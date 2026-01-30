import Foundation

struct UserStreak {
    let currentStreak: Int
    let longestStreak: Int
    let multiplier: Double
    let totalActiveWeeks: Int
    let streakStartDate: Date?

    var formattedMultiplier: String? {
        multiplier > 1.0 ? "x\(String(format: "%.1f", multiplier))" : nil
    }

    var hasActiveStreak: Bool {
        currentStreak > 0
    }

    var formattedCurrentStreak: String {
        "\(currentStreak) semaine\(currentStreak > 1 ? "s" : "")"
    }

    var formattedLongestStreak: String {
        "\(longestStreak) semaine\(longestStreak > 1 ? "s" : "")"
    }

    var streakIcon: String {
        if currentStreak >= 12 {
            return "flame.circle.fill"
        } else if currentStreak >= 4 {
            return "flame.fill"
        } else if currentStreak > 0 {
            return "flame"
        }
        return "flame"
    }

    static let empty = UserStreak(
        currentStreak: 0,
        longestStreak: 0,
        multiplier: 1.0,
        totalActiveWeeks: 0,
        streakStartDate: nil
    )
}
