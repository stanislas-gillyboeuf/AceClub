import { View, Text } from "@/tw";
import { Avatar } from "@/components/ui/Avatar";
import type { Message } from "@/types/conversation";

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
}

export function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  const isMe = message.isFromMe;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      className={`flex-row gap-2 px-horizontal mb-1 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Other user avatar */}
      {!isMe && (
        <View style={{ width: 28 }}>
          {showAvatar && (
            <Avatar
              imageUrl={message.sender.image}
              name={message.sender.name}
              size={28}
            />
          )}
        </View>
      )}

      <View
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
          isMe
            ? "bg-primary dark:bg-primary-dark rounded-br-sm"
            : "bg-bg-card dark:bg-bg-card-dark rounded-bl-sm border-[0.5px] border-border dark:border-border-dark"
        }`}
      >
        <Text
          className={`text-[15px] font-sans leading-5 ${
            isMe
              ? "text-white"
              : "text-label-primary dark:text-label-primary-dark"
          }`}
        >
          {message.content}
        </Text>
        <Text
          className={`text-[10px] font-sans mt-0.5 ${
            isMe ? "text-white/60 text-right" : "text-label-tertiary dark:text-label-tertiary-dark"
          }`}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}
