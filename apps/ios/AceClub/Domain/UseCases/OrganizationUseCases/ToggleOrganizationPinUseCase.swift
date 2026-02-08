import Foundation

class ToggleOrganizationPinUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String, enabled: Bool) async throws {
        try await repository.toggleOrganizationPin(organizationId: organizationId, enabled: enabled)
    }
}
