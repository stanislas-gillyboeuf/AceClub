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
    var pendingConversationId: String?
    var shouldOpenMatchRequests: Bool = false

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

        // Parse: aceclub://conversation/{conversationId}
        if url.host == "conversation", let conversationId = pathComponents.first {
            pendingConversationId = conversationId
            print("[DeepLink] Opening conversation \(conversationId)")
            return true
        }

        return false
    }

    func clearPendingNavigation() {
        pendingMatchId = nil
        shouldOpenScoreEditor = false
        pendingConversationId = nil
        shouldOpenMatchRequests = false
    }
}
