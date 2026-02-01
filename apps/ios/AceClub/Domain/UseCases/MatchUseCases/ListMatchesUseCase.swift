//
//  ListMatchesUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class ListMatchesUseCase {

    private let matchRepository = MatchRepository()

    func execute(
        status: MatchStatus? = nil,
        userId: String? = nil,
        participantOnly: Bool = true,
        page: Int = 1,
        limit: Int = 10
    ) async throws -> MatchListResult {
        return try await matchRepository.listMatches(
            status: status,
            userId: userId,
            participantOnly: participantOnly,
            page: page,
            limit: limit
        )
    }
}
