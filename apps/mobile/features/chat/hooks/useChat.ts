import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
import { queryKeys } from "@/lib/query-keys";
import type { Conversation } from "@/types/conversation";
import type { ChatMessage } from "../types";
import { useMessages } from "./useMessages";
import { useEncryption } from "./useEncryption";
import { useMessageSend, apiMessageToChatMessage } from "./useMessageSend";
import { useChatWebSocket } from "./useChatWebSocket";
import { useReactions } from "./useReactions";
import { useReplyState } from "./useReplyState";

export function useChat(conversation: Conversation, currentUserId: string) {
  const queryClient = useQueryClient();

  const msgState = useMessages();
  const {
    messages,
    setMessages,
    hasMoreMessages,
    setHasMoreMessages,
    messagesRef,
    hasMoreMessagesRef,
    addOptimistic,
    confirmMessage,
    failMessage,
    removeMessage,
    restoreMessage,
    addIncoming,
    mergeMessages,
    markAllAsRead,
    updateMessageReactions,
    updateMatchRequestStatus,
  } = msgState;
  const e2ee = useEncryption(conversation.id, conversation.encryptionKey);
  const reply = useReplyState();

  const send = useMessageSend(conversation, currentUserId, {
    addOptimistic,
    confirmMessage,
    failMessage,
    encryptContent: e2ee.encryptContent,
    onSendSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() }),
  });

  const ws = useChatWebSocket(conversation, currentUserId, {
    addIncoming,
    mergeMessages,
    markAllAsRead,
    updateMessageReactions,
    updateMatchRequestStatus,
    messagesRef,
    retryFailedMessage: send.retryFailedMessage,
    invalidateConversationList: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() }),
  });

  const reactions = useReactions(conversation.id, currentUserId, {
    updateMessageReactions,
  });

  const setErrorMessageRef = useRef(send.setErrorMessage);
  setErrorMessageRef.current = send.setErrorMessage;

  const loadMessages = useCallback(async () => {
    try {
      const loaded = await conversationService.listMessages(conversation.id, { limit: 20 });
      const chatMessages = loaded.map((m) => apiMessageToChatMessage(m, currentUserId));

      setMessages(chatMessages);
      setHasMoreMessages(loaded.length >= 20);
      conversationService.markRead(conversation.id)
        .then(() => {
          queryClient.setQueryData<Conversation[]>(queryKeys.conversation.list(), (old) => {
            if (!old) return old;
            return old.map((c) =>
              c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
            );
          });
        })
        .catch(() => { });
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, currentUserId, setMessages, setHasMoreMessages, queryClient]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessagesRef.current) return;
    const oldest =
      messagesRef.current[messagesRef.current.length - 1];
    if (!oldest) return;

    try {
      const older = await conversationService.listMessages(conversation.id, {
        before: oldest.createdAt,
        limit: 50,
      });

      if (older.length === 0) {
        setHasMoreMessages(false);
      } else {
        const chatMessages = older.map((m) => apiMessageToChatMessage(m, currentUserId));
        mergeMessages(chatMessages);
        if (older.length < 50) {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, currentUserId, hasMoreMessagesRef, messagesRef, setHasMoreMessages, mergeMessages]);

  // Delete message
  const deleteMessage = useCallback(
    async (message: ChatMessage) => {
      removeMessage(message.id);
      try {
        await conversationService.deleteMessage(conversation.id, message.id);
      } catch (error) {
        restoreMessage(message);
        setErrorMessageRef.current((error as Error).message);
      }
    },
    [conversation.id, removeMessage, restoreMessage],
  );

  // Send with reply support
  const sendMessage = useCallback(
    (content: string) => {
      const replyToId = reply.replyingTo?.id;
      const replyTo = reply.replyingTo
        ? {
            id: reply.replyingTo.id,
            senderId: reply.replyingTo.senderId,
            senderName:
              reply.replyingTo.sender?.name || "Unknown",
            content: reply.replyingTo.content.substring(0, 100),
            messageType: reply.replyingTo.type,
          }
        : undefined;

      send.sendTextMessage(content, replyToId, replyTo);
      reply.clearReply();
    },
    [send.sendTextMessage, reply.replyingTo, reply.clearReply],
  );

  const sendVoiceMessage = useCallback(
    (fileUri: string, duration: number) => {
      const replyToId = reply.replyingTo?.id;
      const replyTo = reply.replyingTo
        ? {
            id: reply.replyingTo.id,
            senderId: reply.replyingTo.senderId,
            senderName:
              reply.replyingTo.sender?.name || "Unknown",
            content: reply.replyingTo.content.substring(0, 100),
            messageType: reply.replyingTo.type,
          }
        : undefined;

      send.sendVoiceMessage(fileUri, duration, replyToId, replyTo);
      reply.clearReply();
    },
    [send.sendVoiceMessage, reply.replyingTo, reply.clearReply],
  );

  const sendImageMessage = useCallback(
    (fileUri: string, width: number, height: number) => {
      const replyToId = reply.replyingTo?.id;
      const replyTo = reply.replyingTo
        ? {
            id: reply.replyingTo.id,
            senderId: reply.replyingTo.senderId,
            senderName:
              reply.replyingTo.sender?.name || "Unknown",
            content: reply.replyingTo.content.substring(0, 100),
            messageType: reply.replyingTo.type,
          }
        : undefined;

      send.sendImageMessage(fileUri, width, height, replyToId, replyTo);
      reply.clearReply();
    },
    [send.sendImageMessage, reply.replyingTo, reply.clearReply],
  );

  // Mute / Delete conversation
  const toggleMute = useCallback(async () => {
    try {
      await conversationService.muteConversation(
        conversation.id,
        !conversation.isMuted,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.detail(conversation.id),
      });
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, conversation.isMuted, queryClient]);

  const deleteConversation = useCallback(async () => {
    try {
      await conversationService.deleteConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, queryClient]);

  return {
    messages,
    isOtherUserTyping: ws.isOtherUserTyping,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendVoiceMessage,
    sendImageMessage,
    deleteMessage,
    retryFailedMessage: send.retryFailedMessage,
    sendTypingIndicator: ws.sendTypingIndicator,
    toggleMute,
    deleteConversation,
    errorMessage: send.errorMessage,
    setErrorMessage: send.setErrorMessage,
    replyingTo: reply.replyingTo,
    setReplyingTo: reply.setReplyingTo,
    clearReply: reply.clearReply,
    toggleReaction: reactions.toggleReaction,
    updateMatchRequestStatus,
  };
}
