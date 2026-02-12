//
//  MatchModel.swift
//  AceClub
//
//  SwiftData model for Match - source of truth for match data
//

import SwiftData
import Foundation

@Model
final class MatchModel {
    @Attribute(.unique) var id: String
    var createdBy: String
    var status: String  // "scheduled", "ongoing", "finished"
    var type: String    // "match", "training"
    var createdAt: Date
    var scheduledAt: Date?
    var startedAt: Date?
    var finishedAt: Date?

    // Venue
    var venueOrganizationId: String?
    var venueOrganizationName: String?
    var venueOrganizationAddress: String?
    var venueOrganizationLatitude: Double?
    var venueOrganizationLongitude: Double?
    var venueOrganizationLogo: String?

    // Participant organizations
    var homeOrganizationId: String?
    var homeOrganizationName: String?
    var homeOrganizationAddress: String?
    var homeOrganizationLatitude: Double?
    var homeOrganizationLongitude: Double?
    var homeOrganizationLogo: String?

    var awayOrganizationId: String?
    var awayOrganizationName: String?
    var awayOrganizationAddress: String?
    var awayOrganizationLatitude: Double?
    var awayOrganizationLongitude: Double?
    var awayOrganizationLogo: String?

    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \MatchParticipantModel.match)
    var participants: [MatchParticipantModel] = []

    @Relationship(deleteRule: .cascade, inverse: \MatchSetModel.match)
    var sets: [MatchSetModel] = []

    @Relationship(deleteRule: .cascade, inverse: \MatchCommentModel.match)
    var comments: [MatchCommentModel] = []

    @Relationship(deleteRule: .cascade, inverse: \MatchFeedbackModel.match)
    var feedbacks: [MatchFeedbackModel] = []

    // Cache metadata
    var lastSyncedAt: Date?

    init(
        id: String,
        createdBy: String,
        status: String,
        type: String = "match",
        createdAt: Date,
        scheduledAt: Date? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil
    ) {
        self.id = id
        self.createdBy = createdBy
        self.status = status
        self.type = type
        self.createdAt = createdAt
        self.scheduledAt = scheduledAt
        self.startedAt = startedAt
        self.finishedAt = finishedAt
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var matchStatus: MatchStatus {
        MatchStatus(rawValue: status) ?? .scheduled
    }

    var matchType: MatchType {
        MatchType(rawValue: type) ?? .match
    }

    var isOngoing: Bool { status == "ongoing" }
    var isFinished: Bool { status == "finished" }
    var isScheduled: Bool { status == "scheduled" }

    var homeParticipant: MatchParticipantModel? {
        participants.first { $0.side == "home" }
    }

    var awayParticipant: MatchParticipantModel? {
        participants.first { $0.side == "away" }
    }

    var winner: MatchParticipantModel? {
        participants.first { $0.isWinner }
    }

    // MARK: - Formatted Dates

    var duration: TimeInterval? {
        guard let startedAt, let finishedAt else { return nil }
        return finishedAt.timeIntervalSince(startedAt)
    }

    var formattedDuration: String? {
        guard let duration else { return nil }
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }

    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    var formattedScheduledAt: String? {
        scheduledAt?.formatted(date: .abbreviated, time: .shortened)
    }

    var formattedStartedAt: String? {
        startedAt?.formatted(date: .abbreviated, time: .shortened)
    }

    var formattedFinishedAt: String? {
        finishedAt?.formatted(date: .abbreviated, time: .shortened)
    }

    // MARK: - Set Scores

    var setScores: (home: Int, away: Int) {
        var homeWins = 0
        var awayWins = 0

        for set in sets {
            if let winnerId = set.winner {
                if homeParticipant?.userId == winnerId {
                    homeWins += 1
                } else if awayParticipant?.userId == winnerId {
                    awayWins += 1
                }
            }
        }

        return (homeWins, awayWins)
    }

    var formattedMatchScore: String {
        let scores = setScores
        // If no sets with scores, show em dash to indicate no score data
        if scores.home == 0 && scores.away == 0 && sets.isEmpty {
            return "—"
        }
        return "\(scores.home)-\(scores.away)"
    }

    var totalSets: Int {
        sets.count
    }

    var hasWinner: Bool {
        winner != nil
    }

    var hasVenue: Bool {
        venueOrganizationId != nil
    }

    var hasBothOrganizations: Bool {
        homeOrganizationId != nil && awayOrganizationId != nil
    }

    var hasDifferentOrganizations: Bool {
        hasBothOrganizations && homeOrganizationId != awayOrganizationId
    }

    /// Unique hash combining match ID and participant images for SwiftUI view refresh
    var participantsImageHash: String {
        let imageHashes = participants
            .sorted { $0.side < $1.side }
            .map { $0.userImage ?? "" }
            .joined(separator: "|")
        return "\(id)_\(imageHashes)"
    }

    func myFeedback(userId: String) -> MatchFeedbackModel? {
        feedbacks.first { $0.userId == userId }
    }
}
