import Foundation

class LeaveOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String) async throws {
        try await repository.leaveOrganization(organizationId: organizationId)
    }
}
