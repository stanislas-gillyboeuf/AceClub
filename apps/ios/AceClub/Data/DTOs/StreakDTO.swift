import Foundation

// MARK: - User Streak Response DTO
struct UserStreakResponseDTO: Codable {
    let currentStreak: Int
    let longestStreak: Int
    let multiplier: Double
    let totalActiveWeeks: Int
    let streakStartDate: String?
}
