//
//  E2EERepository.swift
//  AceClub
//

import Foundation

class E2EERepository {

    private let e2eeDataSource = E2EEAPIDataSource()

    // MARK: - Get Public Key

    func getPublicKey(userId: String) async throws -> String {
        let response = try await e2eeDataSource.getPublicKey(userId: userId)
        return response.publicKey
    }

    // MARK: - Get Key Backup

    func getKeyBackup() async throws -> (encryptedPrivateKey: String, backupSalt: String) {
        let response = try await e2eeDataSource.getKeyBackup()
        return (encryptedPrivateKey: response.encryptedPrivateKey, backupSalt: response.backupSalt)
    }

    // MARK: - Upload Public Key

    func uploadPublicKey(publicKey: String) async throws {
        _ = try await e2eeDataSource.uploadPublicKey(publicKey: publicKey)
    }

    // MARK: - Upload Key Backup

    func uploadKeyBackup(encryptedPrivateKey: String, backupSalt: String) async throws {
        try await e2eeDataSource.uploadKeyBackup(
            encryptedPrivateKey: encryptedPrivateKey,
            backupSalt: backupSalt
        )
    }
}
