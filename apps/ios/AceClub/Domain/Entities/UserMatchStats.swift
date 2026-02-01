import Foundation

struct UserMatchStats {
    let totalMatches: Int
    let totalWins: Int
    let totalPlayTime: TimeInterval
    let matchesThisMonth: Int
    let monthlyGoal: Int

    var winRate: Double {
        guard totalMatches > 0 else { return 0 }
        return Double(totalWins) / Double(totalMatches)
    }

    var formattedWinRate: String {
        let percentage = Int(winRate * 100)
        return "\(percentage)%"
    }

    var formattedPlayTime: String {
        let hours = Int(totalPlayTime) / 3600
        return "\(hours)h"
    }

    var monthlyProgress: Double {
        guard monthlyGoal > 0 else { return 0 }
        return min(Double(matchesThisMonth) / Double(monthlyGoal), 1.0)
    }

    static let empty = UserMatchStats(
        totalMatches: 0,
        totalWins: 0,
        totalPlayTime: 0,
        matchesThisMonth: 0,
        monthlyGoal: 10
    )
}
