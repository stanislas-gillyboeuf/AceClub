import Foundation

class RegenerateOrganizationPinUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String) async throws -> OrganizationPinDTO {
        return try await repository.regenerateOrganizationPin(organizationId: organizationId)
    }
}
