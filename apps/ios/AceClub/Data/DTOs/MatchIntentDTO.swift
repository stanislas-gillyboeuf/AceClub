//
//  MatchIntentDTO.swift
//  AceClub
//

import Foundation

// MARK: - Match Intent

struct MatchIntentDTO: Codable {
    let id: String
    let userId: String
    let date: String?
    let time: String?
    let duration: Int?
    let type: String?
    let description: String?
    let status: String?
    let createdAt: String?
}

// MARK: - Cursor pagination (list intents / discover)

struct CursorPaginationDTO: Codable {
    let nextCursor: String?
    let hasMore: Bool
    let limit: Int
}

struct ListMatchIntentsResponseDTO: Codable {
    let data: [MatchIntentDTO]
    let pagination: CursorPaginationDTO
}

// MARK: - Discover (intent with user info)

struct MatchIntentWithUserDTO: Codable {
    let id: String
    let userId: String
    let date: String?
    let time: String?
    let duration: Int?
    let type: String?
    let description: String?
    let status: String?
    let createdAt: String?
    let user: UserBriefDTO?
}

struct OrganizationBriefDTO: Codable {
    let id: String
    let name: String
    let logo: String?
}

struct UserBriefDTO: Codable {
    let id: String
    let name: String
    let email: String
    let image: String?
    let level: Int?
    let organization: OrganizationBriefDTO?
}

struct UserContactDTO: Codable {
    let id: String
    let name: String
    let image: String?
    let phoneNumber: String?
}

struct DiscoverMatchIntentsResponseDTO: Codable {
    let data: [MatchIntentWithUserDTO]
    let pagination: CursorPaginationDTO
}

// MARK: - Create intent

struct CreateMatchIntentRequestDTO: Codable {
    let date: String
    let time: String
    let duration: Int
    let type: String
    let description: String?
}

// Response = MatchIntentDTO (single object, 201)

// MARK: - Swipe

struct SwipeMatchIntentRequestDTO: Codable {
    let matchIntentId: String
    let action: String // "like" | "pass"
}

struct MatchIntentSwipeDTO: Codable {
    let id: String
    let matchIntentId: String
    let swiperUserId: String
    let action: String
    let swipedAt: String?
}

struct MatchRequestDTO: Codable {
    let id: String
    let matchIntentId: String
    let requesterId: String
    let receiverId: String
    let status: String
    let createdAt: String
    let respondedAt: String?
}

struct SwipeMatchIntentResponseDTO: Codable {
    let swipe: MatchIntentSwipeDTO?
    let request: MatchRequestDTO?
    let message: String?
}

// MARK: - List requests (item with intent + requester)

struct MatchRequestWithDetailsDTO: Codable {
    let id: String
    let matchIntentId: String
    let requesterId: String
    let receiverId: String
    let status: String
    let createdAt: String
    let respondedAt: String?
    let matchIntent: MatchIntentDTO?
    let requester: UserBriefDTO?
}

// MARK: - Accept / Reject request

struct AcceptMatchRequestResponseDTO: Codable {
    let request: MatchRequestDTO?
    let match: MatchDTO?
    let requester: UserContactDTO?
    let message: String?
}

struct RejectMatchRequestResponseDTO: Codable {
    let request: MatchRequestDTO?
    let message: String?
}
