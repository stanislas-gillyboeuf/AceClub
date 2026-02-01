//
//  DeleteMatchUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class DeleteMatchUseCase {

    private let matchRepository = MatchRepository()

    func execute(matchId: String) async throws -> Bool {
        return try await matchRepository.deleteMatch(id: matchId)
    }
}
