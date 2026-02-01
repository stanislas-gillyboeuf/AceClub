//
//  SetScoreModel.swift
//  AceClub
//
//  SwiftData model for Set Score
//

import SwiftData
import Foundation

@Model
final class SetScoreModel {
    @Attribute(.unique) var id: String
    var participantId: String
    var userId: String
    var side: String  // "home", "away"
    var games: Int

    // Relationship back to set
    var matchSet: MatchSetModel?

    init(
        id: String,
        participantId: String,
        userId: String,
        side: String,
        games: Int
    ) {
        self.id = id
        self.participantId = participantId
        self.userId = userId
        self.side = side
        self.games = games
    }

    // MARK: - Computed Properties

    var matchSide: MatchSide {
        MatchSide(rawValue: side) ?? .home
    }

    var isWinningScore: Bool {
        games >= 11
    }
}
