import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { Conversation } from "@/types/conversation";
import { Mic, Image as ImageIcon, BellOff } from "lucide-react-native";

interface ConversationRowProps {
  conversation: Conversation;
}

function getDisplayName(conversation: Conversation): string {
  if (conversation.name) return conversation.name;
  const participant = conversation.otherParticipants[0];
  return participant?.user?.name ?? "Conversation";
}

function getAvatarUrl(conversation: Conversation): string | null {
  return conversation.otherParticipants[0]?.user?.image ?? null;
}

function formatLastMessageTime(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Hier";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function ConversationRow({ conversation }: ConversationRowProps) {
  const scheme = useColorScheme();
  const displayName = getDisplayName(conversation);
  const avatarUrl = getAvatarUrl(conversation);
  const time = formatLastMessageTime(conversation.lastMessageAt);
  const preview = conversation.lastMessagePreview;
  const isVoice = preview === "Message vocal";
  const isPhoto = preview === "Photo";
  const hasUnread = conversation.unreadCount > 0;

  return (
    <View style={styles.container}>
      <Avatar imageUrl={avatarUrl} name={displayName} size={54} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.name,
              { color: semanticColors.labelPrimary[scheme] },
              hasUnread && styles.nameUnread,
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {time && (
            <Text
              style={[
                styles.time,
                { color: hasUnread ? colors.accentGreen : semanticColors.labelSecondary[scheme] },
              ]}
            >
              {time}
            </Text>
          )}
        </View>
        <View style={styles.bottomRow}>
          {preview ? (
            <View style={styles.previewRow}>
              {isVoice && (
                <Mic size={14} color={semanticColors.labelSecondary[scheme]} />
              )}
              {isPhoto && (
                <ImageIcon size={14} color={semanticColors.labelSecondary[scheme]} />
              )}
              <Text
                style={[
                  styles.preview,
                  {
                    color: hasUnread
                      ? semanticColors.labelPrimary[scheme]
                      : semanticColors.labelSecondary[scheme],
                  },
                ]}
                numberOfLines={2}
              >
                {preview}
              </Text>
            </View>
          ) : null}
          <View style={styles.badges}>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
              </View>
            )}
            {conversation.isMuted && (
              <BellOff size={14} color={semanticColors.labelSecondary[scheme]} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  preview: {
    fontSize: 15,
    flex: 1,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadBadge: {
    backgroundColor: colors.accentGreen,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
