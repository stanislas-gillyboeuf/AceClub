//
//  MatchIntent.swift
//  AceClub
//

import Foundation

// MARK: - Match Intent Status

enum MatchIntentStatus: String, CaseIterable {
    case pending
    case accepted
    case rejected
}

// MARK: - Match Intent Type

enum MatchIntentType: String, CaseIterable {
    case match
    case training

    var displayName: String {
        switch self {
        case .match: return "Match"
        case .training: return "Entraînement"
        }
    }

    var icon: String {
        switch self {
        case .match: return "sportscourt"
        case .training: return "figure.run"
        }
    }
}

// MARK: - Match Intent

struct MatchIntent: Identifiable {
    let id: String
    let userId: String
    let date: Date?
    let time: Date?
    let duration: Int
    let type: MatchIntentType
    let description: String?
    let status: MatchIntentStatus
    let createdAt: Date?
}

// MARK: - List result (cursor pagination)

struct MatchIntentListResult {
    let data: [MatchIntent]
    let nextCursor: String?
    let hasMore: Bool
    let limit: Int
}

// MARK: - User Brief (for discover & requester)

struct UserBrief: Identifiable {
    let id: String
    let name: String
    let email: String
}

// MARK: - Discover item (intent + user)

struct MatchIntentDiscoverItem: Identifiable {
    let intent: MatchIntent
    let user: UserBrief?

    var id: String { intent.id }
}

struct DiscoverListResult {
    let data: [MatchIntentDiscoverItem]
    let nextCursor: String?
    let hasMore: Bool
    let limit: Int
}

// MARK: - Match Request Status

enum MatchRequestStatus: String, CaseIterable {
    case pending
    case accepted
    case rejected
}

// MARK: - Match Request

struct MatchRequest: Identifiable {
    let id: String
    let matchIntentId: String
    let requesterId: String
    let receiverId: String
    let status: MatchRequestStatus
    let createdAt: Date
    let respondedAt: Date?
}

// MARK: - Match Request with details

struct MatchRequestWithDetails: Identifiable {
    let request: MatchRequest
    let matchIntent: MatchIntent?
    let requester: UserBrief?

    var id: String { request.id }
}

// MARK: - Swipe result

struct SwipeResult {
    let matchRequest: MatchRequest?
    let message: String?
}

// MARK: - User Contact (for contact modal after accept)

struct UserContact: Identifiable {
    let id: String
    let name: String
    let image: String?
    let phoneNumber: String?

    var imageURL: URL? {
        guard let image, !image.isEmpty else { return nil }
        return URL(string: image)
    }

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            let firstInitial = components[0].prefix(1)
            let lastInitial = components[1].prefix(1)
            return "\(firstInitial)\(lastInitial)".uppercased()
        } else if let first = components.first {
            return String(first.prefix(2)).uppercased()
        }
        return "??"
    }
}

// MARK: - Accept request result

struct AcceptMatchRequestResult {
    let match: Match?
    let request: MatchRequest?
    let requester: UserContact?
    let message: String?
}

// MARK: - Reject request result

struct RejectMatchRequestResult {
    let request: MatchRequest?
    let message: String?
}
