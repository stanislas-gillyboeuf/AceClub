import { View, Text, StyleSheet, Pressable } from "react-native";
import { X } from "lucide-react-native";
import Animated, { FadeIn, FadeOut, SlideInDown } from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { ChatMessage } from "../types";

interface InBubbleReplyPreviewProps {
  replyTo: NonNullable<ChatMessage["replyTo"]>;
  isFromMe: boolean;
}

export function InBubbleReplyPreview({
  replyTo,
  isFromMe,
}: InBubbleReplyPreviewProps) {
  const scheme = useColorScheme();

  const previewText =
    replyTo.messageType === "voice"
      ? "Message vocal"
      : replyTo.messageType === "image"
        ? "Photo"
        : replyTo.content;

  const accentColor = isFromMe ? "rgba(255,255,255,0.5)" : colors.accentGreen;
  const textColor = isFromMe
    ? "rgba(255,255,255,0.85)"
    : semanticColors.labelPrimary[scheme];
  const nameColor = isFromMe
    ? "rgba(255,255,255,0.7)"
    : semanticColors.labelSecondary[scheme];

  return (
    <View style={[styles.inBubble, { borderLeftColor: accentColor }]}>
      <Text style={[styles.inBubbleName, { color: nameColor }]} numberOfLines={1}>
        {replyTo.senderName}
      </Text>
      <Text style={[styles.inBubbleText, { color: textColor }]} numberOfLines={1}>
        {previewText}
      </Text>
    </View>
  );
}

interface InputBarReplyPreviewProps {
  message: ChatMessage;
  onCancel: () => void;
}

export function InputBarReplyPreview({
  message,
  onCancel,
}: InputBarReplyPreviewProps) {
  const scheme = useColorScheme();

  const senderName = message.sender?.name || "Unknown";
  const previewText =
    message.type === "voice"
      ? "Message vocal"
      : message.type === "image"
        ? "Photo"
        : message.content;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(200)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.inputBar,
        {
          backgroundColor:
            scheme === "dark" ? "#1C1C1E" : "#F2F2F7",
        },
      ]}
    >
      <View style={styles.inputBarAccent} />
      <View style={styles.inputBarContent}>
        <Text
          style={[
            styles.inputBarName,
            { color: colors.accentGreen },
          ]}
          numberOfLines={1}
        >
          {senderName}
        </Text>
        <Text
          style={[
            styles.inputBarText,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
          numberOfLines={1}
        >
          {previewText}
        </Text>
      </View>
      <Pressable onPress={onCancel} hitSlop={8} style={styles.cancelButton}>
        <X size={18} color={semanticColors.labelSecondary[scheme]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // In-bubble variant
  inBubble: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 2,
  },
  inBubbleName: {
    fontSize: 12,
    fontWeight: "600",
  },
  inBubbleText: {
    fontSize: 13,
    marginTop: 1,
  },

  // Input bar variant
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    paddingVertical: 8,
    paddingRight: 8,
    overflow: "hidden",
  },
  inputBarAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: colors.accentGreen,
    borderRadius: 1.5,
    marginLeft: 10,
  },
  inputBarContent: {
    flex: 1,
    paddingLeft: 8,
  },
  inputBarName: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputBarText: {
    fontSize: 13,
    marginTop: 1,
  },
  cancelButton: {
    padding: 4,
    marginLeft: 4,
  },
});
