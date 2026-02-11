import { View, Text, Pressable } from "@/tw";
import { Avatar } from "@/components/ui/Avatar";
import type { Conversation } from "@/types/conversation";

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const otherUser = conversation.otherParticipants[0]?.user;
  const hasUnread = conversation.unreadCount > 0;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 px-horizontal"
    >
      <Avatar
        imageUrl={otherUser?.image}
        name={otherUser?.name ?? "?"}
        size={52}
      />

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base flex-1 mr-2 ${
              hasUnread
                ? "font-sans-bold text-label-primary dark:text-label-primary-dark"
                : "font-sans-medium text-label-primary dark:text-label-primary-dark"
            }`}
            numberOfLines={1}
          >
            {otherUser?.name ?? "Conversation"}
          </Text>
          <Text className="text-xs font-sans text-label-secondary">
            {formatTime(conversation.lastMessageAt)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-0.5">
          <Text
            className={`text-sm flex-1 mr-2 ${
              hasUnread
                ? "font-sans-medium text-label-primary dark:text-label-primary-dark"
                : "font-sans text-label-secondary"
            }`}
            numberOfLines={1}
          >
            {conversation.lastMessagePreview ?? "Pas de messages"}
          </Text>
          {hasUnread && (
            <View className="bg-primary dark:bg-primary-dark rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
              <Text className="text-white text-[11px] font-sans-bold">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
