/**
 * E2EE Manager for React Native
 *
 * Implements the same Curve25519 ECDH + AES-256-GCM encryption as the iOS app.
 * Uses @noble/curves for X25519 key agreement and @noble/ciphers for AES-GCM.
 *
 * Key derivation:
 *   sharedSecret = X25519(myPrivateKey, theirPublicKey)
 *   conversationKey = HKDF-SHA256(sharedSecret, salt=conversationId, info="aceclub-e2ee-v1", len=32)
 *
 * Message format (base64 of JSON):
 *   { "v": 1, "n": "<nonce_b64>", "c": "<ciphertext+tag_b64>" }
 */

// @ts-expect-error - noble packages use .js exports resolved by Metro bundler
import { x25519 } from "@noble/curves/ed25519";
// @ts-expect-error - noble packages use .js exports resolved by Metro bundler
import { hkdf } from "@noble/hashes/hkdf";
// @ts-expect-error - noble packages use .js exports resolved by Metro bundler
import { sha256 } from "@noble/hashes/sha2";
// @ts-expect-error - noble packages use .js exports resolved by Metro bundler
import { gcm } from "@noble/ciphers/aes";
// @ts-expect-error - noble packages use .js exports resolved by Metro bundler
import { randomBytes } from "@noble/hashes/utils";
import * as SecureStore from "expo-secure-store";

const E2EE_PRIVATE_KEY = "e2ee_private_key";
const E2EE_INFO = new TextEncoder().encode("aceclub-e2ee-v1");
const E2EE_BACKUP_INFO = new TextEncoder().encode("aceclub-e2ee-backup-v1");

// Base64 encode/decode helpers
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

class E2EEManager {
  private privateKey: Uint8Array | null = null;
  private publicKey: Uint8Array | null = null;
  private conversationKeyCache: Map<string, Uint8Array> = new Map();
  private initialized = false;

  get hasKeyPair(): boolean {
    return this.privateKey !== null && this.publicKey !== null;
  }

  get publicKeyBase64(): string | null {
    if (!this.publicKey) return null;
    return toBase64(this.publicKey);
  }

  // Load key pair from SecureStore on init
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const stored = await SecureStore.getItemAsync(E2EE_PRIVATE_KEY);
      if (stored) {
        this.privateKey = fromBase64(stored);
        this.publicKey = x25519.getPublicKey(this.privateKey);
      }
    } catch {
      // Key not found - that's ok
    }
  }

  // Generate a new X25519 key pair and persist it
  async generateKeyPair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
    const privKey = x25519.utils.randomPrivateKey();
    const pubKey = x25519.getPublicKey(privKey);
    this.privateKey = privKey;
    this.publicKey = pubKey;

    await SecureStore.setItemAsync(E2EE_PRIVATE_KEY, toBase64(privKey));
    this.conversationKeyCache.clear();

    return { privateKey: privKey, publicKey: pubKey };
  }

  // Delete keys from storage
  async deleteKeyPair(): Promise<void> {
    this.privateKey = null;
    this.publicKey = null;
    this.conversationKeyCache.clear();
    await SecureStore.deleteItemAsync(E2EE_PRIVATE_KEY);
  }

  /**
   * Derive a conversation-specific symmetric key using ECDH + HKDF.
   * Matches iOS implementation:
   *   sharedSecret = X25519(myPrivateKey, theirPublicKey)
   *   key = HKDF-SHA256(sharedSecret, salt=conversationId, info="aceclub-e2ee-v1", len=32)
   */
  deriveConversationKey(theirPublicKeyBase64: string, conversationId: string): Uint8Array {
    // Check cache
    const cached = this.conversationKeyCache.get(conversationId);
    if (cached) return cached;

    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune cl\u00e9 priv\u00e9e trouv\u00e9e");
    }

    const theirPublicKey = fromBase64(theirPublicKeyBase64);
    if (theirPublicKey.length !== 32) {
      throw new E2EEError("invalidPublicKey", "Cl\u00e9 publique invalide");
    }

    // ECDH key agreement (X25519)
    const sharedSecret = x25519.getSharedSecret(this.privateKey, theirPublicKey);

    // HKDF-SHA256 key derivation
    const salt = new TextEncoder().encode(conversationId);
    const derivedKey = hkdf(sha256, sharedSecret, salt, E2EE_INFO, 32);

    this.conversationKeyCache.set(conversationId, derivedKey);
    return derivedKey;
  }

  clearConversationKeyCache(): void {
    this.conversationKeyCache.clear();
  }

  /**
   * Encrypt a message using AES-256-GCM.
   * Output format: base64 of JSON { "v": 1, "n": "<nonce_b64>", "c": "<ciphertext+tag_b64>" }
   * This matches the iOS E2EEManager format exactly.
   */
  encryptMessage(plaintext: string, key: Uint8Array): string {
    const nonce = randomBytes(12); // 12-byte nonce for AES-GCM
    const plaintextBytes = new TextEncoder().encode(plaintext);

    const cipher = gcm(key, nonce);
    const ciphertextAndTag = cipher.encrypt(plaintextBytes);

    const payload = JSON.stringify({
      v: 1,
      n: toBase64(nonce),
      c: toBase64(ciphertextAndTag),
    });

    return toBase64(new TextEncoder().encode(payload));
  }

  /**
   * Decrypt a message using AES-256-GCM.
   * Input format: base64 of JSON { "v": 1, "n": "<nonce_b64>", "c": "<ciphertext+tag_b64>" }
   */
  decryptMessage(encryptedContent: string, key: Uint8Array): string {
    try {
      const jsonBytes = fromBase64(encryptedContent);
      const jsonStr = new TextDecoder().decode(jsonBytes);
      const payload = JSON.parse(jsonStr) as { v: number; n: string; c: string };

      if (payload.v !== 1) {
        throw new E2EEError("decryptionFailed", "\u00c9chec du d\u00e9chiffrement");
      }

      const nonce = fromBase64(payload.n);
      const ciphertextAndTag = fromBase64(payload.c);

      const cipher = gcm(key, nonce);
      const decrypted = cipher.decrypt(ciphertextAndTag);

      return new TextDecoder().decode(decrypted);
    } catch (err) {
      if (err instanceof E2EEError) throw err;
      throw new E2EEError("decryptionFailed", "\u00c9chec du d\u00e9chiffrement");
    }
  }

  /**
   * Encrypt private key with a passphrase for backup.
   * Matches iOS: SHA256(passphrase + salt) -> HKDF -> AES-GCM encrypt
   */
  encryptPrivateKeyWithPassphrase(passphrase: string): { encryptedKey: string; salt: string } {
    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune cl\u00e9 priv\u00e9e trouv\u00e9e");
    }

    const salt = randomBytes(32);
    const derivedKey = this.deriveKeyFromPassphrase(passphrase, salt);

    const nonce = randomBytes(12);
    const cipher = gcm(derivedKey, nonce);
    const encrypted = cipher.encrypt(this.privateKey);

    // Combine nonce + encrypted (same as iOS AES.GCM.seal combined format)
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return {
      encryptedKey: toBase64(combined),
      salt: toBase64(salt),
    };
  }

  /**
   * Restore private key from backup using passphrase.
   */
  async restorePrivateKeyFromBackup(
    encryptedKey: string,
    salt: string,
    passphrase: string
  ): Promise<void> {
    const encryptedData = fromBase64(encryptedKey);
    const saltData = fromBase64(salt);

    if (encryptedData.length < 12) {
      throw new E2EEError("invalidBackupData", "Donn\u00e9es de backup invalides");
    }

    const derivedKey = this.deriveKeyFromPassphrase(passphrase, saltData);

    // Split nonce (12 bytes) from ciphertext+tag
    const nonce = encryptedData.slice(0, 12);
    const ciphertextAndTag = encryptedData.slice(12);

    const cipher = gcm(derivedKey, nonce);
    const keyData = cipher.decrypt(ciphertextAndTag);

    this.privateKey = keyData;
    this.publicKey = x25519.getPublicKey(keyData);
    this.conversationKeyCache.clear();

    await SecureStore.setItemAsync(E2EE_PRIVATE_KEY, toBase64(keyData));
  }

  private deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Uint8Array {
    const passphraseBytes = new TextEncoder().encode(passphrase);
    // SHA256(passphrase + salt)
    const combined = new Uint8Array(passphraseBytes.length + salt.length);
    combined.set(passphraseBytes);
    combined.set(salt, passphraseBytes.length);
    const hash = sha256(combined);

    // HKDF derivation
    return hkdf(sha256, hash, salt, E2EE_BACKUP_INFO, 32);
  }
}

export class E2EEError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// Singleton instance
export const e2eeManager = new E2EEManager();
