//
//  MatchesView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import SwiftData

struct MatchesView: View {
    @Environment(\.modelContext) private var modelContext

    // SwiftData query - auto-updates when data changes
    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var matches: [MatchModel]

    @State private var showingCreateMatch = false
    @State private var showingListRequestMatch = false
    @State private var isLoading = false
    @State private var selectedStatus: MatchStatus?
    @State private var syncService: MatchSyncService?

    var body: some View {
        NavigationStack {
            ZStack {
                if isLoading && matches.isEmpty {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            SkeletonList(count: 5) {
                                MatchRowSkeleton()
                            }
                        }
                        .padding(.horizontal, Theme.paddingHorizontal)
                        .padding(.top, 16)
                    }
                } else {
                    MatchListContent(selectedStatus: $selectedStatus)
                }
            }
            .navigationTitle("Matchs")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showingCreateMatch = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .disabled(isLoading)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingListRequestMatch = true
                    } label: {
                        Image(systemName: "envelope.badge")
                    }
                }
            }
            .sheet(isPresented: $showingCreateMatch) {
                CreateMatchView(isPresented: $showingCreateMatch) {
                    // No need to refresh - @Query auto-updates
                }
            }
            .fullScreenCover(isPresented: $showingListRequestMatch) {
                ListRequestMatch {
                    // No need to refresh - @Query auto-updates
                }
            }
            .task {
                syncService = MatchSyncService(modelContext: modelContext)
                if matches.isEmpty {
                    await loadMatches()
                }
            }
        }
    }

    private func loadMatches() async {
        guard !isLoading else { return }
        isLoading = true
        do {
            try await syncService?.syncMatches()
        } catch {
            print("Load matches error: \(error)")
        }
        isLoading = false
    }
}
