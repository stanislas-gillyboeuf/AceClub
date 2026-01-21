import Foundation

class ListUserInvitationsUseCase {
    private let repository = InvitationRepository()

    func execute() async throws -> [Invitation] {
        return try await repository.listUserInvitations()
    }
}
