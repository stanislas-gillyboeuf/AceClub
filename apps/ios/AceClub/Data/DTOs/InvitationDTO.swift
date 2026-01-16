import Foundation

// MARK: - Invitation DTO
struct InvitationDTO: Codable {
    let id: String
    let organizationId: String
    let email: String
    let role: String?
    let status: String
    let expiresAt: String
    let createdAt: String?
    let inviterId: String
    let organization: OrganizationDTO?
}

// MARK: - List Invitations Response
struct ListInvitationsResponseDTO: Codable {
    let invitations: [InvitationDTO]?

    // Handle array response directly
    init(from decoder: Decoder) throws {
        if let container = try? decoder.container(keyedBy: CodingKeys.self) {
            invitations = try container.decodeIfPresent([InvitationDTO].self, forKey: .invitations)
        } else if let array = try? decoder.singleValueContainer().decode([InvitationDTO].self) {
            invitations = array
        } else {
            invitations = nil
        }
    }

    private enum CodingKeys: String, CodingKey {
        case invitations
    }
}

// MARK: - Create Invitation Request
struct CreateInvitationRequestDTO: Codable {
    let email: String
    let role: String
    let organizationId: String?
    let resend: Bool?
}

// MARK: - Invitation Action Request
struct InvitationActionRequestDTO: Codable {
    let invitationId: String
}
