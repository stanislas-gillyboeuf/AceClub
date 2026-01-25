import Foundation
import Combine

@MainActor
class OrganizationViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var organizations: [Organization] = []
    @Published var activeOrganization: Organization?
    @Published var members: [Member] = [] // Members of active organization
    @Published var allMembers: [Member] = [] // All members of all user's organizations
    @Published var activeMember: Member?
    @Published var activeMemberRole: MemberRole?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - UseCases
    private let listOrganizationsUseCase = ListOrganizationsUseCase()
    private let getFullOrganizationUseCase = GetFullOrganizationUseCase()
    private let setActiveOrganizationUseCase = SetActiveOrganizationUseCase()
    private let listMembersUseCase = ListMembersUseCase()
    private let getActiveMemberUseCase = GetActiveMemberUseCase()
    private let getActiveMemberRoleUseCase = GetActiveMemberRoleUseCase()
    private let addMemberUseCase = AddMemberUseCase()
    private let removeMemberUseCase = RemoveMemberUseCase()
    private let updateMemberRoleUseCase = UpdateMemberRoleUseCase()
    private let leaveOrganizationUseCase = LeaveOrganizationUseCase()

    // MARK: - Organization Methods

    func loadOrganizations() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            organizations = try await listOrganizationsUseCase.execute()
            // Load all members for all organizations to determine roles
            await loadAllMembers()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadAllMembers() async {
        do {
            // Load members for all organizations
            var tempMembers: [Member] = []
            for org in organizations {
                let result = try await listMembersUseCase.execute(organizationId: org.id)
                tempMembers.append(contentsOf: result.members)
            }
            allMembers = tempMembers
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadFullOrganization(slug: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let (organization, orgMembers) = try await getFullOrganizationUseCase.execute(slug: slug)
            activeOrganization = organization
            members = orgMembers
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func setActiveOrganization(slug: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await setActiveOrganizationUseCase.execute(slug: slug)
            await loadFullOrganization(slug: slug)
            await loadActiveMember()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Member Methods

    func loadMembers(organizationId: String? = nil) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await listMembersUseCase.execute(organizationId: organizationId)
            members = result.members
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadActiveMember() async {
        do {
            activeMember = try await getActiveMemberUseCase.execute()
            activeMemberRole = try await getActiveMemberRoleUseCase.execute()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addMember(userId: String, role: String) async -> Member? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let member = try await addMemberUseCase.execute(userId: userId, role: role)
            members.append(member)
            return member
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func removeMember(memberIdOrEmail: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await removeMemberUseCase.execute(memberIdOrEmail: memberIdOrEmail)
            members.removeAll { $0.id == memberIdOrEmail || $0.user?.email == memberIdOrEmail }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateMemberRole(memberId: String, role: String) async -> Member? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let updatedMember = try await updateMemberRoleUseCase.execute(memberId: memberId, role: role)
            if let index = members.firstIndex(where: { $0.id == memberId }) {
                members[index] = updatedMember
            }
            return updatedMember
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func leaveOrganization(organizationId: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await leaveOrganizationUseCase.execute(organizationId: organizationId)
            organizations.removeAll { $0.id == organizationId }
            if activeOrganization?.id == organizationId {
                activeOrganization = nil
                activeMember = nil
                activeMemberRole = nil
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed Properties

    var isOwner: Bool {
        activeMemberRole == .owner
    }

    var isAdmin: Bool {
        activeMemberRole == .owner || activeMemberRole == .admin
    }

    var canManageMembers: Bool {
        isAdmin
    }
}
