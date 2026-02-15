import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";

// Global state to track which message is currently playing
let currentPlayingId: string | null = null;
let stopCurrentPlayback: (() => void) | null = null;

export function useAudioPlayer(messageId: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    if (currentPlayingId === messageId) {
      currentPlayingId = null;
      stopCurrentPlayback = null;
    }
  }, [messageId]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const togglePlayback = useCallback(
    async (url: string) => {
      // If this message is currently playing, toggle pause/resume
      if (currentPlayingId === messageId && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Stop any other playback first
      if (stopCurrentPlayback) {
        stopCurrentPlayback();
      }

      setIsLoading(true);

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: url });
        soundRef.current = sound;
        currentPlayingId = messageId;
        stopCurrentPlayback = cleanup;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            cleanup();
            return;
          }
          if (status.durationMillis && status.durationMillis > 0) {
            setProgress(status.positionMillis / status.durationMillis);
          }
        });

        await sound.playAsync();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        console.warn("[AudioPlayer] Playback failed:", error);
        setIsLoading(false);
        cleanup();
      }
    },
    [messageId, isPlaying, cleanup],
  );

  return { isPlaying, isLoading, progress, togglePlayback };
}
