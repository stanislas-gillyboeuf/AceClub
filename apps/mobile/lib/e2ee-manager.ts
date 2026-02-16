import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";

// Polyfill crypto.getRandomValues — @noble/curves internally loads @noble/hashes
// which captures globalThis.crypto at module-load time
if (typeof globalThis.crypto === "undefined")
  (globalThis as any).crypto = {} as Crypto;
if (!(globalThis.crypto as any).getRandomValues)
  (globalThis.crypto as any).getRandomValues = Crypto.getRandomValues;

// x25519 ECDH — no native Expo alternative for elliptic curve key exchange
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { x25519 } = require("@noble/curves/ed25519");

const SECURE_STORE_KEY = "e2ee_private_key";
const E2EE_INFO = new TextEncoder().encode("aceclub-e2ee-v1");
const BACKUP_INFO = new TextEncoder().encode("aceclub-e2ee-backup-v1");
const GCM_TAG_LENGTH = 16;
const SHA256_BLOCK = 64;
const SHA256_OUT = 32;

// --- Helpers ---

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
}

function randomBytes(length: number): Uint8Array {
  return Crypto.getRandomBytes(length);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// --- Crypto primitives (expo-crypto native) ---

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buf = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(data));
  return new Uint8Array(buf);
}

async function hmacSha256(key: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  let k = key;
  if (k.length > SHA256_BLOCK) k = await sha256(k);
  if (k.length < SHA256_BLOCK) {
    const padded = new Uint8Array(SHA256_BLOCK);
    padded.set(k);
    k = padded;
  }
  const ipad = new Uint8Array(SHA256_BLOCK);
  const opad = new Uint8Array(SHA256_BLOCK);
  for (let i = 0; i < SHA256_BLOCK; i++) {
    ipad[i] = k[i] ^ 0x36;
    opad[i] = k[i] ^ 0x5c;
  }
  const inner = await sha256(concat(ipad, msg));
  return sha256(concat(opad, inner));
}

// HKDF-SHA256 (RFC 5869)
async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const prk = await hmacSha256(
    salt.length > 0 ? salt : new Uint8Array(SHA256_OUT),
    ikm,
  );
  const n = Math.ceil(length / SHA256_OUT);
  const okm = new Uint8Array(n * SHA256_OUT);
  let prev = new Uint8Array(0);
  for (let i = 1; i <= n; i++) {
    prev = await hmacSha256(prk, concat(prev, info, new Uint8Array([i] as unknown as Uint8Array)));
    okm.set(prev, (i - 1) * SHA256_OUT);
  }
  return okm.slice(0, length);
}

// --- E2EE Manager ---

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
    if (!this.hasKeyPair) {
      this.generateKeyPair();
    }
    this.initialized = true;
  }

  generateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const privKey = randomBytes(32);
    const pubKey = x25519.getPublicKey(privKey);
    this.privateKey = privKey;
    this.publicKey = pubKey;
    this.savePrivateKeyToStore(privKey);
    return { privateKey: privKey, publicKey: pubKey };
  }

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

  async deriveConversationKey(
    theirPublicKeyBase64: string,
    conversationId: string,
  ): Promise<Uint8Array> {
    const cached = this.conversationKeyCache.get(conversationId);
    if (cached) return cached;

    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune clé privée trouvée");
    }

    const theirPublicKey = fromBase64(theirPublicKeyBase64);
    const sharedSecret = x25519.getSharedSecret(this.privateKey, theirPublicKey);

    const salt = new TextEncoder().encode(conversationId);
    const derivedKey = await hkdf(sharedSecret, salt, E2EE_INFO, 32);

    this.conversationKeyCache.set(conversationId, derivedKey);
    return derivedKey;
  }

  clearConversationKeyCache(): void {
    this.conversationKeyCache.clear();
  }

  async encryptMessage(plaintext: string, key: Uint8Array): Promise<string> {
    const plaintextBytes = new TextEncoder().encode(plaintext);
    const nonce = randomBytes(12);

    const aesKey = await Crypto.AESEncryptionKey.import(key);
    const sealed = await Crypto.aesEncryptAsync(plaintextBytes, aesKey, {
      nonce: { bytes: nonce },
      tagLength: GCM_TAG_LENGTH,
    });

    const ciphertextWithTag = await sealed.ciphertext({ includeTag: true });
    const payload = JSON.stringify({
      v: 1,
      n: toBase64(nonce),
      c: toBase64(ciphertextWithTag as Uint8Array),
    });
    return toBase64(new TextEncoder().encode(payload));
  }

  async decryptMessage(
    encryptedContent: string,
    key: Uint8Array,
  ): Promise<string> {
    const jsonBytes = fromBase64(encryptedContent);
    const payload = JSON.parse(new TextDecoder().decode(jsonBytes));

    if (payload.v !== 1 || !payload.n || !payload.c) {
      throw new E2EEError("decryptionFailed", "Format de message invalide");
    }

    const nonce = fromBase64(payload.n);
    const ciphertextAndTag = fromBase64(payload.c);

    const sealed = Crypto.AESSealedData.fromParts(
      nonce,
      ciphertextAndTag,
      GCM_TAG_LENGTH,
    );
    const aesKey = await Crypto.AESEncryptionKey.import(key);
    const decrypted = await Crypto.aesDecryptAsync(sealed, aesKey, {
      output: "bytes",
    });

    return new TextDecoder().decode(decrypted);
  }

  async encryptPrivateKeyWithPassphrase(
    passphrase: string,
  ): Promise<{ encryptedKey: string; salt: string }> {
    if (!this.privateKey) {
      throw new E2EEError("noPrivateKey", "Aucune clé privée trouvée");
    }

    const salt = randomBytes(32);
    const derivedKey = await this.deriveKeyFromPassphrase(passphrase, salt);

    const nonce = randomBytes(12);
    const aesKey = await Crypto.AESEncryptionKey.import(derivedKey);
    const sealed = await Crypto.aesEncryptAsync(this.privateKey, aesKey, {
      nonce: { bytes: nonce },
      tagLength: GCM_TAG_LENGTH,
    });

    const ciphertextWithTag = (await sealed.ciphertext({
      includeTag: true,
    })) as Uint8Array;
    const combined = concat(nonce, ciphertextWithTag);

    return {
      encryptedKey: toBase64(combined),
      salt: toBase64(salt),
    };
  }

  async restorePrivateKeyFromBackup(
    encryptedKey: string,
    salt: string,
    passphrase: string,
  ): Promise<void> {
    const encryptedData = fromBase64(encryptedKey);
    const saltData = fromBase64(salt);

    const derivedKey = await this.deriveKeyFromPassphrase(passphrase, saltData);

    const nonce = encryptedData.slice(0, 12);
    const ciphertextAndTag = encryptedData.slice(12);

    const sealed = Crypto.AESSealedData.fromParts(
      nonce,
      ciphertextAndTag,
      GCM_TAG_LENGTH,
    );
    const aesKey = await Crypto.AESEncryptionKey.import(derivedKey);
    const keyData = (await Crypto.aesDecryptAsync(sealed, aesKey, {
      output: "bytes",
    })) as Uint8Array;

    if (keyData.length !== 32) {
      throw new E2EEError("invalidBackupData", "Données de backup invalides");
    }

    this.privateKey = keyData;
    this.publicKey = x25519.getPublicKey(keyData);
    this.savePrivateKeyToStore(keyData);
    this.conversationKeyCache.clear();
  }

  private async deriveKeyFromPassphrase(
    passphrase: string,
    salt: Uint8Array,
  ): Promise<Uint8Array> {
    const passphraseBytes = new TextEncoder().encode(passphrase);
    const combined = concat(passphraseBytes, salt);
    const hash = await sha256(combined);
    return hkdf(hash, salt, BACKUP_INFO, 32);
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
