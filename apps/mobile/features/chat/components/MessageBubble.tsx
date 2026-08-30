import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
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
import { colors, semanticColors, radii } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { useAcceptRequest, useRejectRequest } from "@/hooks/use-match-intent";
import { formatSkillLevel } from "@/lib/skill-levels";
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
  onRequestStatusChange: (matchRequestId: string, status: "accepted" | "rejected") => void;
}

export function MessageBubble({
  message,
  groupPosition,
  onRetry,
  onDelete,
  onLongPress,
  onSwipeReply,
  onToggleReaction,
  onRequestStatusChange,
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
                    getBubbleRadius(isFromMe, groupPosition),
                    {
                      backgroundColor: isFromMe
                        ? colors.accentGreen
                        : semanticColors.incomingBubble[scheme],
                    },
                  ]}
                >
                  {message.replyTo && (
                    <InBubbleReplyPreview
                      replyTo={message.replyTo}
                      isFromMe={isFromMe}
                    />
                  )}
                  <MessageContent
                    message={message}
                    scheme={scheme}
                    onRequestStatusChange={onRequestStatusChange}
                  />
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
  onRequestStatusChange,
}: {
  message: ChatMessage;
  scheme: "light" | "dark";
  onRequestStatusChange: (matchRequestId: string, status: "accepted" | "rejected") => void;
}) {
  switch (message.type) {
    case "voice":
    case "audio":
      return <VoiceMessageContent message={message} />;
    case "image":
      return <ImageMessageContent message={message} />;
    case "match_request":
      return (
        <MatchRequestContent
          message={message}
          scheme={scheme}
          onRequestStatusChange={onRequestStatusChange}
        />
      );
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

function MatchRequestContent({
  message,
  scheme,
  onRequestStatusChange,
}: {
  message: ChatMessage;
  scheme: "light" | "dark";
  onRequestStatusChange: (matchRequestId: string, status: "accepted" | "rejected") => void;
}) {
  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();
  const [isResponding, setIsResponding] = useState(false);

  const info = message.matchRequest;
  if (!info) {
    return (
      <Text
        style={[
          styles.textContent,
          { color: message.isFromMe ? colors.white : semanticColors.labelPrimary[scheme] },
        ]}
      >
        {message.content}
      </Text>
    );
  }

  const textColor = message.isFromMe ? colors.white : semanticColors.labelPrimary[scheme];
  const subColor = message.isFromMe ? "rgba(255,255,255,0.75)" : semanticColors.labelSecondary[scheme];
  const level = formatSkillLevel(info.requesterSkillLevel, info.requesterSport);

  const handleAccept = async () => {
    setIsResponding(true);
    try {
      await acceptMutation.mutateAsync(info.id);
      onRequestStatusChange(info.id, "accepted");
    } catch {
      Alert.alert("Erreur", "Impossible d'accepter la demande. Réessaie.");
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    setIsResponding(true);
    try {
      await rejectMutation.mutateAsync(info.id);
      onRequestStatusChange(info.id, "rejected");
    } catch {
      Alert.alert("Erreur", "Impossible de refuser la demande. Réessaie.");
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Avatar imageUrl={message.sender?.image} name={message.sender?.name} size={36} />
        <View style={styles.requestHeaderText}>
          <Text style={[styles.requestName, { color: textColor }]} numberOfLines={1}>
            {message.sender?.name ?? "Joueur"}
          </Text>
          <Text style={[styles.requestSub, { color: subColor }]} numberOfLines={1}>
            {[info.requesterOrganizationName, level].filter(Boolean).join(" · ") || "Nouveau joueur"}
          </Text>
        </View>
      </View>

      <Text style={[styles.textContent, { color: textColor, paddingHorizontal: 0, paddingTop: 4 }]}>
        {message.content}
      </Text>

      {info.status === "pending" && info.isReceiver ? (
        <View style={styles.requestActions}>
          <Pressable
            disabled={isResponding}
            onPress={handleReject}
            style={({ pressed }) => [
              styles.requestButton,
              styles.requestButtonSecondary,
              { borderColor: subColor },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.requestButtonText, { color: textColor }]}>Refuser</Text>
          </Pressable>
          <Pressable
            disabled={isResponding}
            onPress={handleAccept}
            style={({ pressed }) => [
              styles.requestButton,
              { backgroundColor: colors.accentGreen },
              pressed && { opacity: 0.85 },
            ]}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.requestButtonText, { color: "#FFFFFF" }]}>Accepter</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <Text style={[styles.requestStatus, { color: subColor }]}>
          {info.status === "pending"
            ? "En attente de réponse"
            : info.status === "accepted"
              ? "Demande acceptée"
              : "Demande refusée"}
        </Text>
      )}
    </View>
  );
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
  requestCard: {
    padding: 12,
    gap: 8,
    minWidth: 220,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  requestHeaderText: {
    flex: 1,
    gap: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: "700",
  },
  requestSub: {
    fontSize: 12.5,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  requestButton: {
    flex: 1,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  requestButtonSecondary: {
    borderWidth: 1,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  requestStatus: {
    fontSize: 12.5,
    fontStyle: "italic",
    marginTop: 2,
  },
});
