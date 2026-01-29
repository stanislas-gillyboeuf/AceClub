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
