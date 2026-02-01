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
            print("[MatchViewModel] Starting match \(matchId)...")
            let updatedMatch = try await updateMatchUseCase.execute(
                matchId: matchId,
                status: .ongoing,
                startedAt: Date()
            )
            print("[MatchViewModel] Match updated: status=\(updatedMatch.status), startedAt=\(String(describing: updatedMatch.startedAt))")

            // Update the match in detail
            if let currentDetail = matchDetail {
                let newDetail = MatchDetail(
                    match: updatedMatch,
                    participants: currentDetail.participants,
                    sets: currentDetail.sets
                )
                matchDetail = newDetail
                print("[MatchViewModel] MatchDetail created, isOngoing=\(newDetail.match.isOngoing)")

                // Start Live Activity
                print("[MatchViewModel] About to start Live Activity...")
                do {
                    try await MatchLiveActivityManager.shared.startActivity(for: newDetail)
                    print("[MatchViewModel] Live Activity started successfully")
                } catch {
                    print("[MatchViewModel] Live Activity failed to start: \(error)")
                }
            } else {
                print("[MatchViewModel] ERROR: currentDetail is nil!")
            }

            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }

    func finishMatch() async -> Bool {
        guard let matchId = matchDetail?.match.id else { return false }

        isLoading = true
        errorMessage = nil

        do {
            // Calculer le vainqueur automatiquement basé sur les sets
            let winnerId = calculateWinner()

            let updatedMatch = try await updateMatchUseCase.execute(
                matchId: matchId,
                status: .finished,
                finishedAt: Date(),
                winnerId: winnerId
            )

            // Update the match in detail and refresh to get updated participants
            if let currentDetail = matchDetail {
                let newDetail = MatchDetail(
                    match: updatedMatch,
                    participants: currentDetail.participants,
                    sets: currentDetail.sets
                )
                matchDetail = newDetail

                // End Live Activity with final state
                await MatchLiveActivityManager.shared.endActivity(withFinalState: newDetail)
            }

            // Refresh pour récupérer les participants mis à jour avec isWinner
            await refreshMatch()

            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }

    /// Calcule le vainqueur en comptant les sets gagnés par chaque joueur
    private func calculateWinner() -> String? {
        guard let detail = matchDetail, !detail.sets.isEmpty else { return nil }

        var setsWonByUser: [String: Int] = [:]

        for set in detail.sets {
            guard set.scores.count == 2 else { continue }

            let sortedScores = set.scores.sorted { $0.games > $1.games }
            guard let winner = sortedScores.first, winner.games > sortedScores.last!.games else {
                continue // Set nul ou scores égaux
            }

            setsWonByUser[winner.userId, default: 0] += 1
        }

        // Le vainqueur est celui qui a gagné le plus de sets
        guard let (winnerId, _) = setsWonByUser.max(by: { $0.value < $1.value }) else {
            return nil
        }

        return winnerId
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
                await refreshMatch()

                // Update Live Activity with new scores
                if let detail = matchDetail {
                    await MatchLiveActivityManager.shared.updateActivity(with: detail)
                }
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

    var canStartMatch: Bool {
        matchDetail?.match.isScheduled ?? false
    }

    var canFinishMatch: Bool {
        matchDetail?.match.isOngoing ?? false
    }

    var canEditScores: Bool {
        matchDetail?.match.isOngoing ?? false
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
