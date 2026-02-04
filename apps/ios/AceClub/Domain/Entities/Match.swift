//
//  Match.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

// MARK: - Match Status
enum MatchStatus: String, CaseIterable {
    case scheduled
    case ongoing
    case finished

    var displayName: String {
        switch self {
        case .scheduled: return "Planifié"
        case .ongoing: return "En cours"
        case .finished: return "Terminé"
        }
    }

    var color: String {
        switch self {
        case .scheduled: return "blue"
        case .ongoing: return "orange"
        case .finished: return "green"
        }
    }
}

// MARK: - Match Side
enum MatchSide: String, CaseIterable {
    case home
    case away

    var displayName: String {
        switch self {
        case .home: return "Domicile"
        case .away: return "Extérieur"
        }
    }
}

// MARK: - Match Type
enum MatchType: String, CaseIterable {
    case match
    case training

    var displayName: String {
        switch self {
        case .match: return "Match"
        case .training: return "Entraînement"
        }
    }

    var icon: String {
        switch self {
        case .match: return "sportscourt"
        case .training: return "figure.run"
        }
    }
}

// MARK: - Match Entity
struct Match: Identifiable {
    let id: String
    let createdBy: String
    let status: MatchStatus
    let type: MatchType
    let createdAt: Date
    let scheduledAt: Date?
    let startedAt: Date?
    let finishedAt: Date?

    // MARK: - Computed Properties

    /// Durée du match en secondes
    var duration: TimeInterval? {
        guard let startedAt, let finishedAt else { return nil }
        return finishedAt.timeIntervalSince(startedAt)
    }

    /// Durée formatée du match
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

    /// Date de création formatée
    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    /// Date prévue formatée
    var formattedScheduledAt: String? {
        scheduledAt?.formatted(date: .abbreviated, time: .shortened)
    }

    /// Date de début formatée
    var formattedStartedAt: String? {
        startedAt?.formatted(date: .abbreviated, time: .shortened)
    }

    /// Date de fin formatée
    var formattedFinishedAt: String? {
        finishedAt?.formatted(date: .abbreviated, time: .shortened)
    }

    /// Indique si le match est en cours
    var isOngoing: Bool {
        status == .ongoing
    }

    /// Indique si le match est terminé
    var isFinished: Bool {
        status == .finished
    }

    /// Indique si le match est planifié
    var isScheduled: Bool {
        status == .scheduled
    }
}

// MARK: - Match Participant Entity
struct MatchParticipant: Identifiable {
    let id: String
    let matchId: String
    let user: UserSummary
    let side: MatchSide
    let isWinner: Bool
    let createdAt: Date

    // MARK: - Convenience accessors (for backwards compatibility)

    var userId: String { user.id }
    var userName: String? { user.name }
    var userEmail: String? { nil }  // No longer available
    var userImage: String? { user.image }

    // MARK: - Computed Properties

    /// Badge de victoire
    var winnerBadge: String {
        isWinner ? "🏆" : ""
    }

    var userImageURL: URL? { user.imageURL }
    var userInitials: String { user.initials }
}

// MARK: - Set Entity
struct MatchSet: Identifiable {
    let id: String
    let matchId: String
    let setNumber: Int
    let createdAt: Date
    let scores: [SetScore]

    // MARK: - Computed Properties

    /// Gagnant du set
    var winner: String? {
        guard scores.count == 2 else { return nil }
        let sortedScores = scores.sorted { $0.games > $1.games }
        guard sortedScores[0].games > sortedScores[1].games else { return nil }
        return sortedScores[0].userId
    }

    /// Score formaté (ex: "11-9")
    var formattedScore: String {
        guard scores.count == 2 else { return "N/A" }
        let sortedScores = scores.sorted { $0.side.rawValue < $1.side.rawValue }
        return "\(sortedScores[0].games)-\(sortedScores[1].games)"
    }

/*     /// Indique si le set est terminé
    var isCompleted: Bool {
        guard scores.count == 2 else { return false }
        let sortedScores = scores.sorted { $0.games > $1.games }
        let higher = sortedScores[0].games
        let lower = sortedScores[1].games

        // Un set est terminé si le score le plus élevé est >= 11
        // et qu'il y a au moins 2 points d'écart
        return higher >= 11 && (higher - lower) >= 2
    } */

    /// Nom du set (ex: "Set 1")
    var displayName: String {
        "Set \(setNumber)"
    }
}

// MARK: - Set Score Entity
struct SetScore: Identifiable {
    let id: String
    let participantId: String
    let userId: String
    let side: MatchSide
    let games: Int

    // MARK: - Computed Properties

    /// Indique si c'est un score gagnant (>= 11)
    var isWinningScore: Bool {
        games >= 11
    }
}

// MARK: - Match Comment Entity
struct MatchComment: Identifiable {
    let id: String
    let matchId: String
    let user: UserSummary
    let content: String
    let createdAt: Date
    let updatedAt: Date

    // MARK: - Convenience accessors (for backwards compatibility)

    var userId: String { user.id }
    var userName: String { user.name }
    var userImage: String? { user.image }

    // MARK: - Computed Properties

    var userImageURL: URL? { user.imageURL }
    var userInitials: String { user.initials }

    var formattedDate: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    var wasEdited: Bool {
        updatedAt > createdAt
    }
}

// MARK: - Complete Match Entity
struct MatchDetail: Identifiable {
    let match: Match
    let participants: [MatchParticipant]
    let sets: [MatchSet]

    var id: String { match.id }

    // MARK: - Computed Properties

    /// Participant domicile
    var homeParticipant: MatchParticipant? {
        participants.first { $0.side == .home }
    }

    /// Participant extérieur
    var awayParticipant: MatchParticipant? {
        participants.first { $0.side == .away }
    }

    /// Gagnant du match
    var winner: MatchParticipant? {
        participants.first { $0.isWinner }
    }

    /// Score total (nombre de sets gagnés par chaque joueur)
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

    /// Score formaté du match (ex: "3-1")
    var formattedMatchScore: String {
        let scores = setScores
        return "\(scores.home)-\(scores.away)"
    }

    /// Nombre total de sets joués
    var totalSets: Int {
        sets.count
    }

    /// Indique si le match a un gagnant déterminé
    var hasWinner: Bool {
        winner != nil
    }
}

// MARK: - Match List Item Entity
struct MatchListItem: Identifiable {
    let id: String
    let createdBy: String
    let status: MatchStatus
    let type: MatchType
    let createdAt: Date
    let scheduledAt: Date?
    let startedAt: Date?
    let finishedAt: Date?
    let participants: [MatchParticipant]
    let sets: [MatchSet]

    // MARK: - Computed Properties

    /// Participant domicile
    var homeParticipant: MatchParticipant? {
        participants.first { $0.side == .home }
    }

    /// Participant extérieur
    var awayParticipant: MatchParticipant? {
        participants.first { $0.side == .away }
    }

    /// Gagnant du match
    var winner: MatchParticipant? {
        participants.first { $0.isWinner }
    }

    /// Date de création formatée
    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    /// Score total (nombre de sets gagnés par chaque joueur)
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

    /// Score formaté du match (ex: "3-1")
    var formattedMatchScore: String {
        let scores = setScores
        return "\(scores.home)-\(scores.away)"
    }
}

// MARK: - Pagination Result
struct MatchListResult {
    let matches: [MatchListItem]
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int

    // MARK: - Computed Properties

    /// Indique s'il y a une page suivante
    var hasNextPage: Bool {
        page < totalPages
    }

    /// Indique s'il y a une page précédente
    var hasPreviousPage: Bool {
        page > 1
    }

    /// Numéro de la page suivante
    var nextPage: Int? {
        hasNextPage ? page + 1 : nil
    }

    /// Numéro de la page précédente
    var previousPage: Int? {
        hasPreviousPage ? page - 1 : nil
    }
}
