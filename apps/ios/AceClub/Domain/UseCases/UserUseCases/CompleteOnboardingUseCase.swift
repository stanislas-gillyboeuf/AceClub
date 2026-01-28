import Foundation

class CompleteOnboardingUseCase {
    private let userRepository = UserRepository()

    func execute(organizationId: String, sport: String, skillLevel: String, phoneNumber: String) async throws -> User {
        return try await userRepository.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber
        )
    }
}

