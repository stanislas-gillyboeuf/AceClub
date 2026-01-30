import Foundation

class RewardMapper {
    static func map(badgeDTO: BadgeDTO) -> Badge {
        let dateFormatter = ISO8601DateFormatter()
        return Badge(
            id: badgeDTO.id,
            code: badgeDTO.code,
            category: BadgeCategory(rawValue: badgeDTO.category) ?? .achievement,
            name: badgeDTO.name,
            description: badgeDTO.description,
            iconName: badgeDTO.iconName,
            requiredLevel: badgeDTO.requiredLevel,
            isUnlocked: badgeDTO.isUnlocked ?? (badgeDTO.unlockedAt != nil),
            unlockedAt: badgeDTO.unlockedAt.flatMap { dateFormatter.date(from: $0) }
        )
    }

    static func map(myBadgesDTO: MyBadgesResponseDTO) -> [Badge] {
        return myBadgesDTO.badges.map { map(badgeDTO: $0) }
    }

    static func map(allBadgesDTO: AllBadgesResponseDTO) -> [Badge] {
        return allBadgesDTO.badges.map { map(badgeDTO: $0) }
    }

    static func map(titleDTO: TitleDTO) -> Title {
        return Title(
            id: titleDTO.id,
            code: titleDTO.code,
            name: titleDTO.name,
            requiredLevel: titleDTO.requiredLevel,
            isEquipped: titleDTO.isEquipped,
            isUnlocked: true
        )
    }

    static func map(titlesDTO: TitlesResponseDTO) -> [Title] {
        return titlesDTO.titles.map { map(titleDTO: $0) }
    }
}
