import Foundation
import Combine
import UIKit

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
    @Published var selectedLogo: UIImage?
    @Published var isUploadingLogo = false

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
    private let uploadOrgLogoUseCase = UploadOrgLogoUseCase()
    private let updateOrganizationUseCase = UpdateOrganizationUseCase()

    // MARK: - Refresh Tasks
    private var refreshOrganizationsTask: Task<Void, Never>?
    private var refreshActiveMemberTask: Task<Void, Never>?

    // MARK: - Organization Methods

    func loadOrganizations() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await listOrganizationsUseCase.execute()
            guard !Task.isCancelled else { return }
            organizations = result
            // Load all members for all organizations to determine roles
            await loadAllMembers()
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    private func loadAllMembers() async {
        do {
            // Load members for all organizations
            var tempMembers: [Member] = []
            for org in organizations {
                guard !Task.isCancelled else { return }
                let result = try await listMembersUseCase.execute(organizationId: org.id)
                tempMembers.append(contentsOf: result.members)
            }
            guard !Task.isCancelled else { return }
            allMembers = tempMembers
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            guard !Task.isCancelled else { return }
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
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            guard !Task.isCancelled else { return }
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

    // MARK: - Refresh Methods (survive SwiftUI task cancellation)

    /// Refresh organizations - survives SwiftUI task cancellation
    func refreshOrganizations() async {
        refreshOrganizationsTask?.cancel()

        refreshOrganizationsTask = Task { [weak self] in
            guard let self else { return }
            await MainActor.run { self.isLoading = true; self.errorMessage = nil }
            do {
                let orgs = try await self.listOrganizationsUseCase.execute()
                await MainActor.run { self.organizations = orgs }
                // Load all members for all organizations
                var tempMembers: [Member] = []
                for org in orgs {
                    let result = try await self.listMembersUseCase.execute(organizationId: org.id)
                    tempMembers.append(contentsOf: result.members)
                }
                await MainActor.run { self.allMembers = tempMembers }
            } catch is CancellationError {
                // Only ignore if we intentionally cancelled
            } catch {
                await MainActor.run { self.errorMessage = error.localizedDescription }
            }
            await MainActor.run { self.isLoading = false }
        }

        await refreshOrganizationsTask?.value
    }

    /// Refresh active member - survives SwiftUI task cancellation
    func refreshActiveMember() async {
        refreshActiveMemberTask?.cancel()

        refreshActiveMemberTask = Task { [weak self] in
            guard let self else { return }
            do {
                let member = try await self.getActiveMemberUseCase.execute()
                let role = try await self.getActiveMemberRoleUseCase.execute()
                await MainActor.run {
                    self.activeMember = member
                    self.activeMemberRole = role
                }
            } catch is CancellationError {
                // Only ignore if we intentionally cancelled
            } catch {
                await MainActor.run { self.errorMessage = error.localizedDescription }
            }
        }

        await refreshActiveMemberTask?.value
    }

    // MARK: - Logo Update Methods

    func updateOrganizationLogo(organizationId: String) async {
        guard let image = selectedLogo else { return }

        isUploadingLogo = true
        errorMessage = nil
        defer { isUploadingLogo = false }

        do {
            // 1. Upload image to get URL
            let logoURL = try await uploadOrgLogoUseCase.execute(organizationId: organizationId, image: image)

            // 2. Update organization with the new logo URL
            let _ = try await updateOrganizationUseCase.execute(organizationId: organizationId, logo: logoURL)

            // 3. Clear selected logo
            selectedLogo = nil

            // 4. Refresh organization data
            if let slug = activeOrganization?.slug {
                await loadFullOrganization(slug: slug)
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
