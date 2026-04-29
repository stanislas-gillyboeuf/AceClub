import { AESEncryptionKey, aesEncryptAsync } from "expo-crypto";

export async function encryptMessage(
  plaintext: string,
  keyBase64: string,
): Promise<string> {
  const key = await AESEncryptionKey.import(keyBase64, "base64");

  const plaintextBytes = new TextEncoder().encode(plaintext);
  const plaintextBase64 = uint8ArrayToBase64(plaintextBytes);

  const sealed = await aesEncryptAsync(plaintextBase64, key);

  const nonce = await sealed.iv("base64");
  const rawCiphertext = await sealed.ciphertext({
    includeTag: true,
    encoding: "base64",
  });
  const ciphertextWithTag =
    typeof rawCiphertext === "string"
      ? rawCiphertext
      : uint8ArrayToBase64(rawCiphertext as Uint8Array);

  return JSON.stringify({ v: 2, n: nonce, c: ciphertextWithTag });
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
