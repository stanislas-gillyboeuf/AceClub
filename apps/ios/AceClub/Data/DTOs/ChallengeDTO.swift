import Foundation

// MARK: - Challenge DTO
struct ChallengeDTO: Codable {
    let id: String
    let code: String
    let type: String
    let difficulty: String
    let title: String
    let description: String
    let currentProgress: Int
    let targetValue: Int
    let acesReward: Int
    let status: String
    let expiresAt: String
}

// MARK: - Challenges Response DTO
struct ChallengesResponseDTO: Codable {
    let challenges: [ChallengeDTO]
}

// MARK: - Challenge Template DTO
struct ChallengeTemplateDTO: Codable {
    let id: String
    let code: String
    let type: String
    let difficulty: String
    let titleFr: String
    let titleEn: String
    let descriptionFr: String
    let descriptionEn: String
    let targetValue: Int
    let acesReward: Int
    let minLevel: Int
    let maxLevel: Int?
}

// MARK: - Challenge Templates Response DTO
struct ChallengeTemplatesResponseDTO: Codable {
    let templates: [ChallengeTemplateDTO]
}
