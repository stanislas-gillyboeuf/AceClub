import { useState, useCallback, useEffect, useRef } from "react";
import {
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";

// Global state to track which message is currently playing
let currentPlayingId: string | null = null;
let stopCurrentPlayback: (() => void) | null = null;

export function useAudioPlayer(messageId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const player = useExpoAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isMounted = useRef(true);

  const isPlaying = currentPlayingId === messageId && status.playing;
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const safePause = useCallback(() => {
    if (!isMounted.current) return;
    try {
      player.pause();
    } catch {
      // Native player may already be released
    }
  }, [player]);

  const cleanup = useCallback(() => {
    safePause();
    if (currentPlayingId === messageId) {
      currentPlayingId = null;
      stopCurrentPlayback = null;
    }
  }, [messageId, safePause]);

  // Reset when playback finishes
  useEffect(() => {
    if (status.didJustFinish && currentPlayingId === messageId) {
      currentPlayingId = null;
      stopCurrentPlayback = null;
    }
  }, [status.didJustFinish, messageId]);

  // Clear loading when audio is loaded
  useEffect(() => {
    if (isLoading && status.isLoaded) {
      setIsLoading(false);
    }
  }, [isLoading, status.isLoaded]);

  // Track mount state — cleanup on unmount only resets global state
  // (Expo's useAudioPlayer hook handles native player release)
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (currentPlayingId === messageId) {
        currentPlayingId = null;
        stopCurrentPlayback = null;
      }
    };
  }, [messageId]);

  const togglePlayback = useCallback(
    async (url: string) => {
      // If this message is currently playing, toggle pause/resume
      if (currentPlayingId === messageId) {
        if (status.playing) {
          safePause();
        } else {
          try {
            player.play();
          } catch {
            // Native player may already be released
          }
        }
        return;
      }

      // Stop any other playback first
      if (stopCurrentPlayback) {
        stopCurrentPlayback();
      }

      setIsLoading(true);

      try {
        await setAudioModeAsync({ playsInSilentMode: true });

        player.replace({ uri: url });
        currentPlayingId = messageId;
        stopCurrentPlayback = cleanup;
        player.play();
      } catch (error) {
        console.warn("[AudioPlayer] Playback failed:", error);
        setIsLoading(false);
        cleanup();
      }
    },
    [messageId, status.playing, cleanup, safePause, player],
  );

  return { isPlaying, isLoading, progress, togglePlayback };
}
