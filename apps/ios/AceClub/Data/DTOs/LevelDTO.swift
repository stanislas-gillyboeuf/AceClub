import Foundation

// MARK: - User Level Response DTO
struct UserLevelResponseDTO: Codable {
    let totalXp: Int
    let level: Int
    let currentLevelXp: Int
    let xpToNextLevel: Int
    let progressPercent: Double
}

// MARK: - XP Transaction DTO
struct XpTransactionDTO: Codable {
    let id: String
    let type: String
    let amount: Int
    let description: String?
    let multiplier: Double?
    let createdAt: String
}

// MARK: - XP History Response DTO
struct XpHistoryResponseDTO: Codable {
    let transactions: [XpTransactionDTO]
    let page: Int
    let limit: Int
}
