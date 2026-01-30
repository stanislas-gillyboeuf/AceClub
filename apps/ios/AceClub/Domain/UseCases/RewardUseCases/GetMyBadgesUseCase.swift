import Foundation

class GetMyBadgesUseCase {
    let repository = RewardRepository()

    func execute() async throws -> [Badge] {
        return try await repository.getMyBadges()
    }
}
