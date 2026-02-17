import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
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
  const e2ee = useEncryption(conversation.id, conversation.encryptionKey);
  const reply = useReplyState();

  const send = useMessageSend(conversation, currentUserId, {
    addOptimistic: msgState.addOptimistic,
    confirmMessage: msgState.confirmMessage,
    failMessage: msgState.failMessage,
    encryptContent: e2ee.encryptContent,
    onSendSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversation", "list"] }),
  });

  const ws = useChatWebSocket(conversation, currentUserId, {
    addIncoming: msgState.addIncoming,
    mergeMessages: msgState.mergeMessages,
    markAllAsRead: msgState.markAllAsRead,
    updateMessageReactions: msgState.updateMessageReactions,
    messagesRef: msgState.messagesRef,
    decryptMessage: e2ee.decryptMessage,
    retryFailedMessage: send.retryFailedMessage,
    invalidateConversationList: () => queryClient.invalidateQueries({ queryKey: ["conversation", "list"] }),
  });

  const reactions = useReactions(conversation.id, currentUserId, {
    updateMessageReactions: msgState.updateMessageReactions,
  });

  // Use refs to hold latest function references, so callbacks stay stable
  const e2eeRef = useRef(e2ee);
  e2eeRef.current = e2ee;
  const setErrorMessageRef = useRef(send.setErrorMessage);
  setErrorMessageRef.current = send.setErrorMessage;

  // Load messages — stable reference (only depends on conversation.id + currentUserId)
  const loadMessages = useCallback(async () => {
    try {
      await e2eeRef.current.ensureReady();

      const loaded = await conversationService.listMessages(conversation.id, { limit: 20 });
      const chatMessages = await Promise.all(
        loaded
          .map((m) => apiMessageToChatMessage(m, currentUserId))
          .map((m) => e2eeRef.current.decryptMessage(m)),
      );

      msgState.setMessages(chatMessages);
      msgState.setHasMoreMessages(loaded.length >= 20);
      conversationService.markRead(conversation.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ["conversation", "list"] }))
        .catch(() => {});
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, currentUserId, msgState.setMessages, msgState.setHasMoreMessages]);

  // Load more (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!msgState.hasMoreMessages) return;
    const oldest =
      msgState.messagesRef.current[msgState.messagesRef.current.length - 1];
    if (!oldest) return;

    try {
      const older = await conversationService.listMessages(conversation.id, {
        before: oldest.createdAt,
        limit: 50,
      });

      if (older.length === 0) {
        msgState.setHasMoreMessages(false);
      } else {
        const chatMessages = await Promise.all(
          older
            .map((m) => apiMessageToChatMessage(m, currentUserId))
            .map((m) => e2eeRef.current.decryptMessage(m)),
        );
        msgState.mergeMessages(chatMessages);
      }
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, currentUserId, msgState.hasMoreMessages, msgState.messagesRef, msgState.setHasMoreMessages, msgState.mergeMessages]);

  // Delete message
  const deleteMessage = useCallback(
    async (message: ChatMessage) => {
      msgState.removeMessage(message.id);
      try {
        await conversationService.deleteMessage(conversation.id, message.id);
      } catch (error) {
        msgState.restoreMessage(message);
        setErrorMessageRef.current((error as Error).message);
      }
    },
    [conversation.id, msgState.removeMessage, msgState.restoreMessage],
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
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversation.id],
      });
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, conversation.isMuted, queryClient]);

  const deleteConversation = useCallback(async () => {
    try {
      await conversationService.deleteConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    } catch (error) {
      setErrorMessageRef.current((error as Error).message);
    }
  }, [conversation.id, queryClient]);

  return {
    messages: msgState.messages,
    isOtherUserTyping: ws.isOtherUserTyping,
    hasMoreMessages: msgState.hasMoreMessages,
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
    // New: reply & reactions
    replyingTo: reply.replyingTo,
    setReplyingTo: reply.setReplyingTo,
    clearReply: reply.clearReply,
    toggleReaction: reactions.toggleReaction,
  };
}
