import Foundation

enum StreakAPIDataSourceError: LocalizedError {
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

class StreakAPIDataSource {
    func getMyStreak() async throws -> UserStreakResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/streak/me") else {
            throw StreakAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw StreakAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw StreakAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(UserStreakResponseDTO.self, from: data)
        } catch {
            throw StreakAPIDataSourceError.decodingFailed
        }
    }
}
