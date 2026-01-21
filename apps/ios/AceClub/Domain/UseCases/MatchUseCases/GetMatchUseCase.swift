//
//  GetMatchUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class GetMatchUseCase {

    private let matchRepository = MatchRepository()

    func execute(matchId: String) async throws -> MatchDetail {
        return try await matchRepository.getMatch(id: matchId)
    }
}
