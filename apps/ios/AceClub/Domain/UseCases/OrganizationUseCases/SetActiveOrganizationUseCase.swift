import Foundation

class SetActiveOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(slug: String? = nil, organizationId: String? = nil) async throws {
        try await repository.setActiveOrganization(slug: slug, organizationId: organizationId)
    }
}
