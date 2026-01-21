import Foundation

class ListInvitationsUseCase {
    private let repository = InvitationRepository()

    func execute(organizationId: String? = nil) async throws -> [Invitation] {
        return try await repository.listInvitations(organizationId: organizationId)
    }
}
