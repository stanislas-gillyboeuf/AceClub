//
//  CreateMatchUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class CreateMatchUseCase {

    private let matchRepository = MatchRepository()

    func execute(
        createdBy: String,
        status: MatchStatus,
        type: MatchType = .match,
        createdAt: Date = Date(),
        scheduledAt: Date? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil,
        participants: [(userId: String, side: MatchSide, isWinner: Bool)],
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> MatchDetail {
        return try await matchRepository.createMatch(
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
    }
}
