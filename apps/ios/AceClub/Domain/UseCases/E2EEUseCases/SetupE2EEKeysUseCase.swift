//
//  SetupE2EEKeysUseCase.swift
//  AceClub
//

import Foundation
import CryptoKit

class SetupE2EEKeysUseCase {

    private let e2eeRepository = E2EERepository()

    /// Sets up E2EE keys. Returns `true` if new keys were generated (backup should be proposed).
    @MainActor
    func execute() async throws -> Bool {
        let manager = E2EEManager.shared

        // Already have keys in Keychain
        if manager.hasKeyPair {
            // Make sure the server has our public key
            if let pubKeyBase64 = manager.publicKeyBase64 {
                try? await e2eeRepository.uploadPublicKey(publicKey: pubKeyBase64)
            }
            return false
        }

        // Generate new key pair
        let keyPair = manager.generateKeyPair()
        let publicKeyBase64 = keyPair.publicKey.rawRepresentation.base64EncodedString()

        // Upload public key to server
        try await e2eeRepository.uploadPublicKey(publicKey: publicKeyBase64)

        return true
    }
}
