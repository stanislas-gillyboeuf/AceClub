import Foundation

class UpdateMemberRoleUseCase {
    private let repository = OrganizationRepository()

    func execute(memberId: String, role: String, organizationId: String? = nil) async throws -> Member {
        return try await repository.updateMemberRole(memberId: memberId, role: role, organizationId: organizationId)
    }
}
