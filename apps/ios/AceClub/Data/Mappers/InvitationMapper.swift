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
            organizationName: invitationDTO.organizationName,
            organization: invitationDTO.organization != nil
                ? OrganizationMapper.map(organizationDTO: invitationDTO.organization!)
                : nil,
        )
    }

    static func map(acceptedInvitationDTO: AcceptedInvitationDTO) -> Invitation {
        return Invitation(
            id: acceptedInvitationDTO.id,
            organizationId: acceptedInvitationDTO.organizationId,
            email: acceptedInvitationDTO.email,
            role: MemberRole(rawValue: acceptedInvitationDTO.role) ?? .member,
            status: InvitationStatus(rawValue: acceptedInvitationDTO.status) ?? .pending,
            expiresAt: acceptedInvitationDTO.expiresAt,
            createdAt: acceptedInvitationDTO.createdAt,
            inviterId: acceptedInvitationDTO.inviterId,
            organizationName: nil, organization: nil
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
