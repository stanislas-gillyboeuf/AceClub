//
//  ConversationDTO.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

// MARK: - Participant Title DTO
struct ParticipantTitleDTO: Codable {
    let code: String
    let nameFr: String
    let nameEn: String
}

// MARK: - Participant Badge DTO
struct ParticipantBadgeDTO: Codable {
    let code: String
    let imageUrl: String
    let nameFr: String
    let nameEn: String
}

// MARK: - Conversation Participant DTO
struct ConversationParticipantDTO: Codable {
    let id: String
    let userId: String
    let userName: String
    let userImage: String?
    // Level info
    let level: Int?
    let totalAces: Int?
    // Title info
    let title: ParticipantTitleDTO?
    // Badges (top 3)
    let badges: [ParticipantBadgeDTO]?
    // Streak info
    let currentStreak: Int?
    let longestStreak: Int?
    // Ranking
    let globalRank: Int?
}

// MARK: - Message DTO
struct MessageDTO: Codable {
    let id: String
    let conversationId: String
    let senderId: String
    let senderName: String
    let senderImage: String?
    let content: String
    let createdAt: String
    let clientMessageId: String?
    let isFromMe: Bool
}

// MARK: - Conversation DTO
struct ConversationDTO: Codable {
    let id: String
    let matchId: String?
    let name: String?
    let type: String
    let lastMessageAt: String?
    let lastMessagePreview: String?
    let lastMessageSenderId: String?
    let createdAt: String
    let unreadCount: Int
    let isMuted: Bool
    let otherParticipants: [ConversationParticipantDTO]
}

// MARK: - Send Message Request DTO
struct SendMessageRequestDTO: Codable {
    let content: String
    let clientMessageId: String?
}

// MARK: - Mark Read Response DTO
struct MarkReadResponseDTO: Codable {
    let success: Bool
    let lastReadAt: String
}

// MARK: - Mute Conversation Request DTO
struct MuteConversationRequestDTO: Codable {
    let isMuted: Bool
}

// MARK: - Mute Conversation Response DTO
struct MuteConversationResponseDTO: Codable {
    let success: Bool
    let isMuted: Bool
}

// MARK: - Delete Conversation Response DTO
struct DeleteConversationResponseDTO: Codable {
    let success: Bool
}
