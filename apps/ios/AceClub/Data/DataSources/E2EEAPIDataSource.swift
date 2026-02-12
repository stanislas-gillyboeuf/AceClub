//
//  E2EEAPIDataSource.swift
//  AceClub
//

import Foundation

enum E2EEAPIDataSourceError: LocalizedError {
    case invalidURL
    case requestFailed(statusCode: Int)
    case decodingFailed(Error)
    case encodingFailed(Error)
    case unauthorized
    case notFound
    case badRequest(String)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return String(localized: "URL invalide")
        case .requestFailed(let statusCode):
            return String(localized: "Échec de la requête (code: \(statusCode))")
        case .decodingFailed:
            return String(localized: "Erreur de décodage des données")
        case .encodingFailed(let error):
            return String(localized: "Erreur d'encodage: \(error.localizedDescription)")
        case .unauthorized:
            return String(localized: "Non autorisé")
        case .notFound:
            return String(localized: "Clé introuvable")
        case .badRequest(let message):
            return String(localized: "Requête invalide: \(message)")
        case .unknown:
            return String(localized: "Erreur inconnue")
        }
    }
}

class E2EEAPIDataSource {

    // MARK: - Get Public Key

    func getPublicKey(userId: String) async throws -> PublicKeyResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/e2ee/public-key/\(userId)") else {
            throw E2EEAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(PublicKeyResponseDTO.self, from: data)
            } catch {
                throw E2EEAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw E2EEAPIDataSourceError.unauthorized
        case 404:
            throw E2EEAPIDataSourceError.notFound
        default:
            throw E2EEAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Get Key Backup

    func getKeyBackup() async throws -> KeyBackupResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/e2ee/key-backup") else {
            throw E2EEAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(KeyBackupResponseDTO.self, from: data)
            } catch {
                throw E2EEAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw E2EEAPIDataSourceError.unauthorized
        case 404:
            throw E2EEAPIDataSourceError.notFound
        default:
            throw E2EEAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Upload Public Key

    func uploadPublicKey(publicKey: String) async throws -> PublicKeyResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/e2ee/keys") else {
            throw E2EEAPIDataSourceError.invalidURL
        }

        let requestDTO = UploadKeysRequestDTO(publicKey: publicKey)

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(requestDTO)
        } catch {
            throw E2EEAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: jsonData
        )

        switch response.statusCode {
        case 200, 201:
            do {
                return try JSONDecoder().decode(PublicKeyResponseDTO.self, from: data)
            } catch {
                throw E2EEAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw E2EEAPIDataSourceError.unauthorized
        default:
            throw E2EEAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Upload Key Backup

    func uploadKeyBackup(encryptedPrivateKey: String, backupSalt: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/e2ee/key-backup") else {
            throw E2EEAPIDataSourceError.invalidURL
        }

        let requestDTO = UploadKeyBackupRequestDTO(
            encryptedPrivateKey: encryptedPrivateKey,
            backupSalt: backupSalt
        )

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(requestDTO)
        } catch {
            throw E2EEAPIDataSourceError.encodingFailed(error)
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: jsonData
        )

        switch response.statusCode {
        case 200:
            return
        case 400:
            throw E2EEAPIDataSourceError.badRequest("Must upload public key first")
        case 401:
            throw E2EEAPIDataSourceError.unauthorized
        default:
            throw E2EEAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }
}
