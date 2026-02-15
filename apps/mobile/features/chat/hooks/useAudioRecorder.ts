import { useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";

interface RecordingResult {
  uri: string;
  duration: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const start = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 50);
    } catch (error) {
      console.warn("[AudioRecorder] Failed to start:", error);
    }
  }, []);

  const stop = useCallback((): RecordingResult | null => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const durationSecs = (Date.now() - startTimeRef.current) / 1000;
      recordingRef.current = null;

      if (!uri || durationSecs < 0.5) {
        return null;
      }

      return { uri, duration: durationSecs };
    } catch {
      recordingRef.current = null;
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    const recording = recordingRef.current;
    if (recording) {
      try {
        recording.stopAndUnloadAsync();
      } catch {
        // Ignore
      }
      recordingRef.current = null;
    }
    setDuration(0);
  }, []);

  return { isRecording, duration, start, stop, cancel };
}
