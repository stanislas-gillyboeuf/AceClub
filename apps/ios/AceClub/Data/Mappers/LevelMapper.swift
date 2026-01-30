import Foundation

class LevelMapper {
    static func map(userLevelDTO: UserLevelResponseDTO) -> UserLevel {
        return UserLevel(
            totalAces: userLevelDTO.totalAces,
            level: userLevelDTO.level,
            currentLevelAces: userLevelDTO.currentLevelAces,
            acesToNextLevel: userLevelDTO.acesToNextLevel,
            progressPercent: userLevelDTO.progressPercent / 100.0
        )
    }

    static func map(acesTransactionDTO: AcesTransactionDTO) -> AcesTransaction {
        let dateFormatter = ISO8601DateFormatter()
        return AcesTransaction(
            id: acesTransactionDTO.id,
            type: AcesTransactionType(rawValue: acesTransactionDTO.type) ?? .matchParticipation,
            amount: acesTransactionDTO.amount,
            description: acesTransactionDTO.description,
            multiplier: acesTransactionDTO.multiplier ?? 1.0,
            createdAt: dateFormatter.date(from: acesTransactionDTO.createdAt) ?? Date()
        )
    }

    static func map(acesHistoryDTO: AcesHistoryResponseDTO) -> [AcesTransaction] {
        return acesHistoryDTO.transactions.map { map(acesTransactionDTO: $0) }
    }
}
