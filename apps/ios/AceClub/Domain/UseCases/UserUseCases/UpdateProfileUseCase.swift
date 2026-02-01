import Foundation

class UpdateProfileUseCase {
    private let userRepository = UserRepository()

    func execute(
        name: String? = nil,
        image: String? = nil,
        phoneNumber: String? = nil,
        organizationId: String? = nil,
        sport: String? = nil,
        skillLevel: String? = nil
    ) async throws -> User {
        return try await userRepository.updateProfile(
            name: name,
            image: image,
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )
    }
}
