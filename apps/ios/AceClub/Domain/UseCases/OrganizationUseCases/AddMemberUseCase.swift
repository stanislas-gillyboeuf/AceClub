import Foundation

class AddMemberUseCase {
    private let repository = OrganizationRepository()

    func execute(userId: String, role: String, organizationId: String? = nil) async throws -> Member {
        return try await repository.addMember(userId: userId, role: role, organizationId: organizationId)
    }
}
