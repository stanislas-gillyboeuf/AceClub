import { useCallback, useRef } from "react";
import { conversationService } from "@/services/conversation";
import {
  encryptMessage,
  decryptMessage,
} from "@/lib/encryption";
import type { ChatMessage } from "../types";

export function useEncryption(conversationId: string, conversationKey?: string | null) {
  const keyRef = useRef<string | null>(conversationKey ?? null);
  const fetchAttemptedRef = useRef(!!conversationKey);

  const fetchKey = useCallback(async () => {
    if (keyRef.current || fetchAttemptedRef.current) return;
    fetchAttemptedRef.current = true;
    try {
      const { key } = await conversationService.getConversationKey(conversationId);
      keyRef.current = key;
    } catch {
      // No key available (legacy conversation)
    }
  }, [conversationId]);

  const ensureReady = useCallback(async () => {
    // If key was provided via conversation data, no fetch needed
    if (keyRef.current) return;
    await fetchKey();
  }, [fetchKey]);

  const encryptContent = useCallback(
    async (
      text: string,
      _conversationId: string,
    ): Promise<{ content: string; isEncrypted: boolean }> => {
      if (!keyRef.current) {
        return { content: text, isEncrypted: false };
      }

      try {
        const encrypted = await encryptMessage(text, keyRef.current);
        return { content: encrypted, isEncrypted: true };
      } catch {
        // Fallback to plaintext on encryption failure
        return { content: text, isEncrypted: false };
      }
    },
    [],
  );

  const decryptMsg = useCallback(
    async (msg: ChatMessage): Promise<ChatMessage> => {
      if (!msg.isEncrypted || !msg.content) return msg;

      // Try to detect v1 messages (old E2EE format — not valid JSON with v field)
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.v === 1) {
          return { ...msg, content: "[Ancien message chiffré]" };
        }
      } catch {
        // Not valid JSON — likely old E2EE format
        return { ...msg, content: "[Ancien message chiffré]" };
      }

      if (!keyRef.current) {
        return { ...msg, content: "[Message chiffré]" };
      }

      try {
        const decrypted = await decryptMessage(msg.content, keyRef.current);
        return { ...msg, content: decrypted };
      } catch {
        return { ...msg, content: "[Message chiffré - impossible à déchiffrer]" };
      }
    },
    [],
  );

  return {
    ensureReady,
    prefetchPublicKey: fetchKey, // Alias for backward compat during transition
    encryptContent,
    decryptMessage: decryptMsg,
  };
}
