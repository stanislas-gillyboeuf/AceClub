import Foundation

class GetActiveMemberUseCase {
    private let repository = OrganizationRepository()

    func execute() async throws -> Member {
        return try await repository.getActiveMember()
    }
}
