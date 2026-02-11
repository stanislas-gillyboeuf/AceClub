//
//  MatchListContent.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI
import SwiftData

// MARK: - MatchListContent using SwiftData @Query

struct MatchListContent: View {
    @Environment(\.modelContext) private var modelContext

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    @Binding var selectedStatus: MatchStatus?
    @State private var syncService: MatchSyncService?
    @State private var isLoading = false
    @State private var isLoadingMore = false
    @State private var hasMorePages = true
    @State private var currentPage = 1
    private let pageSize = 20

    private var matches: [MatchModel] {
        guard let status = selectedStatus else {
            return allMatches
        }
        return allMatches.filter { $0.status == status.rawValue }
    }

    var body: some View {
        VStack(spacing: 0) {
            MatchFilterChips(
                selectedStatus: $selectedStatus,
                onFilterChange: { _ in
                }
            )

            if !isLoading && matches.isEmpty {
                ContentUnavailableView(
                    "Aucun match",
                    systemImage: "tennis.racket",
                    description: Text("Tes matchs apparaîtront ici une fois planifiés ou joués.")
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(matches) { match in
                        MatchRowView(match: match)
                            .background(
                                NavigationLink("", destination: MatchDetailView(matchId: match.id))
                                    .opacity(0)
                            )
                        .onAppear {
                            if shouldLoadMore(for: match) {
                                Task { await loadMoreMatches() }
                            }
                        }
                    }

                    if isLoadingMore {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                        .listRowSeparator(.hidden)
                    }
                }
                .listStyle(.insetGrouped)
                .refreshable {
                    await refresh()
                }
            }
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            await initialSync()
        }
    }

    private func shouldLoadMore(for match: MatchModel) -> Bool {
        guard matches.count >= 3 else { return false }
        let lastThree = matches.suffix(3)
        return lastThree.contains { $0.id == match.id }
    }

    private func initialSync() async {
        guard !isLoading else { return }
        isLoading = true
        currentPage = 1
        hasMorePages = true
        do {
            let result = try await syncService?.syncMatchesPage(page: 1, limit: pageSize, purgeOnFirstPage: true)
            hasMorePages = result?.hasMore ?? false
            currentPage = 1
        } catch {
            print("Initial sync error: \(error)")
        }
        isLoading = false
    }

    private func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        currentPage = 1
        hasMorePages = true
        do {
            let result = try await syncService?.syncMatchesPage(page: 1, limit: pageSize, purgeOnFirstPage: true)
            hasMorePages = result?.hasMore ?? false
            currentPage = 1
        } catch {
            print("Refresh error: \(error)")
        }
        isLoading = false
    }

    private func loadMoreMatches() async {
        guard !isLoadingMore, !isLoading, hasMorePages else { return }
        isLoadingMore = true
        do {
            let nextPage = currentPage + 1
            let result = try await syncService?.syncMatchesPage(page: nextPage, limit: pageSize, purgeOnFirstPage: false)
            if let result {
                hasMorePages = result.hasMore
                currentPage = result.currentPage
            }
        } catch {
            print("Load more error: \(error)")
        }
        isLoadingMore = false
    }
}
