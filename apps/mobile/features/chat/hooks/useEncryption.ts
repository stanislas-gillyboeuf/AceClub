import { useCallback, useEffect, useRef } from "react";
import { encryptMessage } from "@/lib/encryption";

export function useEncryption(conversationId: string, conversationKey?: string | null) {
  const keyRef = useRef<string | null>(conversationKey ?? null);

  useEffect(() => {
    if (conversationKey != null) {
      keyRef.current = conversationKey;
    }
  }, [conversationKey]);

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

  return { encryptContent };
}
