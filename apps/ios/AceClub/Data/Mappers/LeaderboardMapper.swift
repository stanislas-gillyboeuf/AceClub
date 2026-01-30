import Foundation

class LeaderboardMapper {
    static func map(entryDTO: LeaderboardEntryDTO) -> LeaderboardEntry {
        return LeaderboardEntry(
            rank: entryDTO.rank,
            userId: entryDTO.userId,
            name: entryDTO.name,
            image: entryDTO.image,
            xp: entryDTO.xp,
            level: entryDTO.level,
            streak: entryDTO.streak
        )
    }

    static func map(leaderboardDTO: LeaderboardResponseDTO) -> Leaderboard {
        return Leaderboard(
            entries: leaderboardDTO.leaderboard.map { map(entryDTO: $0) },
            page: leaderboardDTO.pagination.page,
            limit: leaderboardDTO.pagination.limit,
            total: leaderboardDTO.pagination.total,
            totalPages: leaderboardDTO.pagination.totalPages
        )
    }

    static func map(weeklyEntryDTO: WeeklyLeaderboardEntryDTO) -> WeeklyLeaderboardEntry {
        return WeeklyLeaderboardEntry(
            rank: weeklyEntryDTO.rank,
            userId: weeklyEntryDTO.userId,
            name: weeklyEntryDTO.name,
            image: weeklyEntryDTO.image,
            weeklyXp: weeklyEntryDTO.weeklyXp
        )
    }

    static func map(weeklyLeaderboardDTO: WeeklyLeaderboardResponseDTO) -> WeeklyLeaderboard {
        let dateFormatter = ISO8601DateFormatter()
        return WeeklyLeaderboard(
            entries: weeklyLeaderboardDTO.leaderboard.map { map(weeklyEntryDTO: $0) },
            page: weeklyLeaderboardDTO.pagination.page,
            totalPages: weeklyLeaderboardDTO.pagination.totalPages,
            weekStartDate: dateFormatter.date(from: weeklyLeaderboardDTO.weekStartDate) ?? Date()
        )
    }
}
