import Foundation

struct Badge: Identifiable {
    let id: String
    let code: String
    let category: BadgeCategory
    let name: String
    let description: String
    let imageUrl: String
    let requiredLevel: Int?
    let isUnlocked: Bool
    let unlockedAt: Date?

    var formattedUnlockedAt: String? {
        unlockedAt?.formatted(date: .abbreviated, time: .omitted)
    }

    var imageURL: URL? {
        guard !imageUrl.isEmpty else { return nil }
        return URL(string: imageUrl)
    }
}

enum BadgeCategory: String, CaseIterable {
    case level
    case achievement
    case milestone
    case special

    var displayName: String {
        switch self {
        case .level: return "Niveau"
        case .achievement: return "Réussite"
        case .milestone: return "Étape"
        case .special: return "Spécial"
        }
    }
}

struct Title: Identifiable {
    let id: String
    let code: String
    let name: String
    let requiredLevel: Int
    let isEquipped: Bool
    let isUnlocked: Bool

    var formattedRequirement: String {
        "Niveau \(requiredLevel) requis"
    }
}
