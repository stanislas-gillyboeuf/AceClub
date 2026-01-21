import Foundation

class RejectInvitationUseCase {
    private let repository = InvitationRepository()

    func execute(invitationId: String) async throws {
        try await repository.rejectInvitation(invitationId: invitationId)
    }
}
