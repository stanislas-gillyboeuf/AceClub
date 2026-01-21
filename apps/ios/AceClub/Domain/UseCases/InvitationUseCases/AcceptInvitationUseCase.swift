import Foundation

class AcceptInvitationUseCase {
    private let repository = InvitationRepository()

    func execute(invitationId: String) async throws -> Member {
        return try await repository.acceptInvitation(invitationId: invitationId)
    }
}
