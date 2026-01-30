import Foundation

struct UserLevel {
    let totalXp: Int
    let level: Int
    let currentLevelXp: Int
    let xpToNextLevel: Int
    let progressPercent: Double

    var formattedProgress: String {
        "\(currentLevelXp)/\(currentLevelXp + xpToNextLevel) XP"
    }

    var isMaxLevel: Bool {
        level >= 100
    }

    var formattedLevel: String {
        "Niveau \(level)"
    }

    var formattedTotalXp: String {
        if totalXp >= 1000 {
            let k = Double(totalXp) / 1000.0
            return String(format: "%.1fk XP", k)
        }
        return "\(totalXp) XP"
    }

    static let empty = UserLevel(
        totalXp: 0,
        level: 1,
        currentLevelXp: 0,
        xpToNextLevel: 100,
        progressPercent: 0
    )
}

struct XpTransaction: Identifiable {
    let id: String
    let type: XpTransactionType
    let amount: Int
    let description: String?
    let multiplier: Double
    let createdAt: Date

    var formattedAmount: String {
        amount >= 0 ? "+\(amount) XP" : "\(amount) XP"
    }

    var formattedMultiplier: String? {
        multiplier > 1.0 ? "x\(String(format: "%.1f", multiplier))" : nil
    }
}

enum XpTransactionType: String, CaseIterable {
    case matchParticipation = "match_participation"
    case matchVictory = "match_victory"
    case challengeCompleted = "challenge_completed"
    case streakBonus = "streak_bonus"
    case levelUpBonus = "level_up_bonus"
    case badgeBonus = "badge_bonus"

    var displayName: String {
        switch self {
        case .matchParticipation: return "Participation"
        case .matchVictory: return "Victoire"
        case .challengeCompleted: return "Défi complété"
        case .streakBonus: return "Bonus série"
        case .levelUpBonus: return "Bonus niveau"
        case .badgeBonus: return "Bonus badge"
        }
    }

    var icon: String {
        switch self {
        case .matchParticipation: return "tennisball"
        case .matchVictory: return "trophy"
        case .challengeCompleted: return "checkmark.seal"
        case .streakBonus: return "flame"
        case .levelUpBonus: return "arrow.up.circle"
        case .badgeBonus: return "medal"
        }
    }
}
