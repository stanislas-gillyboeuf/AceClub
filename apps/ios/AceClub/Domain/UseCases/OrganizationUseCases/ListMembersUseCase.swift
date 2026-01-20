import Foundation

class ListMembersUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String? = nil) async throws -> ListMembersResult {
        return try await repository.listMembers(organizationId: organizationId)
    }
}
