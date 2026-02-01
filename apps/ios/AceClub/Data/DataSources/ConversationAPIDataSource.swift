//
//  ConversationAPIDataSource.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

enum ConversationAPIDataSourceError: Error {
    case invalidURL
    case requestFailed(statusCode: Int)
    case decodingFailed(Error)
    case encodingFailed(Error)
    case unauthorized
    case notFound
    case forbidden
    case badRequest(String)
    case unknown

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return String(localized: "URL invalide")
        case .requestFailed(let statusCode):
            return String(localized: "Echec de la requete (code: \(statusCode))")
        case .decodingFailed(let error):
            return String(localized: "Erreur de decodage: \(error.localizedDescription)")
        case .encodingFailed(let error):
            return String(localized: "Erreur d'encodage: \(error.localizedDescription)")
        case .unauthorized:
            return String(localized: "Non autorise")
        case .notFound:
            return String(localized: "Conversation introuvable")
        case .forbidden:
            return String(localized: "Acces interdit")
        case .badRequest(let message):
            return String(localized: "Requete invalide: \(message)")
        case .unknown:
            return String(localized: "Erreur inconnue")
        }
    }
}

class ConversationAPIDataSource {

    // MARK: - List Conversations

    func listConversations() async throws -> [ConversationDTO] {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                let conversations = try JSONDecoder().decode([ConversationDTO].self, from: data)
                return conversations
            } catch {
                throw ConversationAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Get Conversation

    func getConversation(id: String) async throws -> ConversationDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation/\(id)") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                let conversation = try JSONDecoder().decode(ConversationDTO.self, from: data)
                return conversation
            } catch {
                throw ConversationAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        case 404:
            throw ConversationAPIDataSourceError.notFound
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - List Messages

    func listMessages(
        conversationId: String,
        before: Date? = nil,
        limit: Int = 50
    ) async throws -> [MessageDTO] {
        var components = URLComponents(string: "\(Config.apiBaseURL)/conversation/\(conversationId)/messages")

        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]

        if let before = before {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            queryItems.append(URLQueryItem(name: "before", value: formatter.string(from: before)))
        }

        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "GET")

        switch response.statusCode {
        case 200:
            do {
                let messages = try JSONDecoder().decode([MessageDTO].self, from: data)
                return messages
            } catch {
                throw ConversationAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        case 404:
            throw ConversationAPIDataSourceError.notFound
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Send Message

    func sendMessage(
        conversationId: String,
        content: String,
        clientMessageId: String
    ) async throws -> MessageDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation/\(conversationId)/message") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let requestDTO = SendMessageRequestDTO(content: content, clientMessageId: clientMessageId)

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(requestDTO)
        } catch {
            throw ConversationAPIDataSourceError.encodingFailed(error)
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: jsonData
        )

        switch response.statusCode {
        case 201:
            do {
                let message = try JSONDecoder().decode(MessageDTO.self, from: data)
                return message
            } catch {
                throw ConversationAPIDataSourceError.decodingFailed(error)
            }
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Mark Read

    func markRead(conversationId: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation/\(conversationId)/mark-read") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST")

        switch response.statusCode {
        case 200:
            return
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Delete Conversation

    func deleteConversation(conversationId: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation/\(conversationId)") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "DELETE")

        switch response.statusCode {
        case 200:
            return
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }

    // MARK: - Mute Conversation

    func muteConversation(conversationId: String, isMuted: Bool) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/conversation/\(conversationId)/mute") else {
            throw ConversationAPIDataSourceError.invalidURL
        }

        let requestDTO = MuteConversationRequestDTO(isMuted: isMuted)

        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(requestDTO)
        } catch {
            throw ConversationAPIDataSourceError.encodingFailed(error)
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: jsonData
        )

        switch response.statusCode {
        case 200:
            return
        case 401:
            throw ConversationAPIDataSourceError.unauthorized
        case 403:
            throw ConversationAPIDataSourceError.forbidden
        default:
            throw ConversationAPIDataSourceError.requestFailed(statusCode: response.statusCode)
        }
    }
}
