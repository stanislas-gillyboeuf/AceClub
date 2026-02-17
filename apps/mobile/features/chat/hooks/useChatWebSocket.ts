import { useState, useEffect, useCallback, useRef } from "react";
import { wsManager } from "@/lib/websocket-manager";
import { conversationService } from "@/services/conversation";
import type { Conversation } from "@/types/conversation";
import type { ChatMessage } from "../types";
import { apiMessageToChatMessage } from "./useMessageSend";

interface UseChatWebSocketDeps {
  addIncoming: (msg: ChatMessage) => void;
  mergeMessages: (msgs: ChatMessage[]) => void;
  markAllAsRead: () => void;
  updateMessageReactions: (
    messageId: string,
    updater: (reactions: ChatMessage["reactions"]) => ChatMessage["reactions"],
  ) => void;
  messagesRef: React.MutableRefObject<ChatMessage[]>;
  decryptMessage: (msg: ChatMessage) => Promise<ChatMessage>;
  retryFailedMessage: (msg: ChatMessage) => Promise<void>;
  invalidateConversationList: () => void;
}

export function useChatWebSocket(
  conversation: Conversation,
  currentUserId: string,
  deps: UseChatWebSocketDeps,
) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store deps in refs so the effect doesn't re-subscribe on every render
  const depsRef = useRef(deps);
  depsRef.current = deps;
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const sendTypingIndicator = useCallback(() => {
    wsManager.sendTypingIndicator(conversation.id);
  }, [conversation.id]);

  // Subscribe once per conversation.id — use refs for everything else
  useEffect(() => {
    const unsubscribe = wsManager.subscribe(async (event) => {
      const conv = conversationRef.current;
      const userId = currentUserIdRef.current;
      const d = depsRef.current;

      switch (event.type) {
        case "reconnected": {
          conversationService
            .listMessages(conv.id)
            .then(async (recent) => {
              const existingIds = new Set(
                d.messagesRef.current.map((m) => m.id),
              );
              const toDecrypt = recent
                .filter((m) => !existingIds.has(m.id))
                .map((m) => apiMessageToChatMessage(m, userId));
              if (toDecrypt.length === 0) return;
              const newMsgs = await Promise.all(
                toDecrypt.map((m) => d.decryptMessage(m)),
              );
              d.mergeMessages(newMsgs);
            })
            .catch(() => {});

          const failed = d.messagesRef.current.filter(
            (m) => m.sendStatus === "failed" && m.isFromMe,
          );
          for (const msg of failed) {
            d.retryFailedMessage(msg);
          }
          break;
        }

        case "newMessage": {
          const msg = event.message;
          if (msg.conversationId !== conv.id) break;

          // Dedup
          if (
            msg.clientMessageId &&
            d.messagesRef.current.some(
              (m) => m.clientMessageId === msg.clientMessageId,
            )
          ) {
            break;
          }
          if (d.messagesRef.current.some((m) => m.id === msg.id)) break;

          let chatMsg = apiMessageToChatMessage(msg, userId);
          chatMsg = await d.decryptMessage(chatMsg);
          d.addIncoming(chatMsg);

          conversationService.markRead(conv.id)
            .then(() => d.invalidateConversationList())
            .catch(() => {});
          break;
        }

        case "typing": {
          if (event.conversationId !== conv.id) break;
          const isOther = conv.otherParticipants.some(
            (p) => p.user.id === event.userId,
          );
          if (!isOther) break;

          setIsOtherUserTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(
            () => setIsOtherUserTyping(false),
            3000,
          );
          break;
        }

        case "messageRead": {
          if (event.conversationId !== conv.id) break;
          d.markAllAsRead();
          break;
        }

        case "newReaction": {
          if (event.conversationId !== conv.id) break;
          d.updateMessageReactions(event.messageId, (reactions) => {
            const groups = [...(reactions || [])];
            const existing = groups.find((g) => g.emoji === event.emoji);
            if (existing) {
              if (!existing.users.some((u) => u.id === event.user.id)) {
                existing.count++;
                existing.users.push(event.user);
              }
            } else {
              groups.push({
                emoji: event.emoji,
                count: 1,
                users: [event.user],
                hasReacted: false,
              });
            }
            return groups;
          });
          break;
        }

        case "reactionRemoved": {
          if (event.conversationId !== conv.id) break;
          d.updateMessageReactions(event.messageId, (reactions) => {
            if (!reactions) return reactions;
            return reactions
              .map((g) => {
                if (g.emoji !== event.emoji) return g;
                return {
                  ...g,
                  count: g.count - 1,
                  users: g.users.filter((u) => u.id !== event.userId),
                };
              })
              .filter((g) => g.count > 0);
          });
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversation.id]); // Only re-subscribe when conversation changes

  return {
    isOtherUserTyping,
    sendTypingIndicator,
  };
}
