import Foundation

class InvitationMapper {
    static func map(invitationDTO: InvitationDTO) -> Invitation {
        return Invitation(
            id: invitationDTO.id,
            organizationId: invitationDTO.organizationId,
            email: invitationDTO.email,
            role: MemberRole(rawValue: invitationDTO.role ?? "member") ?? .member,
            status: InvitationStatus(rawValue: invitationDTO.status) ?? .pending,
            expiresAt: invitationDTO.expiresAt,
            createdAt: invitationDTO.createdAt,
            inviterId: invitationDTO.inviterId,
            organization: invitationDTO.organization != nil
                ? OrganizationMapper.map(organizationDTO: invitationDTO.organization!)
                : nil
        )
    }

    static func map(listInvitationsDTO: ListInvitationsResponseDTO) -> [Invitation] {
        guard let invitations = listInvitationsDTO.invitations else {
            return []
        }
        return invitations.map { map(invitationDTO: $0) }
    }

    static func map(invitationDTOs: [InvitationDTO]) -> [Invitation] {
        return invitationDTOs.map { map(invitationDTO: $0) }
    }
}
