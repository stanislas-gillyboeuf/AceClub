import Foundation

class CreateOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(name: String, slug: String, logo: String? = nil, metadata: String? = nil) async throws -> Organization {
        let organization = try await repository.createOrganization(name: name, slug: slug, logo: logo, metadata: metadata)

        // Set the new organization as active
        try await repository.setActiveOrganization(organizationId: organization.id)

        return organization
    }
}
