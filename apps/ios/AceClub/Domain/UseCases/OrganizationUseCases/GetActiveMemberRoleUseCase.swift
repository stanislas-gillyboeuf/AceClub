import Foundation

class GetActiveMemberRoleUseCase {
    private let repository = OrganizationRepository()

    func execute() async throws -> MemberRole? {
        return try await repository.getActiveMemberRole()
    }
}
