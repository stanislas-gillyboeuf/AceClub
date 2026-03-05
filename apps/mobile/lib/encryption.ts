import {
  AESEncryptionKey,
  aesEncryptAsync,
} from "expo-crypto";

/**
 * Encrypt a plaintext message using AES-256-GCM.
 * Returns a JSON string with format: { v: 2, n: <nonce_base64>, c: <ciphertext+tag_base64> }
 *
 * Decryption is handled server-side (Node.js crypto) to guarantee
 * compatibility across all devices regardless of expo-crypto support.
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

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
