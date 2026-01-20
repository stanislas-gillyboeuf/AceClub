import Foundation

class CancelInvitationUseCase {
    private let repository = InvitationRepository()

    func execute(invitationId: String) async throws {
        try await repository.cancelInvitation(invitationId: invitationId)
    }
}
