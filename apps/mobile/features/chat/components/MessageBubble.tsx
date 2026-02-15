import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { VoiceMessageContent } from "./VoiceMessageContent";
import { ImageMessageContent } from "./ImageMessageContent";
import { AlertCircle } from "lucide-react-native";

export type MessageSendStatus = "sending" | "sent" | "read" | "failed";

export type GroupPosition = "first" | "middle" | "last" | "single";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  isEncrypted: boolean;
  clientMessageId?: string | null;
  attachmentUrl?: string | null;
  attachmentDuration?: number | null;
  attachmentWidth?: number | null;
  attachmentHeight?: number | null;
  createdAt: string;
  sender?: { id: string; name: string; image?: string | null } | null;
  isFromMe: boolean;
  sendStatus: MessageSendStatus;
}

interface MessageBubbleProps {
  message: ChatMessage;
  groupPosition: GroupPosition;
  onRetry: () => void;
  onDelete: () => void;
}

export function MessageBubble({ message, groupPosition, onRetry, onDelete }: MessageBubbleProps) {
  const scheme = useColorScheme();
  const isFromMe = message.isFromMe;

  const marginBottom = groupPosition === "last" || groupPosition === "single" ? 8 : 2;

  return (
    <View style={[styles.row, isFromMe ? styles.rowRight : styles.rowLeft, { marginBottom }]}>
      <View
        style={[
          styles.bubble,
          isFromMe
            ? styles.bubbleMine
            : { backgroundColor: semanticColors.incomingBubble[scheme] },
          getBubbleRadius(isFromMe, groupPosition),
        ]}
      >
        <MessageContent message={message} scheme={scheme} />
      </View>

      {message.sendStatus === "failed" && (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <AlertCircle size={18} color={colors.red500} />
        </Pressable>
      )}
    </View>
  );
}

function MessageContent({ message, scheme }: { message: ChatMessage; scheme: "light" | "dark" }) {
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
            { color: message.isFromMe ? colors.white : semanticColors.labelPrimary[scheme] },
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
});
