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
    let teamId: String?
    let organization: OrganizationDTO?
    let organizationName: String?
}

// MARK: - List Invitations Response
struct ListInvitationsResponseDTO: Codable {
    let invitations: [InvitationDTO]?

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

// MARK: - Accept Invitation Response
struct AcceptInvitationResponseDTO: Codable {
    let invitation: AcceptedInvitationDTO
    let member: MemberDTO
}

// MARK: - Accepted Invitation DTO
struct AcceptedInvitationDTO: Codable {
    let id: String
    let organizationId: String
    let email: String
    let role: String
    let status: String
    let inviterId: String
    let expiresAt: String
    let createdAt: String
    let teamId: String?
}
