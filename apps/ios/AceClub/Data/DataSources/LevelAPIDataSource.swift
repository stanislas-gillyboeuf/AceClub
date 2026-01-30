import Foundation

enum LevelAPIDataSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown
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

    func getXpHistory(page: Int = 1, limit: Int = 20) async throws -> XpHistoryResponseDTO {
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
            return try JSONDecoder().decode(XpHistoryResponseDTO.self, from: data)
        } catch {
            throw LevelAPIDataSourceError.decodingFailed
        }
    }
}
