//
//  AuthAPIDataSource.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

enum AdminError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case decodingError
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide"
        case .invalidResponse:
            return "Réponse invalide du serveur"
        case .serverError(let message):
            return message
        case .decodingError:
            return "Échec du décodage de la réponse"
        case .networkError(let error):
            return "Erreur réseau : \(error.localizedDescription)"
        }
    }
}

class AdminAPIDataSource {

    func listUsers() async throws -> ListUsersResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/list-users") else {
            throw AdminError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("List users failed with status code: \(response.statusCode)")
        }


        do {
            let listUsersResponse = try JSONDecoder().decode(ListUsersResponseDTO.self, from: data)
            return listUsersResponse
        } catch {
            throw AdminError.decodingError
        }
    }

    func listUserSessions(userId: String) async throws -> [SessionInfoDTO] {
        guard var urlComponents = URLComponents(string: "\(Config.apiBaseURL)/admin/list-user-sessions") else {
            throw AdminError.invalidURL
        }

        urlComponents.queryItems = [URLQueryItem(name: "userId", value: userId)]

        guard let url = urlComponents.url else {
            throw AdminError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("List user sessions failed with status code: \(response.statusCode)")
        }

        do {
            let sessions = try JSONDecoder().decode([SessionInfoDTO].self, from: data)
            return sessions
        } catch {
            throw AdminError.decodingError
        }
    }

    func revokeUserSession(userId: String, sessionId: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/revoke-user-session") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["sessionToken": sessionId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Revoke user session failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func revokeUserSessions(userId: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/revoke-user-sessions") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["userId": userId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Revoke user sessions failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func banUser(userId: String, banReason: String? = nil, banExpiresIn: Int? = nil) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/ban-user") else {
            throw AdminError.invalidURL
        }

        var requestBody: [String: Any] = ["userId": userId]
        if let banReason = banReason {
            requestBody["banReason"] = banReason
        }
        if let banExpiresIn = banExpiresIn {
            requestBody["banExpiresIn"] = banExpiresIn
        }

        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Ban user failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func unbanUser(userId: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/unban-user") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["userId": userId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Unban user failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func createUser(name: String, email: String, password: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/create-user") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["name": name, "email": email, "password": password]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Create user failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func updateUser(userId: String, name: String, email: String, password: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/update-user") else {
            throw AdminError.invalidURL
        }

        var payload: [String: Any] = [
            "name": name,
            "email": email
        ]
        if !password.isEmpty {
            payload["password"] = password
        }

        let requestBody: [String: Any] = [
            "userId": userId,
            "data": payload
        ]
        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Update user failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func setRole(userId: String, role: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/set-role") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["userId": userId, "role": role.lowercased()]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Set role failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

    func setUserPassword(userId: String, password: String) async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/admin/set-user-password") else {
            throw AdminError.invalidURL
        }

        let requestBody = ["newPassword": password, "userId": userId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "PUT", body: bodyData)

        guard response.statusCode == 200 else {
            throw AdminError.serverError("Set user password failed with status code: \(response.statusCode)")
        }

        do {
            let user = try JSONDecoder().decode(UserDTO.self, from: data)
            return user
        } catch {
            throw AdminError.decodingError
        }
    }

}
