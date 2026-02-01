//
//  MatchRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class MatchRepository {

    private let matchDataSource = MatchAPIDataSource()

    // MARK: - Get Match by ID

    func getMatch(id: String) async throws -> MatchDetail {
        let detailDTO = try await matchDataSource.getMatch(id: id)
        return MatchMapper.map(detailDTO: detailDTO)
    }

    // MARK: - List Matches

    func listMatches(
        status: MatchStatus? = nil,
        userId: String? = nil,
        participantOnly: Bool = true,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> MatchListResult {
        let statusString = status?.rawValue
        let listDTO = try await matchDataSource.listMatches(
            status: statusString,
            userId: userId,
            participantOnly: participantOnly,
            page: page,
            limit: limit
        )
        return MatchMapper.map(listResponseDTO: listDTO)
    }

    // MARK: - Create Match

    func createMatch(
        createdBy: String,
        status: MatchStatus,
        type: MatchType = .match,
        createdAt: Date,
        scheduledAt: Date?,
        startedAt: Date?,
        finishedAt: Date?,
        participants: [(userId: String, side: MatchSide, isWinner: Bool)],
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> MatchDetail {
        let requestDTO = MatchMapper.mapToCreateRequest(
            createdBy: createdBy,
            status: status,
            type: type,
            createdAt: createdAt,
            scheduledAt: scheduledAt,
            startedAt: startedAt,
            finishedAt: finishedAt,
            participants: participants,
            sets: sets
        )

        let responseDTO = try await matchDataSource.createMatch(request: requestDTO)
        return MatchMapper.map(createResponseDTO: responseDTO)
    }

    // MARK: - Update Match

    func updateMatch(
        id: String,
        status: MatchStatus? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil,
        winnerId: String? = nil
    ) async throws -> Match {
        let requestDTO = MatchMapper.mapToUpdateRequest(
            status: status,
            startedAt: startedAt,
            finishedAt: finishedAt,
            winnerId: winnerId
        )

        let responseDTO = try await matchDataSource.updateMatch(id: id, request: requestDTO)
        return MatchMapper.map(updateResponseDTO: responseDTO)
    }

    // MARK: - Update Match Scores

    func updateMatchScores(
        id: String,
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> Bool {
        let requestDTO = MatchMapper.mapToUpdateScoresRequest(sets: sets)
        let responseDTO = try await matchDataSource.updateMatchScores(id: id, request: requestDTO)
        return responseDTO.success
    }

    // MARK: - Delete Match

    func deleteMatch(id: String) async throws -> Bool {
        let responseDTO = try await matchDataSource.deleteMatch(id: id)
        return responseDTO.success
    }

    // MARK: - Convenience Methods

    /// Liste les matchs d'un utilisateur spécifique
    func listUserMatches(
        userId: String,
        status: MatchStatus? = nil,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> MatchListResult {
        return try await listMatches(
            status: status,
            userId: userId,
            participantOnly: false,
            page: page,
            limit: limit
        )
    }

    /// Liste uniquement les matchs en cours
    func listOngoingMatches(
        participantOnly: Bool = true,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> MatchListResult {
        return try await listMatches(
            status: .ongoing,
            participantOnly: participantOnly,
            page: page,
            limit: limit
        )
    }

    /// Liste uniquement les matchs terminés
    func listFinishedMatches(
        participantOnly: Bool = true,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> MatchListResult {
        return try await listMatches(
            status: .finished,
            participantOnly: participantOnly,
            page: page,
            limit: limit
        )
    }
}
