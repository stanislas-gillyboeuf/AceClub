import Foundation

class GetMyStreakUseCase {
    let repository = StreakRepository()

    func execute() async throws -> UserStreak {
        return try await repository.getMyStreak()
    }
}
