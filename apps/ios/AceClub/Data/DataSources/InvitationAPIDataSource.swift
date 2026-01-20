import Foundation

enum InvitationError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case decodingError
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response from server"
        case .serverError(let message): return message
        case .decodingError: return "Failed to decode response"
        case .networkError(let error): return "Network error: \(error.localizedDescription)"
        }
    }
}

class InvitationAPIDataSource {

    // MARK: - Invitation Queries

    func listInvitations(organizationId: String? = nil) async throws -> [InvitationDTO] {
        guard var urlComponents = URLComponents(string: "\(Config.apiBaseURL)/organization/list-invitations") else {
            throw InvitationError.invalidURL
        }

        if let organizationId = organizationId {
            urlComponents.queryItems = [URLQueryItem(name: "organizationId", value: organizationId)]
        }

        guard let url = urlComponents.url else {
            throw InvitationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("List invitations failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode([InvitationDTO].self, from: data)
        } catch {
            throw InvitationError.decodingError
        }
    }

    func listUserInvitations() async throws -> [InvitationDTO] {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/list-user-invitations") else {
            throw InvitationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("List user invitations failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode([InvitationDTO].self, from: data)
        } catch {
            throw InvitationError.decodingError
        }
    }

    func getInvitation(invitationId: String) async throws -> InvitationDTO {
        guard var urlComponents = URLComponents(string: "\(Config.apiBaseURL)/organization/get-invitation") else {
            throw InvitationError.invalidURL
        }

        urlComponents.queryItems = [URLQueryItem(name: "invitationId", value: invitationId)]

        guard let url = urlComponents.url else {
            throw InvitationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("Get invitation failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(InvitationDTO.self, from: data)
        } catch {
            throw InvitationError.decodingError
        }
    }

    // MARK: - Invitation Mutations

    func createInvitation(email: String, role: String, organizationId: String? = nil, resend: Bool? = nil) async throws -> InvitationDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/create-invitation") else {
            throw InvitationError.invalidURL
        }

        var requestBody: [String: Any] = ["email": email, "role": role]
        if let organizationId = organizationId {
            requestBody["organizationId"] = organizationId
        }
        if let resend = resend {
            requestBody["resend"] = resend
        }

        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("Create invitation failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(InvitationDTO.self, from: data)
        } catch {
            throw InvitationError.decodingError
        }
    }

    func acceptInvitation(invitationId: String) async throws -> MemberDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/accept-invitation") else {
            throw InvitationError.invalidURL
        }

        let requestBody = ["invitationId": invitationId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("Accept invitation failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(MemberDTO.self, from: data)
        } catch {
            throw InvitationError.decodingError
        }
    }

    func rejectInvitation(invitationId: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/reject-invitation") else {
            throw InvitationError.invalidURL
        }

        let requestBody = ["invitationId": invitationId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("Reject invitation failed: \(response.statusCode)")
        }
    }

    func cancelInvitation(invitationId: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/cancel-invitation") else {
            throw InvitationError.invalidURL
        }

        let requestBody = ["invitationId": invitationId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw InvitationError.serverError("Cancel invitation failed: \(response.statusCode)")
        }
    }
}
