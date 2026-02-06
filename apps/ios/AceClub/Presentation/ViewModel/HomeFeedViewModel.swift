import Foundation
import SwiftData
import Observation

@MainActor
@Observable
final class HomeFeedViewModel {
    var stats: UserMatchStats?
    var isLoading = false
    var isLoadingMore = false
    var errorMessage: String?
    var hasMorePages = true
    var currentPage = 1

    private let pageSize = 20
    private var syncService: MatchSyncService?

    func initialize(modelContext: ModelContext) {
        syncService = MatchSyncService(modelContext: modelContext)
    }

    var organizationId: String?

    func syncMatches() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        currentPage = 1
        hasMorePages = true

        do {
            let result = try await syncService?.syncMatchesPage(
                page: 1,
                limit: pageSize,
                purgeOnFirstPage: true,
                participantOnly: organizationId == nil,
                organizationId: organizationId
            )
            hasMorePages = result?.hasMore ?? false
            currentPage = 1
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func loadMoreMatches() async {
        guard !isLoadingMore, !isLoading, hasMorePages else { return }
        isLoadingMore = true

        do {
            let nextPage = currentPage + 1
            let result = try await syncService?.syncMatchesPage(
                page: nextPage,
                limit: pageSize,
                purgeOnFirstPage: false,
                participantOnly: organizationId == nil,
                organizationId: organizationId
            )
            if let result {
                hasMorePages = result.hasMore
                currentPage = result.currentPage
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoadingMore = false
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
