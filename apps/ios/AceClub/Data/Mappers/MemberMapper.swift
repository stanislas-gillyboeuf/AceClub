import Foundation

class MemberMapper {
    static func map(memberDTO: MemberDTO) -> Member {
        return Member(
            id: memberDTO.id,
            organizationId: memberDTO.organizationId,
            userId: memberDTO.userId,
            role: MemberRole(rawValue: memberDTO.role) ?? .member,
            createdAt: memberDTO.createdAt,
            user: memberDTO.user != nil ? UserMapper.map(userDTO: memberDTO.user!) : nil
        )
    }

    static func map(listMembersDTO: ListMembersResponseDTO) -> ListMembersResult {
        let members = listMembersDTO.members ?? []
        return ListMembersResult(
            members: members.map { map(memberDTO: $0) },
            total: listMembersDTO.total,
            limit: listMembersDTO.limit,
            offset: listMembersDTO.offset
        )
    }

    static func map(activeMemberDTO: ActiveMemberDTO) -> Member {
        return Member(
            id: activeMemberDTO.id,
            organizationId: activeMemberDTO.organizationId,
            userId: activeMemberDTO.userId,
            role: MemberRole(rawValue: activeMemberDTO.role) ?? .member,
            createdAt: activeMemberDTO.createdAt,
            user: nil
        )
    }

    static func map(memberDTOs: [MemberDTO]) -> [Member] {
        return memberDTOs.map { map(memberDTO: $0) }
    }
}
