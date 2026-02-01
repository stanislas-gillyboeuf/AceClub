import Foundation

class GetGlobalLeaderboardUseCase {
    let repository = LeaderboardRepository()

    func execute(page: Int = 1, limit: Int = 20) async throws -> Leaderboard {
        return try await repository.getGlobalLeaderboard(page: page, limit: limit)
    }
}
