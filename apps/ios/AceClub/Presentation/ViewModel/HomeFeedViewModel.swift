import Foundation
import SwiftData
import Observation

@MainActor
@Observable
final class HomeFeedViewModel {
    var stats: UserMatchStats?
    var isLoading = false
    var errorMessage: String?

    private var syncService: MatchSyncService?

    func initialize(modelContext: ModelContext) {
        syncService = MatchSyncService(modelContext: modelContext)
    }

    func syncMatches() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        do {
            try await syncService?.syncAllMatchesWithPurge()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func calculateStats(from matches: [MatchModel], userId: String) {
        let finishedMatches = matches.filter { $0.isFinished }

        let userMatches = finishedMatches.filter { match in
            match.participants.contains { $0.userId == userId }
        }

        let wins = userMatches.filter { match in
            match.participants.first { $0.userId == userId }?.isWinner ?? false
        }.count

        let totalPlayTime = userMatches.compactMap { $0.duration }.reduce(0, +)

        let calendar = Calendar.current
        let now = Date()
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) ?? now
        let matchesThisMonth = userMatches.filter { match in
            let matchDate = match.finishedAt ?? match.createdAt
            return matchDate >= startOfMonth
        }.count

        stats = UserMatchStats(
            totalMatches: userMatches.count,
            totalWins: wins,
            totalPlayTime: totalPlayTime,
            matchesThisMonth: matchesThisMonth,
            monthlyGoal: 10
        )
    }
}
