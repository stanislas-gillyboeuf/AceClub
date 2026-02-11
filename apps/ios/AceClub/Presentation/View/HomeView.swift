import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var organizationViewModel: OrganizationViewModel

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    @State private var viewModel = HomeFeedViewModel()
    @State private var showProgression = false
    @State private var showLeaderboard = false
    @State private var showFinishSheet = false
    @State private var selectedMatchForDetail: String?
    @StateObject private var progressionViewModel = ProgressionViewModel()
    @StateObject private var leaderboardViewModel = LeaderboardViewModel()

    @State private var syncService: MatchSyncService?
    @State private var isStartingMatch = false

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    private var ongoingMatches: [MatchModel] {
        allMatches.filter { $0.isOngoing }
    }

    private var scheduledMatches: [MatchModel] {
        allMatches.filter { $0.isScheduled }
            .sorted { ($0.scheduledAt ?? $0.createdAt) < ($1.scheduledAt ?? $1.createdAt) }
    }

    private var finishedMatches: [MatchModel] {
        allMatches.filter { $0.isFinished }
    }

    /// The most important upcoming activity: ongoing first, then next scheduled
    private var nextActivity: MatchModel? {
        if let ongoing = ongoingMatches.first {
            return ongoing
        }
        return scheduledMatches.first
    }

    var body: some View {
        NavigationStack {
            List {
                // Level progress card
                Section {
                    if progressionViewModel.isLoadingLevel {
                        SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 150)
                    } else {
                        LevelProgressCard(userLevel: progressionViewModel.userLevel)
                            .onTapGesture {
                                showProgression = true
                            }
                    }
                }
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 8, leading: Theme.paddingHorizontal, bottom: 8, trailing: Theme.paddingHorizontal))
                .listRowBackground(Color.clear)

                // Next activity card (prominent)
                if let activity = nextActivity {
                    Section {
                        NextActivityCardView(
                            match: activity,
                            currentUserId: currentUserId,
                            onStart: {
                                Task { await startMatch(activity) }
                            },
                            onFinish: {
                                showFinishSheet = true
                            },
                            onTap: {
                                selectedMatchForDetail = activity.id
                            }
                        )
                        .disabled(isStartingMatch)
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 4, leading: Theme.paddingHorizontal, bottom: 8, trailing: Theme.paddingHorizontal))
                    .listRowBackground(Color.clear)
                }

                // Other ongoing matches (if more than one)
                if ongoingMatches.count > 1 {
                    Section {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(ongoingMatches.dropFirst()) { match in
                                    NavigationLink {
                                        MatchDetailView(matchId: match.id)
                                    } label: {
                                        OngoingMatchCardView(
                                            match: match,
                                            currentUserId: currentUserId
                                        )
                                    }
                                    .buttonStyle(.plain)
                                    .id(match.participantsImageHash)
                                }
                            }
                        }
                    } header: {
                        Text("Autres matchs en cours")
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 4, leading: Theme.paddingHorizontal, bottom: 4, trailing: Theme.paddingHorizontal))
                    .listRowBackground(Color.clear)
                }

                // Match history
                Section {
                    if finishedMatches.isEmpty && !viewModel.isLoading {
                        emptyFeedView
                    } else {
                        ForEach(finishedMatches) { match in
                            FeedMatchRowView(
                                match: match,
                                currentUserId: currentUserId
                            )
                            .background(
                                NavigationLink("", destination: MatchDetailView(matchId: match.id))
                                    .opacity(0)
                            )
                            .id(match.participantsImageHash)
                            .onAppear {
                                if match.id == finishedMatches.suffix(3).first?.id {
                                    Task {
                                        await viewModel.loadMoreMatches()
                                    }
                                }
                            }

                            if viewModel.isLoadingMore && match.id == finishedMatches.last?.id {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                            }
                        }
                    }
                } header: {
                    Text("Matchs r\u{00e9}cents au club")
                }
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 6, leading: Theme.paddingHorizontal, bottom: 6, trailing: Theme.paddingHorizontal))
                .listRowBackground(Color.clear)
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .navigationTitle("Activit\u{00e9}")
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button {
                        showLeaderboard = true
                    } label: {
                        Image(systemName: "trophy")
                    }
                }
            }
            .navigationDestination(item: $selectedMatchForDetail) { matchId in
                MatchDetailView(matchId: matchId)
            }
            .fullScreenCover(isPresented: $showProgression) {
                NavigationStack {
                    ProgressionView(viewModel: progressionViewModel)
                        .toolbar {
                            ToolbarItem(placement: .topBarLeading) {
                                Button("Fermer") {
                                    showProgression = false
                                }
                            }
                        }
                }
            }
            .fullScreenCover(isPresented: $showLeaderboard) {
                NavigationStack {
                    LeaderboardView(viewModel: leaderboardViewModel)
                        .toolbar {
                            ToolbarItem(placement: .topBarLeading) {
                                Button("Fermer") {
                                    showLeaderboard = false
                                }
                            }
                        }
                }
            }
            .sheet(isPresented: $showFinishSheet) {
                if let activity = nextActivity, activity.isOngoing {
                    FinishActivitySheet(
                        match: activity,
                        totalFinishedCount: finishedMatches.filter { $0.type == activity.type }.count,
                        isPresented: $showFinishSheet
                    )
                    .presentationDragIndicator(.visible)
                }
            }
            .refreshable {
                await refresh()
            }
            .task {
                await initialLoad()
            }
        }
    }

    private var emptyFeedView: some View {
        ContentUnavailableView(
            "Aucun match r\u{00e9}cent",
            systemImage: "sportscourt",
            description: Text("Vos matchs r\u{00e9}cents au club appara\u{00ee}tront ici")
        )
    }

    private func initialLoad() async {
        syncService = MatchSyncService(modelContext: modelContext)
        viewModel.initialize(modelContext: modelContext)
        viewModel.organizationId = organizationViewModel.activeMember?.organizationId
        async let matchesTask: () = viewModel.syncMatches()
        async let levelTask: () = progressionViewModel.loadLevel()
        _ = await (matchesTask, levelTask)
    }

    private func refresh() async {
        viewModel.organizationId = organizationViewModel.activeMember?.organizationId
        async let matchesTask: () = viewModel.syncMatches()
        async let levelTask: () = progressionViewModel.loadLevel()
        _ = await (matchesTask, levelTask)
    }

    private func startMatch(_ match: MatchModel) async {
        guard !isStartingMatch else { return }
        if syncService == nil {
            syncService = MatchSyncService(modelContext: modelContext)
        }
        isStartingMatch = true
        do {
            _ = try await syncService?.updateMatch(
                id: match.id,
                status: .ongoing,
                startedAt: Date()
            )
            try? await MatchLiveActivityManager.shared.startActivity(for: match)
        } catch {
            // Error handled silently - match detail view has full error handling
        }
        isStartingMatch = false
    }
}
