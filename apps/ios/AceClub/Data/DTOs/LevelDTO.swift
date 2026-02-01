import Foundation

// MARK: - User Level Response DTO
struct UserLevelResponseDTO: Codable {
    let totalAces: Int
    let level: Int
    let currentLevelAces: Int
    let acesToNextLevel: Int
    let progressPercent: Double
}

// MARK: - Aces Transaction DTO
struct AcesTransactionDTO: Codable {
    let id: String
    let type: String
    let amount: Int
    let description: String?
    let multiplier: Double?
    let createdAt: String
}

// MARK: - Aces History Response DTO
struct AcesHistoryResponseDTO: Codable {
    let transactions: [AcesTransactionDTO]
    let page: Int
    let limit: Int
}
