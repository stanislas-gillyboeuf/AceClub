import Foundation

enum LevelAPIDataSourceError: LocalizedError {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalide"
        case .requestFailed: return "Échec de la requête"
        case .decodingFailed: return "Échec du décodage"
        case .unauthorized: return "Non autorisé"
        case .unknown: return "Erreur inconnue"
        }
    }
}

class LevelAPIDataSource {
    func getMyLevel() async throws -> UserLevelResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/level/me") else {
            throw LevelAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LevelAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LevelAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(UserLevelResponseDTO.self, from: data)
        } catch {
            throw LevelAPIDataSourceError.decodingFailed
        }
    }

    func getUserLevel(userId: String) async throws -> UserLevelResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/level/user/\(userId)") else {
            throw LevelAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LevelAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LevelAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(UserLevelResponseDTO.self, from: data)
        } catch {
            throw LevelAPIDataSourceError.decodingFailed
        }
    }

    func getAcesHistory(page: Int = 1, limit: Int = 20) async throws -> AcesHistoryResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/level/history")
        components?.queryItems = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        guard let url = components?.url else {
            throw LevelAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LevelAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LevelAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(AcesHistoryResponseDTO.self, from: data)
        } catch {
            throw LevelAPIDataSourceError.decodingFailed
        }
    }
}
