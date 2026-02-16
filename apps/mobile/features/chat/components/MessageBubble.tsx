import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Reply, AlertCircle } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { VoiceMessageContent } from "./VoiceMessageContent";
import { ImageMessageContent } from "./ImageMessageContent";
import { InBubbleReplyPreview } from "./ReplyPreview";
import { ReactionBar } from "./ReactionBar";
import { SWIPE_REPLY_THRESHOLD, SPRING_CONFIGS } from "../constants";
import type { ChatMessage, GroupPosition } from "../types";

// Re-export types for backward compat
export type { ChatMessage, GroupPosition } from "../types";
export type { MessageSendStatus } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  groupPosition: GroupPosition;
  onRetry: () => void;
  onDelete: () => void;
  onLongPress: () => void;
  onSwipeReply: () => void;
  onToggleReaction: (emoji: string) => void;
}

export function MessageBubble({
  message,
  groupPosition,
  onRetry,
  onDelete,
  onLongPress,
  onSwipeReply,
  onToggleReaction,
}: MessageBubbleProps) {
  const scheme = useColorScheme();
  const isFromMe = message.isFromMe;
  const translateX = useSharedValue(0);
  const replyIconOpacity = useSharedValue(0);

  const marginBottom = groupPosition === "last" || groupPosition === "single" ? 8 : 2;

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerReply = () => {
    onSwipeReply();
  };

  // Swipe-to-reply gesture (swipe right for incoming, left for outgoing)
  const panGesture = Gesture.Pan()
    .activeOffsetX(isFromMe ? [-15, 0] : [0, 15])
    .onUpdate((e) => {
      if (isFromMe) {
        // Swipe left for outgoing messages
        const tx = Math.max(e.translationX, -100);
        translateX.value = tx < 0 ? tx : 0;
      } else {
        // Swipe right for incoming messages
        const tx = Math.min(e.translationX, 100);
        translateX.value = tx > 0 ? tx : 0;
      }

      const absX = Math.abs(translateX.value);
      replyIconOpacity.value = Math.min(absX / SWIPE_REPLY_THRESHOLD, 1);

      if (absX >= SWIPE_REPLY_THRESHOLD && replyIconOpacity.value === 1) {
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd(() => {
      const absX = Math.abs(translateX.value);
      if (absX >= SWIPE_REPLY_THRESHOLD) {
        runOnJS(triggerReply)();
      }
      translateX.value = withSpring(0, SPRING_CONFIGS.snappy);
      replyIconOpacity.value = withSpring(0, SPRING_CONFIGS.snappy);
    });

  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconStyle = useAnimatedStyle(() => ({
    opacity: replyIconOpacity.value,
    transform: [{ scale: replyIconOpacity.value }],
  }));

  const hasReactions = message.reactions && message.reactions.length > 0;

  return (
    <View style={{ marginBottom }}>
      <View style={[styles.swipeContainer]}>
        {/* Reply icon behind (incoming: left side, outgoing: right side) */}
        <Animated.View
          style={[
            styles.replyIcon,
            isFromMe ? styles.replyIconRight : styles.replyIconLeft,
            replyIconStyle,
          ]}
        >
          <Reply
            size={20}
            color={semanticColors.labelSecondary[scheme]}
          />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={bubbleAnimatedStyle}>
            <Pressable
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onLongPress();
              }}
              delayLongPress={400}
            >
              <View
                style={[
                  styles.row,
                  isFromMe ? styles.rowRight : styles.rowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isFromMe
                      ? styles.bubbleMine
                      : {
                          backgroundColor:
                            semanticColors.incomingBubble[scheme],
                        },
                    getBubbleRadius(isFromMe, groupPosition),
                  ]}
                >
                  {message.replyTo && (
                    <InBubbleReplyPreview
                      replyTo={message.replyTo}
                      isFromMe={isFromMe}
                    />
                  )}
                  <MessageContent message={message} scheme={scheme} />
                </View>

                {message.sendStatus === "failed" && (
                  <Pressable onPress={onRetry} style={styles.retryButton}>
                    <AlertCircle size={18} color={colors.red500} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {hasReactions && (
        <View style={isFromMe ? styles.reactionsRight : styles.reactionsLeft}>
          <ReactionBar
            reactions={message.reactions!}
            isFromMe={isFromMe}
            onToggleReaction={onToggleReaction}
          />
        </View>
      )}
    </View>
  );
}

function MessageContent({
  message,
  scheme,
}: {
  message: ChatMessage;
  scheme: "light" | "dark";
}) {
  switch (message.type) {
    case "voice":
    case "audio":
      return <VoiceMessageContent message={message} />;
    case "image":
      return <ImageMessageContent message={message} />;
    default:
      return (
        <Text
          style={[
            styles.textContent,
            {
              color: message.isFromMe
                ? colors.white
                : semanticColors.labelPrimary[scheme],
            },
          ]}
        >
          {message.content}
        </Text>
      );
  }
}

function getBubbleRadius(isFromMe: boolean, groupPosition: GroupPosition) {
  const hasTail = groupPosition === "last" || groupPosition === "single";
  const tailRadius = 4;
  const fullRadius = 18;

  if (isFromMe) {
    return {
      borderTopLeftRadius: fullRadius,
      borderTopRightRadius: fullRadius,
      borderBottomLeftRadius: fullRadius,
      borderBottomRightRadius: hasTail ? tailRadius : fullRadius,
    };
  }
  return {
    borderTopLeftRadius: fullRadius,
    borderTopRightRadius: fullRadius,
    borderBottomLeftRadius: hasTail ? tailRadius : fullRadius,
    borderBottomRightRadius: fullRadius,
  };
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
  },
  replyIcon: {
    position: "absolute",
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  replyIconLeft: {
    left: -28,
  },
  replyIconRight: {
    right: -28,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  rowRight: {
    justifyContent: "flex-end",
    paddingLeft: 50,
  },
  rowLeft: {
    justifyContent: "flex-start",
    paddingRight: 50,
  },
  bubble: {
    overflow: "hidden",
  },
  bubbleMine: {
    backgroundColor: colors.accentGreen,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButton: {
    padding: 4,
  },
  reactionsRight: {
    paddingLeft: 50,
    paddingRight: 4,
  },
  reactionsLeft: {
    paddingRight: 50,
    paddingLeft: 4,
  },
});
