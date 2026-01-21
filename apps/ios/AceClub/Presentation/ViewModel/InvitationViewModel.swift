import Foundation
import Combine

@MainActor
class InvitationViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var organizationInvitations: [Invitation] = []
    @Published var userInvitations: [Invitation] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - UseCases
    private let listInvitationsUseCase = ListInvitationsUseCase()
    private let listUserInvitationsUseCase = ListUserInvitationsUseCase()
    private let createInvitationUseCase = CreateInvitationUseCase()
    private let acceptInvitationUseCase = AcceptInvitationUseCase()
    private let rejectInvitationUseCase = RejectInvitationUseCase()
    private let cancelInvitationUseCase = CancelInvitationUseCase()

    // MARK: - Organization Invitations (for owners/admins)

    func loadOrganizationInvitations(organizationId: String? = nil) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            organizationInvitations = try await listInvitationsUseCase.execute(organizationId: organizationId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createInvitation(email: String, role: String = "member", organizationId: String? = nil) async -> Invitation? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let invitation = try await createInvitationUseCase.execute(email: email, role: role, organizationId: organizationId)
            organizationInvitations.insert(invitation, at: 0)
            return invitation
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func cancelInvitation(invitationId: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await cancelInvitationUseCase.execute(invitationId: invitationId)
            organizationInvitations.removeAll { $0.id == invitationId }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func resendInvitation(invitationId: String) async -> Invitation? {
        guard let invitation = organizationInvitations.first(where: { $0.id == invitationId }) else {
            errorMessage = "Invitation not found"
            return nil
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let newInvitation = try await createInvitationUseCase.execute(
                email: invitation.email,
                role: invitation.role.rawValue,
                organizationId: invitation.organizationId,
                resend: true
            )
            if let index = organizationInvitations.firstIndex(where: { $0.id == invitationId }) {
                organizationInvitations[index] = newInvitation
            }
            return newInvitation
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    // MARK: - User Invitations (for users receiving invitations)

    func loadUserInvitations() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            userInvitations = try await listUserInvitationsUseCase.execute()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func acceptInvitation(invitationId: String) async -> Member? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let member = try await acceptInvitationUseCase.execute(invitationId: invitationId)
            userInvitations.removeAll { $0.id == invitationId }
            return member
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func rejectInvitation(invitationId: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await rejectInvitationUseCase.execute(invitationId: invitationId)
            userInvitations.removeAll { $0.id == invitationId }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed Properties

    var pendingUserInvitations: [Invitation] {
        userInvitations.filter { $0.isPending && !$0.isExpired }
    }

    var hasPendingInvitations: Bool {
        !pendingUserInvitations.isEmpty
    }

    var pendingOrganizationInvitations: [Invitation] {
        organizationInvitations.filter { $0.isPending }
    }
}
