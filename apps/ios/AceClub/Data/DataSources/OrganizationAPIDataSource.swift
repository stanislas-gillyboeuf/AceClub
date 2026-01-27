import Foundation

enum OrganizationError: Error, LocalizedError {
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

class OrganizationAPIDataSource {

    // MARK: - Organization Queries

    func listOrganizationsUser() async throws -> [OrganizationDTO] {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/list-organizations-user") else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("List organizations failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode([OrganizationDTO].self, from: data)
        } catch let directError {
            do {
                let response = try JSONDecoder().decode(ListOrganizationsResponseDTO.self, from: data)
                return response.organizations ?? []
            } catch let wrappedError {
                throw OrganizationError.decodingError
            }
        }
    }

    func searchOrganizations(query: String? = nil, limit: Int = 20, offset: Int = 0) async throws -> SearchOrganizationsResponseDTO {
        guard var components = URLComponents(string: "\(Config.apiBaseURL)/organization/search") else {
            throw OrganizationError.invalidURL
        }

        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: String(limit)),
            URLQueryItem(name: "offset", value: String(offset))
        ]
        if let query, !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            queryItems.append(URLQueryItem(name: "query", value: query))
        }
        components.queryItems = queryItems

        guard let url = components.url else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Search organizations failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(SearchOrganizationsResponseDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    func getFullOrganization(slug: String) async throws -> FullOrganizationDTO {
        guard var urlComponents = URLComponents(string: "\(Config.apiBaseURL)/organization/get-full-organization") else {
            throw OrganizationError.invalidURL
        }

        urlComponents.queryItems = [URLQueryItem(name: "organizationSlug", value: slug)]

        guard let url = urlComponents.url else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Get organization failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(FullOrganizationDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    // MARK: - Organization Mutations

    func setActiveOrganization(slug: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/set-active") else {
            throw OrganizationError.invalidURL
        }

        let requestBody = ["organizationSlug": slug]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Set active organization failed: \(response.statusCode)")
        }
    }

    // MARK: - Member Queries

    func listMembers(organizationId: String? = nil) async throws -> ListMembersResponseDTO {
        guard var urlComponents = URLComponents(string: "\(Config.apiBaseURL)/organization/list-members") else {
            throw OrganizationError.invalidURL
        }

        if let organizationId = organizationId {
            urlComponents.queryItems = [URLQueryItem(name: "organizationId", value: organizationId)]
        }

        guard let url = urlComponents.url else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("List members failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(ListMembersResponseDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    func getActiveMember() async throws -> ActiveMemberDTO? {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/get-active-member") else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Get active member failed: \(response.statusCode)")
        }

        if let jsonString = String(data: data, encoding: .utf8), jsonString == "null" {
            return nil
        }

        do {
            return try JSONDecoder().decode(ActiveMemberDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    func getActiveMemberRole() async throws -> String? {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/get-active-member-role") else {
            throw OrganizationError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Get active member role failed: \(response.statusCode)")
        }

        if let jsonString = String(data: data, encoding: .utf8), jsonString == "null" {
            return nil
        }

        do {
            let roleResponse = try JSONDecoder().decode(ActiveMemberRoleDTO.self, from: data)
            return roleResponse.role
        } catch {
            throw OrganizationError.decodingError
        }
    }

    // MARK: - Member Mutations

    func addMember(userId: String, role: String, organizationId: String? = nil) async throws -> MemberDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/add-member") else {
            throw OrganizationError.invalidURL
        }

        var requestBody: [String: Any] = ["userId": userId, "role": role]
        if let organizationId = organizationId {
            requestBody["organizationId"] = organizationId
        }

        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Add member failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(MemberDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    func removeMember(memberIdOrEmail: String, organizationId: String? = nil) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/remove-member") else {
            throw OrganizationError.invalidURL
        }

        var requestBody: [String: Any] = ["memberIdOrEmail": memberIdOrEmail]
        if let organizationId = organizationId {
            requestBody["organizationId"] = organizationId
        }

        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)
        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Remove member failed: \(response.statusCode)")
        }
    }

    func updateMemberRole(memberId: String, role: String, organizationId: String? = nil) async throws -> MemberDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/update-member-role") else {
            throw OrganizationError.invalidURL
        }

        var requestBody: [String: Any] = ["memberId": memberId, "role": role]
        if let organizationId = organizationId {
            requestBody["organizationId"] = organizationId
        }

        let bodyData = try JSONSerialization.data(withJSONObject: requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Update member role failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(MemberDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }

    func leaveOrganization(organizationId: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/leave-organization") else {
            throw OrganizationError.invalidURL
        }

        let requestBody = ["organizationId": organizationId]
        let bodyData = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Leave organization failed: \(response.statusCode)")
        }
    }

    func createOrganization(name: String, slug: String, logo: String? = nil, metadata: String? = nil) async throws -> OrganizationDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/organization/create") else {
            throw OrganizationError.invalidURL
        }

        let requestBody = CreateOrganizationRequestDTO(name: name, slug: slug, logo: logo, metadata: metadata)
        let bodyData = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: bodyData)

        guard response.statusCode == 200 else {
            throw OrganizationError.serverError("Create organization failed: \(response.statusCode)")
        }

        do {
            return try JSONDecoder().decode(OrganizationDTO.self, from: data)
        } catch {
            throw OrganizationError.decodingError
        }
    }
}
