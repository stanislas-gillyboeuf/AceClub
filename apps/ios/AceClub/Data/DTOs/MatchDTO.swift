//
//  MatchDTO.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

// MARK: - Match DTO
struct MatchDTO: Codable {
    let id: String
    let createdBy: String
    let status: String
    let type: String?
    let createdAt: String
    let scheduledAt: String?
    let startedAt: String?
    let finishedAt: String?
    let venueOrganizationId: String?
}

// MARK: - Match Participant DTO
struct MatchParticipantDTO: Codable {
    let id: String
    let matchId: String
    let userId: String
    let side: String
    let isWinner: Bool
    let createdAt: String
    let user: UserDTO?
}


// MARK: - Set DTO
struct SetDTO: Codable {
    let id: String
    let matchId: String
    let setNumber: Int
    let createdAt: String
    let scores: [SetScoreDTO]?
}

// MARK: - Set Score DTO
struct SetScoreDTO: Codable {
    let participantId: String
    let userId: String
    let side: String?
    let games: Int
}

// MARK: - Match Comment DTO
struct MatchCommentDTO: Codable {
    let id: String
    let matchId: String
    let userId: String
    let content: String
    let createdAt: String
    let updatedAt: String
    let user: MessageSenderDTO?
}

// MARK: - Participant Organization DTO
struct ParticipantOrganizationDTO: Codable {
    let userId: String
    let organization: OrganizationDTO
}

// MARK: - Complete Match Response DTO
struct MatchDetailResponseDTO: Codable {
    let match: MatchDTO
    let participants: [MatchParticipantDTO]
    let sets: [SetDTO]
    let comments: [MatchCommentDTO]?
    let venueOrganization: OrganizationDTO?
    let participantOrganizations: [ParticipantOrganizationDTO]?
}

// MARK: - List Matches Response DTO
struct ListMatchesResponseDTO: Codable {
    let matches: [MatchWithParticipantsDTO]
    let pagination: PaginationDTO
}

struct MatchWithParticipantsDTO: Codable {
    let id: String
    let createdBy: String
    let status: String
    let type: String?
    let createdAt: String
    let scheduledAt: String?
    let startedAt: String?
    let finishedAt: String?
    let venueOrganizationId: String?
    let participants: [MatchParticipantDTO]
    let sets: [SetDTO]?
    let comments: [MatchCommentDTO]?
}

struct PaginationDTO: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

// MARK: - Create Match Request DTO
struct CreateMatchRequestDTO: Codable {
    let createdBy: String
    let status: String
    let type: String?
    let createdAt: String
    let scheduledAt: String?
    let startedAt: String?
    let finishedAt: String?
    let participants: [CreateParticipantDTO]
    let sets: [CreateSetDTO]
}

struct CreateParticipantDTO: Codable {
    let userId: String
    let side: String
    let isWinner: Bool?
}

struct CreateSetDTO: Codable {
    let setNumber: Int
    let scores: [CreateScoreDTO]
}

struct CreateScoreDTO: Codable {
    let userId: String
    let score: Int
}

// MARK: - Create Match Response DTO
struct CreateMatchResponseDTO: Codable {
    let match: MatchDTO
    let participants: [MatchParticipantDTO]
    let sets: [SetDTO]
    let scores: [SetScoreResponseDTO]
}

struct SetScoreResponseDTO: Codable {
    let setId: String
    let participantId: String
    let games: Int
}

// MARK: - Update Match Request DTO
struct UpdateMatchRequestDTO: Codable {
    let status: String?
    let scheduledAt: String?
    let startedAt: String?
    let finishedAt: String?
    let winnerId: String?
}

// MARK: - Update Match Response DTO
struct UpdateMatchResponseDTO: Codable {
    let success: Bool
    let match: MatchDTO
}

// MARK: - Update Match Scores Request DTO
struct UpdateMatchScoresRequestDTO: Codable {
    let sets: [UpdateSetScoresDTO]
}

struct UpdateSetScoresDTO: Codable {
    let setNumber: Int
    let scores: [UpdateScoreDTO]
}

struct UpdateScoreDTO: Codable {
    let userId: String
    let score: Int
}

// MARK: - Update Match Scores Response DTO
struct UpdateMatchScoresResponseDTO: Codable {
    let success: Bool
    let updatedScoresCount: Int
    let updatedScores: [SetScoreResponseDTO]
}

// MARK: - Update Venue Request DTO
struct UpdateVenueRequestDTO: Codable {
    let venueOrganizationId: String?
}

// MARK: - Update Venue Response DTO
struct UpdateVenueResponseDTO: Codable {
    let success: Bool
    let match: MatchDTO
    let venueOrganization: OrganizationDTO?
}

// MARK: - Delete Match Response DTO
struct DeleteMatchResponseDTO: Codable {
    let success: Bool
    let message: String
    let matchId: String
    let deletedCounts: DeletedCountsDTO
}

struct DeletedCountsDTO: Codable {
    let participants: Int
    let sets: Int
    let scores: Int
}

// MARK: - Create Comment Request DTO
struct CreateCommentRequestDTO: Codable {
    let content: String
}

// MARK: - Update Comment Request DTO
struct UpdateCommentRequestDTO: Codable {
    let content: String
}

// MARK: - Delete Comment Response DTO
struct DeleteCommentResponseDTO: Codable {
    let success: Bool
    let message: String
}
