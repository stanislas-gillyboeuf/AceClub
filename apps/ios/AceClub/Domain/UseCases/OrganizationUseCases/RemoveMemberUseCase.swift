import Foundation

class RemoveMemberUseCase {
    private let repository = OrganizationRepository()

    func execute(memberIdOrEmail: String, organizationId: String? = nil) async throws {
        try await repository.removeMember(memberIdOrEmail: memberIdOrEmail, organizationId: organizationId)
    }
}
