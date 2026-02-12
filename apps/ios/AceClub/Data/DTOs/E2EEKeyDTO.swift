//
//  E2EEKeyDTO.swift
//  AceClub
//

import Foundation

// MARK: - Public Key Response
struct PublicKeyResponseDTO: Codable {
    let userId: String
    let publicKey: String
    let keyVersion: Int
}

// MARK: - Key Backup Response
struct KeyBackupResponseDTO: Codable {
    let encryptedPrivateKey: String
    let backupSalt: String
}

// MARK: - Upload Keys Request
struct UploadKeysRequestDTO: Codable {
    let publicKey: String
}

// MARK: - Upload Key Backup Request
struct UploadKeyBackupRequestDTO: Codable {
    let encryptedPrivateKey: String
    let backupSalt: String
}
