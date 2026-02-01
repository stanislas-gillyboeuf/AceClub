import Foundation

protocol InvitationRepositoryProtocol {
    func listInvitations(organizationId: String?) async throws -> [Invitation]
    func listUserInvitations() async throws -> [Invitation]
    func getInvitation(invitationId: String) async throws -> Invitation
    func createInvitation(email: String, role: String, organizationId: String?, resend: Bool?) async throws -> Invitation
    func acceptInvitation(invitationId: String) async throws -> Member
    func rejectInvitation(invitationId: String) async throws
    func cancelInvitation(invitationId: String) async throws
}

class InvitationRepository: InvitationRepositoryProtocol {
    private let dataSource: InvitationAPIDataSource

    init(dataSource: InvitationAPIDataSource = InvitationAPIDataSource()) {
        self.dataSource = dataSource
    }

    func listInvitations(organizationId: String? = nil) async throws -> [Invitation] {
        let invitationsDTO = try await dataSource.listInvitations(organizationId: organizationId)
        return InvitationMapper.map(invitationDTOs: invitationsDTO)
    }

    func listUserInvitations() async throws -> [Invitation] {
        let invitationsDTO = try await dataSource.listUserInvitations()
        return InvitationMapper.map(invitationDTOs: invitationsDTO)
    }

    func getInvitation(invitationId: String) async throws -> Invitation {
        let invitationDTO = try await dataSource.getInvitation(invitationId: invitationId)
        return InvitationMapper.map(invitationDTO: invitationDTO)
    }

    func createInvitation(email: String, role: String, organizationId: String? = nil, resend: Bool? = nil) async throws -> Invitation {
        let invitationDTO = try await dataSource.createInvitation(email: email, role: role, organizationId: organizationId, resend: resend)
        return InvitationMapper.map(invitationDTO: invitationDTO)
    }

    func acceptInvitation(invitationId: String) async throws -> Member {
        let responseDTO = try await dataSource.acceptInvitation(invitationId: invitationId)
        let memberDTO = responseDTO.member
        return MemberMapper.map(memberDTO: memberDTO)
    }

    func rejectInvitation(invitationId: String) async throws {
        try await dataSource.rejectInvitation(invitationId: invitationId)
    }

    func cancelInvitation(invitationId: String) async throws {
        try await dataSource.cancelInvitation(invitationId: invitationId)
    }
}
