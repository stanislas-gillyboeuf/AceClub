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

// MARK: - Complete Match Response DTO
struct MatchDetailResponseDTO: Codable {
    let match: MatchDTO
    let participants: [MatchParticipantDTO]
    let sets: [SetDTO]
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
    let participants: [MatchParticipantDTO]
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
