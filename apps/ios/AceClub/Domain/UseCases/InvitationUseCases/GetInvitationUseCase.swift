import Foundation

class GetInvitationUseCase {
    private let repository = InvitationRepository()

    func execute(invitationId: String) async throws -> Invitation {
        return try await repository.getInvitation(invitationId: invitationId)
    }
}
