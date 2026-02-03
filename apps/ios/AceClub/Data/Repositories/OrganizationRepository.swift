import Foundation

protocol OrganizationRepositoryProtocol {
    func listOrganizations() async throws -> [Organization]
    func searchOrganizations(query: String?, limit: Int, offset: Int) async throws -> (organizations: [Organization], total: Int, hasMore: Bool)
    func getFullOrganization(slug: String) async throws -> (Organization, [Member])
    func setActiveOrganization(slug: String?, organizationId: String?) async throws
    func listMembers(organizationId: String?) async throws -> ListMembersResult
    func getActiveMember() async throws -> Member?
    func getActiveMemberRole() async throws -> MemberRole?
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

    func searchOrganizations(query: String? = nil, limit: Int = 20, offset: Int = 0) async throws -> (organizations: [Organization], total: Int, hasMore: Bool) {
        let response = try await dataSource.searchOrganizations(query: query, limit: limit, offset: offset)
        let organizations = OrganizationMapper.map(organizationDTOs: response.organizations)
        return (organizations: organizations, total: response.total, hasMore: response.hasMore)
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

    func setActiveOrganization(slug: String? = nil, organizationId: String? = nil) async throws {
        try await dataSource.setActiveOrganization(slug: slug, organizationId: organizationId)
    }

    func listMembers(organizationId: String? = nil) async throws -> ListMembersResult {
        let membersDTO = try await dataSource.listMembers(organizationId: organizationId)
        return MemberMapper.map(listMembersDTO: membersDTO)
    }

    func getActiveMember() async throws -> Member? {
        guard let activeMemberDTO = try await dataSource.getActiveMember() else {
            return nil
        }
        return MemberMapper.map(activeMemberDTO: activeMemberDTO)
    }

    func getActiveMemberRole() async throws -> MemberRole? {
        guard let role = try await dataSource.getActiveMemberRole() else {
            return nil
        }
        return MemberRole(rawValue: role)
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
    
    func createOrganization(name: String, slug: String, logo: String? = nil, metadata: String? = nil) async throws -> Organization {
        let organizationDTO = try await dataSource.createOrganization(name: name, slug: slug, logo: logo, metadata: metadata)
        return OrganizationMapper.map(organizationDTO: organizationDTO)
    }

    func updateOrganization(organizationId: String, name: String? = nil, slug: String? = nil, logo: String? = nil) async throws -> Organization {
        let organizationDTO = try await dataSource.updateOrganization(organizationId: organizationId, name: name, slug: slug, logo: logo)
        return OrganizationMapper.map(organizationDTO: organizationDTO)
    }

    func getOrganizationStats(organizationId: String) async throws -> OrganizationStats {
        let statsDTO = try await dataSource.getOrganizationStats(organizationId: organizationId)
        return OrganizationStats(
            totalMembers: statsDTO.totalMembers,
            matchesThisMonth: statsDTO.matchesThisMonth,
            activeMembers: statsDTO.activeMembers,
            activityRate: statsDTO.activityRate
        )
    }

    func requestClub(name: String, city: String) async throws -> ClubRequestResult {
        let response = try await dataSource.requestClub(name: name, city: city)
        return ClubRequestResult(
            success: response.success,
            message: response.message,
            requestCount: response.requestCount,
            status: ClubRequestStatus(rawValue: response.status) ?? .pending
        )
    }
}
