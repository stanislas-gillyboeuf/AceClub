import Foundation

class GetFullOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(slug: String) async throws -> (organization: Organization, members: [Member]) {
        return try await repository.getFullOrganization(slug: slug)
    }
}
