import Foundation

class CreateOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(name: String, slug: String, logo: String? = nil, metadata: String? = nil) async throws -> Organization {
        return try await repository.createOrganization(name: name, slug: slug, logo: logo, metadata: metadata)
    }
}
