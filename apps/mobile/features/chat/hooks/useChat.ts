import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
import { e2eeService } from "@/services/e2ee";
import { e2eeManager, E2EEError } from "@/lib/e2ee-manager";
import { wsManager } from "@/lib/websocket-manager";
import type { Conversation, Message } from "@/types/conversation";
import type { ChatMessage, MessageSendStatus } from "../components/MessageBubble";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function apiMessageToChatMessage(msg: Message, currentUserId: string): ChatMessage {
  return {
    ...msg,
    isFromMe: msg.senderId === currentUserId,
    sendStatus: "sent" as MessageSendStatus,
  };
}

export function useChat(conversation: Conversation, currentUserId: string) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participantPublicKeyRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Pre-fetch participant's public key for E2EE
  const prefetchPublicKey = useCallback(async () => {
    if (participantPublicKeyRef.current) return;
    if (conversation.type !== "direct" && conversation.type !== "match") return;
    const otherUserId = conversation.otherParticipants[0]?.user?.id;
    if (!otherUserId) return;

    try {
      const response = await e2eeService.getPublicKey(otherUserId);
      participantPublicKeyRef.current = response.publicKey;
    } catch {
      // Other user has no E2EE keys, that's OK
    }
  }, [conversation]);

  // Decrypt a message if needed
  const decryptIfNeeded = useCallback(
    (msg: ChatMessage): ChatMessage => {
      if (!msg.isEncrypted || !msg.content) return msg;
      try {
        const theirKey = participantPublicKeyRef.current;
        if (!theirKey) {
          return { ...msg, content: "[Message chiffré - impossible à déchiffrer]" };
        }
        const key = e2eeManager.deriveConversationKey(theirKey, msg.conversationId);
        const decrypted = e2eeManager.decryptMessage(msg.content, key);
        return { ...msg, content: decrypted };
      } catch {
        return { ...msg, content: "[Message chiffré - impossible à déchiffrer]" };
      }
    },
    [],
  );

  // Load messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await e2eeManager.init();
      await prefetchPublicKey();

      const loaded = await conversationService.listMessages(conversation.id);
      const chatMessages = loaded
        .map((m) => apiMessageToChatMessage(m, currentUserId))
        .map(decryptIfNeeded);

      setMessages(chatMessages);
      setHasMoreMessages(loaded.length >= 50);

      // Mark as read
      conversationService.markRead(conversation.id).catch(() => {});
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id, currentUserId, prefetchPublicKey, decryptIfNeeded]);

  // Load more (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return;
    const oldest = messagesRef.current[messagesRef.current.length - 1];
    if (!oldest) return;

    setIsLoading(true);
    try {
      const older = await conversationService.listMessages(conversation.id, {
        before: oldest.createdAt,
        limit: 50,
      });

      if (older.length === 0) {
        setHasMoreMessages(false);
      } else {
        const chatMessages = older
          .map((m) => apiMessageToChatMessage(m, currentUserId))
          .map(decryptIfNeeded);
        setMessages((prev) => [...prev, ...chatMessages]);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id, currentUserId, hasMoreMessages, isLoading, decryptIfNeeded]);

  // Send text message
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const clientMessageId = generateId();
      const optimistic: ChatMessage = {
        id: clientMessageId,
        conversationId: conversation.id,
        senderId: currentUserId,
        content: trimmed,
        type: "text",
        isEncrypted: false,
        clientMessageId,
        createdAt: new Date().toISOString(),
        isFromMe: true,
        sendStatus: "sending",
      };

      setMessages((prev) => [optimistic, ...prev]);
      setIsSending(true);

      try {
        // Encrypt if possible
        let finalContent = trimmed;
        let isEncrypted = false;

        const shouldEncrypt =
          (conversation.type === "direct" || conversation.type === "match") &&
          e2eeManager.hasKeyPair &&
          conversation.otherParticipants[0]?.user?.id;

        if (shouldEncrypt) {
          try {
            const otherUserId = conversation.otherParticipants[0].user.id;
            let theirKey = participantPublicKeyRef.current;
            if (!theirKey) {
              const response = await e2eeService.getPublicKey(otherUserId);
              theirKey = response.publicKey;
              participantPublicKeyRef.current = theirKey;
            }
            const key = e2eeManager.deriveConversationKey(theirKey, conversation.id);
            finalContent = e2eeManager.encryptMessage(trimmed, key);
            isEncrypted = true;
          } catch {
            // Fallback to unencrypted
          }
        }

        const sent = await conversationService.sendMessage(conversation.id, {
          content: finalContent,
          clientMessageId,
          isEncrypted,
          type: "text",
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? {
                  ...apiMessageToChatMessage(sent, currentUserId),
                  content: trimmed, // Keep plaintext for display
                  sendStatus: "sent" as MessageSendStatus,
                }
              : m,
          ),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, sendStatus: "failed" as MessageSendStatus }
              : m,
          ),
        );
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId],
  );

  // Send voice message
  const sendVoiceMessage = useCallback(
    async (fileUri: string, duration: number) => {
      const clientMessageId = generateId();
      const durationInt = Math.ceil(duration);

      const optimistic: ChatMessage = {
        id: clientMessageId,
        conversationId: conversation.id,
        senderId: currentUserId,
        content: "",
        type: "voice",
        isEncrypted: false,
        clientMessageId,
        createdAt: new Date().toISOString(),
        isFromMe: true,
        sendStatus: "sending",
        attachmentDuration: durationInt,
      };

      setMessages((prev) => [optimistic, ...prev]);
      setIsSending(true);

      try {
        const uploaded = await conversationService.uploadAttachment(
          conversation.id,
          fileUri,
          `${clientMessageId}.m4a`,
          "audio/m4a",
        );

        const sent = await conversationService.sendMessage(conversation.id, {
          content: "",
          clientMessageId,
          type: "voice",
          attachmentUrl: uploaded.url,
          attachmentDuration: durationInt,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...apiMessageToChatMessage(sent, currentUserId), sendStatus: "sent" as MessageSendStatus }
              : m,
          ),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, sendStatus: "failed" as MessageSendStatus }
              : m,
          ),
        );
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId],
  );

  // Send image message
  const sendImageMessage = useCallback(
    async (fileUri: string, width: number, height: number) => {
      const clientMessageId = generateId();

      const optimistic: ChatMessage = {
        id: clientMessageId,
        conversationId: conversation.id,
        senderId: currentUserId,
        content: "",
        type: "image",
        isEncrypted: false,
        clientMessageId,
        createdAt: new Date().toISOString(),
        isFromMe: true,
        sendStatus: "sending",
        attachmentUrl: fileUri, // Show local preview
        attachmentWidth: width,
        attachmentHeight: height,
      };

      setMessages((prev) => [optimistic, ...prev]);
      setIsSending(true);

      try {
        const uploaded = await conversationService.uploadAttachment(
          conversation.id,
          fileUri,
          `${clientMessageId}.jpg`,
          "image/jpeg",
        );

        const sent = await conversationService.sendMessage(conversation.id, {
          content: "",
          clientMessageId,
          type: "image",
          attachmentUrl: uploaded.url,
          attachmentWidth: width,
          attachmentHeight: height,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...apiMessageToChatMessage(sent, currentUserId), sendStatus: "sent" as MessageSendStatus }
              : m,
          ),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, sendStatus: "failed" as MessageSendStatus }
              : m,
          ),
        );
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId],
  );

  // Delete message
  const deleteMessage = useCallback(
    async (message: ChatMessage) => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));

      try {
        await conversationService.deleteMessage(conversation.id, message.id);
      } catch (error) {
        // Restore on failure
        setMessages((prev) => {
          const restored = [...prev, message];
          restored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return restored;
        });
        setErrorMessage((error as Error).message);
      }
    },
    [conversation.id],
  );

  // Retry failed message
  const retryFailedMessage = useCallback(
    async (message: ChatMessage) => {
      if (message.sendStatus !== "failed") return;
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      await sendMessage(message.content);
    },
    [sendMessage],
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    wsManager.sendTypingIndicator(conversation.id);
  }, [conversation.id]);

  // WebSocket listener
  useEffect(() => {
    const unsubscribe = wsManager.subscribe((event) => {
      switch (event.type) {
        case "reconnected": {
          // Fetch missed messages
          conversationService
            .listMessages(conversation.id)
            .then((recent) => {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newMsgs = recent
                  .filter((m) => !existingIds.has(m.id))
                  .map((m) => apiMessageToChatMessage(m, currentUserId))
                  .map(decryptIfNeeded);

                if (newMsgs.length === 0) return prev;
                const merged = [...newMsgs, ...prev];
                merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                return merged;
              });
            })
            .catch(() => {});

          // Retry failed messages
          const failed = messagesRef.current.filter((m) => m.sendStatus === "failed" && m.isFromMe);
          for (const msg of failed) {
            retryFailedMessage(msg);
          }
          break;
        }

        case "newMessage": {
          const msg = event.message;
          if (msg.conversationId !== conversation.id) break;

          // Dedup by clientMessageId
          if (msg.clientMessageId && messagesRef.current.some((m) => m.clientMessageId === msg.clientMessageId)) {
            break;
          }
          // Dedup by id
          if (messagesRef.current.some((m) => m.id === msg.id)) break;

          let chatMsg = apiMessageToChatMessage(msg, currentUserId);
          chatMsg = decryptIfNeeded(chatMsg);
          setMessages((prev) => [chatMsg, ...prev]);

          // Mark as read
          conversationService.markRead(conversation.id).catch(() => {});
          break;
        }

        case "typing": {
          if (event.conversationId !== conversation.id) break;
          const isOther = conversation.otherParticipants.some((p) => p.user.id === event.userId);
          if (!isOther) break;

          setIsOtherUserTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setIsOtherUserTyping(false), 3000);
          break;
        }

        case "messageRead": {
          if (event.conversationId !== conversation.id) break;
          setMessages((prev) =>
            prev.map((m) =>
              m.isFromMe && m.sendStatus === "sent" ? { ...m, sendStatus: "read" as MessageSendStatus } : m,
            ),
          );
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversation, currentUserId, decryptIfNeeded, retryFailedMessage]);

  // Mute / Delete conversation
  const toggleMute = useCallback(async () => {
    try {
      await conversationService.muteConversation(conversation.id, !conversation.isMuted);
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversation.id] });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, [conversation, queryClient]);

  const deleteConversation = useCallback(async () => {
    try {
      await conversationService.deleteConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, [conversation.id, queryClient]);

  return {
    messages,
    isLoading,
    isSending,
    errorMessage,
    isOtherUserTyping,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendVoiceMessage,
    sendImageMessage,
    deleteMessage,
    retryFailedMessage,
    sendTypingIndicator,
    toggleMute,
    deleteConversation,
    setErrorMessage,
  };
}
