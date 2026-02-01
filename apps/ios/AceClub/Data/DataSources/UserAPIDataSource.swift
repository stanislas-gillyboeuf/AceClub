import Foundation

enum UserAPIDateSourceError: LocalizedError {
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

    func completeOnboarding(organizationId: String, sport: String, skillLevel: String, phoneNumber: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/complete-onboarding") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let requestBody = CompleteOnboardingRequestDTO(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber
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

    func getPreferences() async throws -> UserPreferencesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/preferences") else {
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
            return try JSONDecoder().decode(UserPreferencesResponseDTO.self, from: data)
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }

    func updateProfile(
        name: String?,
        image: String?,
        phoneNumber: String?,
        organizationId: String?,
        sport: String?,
        skillLevel: String?
    ) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/profile") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let requestBody = UpdateProfileRequestDTO(
            name: name,
            image: image,
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: body)

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

    func createGhost(name: String, email: String) async throws -> GhostUserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/ghost") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let requestBody = CreateGhostRequestDTO(name: name, email: email)
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: body)

        if response.statusCode == 401 {
            throw UserAPIDateSourceError.unauthorized
        }

        guard response.statusCode == 200 || response.statusCode == 201 else {
            throw UserAPIDateSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(GhostUserDTO.self, from: data)
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }
}
