import Foundation

class CompleteOnboardingUseCase {
    private let userRepository = UserRepository()

    func execute(organizationId: String, sport: String, skillLevel: String, phoneNumber: String, imageUrl: String? = nil, pin: String? = nil) async throws -> User {
        return try await userRepository.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber,
            imageUrl: imageUrl,
            pin: pin
        )
    }
}

