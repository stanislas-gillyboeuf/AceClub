// @ts-expect-error — noble v2 uses exports map with .js extension
import { x25519 } from "@noble/curves/ed25519";
// @ts-expect-error — noble v2 uses exports map with .js extension
import { gcm } from "@noble/ciphers/aes";
// @ts-expect-error — noble v2 uses exports map with .js extension
import { hkdf } from "@noble/hashes/hkdf";
// @ts-expect-error — noble v2 uses exports map with .js extension
import { sha256 } from "@noble/hashes/sha2";
// @ts-expect-error — noble v2 uses exports map with .js extension
import { concatBytes, randomBytes } from "@noble/hashes/utils";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";

const SECURE_STORE_KEY = "e2ee_private_key";
const E2EE_INFO = new TextEncoder().encode("aceclub-e2ee-v1");
const BACKUP_INFO = new TextEncoder().encode("aceclub-e2ee-backup-v1");

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
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
    return this.publicKey ? toBase64(this.publicKey) : null;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.loadKeyPairFromStore();
    this.initialized = true;
  }

  // Key generation
  generateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const privKey = x25519.utils.randomPrivateKey();
    const pubKey = x25519.getPublicKey(privKey);

    this.privateKey = privKey;
    this.publicKey = pubKey;

    this.savePrivateKeyToStore(privKey);

    return { privateKey: privKey, publicKey: pubKey };
  }

  // SecureStore persistence
  private async savePrivateKeyToStore(key: Uint8Array): Promise<void> {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, toBase64(key));
    } catch (error) {
      console.warn("[E2EE] Failed to save private key:", error);
    }
  }

  private async loadKeyPairFromStore(): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (!stored) return;

      const privKey = fromBase64(stored);
      if (privKey.length !== 32) return;

      this.privateKey = privKey;
      this.publicKey = x25519.getPublicKey(privKey);
    } catch {
      // Key not found or invalid
    }
  }

  async deleteKeyPair(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    } catch {
      // Ignore
    }
    this.privateKey = null;
    this.publicKey = null;
    this.conversationKeyCache.clear();
  }

  // Key derivation — compatible with iOS CryptoKit ECDH + HKDF
  deriveConversationKey(theirPublicKeyBase64: string, conversationId: string): Uint8Array {
    const cached = this.conversationKeyCache.get(conversationId);
    if (cached) return cached;

    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune clé privée trouvée");
    }

    const theirPublicKey = fromBase64(theirPublicKeyBase64);
    const sharedSecret = x25519.getSharedSecret(this.privateKey, theirPublicKey);

    const salt = new TextEncoder().encode(conversationId);
    const derivedKey = hkdf(sha256, sharedSecret, salt, E2EE_INFO, 32);

    this.conversationKeyCache.set(conversationId, derivedKey);
    return derivedKey;
  }

  clearConversationKeyCache(): void {
    this.conversationKeyCache.clear();
  }

  // Message encryption — format compatible with iOS: {"v":1,"n":"<nonce>","c":"<ciphertext+tag>"}
  encryptMessage(plaintext: string, key: Uint8Array): string {
    const plaintextBytes = new TextEncoder().encode(plaintext);
    const nonce = randomBytes(12);

    const cipher = gcm(key, nonce);
    const ciphertextAndTag = cipher.encrypt(plaintextBytes);

    const payload = JSON.stringify({
      v: 1,
      n: toBase64(nonce),
      c: toBase64(ciphertextAndTag),
    });

    return toBase64(new TextEncoder().encode(payload));
  }

  decryptMessage(encryptedContent: string, key: Uint8Array): string {
    const jsonBytes = fromBase64(encryptedContent);
    const payload = JSON.parse(new TextDecoder().decode(jsonBytes));

    if (payload.v !== 1 || !payload.n || !payload.c) {
      throw new E2EEError("decryptionFailed", "Format de message invalide");
    }

    const nonce = fromBase64(payload.n);
    const ciphertextAndTag = fromBase64(payload.c);

    const cipher = gcm(key, nonce);
    const decrypted = cipher.decrypt(ciphertextAndTag);

    return new TextDecoder().decode(decrypted);
  }

  // Backup / Recovery — compatible with iOS passphrase-based backup
  encryptPrivateKeyWithPassphrase(passphrase: string): { encryptedKey: string; salt: string } {
    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune clé privée trouvée");
    }

    const salt = randomBytes(32);
    const derivedKey = this.deriveKeyFromPassphrase(passphrase, salt);

    const nonce = randomBytes(12);
    const cipher = gcm(derivedKey, nonce);
    const encrypted = cipher.encrypt(this.privateKey);

    // Combined format: nonce + encrypted (same as iOS AES.GCM.SealedBox.combined)
    const combined = concatBytes(nonce, encrypted);

    return {
      encryptedKey: toBase64(combined),
      salt: toBase64(salt),
    };
  }

  restorePrivateKeyFromBackup(encryptedKey: string, salt: string, passphrase: string): void {
    const encryptedData = fromBase64(encryptedKey);
    const saltData = fromBase64(salt);

    const derivedKey = this.deriveKeyFromPassphrase(passphrase, saltData);

    // Split combined: nonce (12 bytes) + ciphertext+tag
    const nonce = encryptedData.slice(0, 12);
    const ciphertextAndTag = encryptedData.slice(12);

    const cipher = gcm(derivedKey, nonce);
    const keyData = cipher.decrypt(ciphertextAndTag);

    if (keyData.length !== 32) {
      throw new E2EEError("invalidBackupData", "Données de backup invalides");
    }

    this.privateKey = keyData;
    this.publicKey = x25519.getPublicKey(keyData);
    this.savePrivateKeyToStore(keyData);
    this.conversationKeyCache.clear();
  }

  // Passphrase key derivation — matches iOS: SHA256(passphrase + salt) → HKDF
  private deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Uint8Array {
    const passphraseBytes = new TextEncoder().encode(passphrase);
    const combined = concatBytes(passphraseBytes, salt);
    const hash = sha256(combined);
    return hkdf(sha256, hash, salt, BACKUP_INFO, 32);
  }
}

export class E2EEError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const e2eeManager = new E2EEManager();
