import Foundation

class ChallengeMapper {
    static func map(challengeDTO: ChallengeDTO) -> Challenge {
        let dateFormatter = ISO8601DateFormatter()
        return Challenge(
            id: challengeDTO.id,
            code: challengeDTO.code,
            type: ChallengeType(rawValue: challengeDTO.type) ?? .quantitative,
            difficulty: ChallengeDifficulty(rawValue: challengeDTO.difficulty) ?? .medium,
            title: challengeDTO.title,
            description: challengeDTO.description,
            currentProgress: challengeDTO.currentProgress,
            targetValue: challengeDTO.targetValue,
            xpReward: challengeDTO.xpReward,
            status: ChallengeStatus(rawValue: challengeDTO.status) ?? .active,
            expiresAt: dateFormatter.date(from: challengeDTO.expiresAt) ?? Date()
        )
    }

    static func map(challengesDTO: ChallengesResponseDTO) -> [Challenge] {
        return challengesDTO.challenges.map { map(challengeDTO: $0) }
    }
}
