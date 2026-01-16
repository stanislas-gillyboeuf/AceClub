import Foundation

protocol OrganizationRepositoryProtocol {
    func listOrganizations() async throws -> [Organization]
    func getFullOrganization(slug: String) async throws -> (Organization, [Member])
    func setActiveOrganization(slug: String) async throws
    func listMembers(organizationId: String?) async throws -> ListMembersResult
    func getActiveMember() async throws -> Member
    func getActiveMemberRole() async throws -> MemberRole
    func addMember(userId: String, role: String, organizationId: String?) async throws -> Member
    func removeMember(memberIdOrEmail: String, organizationId: String?) async throws
    func updateMemberRole(memberId: String, role: String, organizationId: String?) async throws -> Member
    func leaveOrganization(organizationId: String) async throws
}

class OrganizationRepository: OrganizationRepositoryProtocol {
    private let dataSource: OrganizationAPIDataSource

    init(dataSource: OrganizationAPIDataSource = OrganizationAPIDataSource()) {
        self.dataSource = dataSource
    }

    func listOrganizations() async throws -> [Organization] {
        let organizationsDTO = try await dataSource.listOrganizationsUser()
        return OrganizationMapper.map(organizationDTOs: organizationsDTO)
    }

    func getFullOrganization(slug: String) async throws -> (Organization, [Member]) {
        let fullOrgDTO = try await dataSource.getFullOrganization(slug: slug)
        let organization = Organization(
            id: fullOrgDTO.id,
            name: fullOrgDTO.name,
            slug: fullOrgDTO.slug,
            logo: fullOrgDTO.logo,
            createdAt: fullOrgDTO.createdAt,
            metadata: fullOrgDTO.metadata
        )
        let members = MemberMapper.map(memberDTOs: fullOrgDTO.members)
        return (organization, members)
    }

    func setActiveOrganization(slug: String) async throws {
        try await dataSource.setActiveOrganization(slug: slug)
    }

    func listMembers(organizationId: String? = nil) async throws -> ListMembersResult {
        let membersDTO = try await dataSource.listMembers(organizationId: organizationId)
        return MemberMapper.map(listMembersDTO: membersDTO)
    }

    func getActiveMember() async throws -> Member {
        let activeMemberDTO = try await dataSource.getActiveMember()
        return MemberMapper.map(activeMemberDTO: activeMemberDTO)
    }

    func getActiveMemberRole() async throws -> MemberRole {
        let role = try await dataSource.getActiveMemberRole()
        return MemberRole(rawValue: role) ?? .member
    }

    func addMember(userId: String, role: String, organizationId: String? = nil) async throws -> Member {
        let memberDTO = try await dataSource.addMember(userId: userId, role: role, organizationId: organizationId)
        return MemberMapper.map(memberDTO: memberDTO)
    }

    func removeMember(memberIdOrEmail: String, organizationId: String? = nil) async throws {
        try await dataSource.removeMember(memberIdOrEmail: memberIdOrEmail, organizationId: organizationId)
    }

    func updateMemberRole(memberId: String, role: String, organizationId: String? = nil) async throws -> Member {
        let memberDTO = try await dataSource.updateMemberRole(memberId: memberId, role: role, organizationId: organizationId)
        return MemberMapper.map(memberDTO: memberDTO)
    }

    func leaveOrganization(organizationId: String) async throws {
        try await dataSource.leaveOrganization(organizationId: organizationId)
    }
}
