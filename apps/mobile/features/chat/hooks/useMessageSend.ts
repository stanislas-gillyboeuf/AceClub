import { useState, useCallback } from "react";
import { conversationService } from "@/services/conversation";
import type { Conversation } from "@/types/conversation";
import type { ChatMessage, MessageSendStatus } from "../types";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function apiMessageToChatMessage(msg: any, currentUserId: string): ChatMessage {
  const senderId = msg.senderId ?? msg.sender?.id ?? "";
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId,
    content: msg.content ?? "",
    type: msg.type ?? msg.messageType ?? "text",
    isEncrypted: msg.isEncrypted ?? false,
    clientMessageId: msg.clientMessageId ?? null,
    attachmentUrl: msg.attachmentUrl ?? null,
    attachmentDuration: msg.attachmentDuration ?? null,
    attachmentWidth: msg.attachmentWidth ?? null,
    attachmentHeight: msg.attachmentHeight ?? null,
    createdAt: msg.createdAt,
    sender: msg.sender ?? null,
    isFromMe: msg.isFromMe ?? senderId === currentUserId,
    sendStatus: "sent" as MessageSendStatus,
    replyToId: msg.replyToId ?? null,
    replyTo: msg.replyTo ?? null,
    reactions: msg.reactions ?? [],
  };
}

// Re-export for use by other hooks
export { apiMessageToChatMessage, generateId };

interface UseMessageSendDeps {
  addOptimistic: (msg: ChatMessage) => void;
  confirmMessage: (clientMessageId: string, confirmed: ChatMessage) => void;
  failMessage: (clientMessageId: string) => void;
  encryptContent: (text: string, conversationId: string) => Promise<{ content: string; isEncrypted: boolean }>;
  onSendSuccess?: () => void;
}

export function useMessageSend(
  conversation: Conversation,
  currentUserId: string,
  deps: UseMessageSendDeps,
) {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { addOptimistic, confirmMessage, failMessage, encryptContent, onSendSuccess } = deps;

  const sendTextMessage = useCallback(
    async (content: string, replyToId?: string, replyTo?: ChatMessage["replyTo"]) => {
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
        replyToId: replyToId ?? null,
        replyTo: replyTo ?? null,
      };

      addOptimistic(optimistic);
      setIsSending(true);

      try {
        const { content: finalContent, isEncrypted } = await encryptContent(
          trimmed,
          conversation.id,
        );

        const sent = await conversationService.sendMessage(conversation.id, {
          content: finalContent,
          clientMessageId,
          isEncrypted,
          type: "text",
          replyToId,
          plaintextPreview: isEncrypted ? trimmed.substring(0, 100) : undefined,
        });

        confirmMessage(clientMessageId, {
          ...apiMessageToChatMessage(sent, currentUserId),
          content: trimmed, // Keep plaintext
          sendStatus: "sent" as MessageSendStatus,
        });
        onSendSuccess?.();
      } catch (error) {
        failMessage(clientMessageId);
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId, addOptimistic, confirmMessage, failMessage, encryptContent, onSendSuccess],
  );

  const sendVoiceMessage = useCallback(
    async (fileUri: string, duration: number, replyToId?: string, replyTo?: ChatMessage["replyTo"]) => {
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
        replyToId: replyToId ?? null,
        replyTo: replyTo ?? null,
      };

      addOptimistic(optimistic);
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
          attachmentUrl: uploaded.attachmentUrl,
          attachmentDuration: durationInt,
          replyToId,
        });

        confirmMessage(clientMessageId, {
          ...apiMessageToChatMessage(sent, currentUserId),
          attachmentUrl: sent.attachmentUrl ?? uploaded.attachmentUrl,
          sendStatus: "sent" as MessageSendStatus,
        });
        onSendSuccess?.();
      } catch (error) {
        failMessage(clientMessageId);
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId, addOptimistic, confirmMessage, failMessage, onSendSuccess],
  );

  const sendImageMessage = useCallback(
    async (fileUri: string, width: number, height: number, replyToId?: string, replyTo?: ChatMessage["replyTo"]) => {
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
        attachmentUrl: fileUri,
        attachmentWidth: width,
        attachmentHeight: height,
        replyToId: replyToId ?? null,
        replyTo: replyTo ?? null,
      };

      addOptimistic(optimistic);
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
          attachmentUrl: uploaded.attachmentUrl,
          attachmentWidth: width,
          attachmentHeight: height,
          replyToId,
        });

        confirmMessage(clientMessageId, {
          ...apiMessageToChatMessage(sent, currentUserId),
          attachmentUrl: sent.attachmentUrl ?? uploaded.attachmentUrl,
          attachmentWidth: width,
          attachmentHeight: height,
          sendStatus: "sent" as MessageSendStatus,
        });
        onSendSuccess?.();
      } catch (error) {
        failMessage(clientMessageId);
        setErrorMessage((error as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUserId, addOptimistic, confirmMessage, failMessage, onSendSuccess],
  );

  const retryFailedMessage = useCallback(
    async (message: ChatMessage) => {
      if (message.sendStatus !== "failed") return;
      await sendTextMessage(message.content, message.replyToId ?? undefined, message.replyTo);
    },
    [sendTextMessage],
  );

  return {
    isSending,
    errorMessage,
    setErrorMessage,
    sendTextMessage,
    sendVoiceMessage,
    sendImageMessage,
    retryFailedMessage,
  };
}
