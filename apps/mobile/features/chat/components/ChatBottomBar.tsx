import { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Send, Mic, ImageIcon, Trash2 } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

interface ChatBottomBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (fileUri: string, duration: number) => void;
  onSendImage: (fileUri: string, width: number, height: number) => void;
  onTyping: () => void;
}

export function ChatBottomBar({
  onSendText,
  onSendVoice,
  onSendImage,
  onTyping,
}: ChatBottomBarProps) {
  const scheme = useColorScheme();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const hasText = text.trim().length > 0;

  const recorder = useAudioRecorder();
  const recorderOffset = useSharedValue(0);
  const isHolding = useSharedValue(false);

  const handleSendText = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText("");
  }, [text, onSendText]);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      onTyping();
    },
    [onTyping],
  );

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onSendImage(asset.uri, asset.width, asset.height);
    }
  }, [onSendImage]);

  // Voice recording gesture
  const startRecording = useCallback(() => {
    recorder.start();
  }, [recorder]);

  const finishRecording = useCallback(
    (cancelled: boolean) => {
      if (cancelled) {
        recorder.cancel();
      } else {
        const result = recorder.stop();
        if (result) {
          onSendVoice(result.uri, result.duration);
        }
      }
      recorderOffset.value = withSpring(0);
      isHolding.value = false;
    },
    [recorder, onSendVoice, recorderOffset, isHolding],
  );

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isHolding.value = true;
      runOnJS(startRecording)();
    })
    .onEnd(() => {
      const wasCancelled = recorderOffset.value < -50;
      runOnJS(finishRecording)(wasCancelled);
    })
    .enabled(!hasText);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isHolding.value) {
        recorderOffset.value = Math.max(Math.min(e.translationX, 0), -200);
      }
    })
    .onEnd(() => {
      if (isHolding.value) {
        const wasCancelled = recorderOffset.value < -50;
        runOnJS(finishRecording)(wasCancelled);
      }
    })
    .enabled(!hasText);

  const combinedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const buttonScale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isHolding.value ? 1.28 : 1) }],
  }));

  const buttonOffset = useAnimatedStyle(() => ({
    transform: [{ translateX: recorderOffset.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F2F2F7",
              borderColor: semanticColors.borderColor[scheme],
            },
          ]}
        >
          {recorder.isRecording ? (
            <View style={styles.recordingIndicator}>
              <Trash2 size={20} color={colors.red500} />
              <Text style={styles.recordingTimer}>
                {formatTimer(recorder.duration)}
              </Text>
              <Text style={[styles.slideHint, { color: semanticColors.labelSecondary[scheme] }]}>
                Glisser pour annuler
              </Text>
            </View>
          ) : (
            <>
              <Pressable onPress={handlePickImage} style={styles.mediaButton}>
                <ImageIcon
                  size={22}
                  color={semanticColors.labelPrimary[scheme]}
                />
              </Pressable>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  { color: semanticColors.labelPrimary[scheme] },
                ]}
                placeholder="Message..."
                placeholderTextColor={semanticColors.labelSecondary[scheme]}
                value={text}
                onChangeText={handleTextChange}
                multiline
                maxLength={5000}
              />
            </>
          )}
        </View>

        {hasText ? (
          <Pressable onPress={handleSendText} style={styles.sendButton}>
            <Send size={20} color={colors.white} />
          </Pressable>
        ) : (
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.sendButton, buttonScale, buttonOffset]}>
              {recorder.isRecording ? (
                <Mic size={20} color={colors.white} />
              ) : (
                <Mic size={20} color={colors.white} />
              )}
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === "ios" ? 0 : 12,
    paddingTop: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 0.5,
  },
  mediaButton: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  recordingTimer: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray500,
    fontVariant: ["tabular-nums"],
  },
  slideHint: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
});
