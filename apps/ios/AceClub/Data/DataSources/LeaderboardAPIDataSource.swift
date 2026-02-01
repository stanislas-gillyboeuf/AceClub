import Foundation

enum LeaderboardAPIDataSourceError: LocalizedError {
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

class LeaderboardAPIDataSource {
    func getGlobalLeaderboard(page: Int = 1, limit: Int = 20) async throws -> LeaderboardResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/leaderboard/global")
        components?.queryItems = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        guard let url = components?.url else {
            throw LeaderboardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LeaderboardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LeaderboardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(LeaderboardResponseDTO.self, from: data)
        } catch {
            throw LeaderboardAPIDataSourceError.decodingFailed
        }
    }

    func getOrganizationLeaderboard(orgId: String, page: Int = 1, limit: Int = 20) async throws -> LeaderboardResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/leaderboard/organization/\(orgId)")
        components?.queryItems = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        guard let url = components?.url else {
            throw LeaderboardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LeaderboardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LeaderboardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(LeaderboardResponseDTO.self, from: data)
        } catch {
            throw LeaderboardAPIDataSourceError.decodingFailed
        }
    }

    func getWeeklyLeaderboard(page: Int = 1, limit: Int = 20) async throws -> WeeklyLeaderboardResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/leaderboard/weekly")
        components?.queryItems = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        guard let url = components?.url else {
            throw LeaderboardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw LeaderboardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw LeaderboardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(WeeklyLeaderboardResponseDTO.self, from: data)
        } catch {
            throw LeaderboardAPIDataSourceError.decodingFailed
        }
    }
}
