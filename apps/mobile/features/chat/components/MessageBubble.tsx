import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { VoiceMessageContent } from "./VoiceMessageContent";
import { ImageMessageContent } from "./ImageMessageContent";
import { Clock, Check, CheckCheck, AlertCircle } from "lucide-react-native";

export type MessageSendStatus = "sending" | "sent" | "read" | "failed";

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
  showTime: boolean;
  onRetry: () => void;
  onDelete: () => void;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, showTime, onRetry, onDelete }: MessageBubbleProps) {
  const scheme = useColorScheme();
  const isFromMe = message.isFromMe;

  return (
    <View style={[styles.row, isFromMe ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.column, { alignItems: isFromMe ? "flex-end" : "flex-start" }]}>
        <View
          style={[
            styles.bubble,
            isFromMe ? styles.bubbleMine : getBubbleOther(scheme),
            getBubbleRadius(message),
          ]}
        >
          <MessageContent message={message} scheme={scheme} />
        </View>

        {showTime && (
          <View style={styles.statusRow}>
            <Text style={[styles.timeText, { color: semanticColors.labelSecondary[scheme] }]}>
              {formatTime(message.createdAt)}
            </Text>
            {isFromMe && <StatusIcon status={message.sendStatus} onRetry={onRetry} />}
          </View>
        )}
      </View>
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

function StatusIcon({ status, onRetry }: { status: MessageSendStatus; onRetry: () => void }) {
  switch (status) {
    case "sending":
      return <Clock size={12} color={semanticColors.labelSecondary.light} />;
    case "sent":
      return <Check size={12} color={semanticColors.labelSecondary.light} />;
    case "read":
      return <CheckCheck size={14} color={colors.accentGreen} />;
    case "failed":
      return (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <AlertCircle size={12} color={colors.red500} />
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      );
  }
}

function getBubbleOther(scheme: "light" | "dark") {
  return {
    backgroundColor: scheme === "dark" ? "#2C2C2E" : "#E5E5EA",
  };
}

function getBubbleRadius(message: ChatMessage) {
  const isShort =
    message.type === "text" && !message.content.includes("\n") && message.content.length <= 40;
  const tail = isShort ? 4 : 18;

  if (message.isFromMe) {
    return {
      borderTopLeftRadius: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: tail,
      borderTopRightRadius: 18,
    };
  }
  return {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: tail,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
  };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 1,
  },
  rowRight: {
    justifyContent: "flex-end",
    paddingLeft: 50,
  },
  rowLeft: {
    justifyContent: "flex-start",
    paddingRight: 50,
  },
  column: {
    gap: 2,
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
    paddingVertical: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  retryText: {
    fontSize: 11,
    color: colors.red500,
  },
});
