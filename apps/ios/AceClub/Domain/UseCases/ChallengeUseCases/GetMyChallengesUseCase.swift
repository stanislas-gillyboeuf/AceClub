import Foundation

class GetMyChallengesUseCase {
    let repository = ChallengeRepository()

    func execute() async throws -> [Challenge] {
        return try await repository.getMyChallenges()
    }
}
