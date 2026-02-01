import Foundation

class GetUserPreferencesUseCase {
    private let userRepository = UserRepository()

    func execute() async throws -> UserPreferences {
        return try await userRepository.getPreferences()
    }
}
