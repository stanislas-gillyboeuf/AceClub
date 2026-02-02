//
//  MatchLiveActivityAttributes.swift
//  AceClub
//
//  Live Activity attributes for ongoing matches
//

import Foundation
import ActivityKit

struct MatchLiveActivityAttributes: ActivityAttributes {

    // MARK: - Static Data
    let matchId: String
    let startedAt: Date
    let homePlayerName: String
    let homePlayerAvatarURL: String?

    /// Away player info
    let awayPlayerName: String
    let awayPlayerAvatarURL: String?

    // MARK: - Dynamic State

    /// Score d'un set terminé
    struct CompletedSetScore: Codable, Hashable {
        let setNumber: Int
        let homeGames: Int
        let awayGames: Int

        /// Indique si le joueur home a gagné ce set
        var homeWon: Bool {
            homeGames > awayGames
        }

        /// Score formaté (ex: "6-4")
        var formattedScore: String {
            "\(homeGames)-\(awayGames)"
        }
    }

    struct ContentState: Codable, Hashable {
        let homeSetScore: Int
        let awaySetScore: Int

        let currentSetNumber: Int
        let currentSetHomeGames: Int
        let currentSetAwayGames: Int

        /// Scores des sets terminés
        let completedSets: [CompletedSetScore]

        // MARK: - Computed Properties

        var formattedSetScore: String {
            "\(homeSetScore)-\(awaySetScore)"
        }

        var formattedCurrentSetScore: String {
            "\(currentSetHomeGames)-\(currentSetAwayGames)"
        }

        /// Le joueur home mène au score des sets
        var isHomeLeading: Bool {
            homeSetScore > awaySetScore
        }

        /// Le joueur away mène au score des sets
        var isAwayLeading: Bool {
            awaySetScore > homeSetScore
        }

        /// Le score est à égalité
        var isTied: Bool {
            homeSetScore == awaySetScore
        }

        /// Le joueur home mène dans le set en cours
        var isHomeLeadingCurrentSet: Bool {
            currentSetHomeGames > currentSetAwayGames
        }

        /// Le joueur away mène dans le set en cours
        var isAwayLeadingCurrentSet: Bool {
            currentSetAwayGames > currentSetHomeGames
        }
    }
}
