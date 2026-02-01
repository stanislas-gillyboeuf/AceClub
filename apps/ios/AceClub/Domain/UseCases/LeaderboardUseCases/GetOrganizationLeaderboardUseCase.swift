import Foundation

class GetOrganizationLeaderboardUseCase {
    let repository = LeaderboardRepository()

    func execute(orgId: String, page: Int = 1, limit: Int = 20) async throws -> Leaderboard {
        return try await repository.getOrganizationLeaderboard(orgId: orgId, page: page, limit: limit)
    }
}
