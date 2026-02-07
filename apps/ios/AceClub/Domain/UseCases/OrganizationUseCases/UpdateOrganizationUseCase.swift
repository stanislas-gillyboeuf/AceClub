import Foundation

class UpdateOrganizationUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String, name: String? = nil, logo: String? = nil, address: String? = nil) async throws -> Organization {
        return try await repository.updateOrganization(organizationId: organizationId, name: name, logo: logo, address: address)
    }
}
