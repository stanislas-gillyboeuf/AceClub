//
//  MatchViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import Combine

@MainActor
class MatchViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var matchDetail: MatchDetail? = nil
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var successMessage: String? = nil

    // Editing states
    @Published var isEditing: Bool = false
    @Published var isDeletingMatch: Bool = false
    @Published var isUpdatingScores: Bool = false

    // MARK: - Use Cases

    private let getMatchUseCase = GetMatchUseCase()
    private let updateMatchUseCase = UpdateMatchUseCase()
    private let updateMatchScoresUseCase = UpdateMatchScoresUseCase()
    private let deleteMatchUseCase = DeleteMatchUseCase()

    // MARK: - Public Methods

    /// Charge les détails d'un match
    func loadMatch(matchId: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let detail = try await getMatchUseCase.execute(matchId: matchId)
            matchDetail = detail
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    /// Rafraîchit les détails du match
    func refreshMatch() async {
        guard let matchId = matchDetail?.match.id else { return }
        await loadMatch(matchId: matchId)
    }

    // MARK: - Update Match Status

    /// Démarre un match
    func startMatch() async -> Bool {
        guard let matchId = matchDetail?.match.id else { return false }

        isLoading = true
        errorMessage = nil

        do {
            let updatedMatch = try await updateMatchUseCase.execute(
                matchId: matchId,
                status: .ongoing,
                startedAt: Date()
            )

            // Update the match in detail
            if let currentDetail = matchDetail {
                matchDetail = MatchDetail(
                    match: updatedMatch,
                    participants: currentDetail.participants,
                    sets: currentDetail.sets
                )
            }

            successMessage = "Match démarré avec succès"
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }

    /// Termine un match
    func finishMatch() async -> Bool {
        guard let matchId = matchDetail?.match.id else { return false }

        isLoading = true
        errorMessage = nil

        do {
            let updatedMatch = try await updateMatchUseCase.execute(
                matchId: matchId,
                status: .finished,
                finishedAt: Date()
            )

            // Update the match in detail
            if let currentDetail = matchDetail {
                matchDetail = MatchDetail(
                    match: updatedMatch,
                    participants: currentDetail.participants,
                    sets: currentDetail.sets
                )
            }

            successMessage = "Match terminé avec succès"
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }

    // MARK: - Update Scores

    /// Met à jour les scores d'un ou plusieurs sets
    func updateScores(
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async -> Bool {
        guard let matchId = matchDetail?.match.id else { return false }

        isUpdatingScores = true
        errorMessage = nil

        do {
            let success = try await updateMatchScoresUseCase.execute(
                matchId: matchId,
                sets: sets
            )

            if success {
                // Reload match to get updated scores
                await refreshMatch()
                successMessage = "Scores mis à jour avec succès"
            }

            isUpdatingScores = false
            return success
        } catch {
            errorMessage = error.localizedDescription
            isUpdatingScores = false
            return false
        }
    }

    // MARK: - Delete Match

    /// Supprime le match
    func deleteMatch() async -> Bool {
        guard let matchId = matchDetail?.match.id else { return false }

        isDeletingMatch = true
        errorMessage = nil

        do {
            let success = try await deleteMatchUseCase.execute(matchId: matchId)

            if success {
                matchDetail = nil
                successMessage = "Match supprimé avec succès"
            }

            isDeletingMatch = false
            return success
        } catch {
            errorMessage = error.localizedDescription
            isDeletingMatch = false
            return false
        }
    }

    // MARK: - Computed Properties

    /// Indique si le match est en cours
    var isMatchOngoing: Bool {
        matchDetail?.match.isOngoing ?? false
    }

    /// Indique si le match est terminé
    var isMatchFinished: Bool {
        matchDetail?.match.isFinished ?? false
    }

    /// Indique si le match peut être démarré
    var canStartMatch: Bool {
        matchDetail?.match.isScheduled ?? false
    }

    /// Indique si le match peut être terminé
    var canFinishMatch: Bool {
        matchDetail?.match.isOngoing ?? false
    }

    /// Indique si les scores peuvent être modifiés
    var canEditScores: Bool {
        guard let match = matchDetail?.match else { return false }
        return match.isOngoing || match.isScheduled
    }

    // MARK: - Helper Methods

    /// Récupère un participant par userId
    func participant(withUserId userId: String) -> MatchParticipant? {
        matchDetail?.participants.first { $0.userId == userId }
    }

    /// Récupère un set par numéro
    func set(withNumber number: Int) -> MatchSet? {
        matchDetail?.sets.first { $0.setNumber == number }
    }

    /// Score actuel d'un participant pour un set
    func score(forUserId userId: String, inSet setNumber: Int) -> Int? {
        guard let matchSet = set(withNumber: setNumber) else { return nil }
        return matchSet.scores.first { $0.userId == userId }?.games
    }

    /// Clear messages
    func clearMessages() {
        errorMessage = nil
        successMessage = nil
    }
}
