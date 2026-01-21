//
//  UpdateMatchScoresUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class UpdateMatchScoresUseCase {

    private let matchRepository = MatchRepository()

    func execute(
        matchId: String,
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> Bool {
        return try await matchRepository.updateMatchScores(
            id: matchId,
            sets: sets
        )
    }
}
