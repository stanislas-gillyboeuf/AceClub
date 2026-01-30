import Foundation

class LevelMapper {
    static func map(userLevelDTO: UserLevelResponseDTO) -> UserLevel {
        return UserLevel(
            totalXp: userLevelDTO.totalXp,
            level: userLevelDTO.level,
            currentLevelXp: userLevelDTO.currentLevelXp,
            xpToNextLevel: userLevelDTO.xpToNextLevel,
            progressPercent: userLevelDTO.progressPercent
        )
    }

    static func map(xpTransactionDTO: XpTransactionDTO) -> XpTransaction {
        let dateFormatter = ISO8601DateFormatter()
        return XpTransaction(
            id: xpTransactionDTO.id,
            type: XpTransactionType(rawValue: xpTransactionDTO.type) ?? .matchParticipation,
            amount: xpTransactionDTO.amount,
            description: xpTransactionDTO.description,
            multiplier: xpTransactionDTO.multiplier ?? 1.0,
            createdAt: dateFormatter.date(from: xpTransactionDTO.createdAt) ?? Date()
        )
    }

    static func map(xpHistoryDTO: XpHistoryResponseDTO) -> [XpTransaction] {
        return xpHistoryDTO.transactions.map { map(xpTransactionDTO: $0) }
    }
}
