//
//  E2EEManager.swift
//  AceClub
//

import Foundation
import CryptoKit
import Security

@MainActor
class E2EEManager {

    static let shared = E2EEManager()

    private init() {
        loadKeyPairFromKeychain()
    }

    // MARK: - Properties

    private(set) var privateKey: Curve25519.KeyAgreement.PrivateKey?
    private(set) var publicKey: Curve25519.KeyAgreement.PublicKey?

    var hasKeyPair: Bool {
        privateKey != nil && publicKey != nil
    }

    var publicKeyBase64: String? {
        publicKey?.rawRepresentation.base64EncodedString()
    }

    // MARK: - Conversation Key Cache

    private var conversationKeyCache: [String: SymmetricKey] = [:]

    // MARK: - Keychain Constants

    private let keychainService = "com.aceclub.e2ee"
    private let privateKeyAccount = "e2ee_private_key"

    // MARK: - Key Generation

    func generateKeyPair() -> (privateKey: Curve25519.KeyAgreement.PrivateKey, publicKey: Curve25519.KeyAgreement.PublicKey) {
        let privKey = Curve25519.KeyAgreement.PrivateKey()
        let pubKey = privKey.publicKey

        self.privateKey = privKey
        self.publicKey = pubKey

        savePrivateKeyToKeychain(privKey)

        return (privKey, pubKey)
    }

    // MARK: - Keychain Storage (iCloud Sync)

    private func savePrivateKeyToKeychain(_ key: Curve25519.KeyAgreement.PrivateKey) {
        let keyData = key.rawRepresentation

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: privateKeyAccount,
            kSecAttrSynchronizable as String: true
        ]

        // Delete existing
        SecItemDelete(query as CFDictionary)

        var addQuery = query
        addQuery[kSecValueData as String] = keyData

        let status = SecItemAdd(addQuery as CFDictionary, nil)
        if status != errSecSuccess {
            print("[E2EE] Failed to save private key to Keychain: \(status)")
        }
    }

    private func loadKeyPairFromKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: privateKeyAccount,
            kSecAttrSynchronizable as String: true,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let keyData = result as? Data,
              let privKey = try? Curve25519.KeyAgreement.PrivateKey(rawRepresentation: keyData) else {
            return
        }

        self.privateKey = privKey
        self.publicKey = privKey.publicKey
    }

    func deleteKeyPairFromKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: privateKeyAccount,
            kSecAttrSynchronizable as String: true
        ]

        SecItemDelete(query as CFDictionary)
        privateKey = nil
        publicKey = nil
        conversationKeyCache.removeAll()
    }

    // MARK: - Key Derivation

    func deriveConversationKey(theirPublicKeyBase64: String, conversationId: String) throws -> SymmetricKey {
        // Check cache
        if let cached = conversationKeyCache[conversationId] {
            return cached
        }

        guard let privKey = privateKey else {
            throw E2EEError.noPrivateKey
        }

        guard let theirKeyData = Data(base64Encoded: theirPublicKeyBase64) else {
            throw E2EEError.invalidPublicKey
        }

        let theirPublicKey = try Curve25519.KeyAgreement.PublicKey(rawRepresentation: theirKeyData)

        let sharedSecret = try privKey.sharedSecretFromKeyAgreement(with: theirPublicKey)

        let salt = Data(conversationId.utf8)
        let info = Data("aceclub-e2ee-v1".utf8)

        let derivedKey = sharedSecret.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: salt,
            sharedInfo: info,
            outputByteCount: 32
        )

        conversationKeyCache[conversationId] = derivedKey
        return derivedKey
    }

    func clearConversationKeyCache() {
        conversationKeyCache.removeAll()
    }

    // MARK: - Message Encryption

    func encryptMessage(_ plaintext: String, withKey key: SymmetricKey) throws -> String {
        let plaintextData = Data(plaintext.utf8)
        let sealedBox = try AES.GCM.seal(plaintextData, using: key)

        guard let combined = sealedBox.combined else {
            throw E2EEError.encryptionFailed
        }

        // Format: {"v":1,"n":"<nonce base64>","c":"<ciphertext+tag base64>"}
        let nonce = sealedBox.nonce.withUnsafeBytes { Data($0) }
        let ciphertextAndTag = combined.dropFirst(12) // Remove nonce (12 bytes) from combined

        let payload: [String: Any] = [
            "v": 1,
            "n": nonce.base64EncodedString(),
            "c": ciphertextAndTag.base64EncodedString()
        ]

        let jsonData = try JSONSerialization.data(withJSONObject: payload)
        return jsonData.base64EncodedString()
    }

    func decryptMessage(_ encryptedContent: String, withKey key: SymmetricKey) throws -> String {
        guard let jsonData = Data(base64Encoded: encryptedContent) else {
            throw E2EEError.decryptionFailed
        }

        guard let payload = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
              let version = payload["v"] as? Int,
              version == 1,
              let nonceBase64 = payload["n"] as? String,
              let ciphertextBase64 = payload["c"] as? String,
              let nonceData = Data(base64Encoded: nonceBase64),
              let ciphertextAndTag = Data(base64Encoded: ciphertextBase64) else {
            throw E2EEError.decryptionFailed
        }

        let combined = nonceData + ciphertextAndTag
        let sealedBox = try AES.GCM.SealedBox(combined: combined)
        let decryptedData = try AES.GCM.open(sealedBox, using: key)

        guard let plaintext = String(data: decryptedData, encoding: .utf8) else {
            throw E2EEError.decryptionFailed
        }

        return plaintext
    }

    // MARK: - Backup / Recovery

    func encryptPrivateKeyWithPassphrase(_ passphrase: String) throws -> (encryptedKey: String, salt: String) {
        guard let privKey = privateKey else {
            throw E2EEError.noPrivateKey
        }

        let salt = generateRandomSalt()
        let derivedKey = deriveKeyFromPassphrase(passphrase, salt: salt)

        let keyData = privKey.rawRepresentation
        let sealedBox = try AES.GCM.seal(keyData, using: derivedKey)

        guard let combined = sealedBox.combined else {
            throw E2EEError.encryptionFailed
        }

        return (
            encryptedKey: combined.base64EncodedString(),
            salt: salt.base64EncodedString()
        )
    }

    func restorePrivateKeyFromBackup(encryptedKey: String, salt: String, passphrase: String) throws {
        guard let encryptedData = Data(base64Encoded: encryptedKey),
              let saltData = Data(base64Encoded: salt) else {
            throw E2EEError.invalidBackupData
        }

        let derivedKey = deriveKeyFromPassphrase(passphrase, salt: saltData)

        let sealedBox = try AES.GCM.SealedBox(combined: encryptedData)
        let keyData = try AES.GCM.open(sealedBox, using: derivedKey)

        let privKey = try Curve25519.KeyAgreement.PrivateKey(rawRepresentation: keyData)

        self.privateKey = privKey
        self.publicKey = privKey.publicKey
        savePrivateKeyToKeychain(privKey)
        conversationKeyCache.removeAll()
    }

    // MARK: - Private Helpers

    private func generateRandomSalt() -> Data {
        var salt = Data(count: 32)
        _ = salt.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }
        return salt
    }

    private func deriveKeyFromPassphrase(_ passphrase: String, salt: Data) -> SymmetricKey {
        let passphraseData = Data(passphrase.utf8)
        let hash = SHA256.hash(data: passphraseData + salt)
        let hashData = Data(hash)

        return SymmetricKey(data: HKDF<SHA256>.deriveKey(
            inputKeyMaterial: SymmetricKey(data: hashData),
            salt: salt,
            info: Data("aceclub-e2ee-backup-v1".utf8),
            outputByteCount: 32
        ))
    }
}

// MARK: - E2EE Errors

enum E2EEError: LocalizedError {
    case noPrivateKey
    case invalidPublicKey
    case encryptionFailed
    case decryptionFailed
    case invalidBackupData

    var errorDescription: String? {
        switch self {
        case .noPrivateKey:
            return String(localized: "Aucune clé privée trouvée")
        case .invalidPublicKey:
            return String(localized: "Clé publique invalide")
        case .encryptionFailed:
            return String(localized: "Échec du chiffrement")
        case .decryptionFailed:
            return String(localized: "Échec du déchiffrement")
        case .invalidBackupData:
            return String(localized: "Données de backup invalides")
        }
    }
}

