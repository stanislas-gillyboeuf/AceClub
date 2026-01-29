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

    // SwiftData query - auto-updates when data changes
    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    @Binding var selectedStatus: MatchStatus?
    @State private var syncService: MatchSyncService?
    @State private var isLoading = false

    // Filtered matches based on status
    private var matches: [MatchModel] {
        guard let status = selectedStatus else {
            return allMatches
        }
        return allMatches.filter { $0.status == status.rawValue }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Chips de filtre scrollables
            MatchFilterChips(
                selectedStatus: $selectedStatus,
                onFilterChange: { _ in
                    // No API call needed - filtering is local
                }
            )

            // Match list
            List {
                ForEach(matches) { match in
                    NavigationLink {
                        MatchDetailView(matchId: match.id)
                    } label: {
                        MatchRowView(match: match)
                    }
                }

                if isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .refreshable {
                await refresh()
            }
        }
        .background(Theme.primaryBackground)
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            await initialSync()
        }
    }

    private func initialSync() async {
        guard !isLoading else { return }
        isLoading = true
        do {
            try await syncService?.syncMatches()
        } catch {
            print("Initial sync error: \(error)")
        }
        isLoading = false
    }

    private func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        do {
            try await syncService?.syncMatches()
        } catch {
            print("Refresh error: \(error)")
        }
        isLoading = false
    }
}

// MARK: - Legacy MatchListContent using ViewModel

struct MatchListContentLegacy: View {
    @ObservedObject var viewModel: MatchListViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Chips de filtre scrollables
            MatchFilterChips(
                selectedStatus: $viewModel.selectedStatus,
                onFilterChange: { status in
                    await viewModel.filterByStatus(status)
                }
            )

            // Match list
            List {
                ForEach(viewModel.matches) { match in
                    NavigationLink {
                        MatchDetailView(matchId: match.id)
                    } label: {
                        MatchRowViewLegacy(match: match)
                    }
                    .onAppear {
                        if match.id == viewModel.matches.last?.id && viewModel.hasMorePages && !viewModel.isLoading {
                            Task {
                                await viewModel.loadNextPage()
                            }
                        }
                    }
                }

                if viewModel.hasMorePages && viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .refreshable {
                await viewModel.refreshMatches()
            }
        }
        .background(Theme.primaryBackground)
    }
}
