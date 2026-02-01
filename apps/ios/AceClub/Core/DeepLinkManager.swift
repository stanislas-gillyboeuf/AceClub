//
//  DeepLinkManager.swift
//  AceClub
//
//  Manages deep link navigation for the app
//

import Foundation
import Observation

@MainActor
@Observable
final class DeepLinkManager {

    // MARK: - Properties

    var pendingMatchId: String?
    var shouldOpenScoreEditor: Bool = false

    // MARK: - Methods

    func handle(url: URL) -> Bool {
        guard url.scheme == "aceclub" else { return false }

        // Parse: aceclub://match/{matchId}/edit-scores
        let pathComponents = url.pathComponents.filter { $0 != "/" }

        if url.host == "match", let matchId = pathComponents.first {
            pendingMatchId = matchId
            shouldOpenScoreEditor = pathComponents.contains("edit-scores")
            print("[DeepLink] Opening match \(matchId), editScores: \(shouldOpenScoreEditor)")
            return true
        }

        return false
    }

    func clearPendingNavigation() {
        pendingMatchId = nil
        shouldOpenScoreEditor = false
    }
}
