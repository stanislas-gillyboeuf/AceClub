//
//  MatchSetModel.swift
//  AceClub
//
//  SwiftData model for Match Set
//

import SwiftData
import Foundation

@Model
final class MatchSetModel {
    @Attribute(.unique) var id: String
    var matchId: String
    var setNumber: Int
    var createdAt: Date

    // Relationship to scores
    @Relationship(deleteRule: .cascade, inverse: \SetScoreModel.matchSet)
    var scores: [SetScoreModel] = []

    // Relationship back to match
    var match: MatchModel?

    init(
        id: String,
        matchId: String,
        setNumber: Int,
        createdAt: Date
    ) {
        self.id = id
        self.matchId = matchId
        self.setNumber = setNumber
        self.createdAt = createdAt
    }

    // MARK: - Computed Properties

    var winner: String? {
        guard scores.count == 2 else { return nil }
        let sortedScores = scores.sorted { $0.games > $1.games }
        guard sortedScores[0].games > sortedScores[1].games else { return nil }
        return sortedScores[0].userId
    }

    var formattedScore: String {
        guard scores.count == 2 else { return "N/A" }
        let sortedScores = scores.sorted { $0.side < $1.side }
        return "\(sortedScores[0].games)-\(sortedScores[1].games)"
    }

    var displayName: String {
        "Set \(setNumber)"
    }
}
