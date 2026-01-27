import Foundation

enum UserAPIDateSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown
}

class UserAPIDataSource {
    func getMe() async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/me") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw UserAPIDateSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw UserAPIDateSourceError.requestFailed
        }

        do {
            let me = try JSONDecoder().decode(UserDTO.self, from: data)
            return me
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }

    func searchUsers(query: String, limit: Int = 10) async throws -> UserSearchResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/user/search")
        components?.queryItems = [
            URLQueryItem(name: "query", value: query),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        guard let url = components?.url else {
            throw UserAPIDateSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw UserAPIDateSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw UserAPIDateSourceError.requestFailed
        }

        do {
            let searchResponse = try JSONDecoder().decode(UserSearchResponseDTO.self, from: data)
            return searchResponse
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }

    func completeOnboarding(organizationId: String, sport: String, skillLevel: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/complete-onboarding") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let requestBody = CompleteOnboardingRequestDTO(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: body)

        if response.statusCode == 401 {
            throw UserAPIDateSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw UserAPIDateSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(UserDTO.self, from: data)
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }
}
