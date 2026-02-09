import Foundation

class VerifyPinUseCase {
    private let repository = OrganizationRepository()

    func execute(organizationId: String, pin: String) async throws -> Bool {
        return try await repository.verifyPin(organizationId: organizationId, pin: pin)
    }
}
