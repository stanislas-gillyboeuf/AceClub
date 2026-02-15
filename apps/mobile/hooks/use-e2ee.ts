import { useCallback, useEffect, useState } from "react";
import { e2eeManager } from "@/lib/e2ee";
import { e2eeService } from "@/services/e2ee";
import { ApiError } from "@/lib/api";

/**
 * Hook to initialize and manage E2EE keys.
 * Mirrors the iOS SetupE2EEKeysUseCase:
 * - On mount, initializes the E2EE manager (loads keys from SecureStore)
 * - If keys exist locally, uploads the public key to the server
 * - If no keys exist, generates a new pair and uploads
 */
export function useE2EESetup() {
  const [isReady, setIsReady] = useState(false);
  const [needsBackup, setNeedsBackup] = useState(false);

  useEffect(() => {
    (async () => {
      await e2eeManager.initialize();

      if (e2eeManager.hasKeyPair) {
        // Keys already exist - upload public key
        const publicKey = e2eeManager.publicKeyBase64;
        if (publicKey) {
          try {
            await e2eeService.uploadPublicKey({ publicKey });
          } catch {
            // Upload failed - continue, will retry later
          }
        }
        setIsReady(true);
      } else {
        // Generate new key pair
        const { publicKey } = await e2eeManager.generateKeyPair();
        const publicKeyBase64 = e2eeManager.publicKeyBase64;
        if (publicKeyBase64) {
          try {
            await e2eeService.uploadPublicKey({ publicKey: publicKeyBase64 });
          } catch {
            // Upload failed
          }
        }
        setNeedsBackup(true);
        setIsReady(true);
      }
    })();
  }, []);

  return { isReady, needsBackup };
}

/**
 * Hook to encrypt a message for a conversation.
 * Returns null if E2EE is not available for this conversation.
 */
export function useEncryptMessage() {
  return useCallback(
    async (
      content: string,
      conversationId: string,
      otherParticipantId: string
    ): Promise<{ encrypted: string; isEncrypted: true } | { encrypted: string; isEncrypted: false }> => {
      await e2eeManager.initialize();

      if (!e2eeManager.hasKeyPair) {
        return { encrypted: content, isEncrypted: false };
      }

      try {
        const response = await e2eeService.getPublicKey(otherParticipantId);
        const key = e2eeManager.deriveConversationKey(response.publicKey, conversationId);
        const encrypted = e2eeManager.encryptMessage(content, key);
        return { encrypted, isEncrypted: true };
      } catch (err) {
        // If recipient has no keys (404), send plaintext
        if (err instanceof ApiError && err.status === 404) {
          return { encrypted: content, isEncrypted: false };
        }
        // Other errors - fallback to plaintext
        return { encrypted: content, isEncrypted: false };
      }
    },
    []
  );
}

/**
 * Hook to decrypt a message from a conversation.
 */
export function useDecryptMessage() {
  return useCallback(
    async (
      encryptedContent: string,
      conversationId: string,
      senderUserId: string
    ): Promise<string> => {
      await e2eeManager.initialize();

      if (!e2eeManager.hasKeyPair) {
        return "[Message chiffr\u00e9 - impossible \u00e0 d\u00e9chiffrer]";
      }

      try {
        const response = await e2eeService.getPublicKey(senderUserId);
        const key = e2eeManager.deriveConversationKey(response.publicKey, conversationId);
        return e2eeManager.decryptMessage(encryptedContent, key);
      } catch {
        return "[Message chiffr\u00e9 - impossible \u00e0 d\u00e9chiffrer]";
      }
    },
    []
  );
}
