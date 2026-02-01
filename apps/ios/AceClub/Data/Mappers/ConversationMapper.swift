//
//  ConversationMapper.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class ConversationMapper {

    // MARK: - Date Parsing

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static func parseDate(_ dateString: String) -> Date? {
        // Try with fractional seconds first
        if let date = isoDateFormatter.date(from: dateString) {
            return date
        }

        // Try without fractional seconds
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }

    // MARK: - Conversation Type Mapping

    private static func mapType(_ typeString: String) -> ConversationType {
        switch typeString.lowercased() {
        case "match":
            return .match
        case "group":
            return .group
        default:
            return .match // Default fallback
        }
    }

    // MARK: - Title Mapping

    static func map(titleDTO: ParticipantTitleDTO?) -> ParticipantTitle? {
        guard let titleDTO else { return nil }
        return ParticipantTitle(
            code: titleDTO.code,
            nameFr: titleDTO.nameFr,
            nameEn: titleDTO.nameEn
        )
    }

    // MARK: - Badge Mapping

    static func map(badgeDTO: ParticipantBadgeDTO) -> ParticipantBadge {
        return ParticipantBadge(
            code: badgeDTO.code,
            imageUrl: badgeDTO.imageUrl,
            nameFr: badgeDTO.nameFr,
            nameEn: badgeDTO.nameEn
        )
    }

    static func map(badgeDTOs: [ParticipantBadgeDTO]?) -> [ParticipantBadge] {
        guard let badgeDTOs else { return [] }
        return badgeDTOs.map { map(badgeDTO: $0) }
    }

    // MARK: - Participant Mapping

    static func map(participantDTO: ConversationParticipantDTO) -> ConversationParticipant {
        return ConversationParticipant(
            id: participantDTO.id,
            userId: participantDTO.userId,
            userName: participantDTO.userName,
            userImage: participantDTO.userImage,
            level: participantDTO.level ?? 1,
            totalAces: participantDTO.totalAces ?? 0,
            title: map(titleDTO: participantDTO.title),
            badges: map(badgeDTOs: participantDTO.badges),
            currentStreak: participantDTO.currentStreak ?? 0,
            longestStreak: participantDTO.longestStreak ?? 0,
            globalRank: participantDTO.globalRank
        )
    }

    // MARK: - Message Mapping

    static func map(messageDTO: MessageDTO) -> Message {
        let isFromMe = messageDTO.isFromMe ?? false

        return Message(
            id: messageDTO.id,
            conversationId: messageDTO.conversationId,
            senderId: messageDTO.senderId,
            senderName: messageDTO.senderName,
            senderImage: messageDTO.senderImage,
            content: messageDTO.content,
            createdAt: parseDate(messageDTO.createdAt) ?? Date(),
            clientMessageId: messageDTO.clientMessageId,
            isFromMe: isFromMe,
            sendStatus: .sent
        )
    }

    static func map(messageDTOs: [MessageDTO]) -> [Message] {
        return messageDTOs.map { map(messageDTO: $0) }
    }

    // MARK: - Conversation Mapping

    static func map(conversationDTO: ConversationDTO) -> Conversation {
        return Conversation(
            id: conversationDTO.id,
            matchId: conversationDTO.matchId,
            name: conversationDTO.name,
            type: mapType(conversationDTO.type),
            lastMessageAt: conversationDTO.lastMessageAt.flatMap { parseDate($0) },
            lastMessagePreview: conversationDTO.lastMessagePreview,
            lastMessageSenderId: conversationDTO.lastMessageSenderId,
            createdAt: parseDate(conversationDTO.createdAt) ?? Date(),
            unreadCount: conversationDTO.unreadCount,
            isMuted: conversationDTO.isMuted,
            otherParticipants: conversationDTO.otherParticipants.map { map(participantDTO: $0) }
        )
    }

    static func map(conversationDTOs: [ConversationDTO]) -> [Conversation] {
        return conversationDTOs.map { map(conversationDTO: $0) }
    }
}
