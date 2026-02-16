import { useCallback } from "react";
import { conversationService } from "@/services/conversation";
import type { ChatMessage } from "../types";

interface UseReactionsDeps {
  updateMessageReactions: (
    messageId: string,
    updater: (
      reactions: ChatMessage["reactions"],
    ) => ChatMessage["reactions"],
  ) => void;
}

export function useReactions(
  conversationId: string,
  currentUserId: string,
  deps: UseReactionsDeps,
) {
  const { updateMessageReactions } = deps;

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      // Check if user already reacted with this emoji
      let shouldRemove = false;

      updateMessageReactions(messageId, (reactions) => {
        const groups = [...(reactions || [])];
        const existing = groups.find((g) => g.emoji === emoji);

        if (existing?.hasReacted) {
          shouldRemove = true;
          // Optimistic remove
          const updated = groups
            .map((g) => {
              if (g.emoji !== emoji) return g;
              return {
                ...g,
                count: g.count - 1,
                users: g.users.filter((u) => u.id !== currentUserId),
                hasReacted: false,
              };
            })
            .filter((g) => g.count > 0);
          return updated;
        } else {
          shouldRemove = false;
          // Optimistic add
          if (existing) {
            existing.count++;
            existing.users.push({ id: currentUserId, name: "Moi" });
            existing.hasReacted = true;
          } else {
            groups.push({
              emoji,
              count: 1,
              users: [{ id: currentUserId, name: "Moi" }],
              hasReacted: true,
            });
          }
          return groups;
        }
      });

      try {
        if (shouldRemove) {
          await conversationService.removeReaction(
            conversationId,
            messageId,
            emoji,
          );
        } else {
          await conversationService.addReaction(
            conversationId,
            messageId,
            emoji,
          );
        }
      } catch {
        // Revert on failure — just refetch would be ideal but for now we ignore
      }
    },
    [conversationId, currentUserId, updateMessageReactions],
  );

  return { toggleReaction };
}
