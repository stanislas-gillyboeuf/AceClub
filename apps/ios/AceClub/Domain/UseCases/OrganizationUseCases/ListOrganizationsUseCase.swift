import Foundation

class ListOrganizationsUseCase {
    private let repository = OrganizationRepository()

    func execute() async throws -> [Organization] {
        return try await repository.listOrganizations()
    }
}
