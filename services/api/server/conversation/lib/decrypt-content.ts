import { createDecipheriv } from "crypto";

/**
 * Decrypt a v2 AES-256-GCM encrypted message server-side.
 * Returns the plaintext, or the original content if not encrypted / unknown format.
 */
export function decryptMessageContent(
  content: string,
  encryptionKey: string | null,
): string {
  if (!encryptionKey || !content) return content;

  let parsed: { v?: number; n?: string; c?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    // Not JSON — not a v2 encrypted message
    return content;
  }

  if (parsed.v !== 2 || !parsed.n || !parsed.c) {
    return content;
  }

  try {
    const key = Buffer.from(encryptionKey, "base64");
    const iv = Buffer.from(parsed.n, "base64");
    const ciphertextWithTag = Buffer.from(parsed.c, "base64");

    // AES-GCM: last 16 bytes are the auth tag
    const TAG_LENGTH = 16;
    const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - TAG_LENGTH);
    const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - TAG_LENGTH);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    // Decryption failed — return original content as fallback
    return content;
  }
}
