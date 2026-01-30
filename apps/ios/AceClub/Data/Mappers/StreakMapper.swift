import Foundation

class StreakMapper {
    static func map(userStreakDTO: UserStreakResponseDTO) -> UserStreak {
        let dateFormatter = ISO8601DateFormatter()
        return UserStreak(
            currentStreak: userStreakDTO.currentStreak,
            longestStreak: userStreakDTO.longestStreak,
            multiplier: userStreakDTO.multiplier,
            totalActiveWeeks: userStreakDTO.totalActiveWeeks,
            streakStartDate: userStreakDTO.streakStartDate.flatMap { dateFormatter.date(from: $0) }
        )
    }
}
