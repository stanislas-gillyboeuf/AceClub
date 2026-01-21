import Foundation

class SetActiveOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(slug: String) async throws {
        try await repository.setActiveOrganization(slug: slug)
    }
}
