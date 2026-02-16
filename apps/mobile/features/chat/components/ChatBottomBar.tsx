import { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Image, ArrowUp, Mic, Trash2 } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { InputBarReplyPreview } from "./ReplyPreview";
import type { ChatMessage } from "../types";

interface ChatBottomBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (fileUri: string, duration: number) => void;
  onSendImage: (fileUri: string, width: number, height: number) => void;
  onTyping: () => void;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
}

export function ChatBottomBar({
  onSendText,
  onSendVoice,
  onSendImage,
  onTyping,
  replyingTo,
  onCancelReply,
}: ChatBottomBarProps) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { progress: keyboardProgress } = useReanimatedKeyboardAnimation();
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

  // Animate bottom padding: full safe area when keyboard closed, minimal when open
  const animatedWrapperStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      keyboardProgress.value,
      [0, 1],
      [Math.max(insets.bottom, 8), 8],
    ),
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedWrapperStyle]}>
      {replyingTo && (
        <InputBarReplyPreview message={replyingTo} onCancel={onCancelReply} />
      )}
      <View style={styles.container}>
        <Pressable onPress={handlePickImage} style={styles.plusButton}>
          <GlassView style={styles.plusCircle}>
            <Image size={18} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
          </GlassView>
        </Pressable>

        <GlassView style={styles.inputRow}>
          {recorder.isRecording ? (
            <View style={styles.recordingIndicator}>
              <Trash2 size={18} color={colors.red500} />
              <Text style={styles.recordingTimer}>
                {formatTimer(recorder.duration)}
              </Text>
              <Text style={[styles.slideHint, { color: semanticColors.labelSecondary[scheme] }]}>
                Glisser pour annuler
              </Text>
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
              placeholder="Message"
              placeholderTextColor={semanticColors.labelSecondary[scheme]}
              value={text}
              onChangeText={handleTextChange}
              multiline
              maxLength={5000}
            />
          )}

          {hasText ? (
            <Pressable onPress={handleSendText} style={styles.sendButtonInline}>
              <GlassView style={styles.sendCircle} tintColor={colors.accentGreen}>
                <ArrowUp size={18} color={colors.white} strokeWidth={2.5} />
              </GlassView>
            </Pressable>
          ) : null}
        </GlassView>

        {!hasText && (
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.micButton, buttonScale, buttonOffset]}>
              <Mic size={22} color={semanticColors.labelPrimary[scheme]} />
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </Animated.View>
  );
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 8,
    paddingTop: 6,
      backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    backgroundColor: "transparent",
  },
  plusButton: {
    paddingBottom: 4,
  },
  plusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 20,
    minHeight: 36,
    paddingLeft: 12,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendButtonInline: {
    paddingBottom: 3,
    paddingLeft: 4,
    paddingRight: 2,
  },
  sendCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  recordingTimer: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    fontVariant: ["tabular-nums"],
  },
  slideHint: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
});
