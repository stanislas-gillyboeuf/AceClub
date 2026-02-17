import { useState, useCallback, useRef } from "react";
import type { ChatMessage, MessageSendStatus } from "../types";

export function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const hasMoreMessagesRef = useRef(hasMoreMessages);
  hasMoreMessagesRef.current = hasMoreMessages;

  const addOptimistic = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [msg, ...prev]);
  }, []);

  const confirmMessage = useCallback(
    (clientMessageId: string, confirmed: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId ? confirmed : m,
        ),
      );
    },
    [],
  );

  const failMessage = useCallback((clientMessageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.clientMessageId === clientMessageId
          ? { ...m, sendStatus: "failed" as MessageSendStatus }
          : m,
      ),
    );
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const restoreMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      const restored = [...prev, msg];
      restored.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return restored;
    });
  }, []);

  const addIncoming = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      // Dedup by clientMessageId
      if (
        msg.clientMessageId &&
        prev.some((m) => m.clientMessageId === msg.clientMessageId)
      ) {
        return prev;
      }
      // Dedup by id
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [msg, ...prev];
    });
  }, []);

  const mergeMessages = useCallback((newMsgs: ChatMessage[]) => {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
      if (toAdd.length === 0) return prev;
      const merged = [...toAdd, ...prev];
      merged.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return merged;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.isFromMe && m.sendStatus === "sent"
          ? { ...m, sendStatus: "read" as MessageSendStatus }
          : m,
      ),
    );
  }, []);

  const updateMessageReactions = useCallback(
    (
      messageId: string,
      updater: (
        reactions: ChatMessage["reactions"],
      ) => ChatMessage["reactions"],
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: updater(m.reactions) }
            : m,
        ),
      );
    },
    [],
  );

  return {
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
  };
}
