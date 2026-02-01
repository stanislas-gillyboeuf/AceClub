import Foundation

struct UserPreferences: Identifiable {
    let id: String
    let userId: String
    let organizationId: String
    let organizationName: String?
    let sport: String
    let skillLevel: String
    let createdAt: String
    let updatedAt: String

    /// Sport as enum
    var sportType: Sport? {
        Sport(rawValue: sport)
    }

    /// SkillLevel as struct
    func skillLevelType(for sport: Sport) -> SkillLevel? {
        SkillLevel.levels(for: sport).first { $0.value == skillLevel }
    }
}
