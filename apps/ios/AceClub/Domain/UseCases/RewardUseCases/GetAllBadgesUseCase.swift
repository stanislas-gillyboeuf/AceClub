import Foundation

class GetAllBadgesUseCase {
    let repository = RewardRepository()

    func execute() async throws -> [Badge] {
        return try await repository.getAllBadges()
    }
}
