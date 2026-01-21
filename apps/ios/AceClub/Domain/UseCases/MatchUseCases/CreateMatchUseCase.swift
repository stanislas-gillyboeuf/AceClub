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
        createdAt: Date = Date(),
        startedAt: Date? = nil,
        finishedAt: Date? = nil,
        participants: [(userId: String, side: MatchSide, isWinner: Bool)],
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> MatchDetail {
        return try await matchRepository.createMatch(
            createdBy: createdBy,
            status: status,
            createdAt: createdAt,
            startedAt: startedAt,
            finishedAt: finishedAt,
            participants: participants,
            sets: sets
        )
    }
}
