import Foundation

struct UserPreference: Identifiable, Codable {
    let id: String
    let userId: String
    let organizationId: String
    let sport: Sport
    let skillLevel: String
    let createdAt: String
    let updatedAt: String
}

