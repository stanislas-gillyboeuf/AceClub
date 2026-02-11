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
    @StateObject private var progressionViewModel = ProgressionViewModel()
    @StateObject private var leaderboardViewModel = LeaderboardViewModel()

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    private var ongoingMatches: [MatchModel] {
        allMatches.filter { $0.isOngoing }
    }

    private var finishedMatches: [MatchModel] {
        allMatches.filter { $0.isFinished }
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

                // Ongoing matches
                if !ongoingMatches.isEmpty {
                    Section {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(ongoingMatches) { match in
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
                        Text("En cours")
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
                    Text("Matchs récents au club")
                }
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 6, leading: Theme.paddingHorizontal, bottom: 6, trailing: Theme.paddingHorizontal))
                .listRowBackground(Color.clear)
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .navigationTitle("Activité")
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button {
                        showLeaderboard = true
                    } label: {
                        Image(systemName: "trophy")
                    }
                }
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
            "Aucun match récent",
            systemImage: "sportscourt",
            description: Text("Vos matchs récents au club apparaîtront ici")
        )
    }

    private func initialLoad() async {
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
}
