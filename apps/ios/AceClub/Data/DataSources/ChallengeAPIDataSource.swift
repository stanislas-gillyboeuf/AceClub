import Foundation

enum ChallengeAPIDataSourceError: LocalizedError {
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

class ChallengeAPIDataSource {
    func getMyChallenges() async throws -> ChallengesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/challenge") else {
            throw ChallengeAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw ChallengeAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw ChallengeAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(ChallengesResponseDTO.self, from: data)
        } catch {
            throw ChallengeAPIDataSourceError.decodingFailed
        }
    }

    func getChallengeTemplates() async throws -> ChallengeTemplatesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/challenge/templates") else {
            throw ChallengeAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw ChallengeAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw ChallengeAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(ChallengeTemplatesResponseDTO.self, from: data)
        } catch {
            throw ChallengeAPIDataSourceError.decodingFailed
        }
    }
}
