//
//  UpdateMatchUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class UpdateMatchUseCase {

    private let matchRepository = MatchRepository()

    func execute(
        matchId: String,
        status: MatchStatus? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil
    ) async throws -> Match {
        return try await matchRepository.updateMatch(
            id: matchId,
            status: status,
            startedAt: startedAt,
            finishedAt: finishedAt
        )
    }
}
