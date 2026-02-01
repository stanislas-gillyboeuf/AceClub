import Foundation

struct LeaderboardEntry: Identifiable {
    let rank: Int
    let userId: String
    let name: String
    let image: String?
    let aces: Int
    let level: Int
    let streak: Int

    var id: String { "\(rank)-\(userId)" }

    var formattedRank: String {
        "#\(rank)"
    }

    var formattedAces: String {
        if aces >= 1000 {
            let k = Double(aces) / 1000.0
            return String(format: "%.1fk Aces", k)
        }
        return "\(aces) Aces"
    }

    var rankIcon: String? {
        switch rank {
        case 1: return "medal.fill"
        case 2: return "medal.fill"
        case 3: return "medal.fill"
        default: return nil
        }
    }

    var rankColor: String {
        switch rank {
        case 1: return "yellow"
        case 2: return "gray"
        case 3: return "orange"
        default: return "primary"
        }
    }
}

struct Leaderboard {
    let entries: [LeaderboardEntry]
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int

    var hasNextPage: Bool { page < totalPages }
    var hasPreviousPage: Bool { page > 1 }
}

struct WeeklyLeaderboardEntry: Identifiable {
    let rank: Int
    let userId: String
    let name: String
    let image: String?
    let weeklyAces: Int

    var id: String { "\(rank)-\(userId)" }

    var formattedRank: String {
        "#\(rank)"
    }

    var formattedWeeklyAces: String {
        "+\(weeklyAces) Aces"
    }
}

struct WeeklyLeaderboard {
    let entries: [WeeklyLeaderboardEntry]
    let page: Int
    let totalPages: Int
    let weekStartDate: Date

    var hasNextPage: Bool { page < totalPages }
}
