//
//  RecoverE2EEKeyUseCase.swift
//  AceClub
//

import Foundation

class RecoverE2EEKeyUseCase {

    private let e2eeRepository = E2EERepository()

    @MainActor
    func execute(passphrase: String) async throws {
        let backup = try await e2eeRepository.getKeyBackup()
        try E2EEManager.shared.restorePrivateKeyFromBackup(
            encryptedKey: backup.encryptedPrivateKey,
            salt: backup.backupSalt,
            passphrase: passphrase
        )
    }
}
