//
//  MatchAPIDataSource.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

enum MatchAPIDataSourceError: LocalizedError {
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
        case .notFound: return "Match introuvable"
        case .badRequest(let message): return "Requête invalide: \(message)"
        case .unknown: return "Erreur inconnue"
        }
    }
}

class MatchAPIDataSource {

    // MARK: - Get Match by ID

    func getMatch(id: String) async throws -> MatchDetailResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(id)") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                let matchDetail = try JSONDecoder().decode(MatchDetailResponseDTO.self, from: data)
                return matchDetail
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - List Matches

    func listMatches(
        status: String? = nil,
        userId: String? = nil,
        participantOnly: Bool = true,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> ListMatchesResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/match")

        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "participantOnly", value: participantOnly ? "true" : "false")
        ]

        if let status = status {
            queryItems.append(URLQueryItem(name: "status", value: status))
        }

        if let userId = userId {
            queryItems.append(URLQueryItem(name: "userId", value: userId))
        }

        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                let listResponse = try JSONDecoder().decode(ListMatchesResponseDTO.self, from: data)
                return listResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Create Match

    func createMatch(request: CreateMatchRequestDTO) async throws -> CreateMatchResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            let encoder = JSONEncoder()
            jsonData = try encoder.encode(request)
        } catch {
            throw MatchAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: jsonData)

        switch response.statusCode {
        case 201:
            do {
                let createResponse = try JSONDecoder().decode(CreateMatchResponseDTO.self, from: data)
                return createResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchAPIDataSourceError.badRequest(message)
            }
            throw MatchAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Update Match

    func updateMatch(id: String, request: UpdateMatchRequestDTO) async throws -> UpdateMatchResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(id)") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            let encoder = JSONEncoder()
            jsonData = try encoder.encode(request)

        } catch {
            throw MatchAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: jsonData)


        switch response.statusCode {
        case 200:
            do {
                let updateResponse = try JSONDecoder().decode(UpdateMatchResponseDTO.self, from: data)
                return updateResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchAPIDataSourceError.badRequest(message)
            }
            throw MatchAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Update Match Scores

    func updateMatchScores(id: String, request: UpdateMatchScoresRequestDTO) async throws -> UpdateMatchScoresResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(id)/scores") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            let encoder = JSONEncoder()
            jsonData = try encoder.encode(request)
        } catch {
            throw MatchAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: jsonData)

        switch response.statusCode {
        case 200:
            do {
                let updateResponse = try JSONDecoder().decode(UpdateMatchScoresResponseDTO.self, from: data)
                return updateResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchAPIDataSourceError.badRequest(message)
            }
            throw MatchAPIDataSourceError.badRequest("Données invalides")
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Delete Match

    func deleteMatch(id: String) async throws -> DeleteMatchResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(id)") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "DELETE")

        switch response.statusCode {
        case 200:
            do {
                let deleteResponse = try JSONDecoder().decode(DeleteMatchResponseDTO.self, from: data)
                return deleteResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Create Comment

    func createComment(matchId: String, request: CreateCommentRequestDTO) async throws -> MatchCommentDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(matchId)/comment") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            let encoder = JSONEncoder()
            jsonData = try encoder.encode(request)
        } catch {
            throw MatchAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: jsonData)

        switch response.statusCode {
        case 201:
            do {
                let commentResponse = try JSONDecoder().decode(MatchCommentDTO.self, from: data)
                return commentResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 400, 403, 409:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchAPIDataSourceError.badRequest(message)
            }
            throw MatchAPIDataSourceError.badRequest("Impossible d'ajouter le commentaire")
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Update Comment

    func updateComment(matchId: String, request: UpdateCommentRequestDTO) async throws -> MatchCommentDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(matchId)/comment") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let jsonData: Data
        do {
            let encoder = JSONEncoder()
            jsonData = try encoder.encode(request)
        } catch {
            throw MatchAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: jsonData)

        switch response.statusCode {
        case 200:
            do {
                let commentResponse = try JSONDecoder().decode(MatchCommentDTO.self, from: data)
                return commentResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 400:
            if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
               let message = errorResponse["message"] ?? errorResponse["error"] {
                throw MatchAPIDataSourceError.badRequest(message)
            }
            throw MatchAPIDataSourceError.badRequest("Impossible de modifier le commentaire")
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Delete Comment

    func deleteComment(matchId: String) async throws -> DeleteCommentResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/match/\(matchId)/comment") else {
            throw MatchAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "DELETE")

        switch response.statusCode {
        case 200:
            do {
                let deleteResponse = try JSONDecoder().decode(DeleteCommentResponseDTO.self, from: data)
                return deleteResponse
            } catch {
                throw MatchAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw MatchAPIDataSourceError.unauthorized
        case 404:
            throw MatchAPIDataSourceError.notFound
        default:
            throw MatchAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }
}
