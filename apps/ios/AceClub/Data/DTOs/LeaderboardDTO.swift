import Foundation

// MARK: - Leaderboard Entry DTO
struct LeaderboardEntryDTO: Codable {
    let rank: Int
    let userId: String
    let name: String
    let image: String?
    let xp: Int
    let level: Int
    let streak: Int
}

// MARK: - Leaderboard Response DTO
struct LeaderboardResponseDTO: Codable {
    let leaderboard: [LeaderboardEntryDTO]
    let pagination: LeaderboardPaginationDTO
}

struct LeaderboardPaginationDTO: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

// MARK: - Weekly Leaderboard Entry DTO
struct WeeklyLeaderboardEntryDTO: Codable {
    let rank: Int
    let userId: String
    let name: String
    let image: String?
    let weeklyXp: Int
}

// MARK: - Weekly Leaderboard Response DTO
struct WeeklyLeaderboardResponseDTO: Codable {
    let leaderboard: [WeeklyLeaderboardEntryDTO]
    let pagination: LeaderboardPaginationDTO
    let weekStartDate: String
}
