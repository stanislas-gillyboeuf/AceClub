import { useCallback, useRef } from "react";
import { e2eeService } from "@/services/e2ee";
import { e2eeManager } from "@/lib/e2ee-manager";
import type { Conversation } from "@/types/conversation";
import type { ChatMessage } from "../types";

// Module-level flag: public key only needs to be uploaded once per app session
let localKeyUploaded = false;

export function useE2EE(conversation: Conversation) {
  const participantPublicKeyRef = useRef<string | null>(null);
  const keyFetchAttemptedRef = useRef(false);

  const ensureReady = useCallback(async () => {
    await e2eeManager.init();

    if (!localKeyUploaded && e2eeManager.publicKeyBase64) {
      try {
        await e2eeService.uploadPublicKey({
          publicKey: e2eeManager.publicKeyBase64,
        });
        localKeyUploaded = true;
      } catch {
        // Non-blocking
      }
    }
  }, []);

  const prefetchPublicKey = useCallback(async () => {
    if (participantPublicKeyRef.current || keyFetchAttemptedRef.current) return;
    if (conversation.type !== "direct" && conversation.type !== "match") return;
    const otherUserId = conversation.otherParticipants[0]?.user?.id;
    if (!otherUserId) return;

    keyFetchAttemptedRef.current = true;
    try {
      const response = await e2eeService.getPublicKey(otherUserId);
      participantPublicKeyRef.current = response.publicKey;
    } catch {
      // Other user has no E2EE keys yet
    }
  }, [conversation]);

  const decryptMessage = useCallback(
    async (msg: ChatMessage): Promise<ChatMessage> => {
      if (!msg.isEncrypted || !msg.content) return msg;
      try {
        const theirKey = participantPublicKeyRef.current;
        if (!theirKey) {
          return {
            ...msg,
            content: "[Message chiffré - impossible à déchiffrer]",
          };
        }
        const key = await e2eeManager.deriveConversationKey(
          theirKey,
          msg.conversationId,
        );
        const decrypted = await e2eeManager.decryptMessage(msg.content, key);
        return { ...msg, content: decrypted };
      } catch {
        return {
          ...msg,
          content: "[Message chiffré - impossible à déchiffrer]",
        };
      }
    },
    [],
  );

  const encryptContent = useCallback(
    async (
      text: string,
      conversationId: string,
    ): Promise<{ content: string; isEncrypted: boolean }> => {
      const shouldEncrypt =
        (conversation.type === "direct" || conversation.type === "match") &&
        e2eeManager.hasKeyPair &&
        conversation.otherParticipants[0]?.user?.id;

      if (!shouldEncrypt) {
        return { content: text, isEncrypted: false };
      }

      try {
        const otherUserId = conversation.otherParticipants[0].user.id;
        let theirKey = participantPublicKeyRef.current;
        if (!theirKey && !keyFetchAttemptedRef.current) {
          keyFetchAttemptedRef.current = true;
          const response = await e2eeService.getPublicKey(otherUserId);
          theirKey = response.publicKey;
          participantPublicKeyRef.current = theirKey;
        }
        if (!theirKey) {
          return { content: text, isEncrypted: false };
        }
        const key = await e2eeManager.deriveConversationKey(
          theirKey,
          conversationId,
        );
        const encrypted = await e2eeManager.encryptMessage(text, key);
        return { content: encrypted, isEncrypted: true };
      } catch {
        return { content: text, isEncrypted: false };
      }
    },
    [conversation],
  );

  return {
    ensureReady,
    prefetchPublicKey,
    decryptMessage,
    encryptContent,
  };
}
