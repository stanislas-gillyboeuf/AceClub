import Foundation

// MARK: - Badge DTO
struct BadgeDTO: Codable {
    let id: String
    let code: String
    let category: String
    let name: String
    let description: String
    let iconName: String
    let requiredLevel: Int?
    let isUnlocked: Bool?
    let unlockedAt: String?
}

// MARK: - My Badges Response DTO
struct MyBadgesResponseDTO: Codable {
    let badges: [BadgeDTO]
}

// MARK: - All Badges Response DTO
struct AllBadgesResponseDTO: Codable {
    let badges: [BadgeDTO]
}

// MARK: - Title DTO
struct TitleDTO: Codable {
    let id: String
    let code: String
    let name: String
    let requiredLevel: Int
    let isEquipped: Bool
}

// MARK: - Titles Response DTO
struct TitlesResponseDTO: Codable {
    let titles: [TitleDTO]
    let equippedTitleId: String?
}

// MARK: - Equip Title Request DTO
struct EquipTitleRequestDTO: Codable {
    let titleId: String
}

// MARK: - Equip Title Response DTO
struct EquipTitleResponseDTO: Codable {
    let success: Bool
    let titleId: String
}
