import Foundation

enum RewardAPIDataSourceError: LocalizedError {
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

class RewardAPIDataSource {
    func getMyBadges() async throws -> MyBadgesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/reward/badges") else {
            throw RewardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw RewardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw RewardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(MyBadgesResponseDTO.self, from: data)
        } catch {
            throw RewardAPIDataSourceError.decodingFailed
        }
    }

    func getAllBadges() async throws -> AllBadgesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/reward/badges/all") else {
            throw RewardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw RewardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw RewardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(AllBadgesResponseDTO.self, from: data)
        } catch {
            throw RewardAPIDataSourceError.decodingFailed
        }
    }

    func getMyTitles() async throws -> TitlesResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/reward/titles") else {
            throw RewardAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw RewardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw RewardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(TitlesResponseDTO.self, from: data)
        } catch {
            throw RewardAPIDataSourceError.decodingFailed
        }
    }

    func equipTitle(titleId: String) async throws -> EquipTitleResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/reward/titles/equip") else {
            throw RewardAPIDataSourceError.invalidURL
        }

        let requestBody = EquipTitleRequestDTO(titleId: titleId)
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: body)

        if response.statusCode == 401 {
            throw RewardAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw RewardAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(EquipTitleResponseDTO.self, from: data)
        } catch {
            throw RewardAPIDataSourceError.decodingFailed
        }
    }
}
