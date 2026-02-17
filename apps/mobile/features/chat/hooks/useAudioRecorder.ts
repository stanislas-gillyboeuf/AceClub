import { useCallback, useRef } from "react";
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";

interface RecordingResult {
  uri: string;
  duration: number;
}

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 50);
  const startTimeRef = useRef(0);

  const start = useCallback(async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) return;

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      startTimeRef.current = Date.now();
    } catch (error) {
      console.warn("[AudioRecorder] Failed to start:", error);
    }
  }, [recorder]);

  const stop = useCallback(async (): Promise<RecordingResult | null> => {
    const uri = recorder.uri;
    const durationSecs = (Date.now() - startTimeRef.current) / 1000;

    await recorder.stop();

    if (!uri || durationSecs < 0.5) {
      return null;
    }

    return { uri, duration: durationSecs };
  }, [recorder]);

  const cancel = useCallback(() => {
    try {
      recorder.stop(); // Fire and forget
    } catch {
      // Ignore
    }
  }, [recorder]);

  return {
    isRecording: state.isRecording,
    duration: state.durationMillis / 1000,
    start,
    stop,
    cancel,
  };
}
