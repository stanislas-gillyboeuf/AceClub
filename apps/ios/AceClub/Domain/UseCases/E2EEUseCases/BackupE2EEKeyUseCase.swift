//
//  BackupE2EEKeyUseCase.swift
//  AceClub
//

import Foundation

class BackupE2EEKeyUseCase {

    private let e2eeRepository = E2EERepository()

    @MainActor
    func execute(passphrase: String) async throws {
        let (encryptedKey, salt) = try E2EEManager.shared.encryptPrivateKeyWithPassphrase(passphrase)
        try await e2eeRepository.uploadKeyBackup(encryptedPrivateKey: encryptedKey, backupSalt: salt)
    }
}
