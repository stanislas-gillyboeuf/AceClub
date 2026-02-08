import Foundation

class GetOrganizationPinUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String) async throws -> OrganizationPinDTO {
        return try await repository.getOrganizationPin(organizationId: organizationId)
    }
}
