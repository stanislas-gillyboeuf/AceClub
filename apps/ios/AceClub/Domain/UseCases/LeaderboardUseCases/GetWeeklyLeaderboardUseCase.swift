import Foundation

class GetWeeklyLeaderboardUseCase {
    let repository = LeaderboardRepository()

    func execute(page: Int = 1, limit: Int = 20) async throws -> WeeklyLeaderboard {
        return try await repository.getWeeklyLeaderboard(page: page, limit: limit)
    }
}
