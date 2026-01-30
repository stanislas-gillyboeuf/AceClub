import Foundation

struct Challenge: Identifiable {
    let id: String
    let code: String
    let type: ChallengeType
    let difficulty: ChallengeDifficulty
    let title: String
    let description: String
    let currentProgress: Int
    let targetValue: Int
    let xpReward: Int
    let status: ChallengeStatus
    let expiresAt: Date

    var progressPercent: Double {
        guard targetValue > 0 else { return 0 }
        return min(Double(currentProgress) / Double(targetValue), 1.0)
    }

    var isCompleted: Bool {
        currentProgress >= targetValue
    }

    var formattedProgress: String {
        "\(currentProgress)/\(targetValue)"
    }

    var timeRemaining: String? {
        let now = Date()
        guard expiresAt > now else { return nil }
        let components = Calendar.current.dateComponents(
            [.day, .hour],
            from: now,
            to: expiresAt
        )
        if let days = components.day, days > 0 {
            return "\(days)j restants"
        } else if let hours = components.hour {
            return "\(hours)h restantes"
        }
        return nil
    }

    var formattedXpReward: String {
        "+\(xpReward) XP"
    }
}

enum ChallengeType: String, CaseIterable {
    case quantitative
    case social
    case performance

    var displayName: String {
        switch self {
        case .quantitative: return "Quantitatif"
        case .social: return "Social"
        case .performance: return "Performance"
        }
    }

    var icon: String {
        switch self {
        case .quantitative: return "number.circle"
        case .social: return "person.2"
        case .performance: return "star"
        }
    }
}

enum ChallengeDifficulty: String, CaseIterable {
    case easy
    case medium
    case hard

    var displayName: String {
        switch self {
        case .easy: return "Facile"
        case .medium: return "Moyen"
        case .hard: return "Difficile"
        }
    }

    var color: String {
        switch self {
        case .easy: return "green"
        case .medium: return "orange"
        case .hard: return "red"
        }
    }
}

enum ChallengeStatus: String, CaseIterable {
    case active
    case completed
    case expired

    var displayName: String {
        switch self {
        case .active: return "En cours"
        case .completed: return "Complété"
        case .expired: return "Expiré"
        }
    }
}
