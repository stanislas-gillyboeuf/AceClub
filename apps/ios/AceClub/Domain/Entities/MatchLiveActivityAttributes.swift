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

    struct ContentState: Codable, Hashable {
        let homeSetScore: Int
        let awaySetScore: Int

        let currentSetNumber: Int
        let currentSetHomeGames: Int
        let currentSetAwayGames: Int

        // MARK: - Computed Properties

        var formattedSetScore: String {
            "\(homeSetScore)-\(awaySetScore)"
        }

        var formattedCurrentSetScore: String {
            "\(currentSetHomeGames)-\(currentSetAwayGames)"
        }
    }
}
