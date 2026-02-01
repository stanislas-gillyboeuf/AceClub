//
//  UserSummaryMapper.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

enum UserSummaryMapper {

    // MARK: - UserSummary Mapping

    static func map(dto: UserBriefDTO) -> UserSummary {
        UserSummary(
            id: dto.id,
            name: dto.name,
            image: dto.image
        )
    }

    static func map(dto: LeaderboardUserDTO) -> UserSummary {
        UserSummary(
            id: dto.id,
            name: dto.name,
            image: dto.image
        )
    }

    // MARK: - MessageSender Mapping

    static func map(dto: MessageSenderDTO) -> MessageSender {
        MessageSender(
            id: dto.id,
            name: dto.name,
            image: dto.image
        )
    }

    // MARK: - UserProfile Mapping

    static func map(dto: ParticipantUserDTO) -> UserProfile {
        UserProfile(
            id: dto.id,
            name: dto.name,
            image: dto.image,
            level: dto.level ?? 1,
            totalAces: dto.totalAces ?? 0,
            title: dto.title.map { mapTitle($0) },
            badges: dto.badges?.map { mapBadge($0) } ?? [],
            currentStreak: dto.currentStreak ?? 0,
            longestStreak: dto.longestStreak ?? 0,
            globalRank: dto.globalRank
        )
    }

    // MARK: - Helper Mappings

    private static func mapTitle(_ dto: ParticipantTitleDTO) -> ParticipantTitle {
        ParticipantTitle(
            code: dto.code,
            nameFr: dto.nameFr,
            nameEn: dto.nameEn
        )
    }

    private static func mapBadge(_ dto: ParticipantBadgeDTO) -> ParticipantBadge {
        ParticipantBadge(
            code: dto.code,
            imageUrl: dto.imageUrl,
            nameFr: dto.nameFr,
            nameEn: dto.nameEn
        )
    }
}
