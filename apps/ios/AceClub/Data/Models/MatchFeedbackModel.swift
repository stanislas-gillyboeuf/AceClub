//
//  MatchFeedbackModel.swift
//  AceClub
//
//  SwiftData model for Match Feedback
//

import SwiftData
import Foundation

@Model
final class MatchFeedbackModel {
    @Attribute(.unique) var id: String
    var matchId: String
    var userId: String
    var sensation: String  // "bad", "average", "good", "great"
    var comment: String?
    var visibleToClub: Bool
    var createdAt: Date
    var updatedAt: Date

    // Relationship back to match
    var match: MatchModel?

    init(
        id: String,
        matchId: String,
        userId: String,
        sensation: String,
        comment: String? = nil,
        visibleToClub: Bool = true,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.matchId = matchId
        self.userId = userId
        self.sensation = sensation
        self.comment = comment
        self.visibleToClub = visibleToClub
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    // MARK: - Computed Properties

    var sensationEmoji: String {
        switch sensation {
        case "bad": return "😞"
        case "average": return "😐"
        case "good": return "🙂"
        case "great": return "🔥"
        default: return "❓"
        }
    }

    var sensationLabel: String {
        switch sensation {
        case "bad": return "Mauvaises sensations"
        case "average": return "Moyen"
        case "good": return "Bon"
        case "great": return "Très bon"
        default: return "Inconnu"
        }
    }
}
