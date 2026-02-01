import Foundation

enum ChallengeAPIDataSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown
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
