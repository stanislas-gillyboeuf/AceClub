//
//  Conversation.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

// MARK: - Conversation Type
enum ConversationType: String, CaseIterable {
    case match
    case group

    var displayName: String {
        switch self {
        case .match: return "Match"
        case .group: return "Groupe"
        }
    }
}

// MARK: - Message Send Status
enum MessageSendStatus: String {
    case sending
    case sent
    case failed
}

// MARK: - Participant Title
struct ParticipantTitle: Equatable, Hashable {
    let code: String
    let nameFr: String
    let nameEn: String

    var localizedName: String {
        Locale.current.language.languageCode?.identifier == "fr" ? nameFr : nameEn
    }
}

// MARK: - Participant Badge
struct ParticipantBadge: Identifiable, Equatable, Hashable {
    var id: String { code }
    let code: String
    let imageUrl: String
    let nameFr: String
    let nameEn: String

    var imageURL: URL? {
        URL(string: imageUrl)
    }

    var localizedName: String {
        Locale.current.language.languageCode?.identifier == "fr" ? nameFr : nameEn
    }
}

// MARK: - Conversation Participant
struct ConversationParticipant: Identifiable, Equatable, Hashable {
    let id: String
    let user: UserProfile

    // MARK: - Convenience accessors (for backwards compatibility)

    var userId: String { user.id }
    var userName: String { user.name }
    var userImage: String? { user.image }
    var level: Int { user.level }
    var totalAces: Int { user.totalAces }
    var title: ParticipantTitle? { user.title }
    var badges: [ParticipantBadge] { user.badges }
    var currentStreak: Int { user.currentStreak }
    var longestStreak: Int { user.longestStreak }
    var globalRank: Int? { user.globalRank }

    var userImageURL: URL? { user.imageURL }
    var localizedTitle: String? { user.localizedTitle }
    var hasActiveStreak: Bool { user.hasActiveStreak }
}

// MARK: - Message Entity
struct Message: Identifiable, Equatable {
    let id: String
    let conversationId: String
    let sender: MessageSender
    let content: String
    let createdAt: Date
    let clientMessageId: String?
    let isFromMe: Bool
    var sendStatus: MessageSendStatus

    // MARK: - Convenience accessors (for backwards compatibility)

    var senderId: String { sender.id }
    var senderName: String { sender.name }
    var senderImage: String? { sender.image }

    init(
        id: String,
        conversationId: String,
        sender: MessageSender,
        content: String,
        createdAt: Date,
        clientMessageId: String? = nil,
        isFromMe: Bool,
        sendStatus: MessageSendStatus = .sent
    ) {
        self.id = id
        self.conversationId = conversationId
        self.sender = sender
        self.content = content
        self.createdAt = createdAt
        self.clientMessageId = clientMessageId
        self.isFromMe = isFromMe
        self.sendStatus = sendStatus
    }

    // MARK: - Computed Properties

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: createdAt)
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: createdAt)
    }
}

// MARK: - Conversation Entity
struct Conversation: Identifiable, Equatable, Hashable {
    let id: String
    let name: String?
    let type: ConversationType
    let lastMessageAt: Date?
    let lastMessagePreview: String?
    let lastMessageSenderId: String?
    let createdAt: Date
    let unreadCount: Int
    let isMuted: Bool
    let otherParticipants: [ConversationParticipant]

    // MARK: - Computed Properties

    var displayName: String {
        if let name = name, !name.isEmpty {
            return name
        }
        return otherParticipants.first?.userName ?? "Conversation"
    }

    var avatarURL: String? {
        otherParticipants.first?.userImage
    }

    var hasUnreadMessages: Bool {
        unreadCount > 0
    }

    var formattedLastMessageTime: String? {
        guard let lastMessageAt = lastMessageAt else { return nil }

        let calendar = Calendar.current
        let now = Date()

        if calendar.isDateInToday(lastMessageAt) {
            let formatter = DateFormatter()
            formatter.timeStyle = .short
            return formatter.string(from: lastMessageAt)
        } else if calendar.isDateInYesterday(lastMessageAt) {
            return "Hier"
        } else if calendar.isDate(lastMessageAt, equalTo: now, toGranularity: .weekOfYear) {
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE"
            return formatter.string(from: lastMessageAt)
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .short
            return formatter.string(from: lastMessageAt)
        }
    }
}

// MARK: - Conversation List Result
struct ConversationListResult {
    let conversations: [Conversation]
    let totalUnreadCount: Int

    init(conversations: [Conversation]) {
        self.conversations = conversations
        self.totalUnreadCount = conversations.reduce(0) { $0 + $1.unreadCount }
    }
}

// MARK: - UserProfileData Conformance

extension ConversationParticipant: UserProfileData {
    var profileName: String { user.name }
    var profileImageURL: URL? { user.imageURL }
    var profileLevel: Int { user.level }
    var profileInitials: String { user.initials }
    var profileOrganizationName: String? { nil }
    var profileTotalAces: Int { user.totalAces }
    var profileTitle: String? { user.localizedTitle }
    var profileBadges: [UserProfileBadge] {
        user.badges.map { UserProfileBadge(code: $0.code, imageUrl: $0.imageUrl, localizedName: $0.localizedName) }
    }
    var profileCurrentStreak: Int { user.currentStreak }
    var profileLongestStreak: Int { user.longestStreak }
    var profileGlobalRank: Int? { user.globalRank }
}
