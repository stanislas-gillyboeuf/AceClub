//
//  MatchLiveActivityManager.swift
//  AceClub
//
//  Manages Live Activity lifecycle for ongoing matches
//

import Foundation
import ActivityKit

@MainActor
@Observable
final class MatchLiveActivityManager {

    static let shared = MatchLiveActivityManager()

    // MARK: - Properties

    private var currentActivity: Activity<MatchLiveActivityAttributes>?
    private(set) var activeMatchId: String?
    private init() {}

    // MARK: - Public API

    var areActivitiesSupported: Bool {
        ActivityAuthorizationInfo().areActivitiesEnabled
    }

    func startActivity(for match: MatchModel) async throws {
        guard areActivitiesSupported else {
            throw LiveActivityError.notSupported
        }

        guard match.isOngoing, let startedAt = match.startedAt else {
            throw LiveActivityError.matchNotOngoing
        }

        if currentActivity != nil {
            await endActivity()
        }

        let attributes = MatchLiveActivityAttributes(
            matchId: match.id,
            startedAt: startedAt,
            homePlayerName: match.homeParticipant?.userName ?? "Joueur 1",
            homePlayerAvatarURL: match.homeParticipant?.userImage,
            awayPlayerName: match.awayParticipant?.userName ?? "Joueur 2",
            awayPlayerAvatarURL: match.awayParticipant?.userImage
        )

        let initialState = contentState(from: match)

        let content = ActivityContent(
            state: initialState,
            staleDate: nil
        )

        do {
            currentActivity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )
            activeMatchId = match.id
            print("[LiveActivity] Started for match \(match.id)")
            Task {
                await observeActivityState()
            }
        } catch {
            print("[LiveActivity] Failed to start: \(error)")
            throw error
        }
    }

    func updateActivity(with match: MatchModel) async {
        guard let activity = currentActivity,
              activeMatchId == match.id else {
            return
        }

        let newState = contentState(from: match)
        let content = ActivityContent(state: newState, staleDate: nil)

        await activity.update(content)
        print("[LiveActivity] Updated for match \(match.id)")
    }

    func endActivity(withFinalState match: MatchModel? = nil) async {
        guard let activity = currentActivity else { return }

        let finalState: MatchLiveActivityAttributes.ContentState
        if let match = match {
            finalState = contentState(from: match)
        } else {
            finalState = activity.content.state
        }

        let finalContent = ActivityContent(
            state: finalState,
            staleDate: nil
        )

        await activity.end(finalContent, dismissalPolicy: .default)
        currentActivity = nil
        activeMatchId = nil
        print("[LiveActivity] Ended")
    }
    func isActivityActive(for matchId: String) -> Bool {
        activeMatchId == matchId && currentActivity != nil
    }

    // MARK: - MatchDetail API (for ViewModel usage)

    /// Start a Live Activity for a match (using Domain entity)
    func startActivity(for matchDetail: MatchDetail) async throws {
        let authInfo = ActivityAuthorizationInfo()
        print("[LiveActivity] === DEBUG INFO ===")
        print("[LiveActivity] areActivitiesEnabled: \(authInfo.areActivitiesEnabled)")
        print("[LiveActivity] frequentPushesEnabled: \(authInfo.frequentPushesEnabled)")
        print("[LiveActivity] Match ID: \(matchDetail.id)")
        print("[LiveActivity] Match isOngoing: \(matchDetail.match.isOngoing)")
        print("[LiveActivity] Match startedAt: \(String(describing: matchDetail.match.startedAt))")

        guard areActivitiesSupported else {
            print("[LiveActivity] ERROR: Activities not supported on this device")
            throw LiveActivityError.notSupported
        }

        guard matchDetail.match.isOngoing, let startedAt = matchDetail.match.startedAt else {
            print("[LiveActivity] ERROR: Match not ongoing or no startedAt date")
            throw LiveActivityError.matchNotOngoing
        }

        if currentActivity != nil {
            await endActivity()
        }

        let attributes = MatchLiveActivityAttributes(
            matchId: matchDetail.id,
            startedAt: startedAt,
            homePlayerName: matchDetail.homeParticipant?.userName ?? "Joueur 1",
            homePlayerAvatarURL: matchDetail.homeParticipant?.userImage,
            awayPlayerName: matchDetail.awayParticipant?.userName ?? "Joueur 2",
            awayPlayerAvatarURL: matchDetail.awayParticipant?.userImage
        )

        let initialState = contentState(from: matchDetail)

        let content = ActivityContent(
            state: initialState,
            staleDate: nil
        )

        print("[LiveActivity] Attempting to create activity...")
        print("[LiveActivity] Attributes: matchId=\(attributes.matchId), home=\(attributes.homePlayerName), away=\(attributes.awayPlayerName)")
        print("[LiveActivity] Initial state: sets=\(initialState.formattedSetScore), currentSet=\(initialState.currentSetNumber)")

        do {
            currentActivity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )
            activeMatchId = matchDetail.id
            print("[LiveActivity] ✅ SUCCESS - Started for match \(matchDetail.id)")
            print("[LiveActivity] Activity ID: \(currentActivity?.id ?? "nil")")

            Task {
                await observeActivityState()
            }
        } catch {
            print("[LiveActivity] ❌ FAILED to start: \(error)")
            print("[LiveActivity] Error type: \(type(of: error))")
            if let activityError = error as? ActivityAuthorizationError {
                print("[LiveActivity] ActivityAuthorizationError: \(activityError)")
            }
            throw error
        }
    }

    /// Update the Live Activity with new scores (using Domain entity)
    func updateActivity(with matchDetail: MatchDetail) async {
        guard let activity = currentActivity,
              activeMatchId == matchDetail.id else {
            return
        }

        let newState = contentState(from: matchDetail)
        let content = ActivityContent(state: newState, staleDate: nil)

        await activity.update(content)
        print("[LiveActivity] Updated for match \(matchDetail.id)")
    }

    /// End the Live Activity (using Domain entity)
    func endActivity(withFinalState matchDetail: MatchDetail) async {
        guard let activity = currentActivity else { return }

        let finalState = contentState(from: matchDetail)

        let finalContent = ActivityContent(
            state: finalState,
            staleDate: nil
        )

        await activity.end(finalContent, dismissalPolicy: .default)
        currentActivity = nil
        activeMatchId = nil
        print("[LiveActivity] Ended")
    }

    // MARK: - Private Helpers (MatchModel)

    private func contentState(from match: MatchModel) -> MatchLiveActivityAttributes.ContentState {
        let setScores = match.setScores
        let currentSetNumber = max(match.sets.count, 1)

        let currentSet = match.sets.first { $0.setNumber == currentSetNumber }
        let homeGames = currentSet?.scores.first {
            $0.userId == match.homeParticipant?.userId
        }?.games ?? 0
        let awayGames = currentSet?.scores.first {
            $0.userId == match.awayParticipant?.userId
        }?.games ?? 0

        // Build completed sets array (all sets except the current one)
        let completedSets: [MatchLiveActivityAttributes.CompletedSetScore] = match.sets
            .filter { $0.setNumber < currentSetNumber }
            .sorted { $0.setNumber < $1.setNumber }
            .compactMap { set in
                let homeScore = set.scores.first { $0.userId == match.homeParticipant?.userId }?.games ?? 0
                let awayScore = set.scores.first { $0.userId == match.awayParticipant?.userId }?.games ?? 0
                return MatchLiveActivityAttributes.CompletedSetScore(
                    setNumber: set.setNumber,
                    homeGames: homeScore,
                    awayGames: awayScore
                )
            }

        return MatchLiveActivityAttributes.ContentState(
            homeSetScore: setScores.home,
            awaySetScore: setScores.away,
            currentSetNumber: currentSetNumber,
            currentSetHomeGames: homeGames,
            currentSetAwayGames: awayGames,
            completedSets: completedSets
        )
    }

    // MARK: - Private Helpers (MatchDetail)

    private func contentState(from matchDetail: MatchDetail) -> MatchLiveActivityAttributes.ContentState {
        let setScores = matchDetail.setScores
        let currentSetNumber = max(matchDetail.sets.count, 1)

        let currentSet = matchDetail.sets.first { $0.setNumber == currentSetNumber }
        let homeGames = currentSet?.scores.first {
            $0.userId == matchDetail.homeParticipant?.userId
        }?.games ?? 0
        let awayGames = currentSet?.scores.first {
            $0.userId == matchDetail.awayParticipant?.userId
        }?.games ?? 0

        // Build completed sets array (all sets except the current one)
        let completedSets: [MatchLiveActivityAttributes.CompletedSetScore] = matchDetail.sets
            .filter { $0.setNumber < currentSetNumber }
            .sorted { $0.setNumber < $1.setNumber }
            .compactMap { set in
                let homeScore = set.scores.first { $0.userId == matchDetail.homeParticipant?.userId }?.games ?? 0
                let awayScore = set.scores.first { $0.userId == matchDetail.awayParticipant?.userId }?.games ?? 0
                return MatchLiveActivityAttributes.CompletedSetScore(
                    setNumber: set.setNumber,
                    homeGames: homeScore,
                    awayGames: awayScore
                )
            }

        return MatchLiveActivityAttributes.ContentState(
            homeSetScore: setScores.home,
            awaySetScore: setScores.away,
            currentSetNumber: currentSetNumber,
            currentSetHomeGames: homeGames,
            currentSetAwayGames: awayGames,
            completedSets: completedSets
        )
    }

    private func observeActivityState() async {
        guard let activity = currentActivity else { return }

        for await state in activity.activityStateUpdates {
            switch state {
            case .dismissed:
                print("[LiveActivity] User dismissed")
                currentActivity = nil
                activeMatchId = nil
            case .ended:
                print("[LiveActivity] System ended")
                currentActivity = nil
                activeMatchId = nil
            case .active:
                break
            case .stale:
                print("[LiveActivity] Became stale")
            @unknown default:
                break
            }
        }
    }
}

// MARK: - Errors

enum LiveActivityError: LocalizedError {
    case notSupported
    case matchNotOngoing

    var errorDescription: String? {
        switch self {
        case .notSupported:
            return "Les Live Activities ne sont pas supportees sur cet appareil"
        case .matchNotOngoing:
            return "Le match doit etre en cours pour demarrer une Live Activity"
        }
    }
}
