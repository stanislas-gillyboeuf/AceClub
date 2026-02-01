//
//  MatchIntentAPIDataSource.swift
//  AceClub
//

import Foundation

enum MatchIntentAPIDataSourceError: LocalizedError {
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
        case .invalidURL: return "URL invalide"
        case .requestFailed(let statusCode): return "Échec de la requête (code: \(statusCode))"
        case .decodingFailed: return "Erreur de décodage"
        case .encodingFailed: return "Erreur d'encodage"
        case .unauthorized: return "Non autorisé"
        case .notFound: return "Intention introuvable"
        case .badRequest(let message): return "Requête invalide: \(message)"
        case .unknown: return "Erreur inconnue"
        }
    }
}

class MatchIntentAPIDataSource {

    private var baseURL: String { "\(Config.apiBaseURL)/match-intents" }

    // MARK: - List my intents

    func listMatchIntents(cursor: String? = nil, limit: Int = 20) async throws -> ListMatchIntentsResponseDTO {
        var components = URLComponents(string: baseURL)
        var queryItems: [URLQueryItem] = [URLQueryItem(name: "limit", value: "\(min(limit, 100))")]
        if let cursor = cursor {
            queryItems.append(URLQueryItem(name: "cursor", value: cursor))
        }
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(ListMatchIntentsResponseDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Discover (feed)

    func discover(cursor: String? = nil, limit: Int = 20) async throws -> DiscoverMatchIntentsResponseDTO {
        var components = URLComponents(string: "\(baseURL)/discover")
        var queryItems: [URLQueryItem] = [URLQueryItem(name: "limit", value: "\(min(limit, 100))")]
        if let cursor = cursor {
            queryItems.append(URLQueryItem(name: "cursor", value: cursor))
        }
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(DiscoverMatchIntentsResponseDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - List requests (incoming)

    func listRequests() async throws -> [MatchRequestWithDetailsDTO] {
        guard let url = URL(string: "\(baseURL)/requests") else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode([MatchRequestWithDetailsDTO].self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Create intent

    func createMatchIntent(request: CreateMatchIntentRequestDTO) async throws -> MatchIntentDTO {
        guard let url = URL(string: baseURL) else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(request)
        } catch {
            throw MatchIntentAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: jsonData)

        switch response.statusCode {
        case 201:
            do {
                return try JSONDecoder().decode(MatchIntentDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchIntentAPIDataSourceError.badRequest(message)
            }
            throw MatchIntentAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Swipe

    func swipe(request: SwipeMatchIntentRequestDTO) async throws -> SwipeMatchIntentResponseDTO {
        guard let url = URL(string: "\(baseURL)/swipe") else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(request)
        } catch {
            throw MatchIntentAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: jsonData)

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(SwipeMatchIntentResponseDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchIntentAPIDataSourceError.badRequest(message)
            }
            throw MatchIntentAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        case 404:
            throw MatchIntentAPIDataSourceError.notFound
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Accept request

    func acceptRequest(id: String) async throws -> AcceptMatchRequestResponseDTO {
        guard let url = URL(string: "\(baseURL)/requests/\(id)/accept") else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(AcceptMatchRequestResponseDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchIntentAPIDataSourceError.badRequest(message)
            }
            throw MatchIntentAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        case 404:
            throw MatchIntentAPIDataSourceError.notFound
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Delete intent (owner only)

    func deleteMatchIntent(id: String) async throws {
        guard let url = URL(string: "\(baseURL)/\(id)") else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "DELETE")

        switch response.statusCode {
        case 200:
            return
        case 403:
            throw MatchIntentAPIDataSourceError.badRequest("Non autorisé")
        case 404:
            throw MatchIntentAPIDataSourceError.notFound
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Reject request

    func rejectRequest(id: String) async throws -> RejectMatchRequestResponseDTO {
        guard let url = URL(string: "\(baseURL)/requests/\(id)/reject") else {
            throw MatchIntentAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST")

        switch response.statusCode {
        case 200:
            do {
                return try JSONDecoder().decode(RejectMatchRequestResponseDTO.self, from: data)
            } catch {
                throw MatchIntentAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchIntentAPIDataSourceError.badRequest(message)
            }
            throw MatchIntentAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchIntentAPIDataSourceError.unauthorized
        case 404:
            throw MatchIntentAPIDataSourceError.notFound
        default:
            throw MatchIntentAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }
}
