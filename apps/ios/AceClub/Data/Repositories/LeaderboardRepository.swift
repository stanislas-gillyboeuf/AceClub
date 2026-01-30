import Foundation

class LeaderboardRepository {
    let dataSource = LeaderboardAPIDataSource()

    func getGlobalLeaderboard(page: Int = 1, limit: Int = 20) async throws -> Leaderboard {
        let dto = try await dataSource.getGlobalLeaderboard(page: page, limit: limit)
        return LeaderboardMapper.map(leaderboardDTO: dto)
    }

    func getOrganizationLeaderboard(orgId: String, page: Int = 1, limit: Int = 20) async throws -> Leaderboard {
        let dto = try await dataSource.getOrganizationLeaderboard(orgId: orgId, page: page, limit: limit)
        return LeaderboardMapper.map(leaderboardDTO: dto)
    }

    func getWeeklyLeaderboard(page: Int = 1, limit: Int = 20) async throws -> WeeklyLeaderboard {
        let dto = try await dataSource.getWeeklyLeaderboard(page: page, limit: limit)
        return LeaderboardMapper.map(weeklyLeaderboardDTO: dto)
    }
}
