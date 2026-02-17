import {
  AESEncryptionKey,
  AESSealedData,
  aesEncryptAsync,
  aesDecryptAsync,
} from "expo-crypto";

/**
 * Encrypt a plaintext message using AES-256-GCM.
 * Returns a JSON string with format: { v: 2, n: <nonce_base64>, c: <ciphertext+tag_base64> }
 */
export async function encryptMessage(
  plaintext: string,
  keyBase64: string,
): Promise<string> {
  const key = await AESEncryptionKey.import(keyBase64, "base64");

  // Encode plaintext to base64 for the encrypt API (BinaryInput string = base64)
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const plaintextBase64 = uint8ArrayToBase64(plaintextBytes);

  const sealed = await aesEncryptAsync(plaintextBase64, key);

  const nonce = await sealed.iv("base64");
  const ciphertextWithTag = await sealed.ciphertext({
    includeTag: true,
    encoding: "base64",
  });

  return JSON.stringify({ v: 2, n: nonce, c: ciphertextWithTag });
}

/**
 * Decrypt a message encrypted with encryptMessage.
 * Returns the plaintext string, or a placeholder for v1 (legacy E2EE) messages.
 */
export async function decryptMessage(
  encryptedContent: string,
  keyBase64: string,
): Promise<string> {
  const parsed = JSON.parse(encryptedContent);

  if (parsed.v === 1) {
    return "[Ancien message chiffré]";
  }

  if (parsed.v !== 2) {
    throw new Error(`Unknown encryption version: ${parsed.v}`);
  }

  const key = await AESEncryptionKey.import(keyBase64, "base64");

  // Reconstruct sealed data from nonce + ciphertext (with tag appended)
  const sealed = AESSealedData.fromParts(parsed.n, parsed.c);

  const decryptedBytes = await aesDecryptAsync(sealed, key);
  // decryptedBytes is Uint8Array by default
  return new TextDecoder().decode(decryptedBytes as Uint8Array);
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
