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
    @Environment(DeepLinkManager.self) private var deepLinkManager

    @ObservedObject var matchRequestsViewModel: MatchRequestsViewModel

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var matches: [MatchModel]

    @State private var showingCreateMatch = false
    @State private var showingListRequestMatch = false
    @State private var isLoading = false
    @State private var syncService: MatchSyncService?
    @State private var navigationPath = NavigationPath()

    var body: some View {
        NavigationStack(path: $navigationPath) {
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
                    MatchListContent()
                }
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Matchs")
            .navigationDestination(for: String.self) { matchId in
                MatchDetailView(matchId: matchId)
            }
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
                            .overlay(alignment: .topTrailing) {
                                if matchRequestsViewModel.pendingRequests.count > 0 {
                                    Text("\(matchRequestsViewModel.pendingRequests.count)")
                                        .font(.caption2.weight(.bold))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 1)
                                        .background(Color.red)
                                        .clipShape(Capsule())
                                        .offset(x: 8, y: -8)
                                }
                            }
                    }
                }
            }
            .sheet(isPresented: $showingCreateMatch) {
                CreateMatchSheet(isPresented: $showingCreateMatch) {
                    Task {
                        await loadMatches()
                    }
                }
                .presentationDragIndicator(.visible)
            }
            .fullScreenCover(isPresented: $showingListRequestMatch) {
                ListRequestMatch(viewModel: matchRequestsViewModel) {
                }
            }
            .task {
                syncService = MatchSyncService(modelContext: modelContext)
                if matches.isEmpty {
                    await loadMatches()
                }
            }
            .onChange(of: deepLinkManager.pendingMatchId) { _, matchId in
                if let matchId {
                    navigationPath.append(matchId)
                }
            }
            .onChange(of: deepLinkManager.shouldOpenMatchRequests) { _, shouldOpen in
                if shouldOpen {
                    showingListRequestMatch = true
                    deepLinkManager.shouldOpenMatchRequests = false
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
