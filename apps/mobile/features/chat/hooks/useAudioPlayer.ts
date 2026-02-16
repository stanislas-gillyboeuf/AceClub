import { useState, useCallback, useEffect } from "react";
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

  const isPlaying = currentPlayingId === messageId && status.playing;
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const cleanup = useCallback(() => {
    player.pause();
    if (currentPlayingId === messageId) {
      currentPlayingId = null;
      stopCurrentPlayback = null;
    }
  }, [messageId, player]);

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

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const togglePlayback = useCallback(
    async (url: string) => {
      // If this message is currently playing, toggle pause/resume
      if (currentPlayingId === messageId) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
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
    [messageId, status.playing, cleanup, player],
  );

  return { isPlaying, isLoading, progress, togglePlayback };
}
