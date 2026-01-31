import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var organizationViewModel: OrganizationViewModel

    @Query(
        sort: \MatchModel.createdAt,
        order: .reverse
    )
    private var allMatches: [MatchModel]

    @State private var viewModel = HomeFeedViewModel()
    @State private var showProgression = false
    @State private var showLeaderboard = false
    @StateObject private var progressionViewModel = ProgressionViewModel()
    @StateObject private var leaderboardViewModel = LeaderboardViewModel()

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    private var organizationMemberUserIds: Set<String> {
        Set(organizationViewModel.members.map { $0.userId })
    }

    private var ongoingOrganizationMatches: [MatchModel] {
        allMatches.filter { match in
            guard match.isOngoing else { return false }
            return match.participants.contains { participant in
                organizationMemberUserIds.contains(participant.userId)
            }
        }
    }

    private var finishedMatches: [MatchModel] {
        allMatches.filter { $0.isFinished }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if let stats = viewModel.stats {
                        StatsCardView(stats: stats)
                            .padding(.horizontal, Theme.paddingHorizontal)
                    } else if viewModel.isLoading {
                        StatsCardSkeleton()
                            .padding(.horizontal, Theme.paddingHorizontal)
                    }

                    if !ongoingOrganizationMatches.isEmpty {
                        ongoingMatchesSection
                    }

                    matchHistorySection
                }
                .padding(.top, 16)
                .padding(.bottom, 32)
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Activité")
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button {
                        showProgression = true
                    } label: {
                        Image(systemName: "chart.line.uptrend.xyaxis")
                    }

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
            .onChange(of: allMatches.count) {
                recalculateStats()
            }
        }
    }

    @ViewBuilder
    private var ongoingMatchesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("En cours")
                .font(.title2.weight(.bold))
                .padding(.horizontal, Theme.paddingHorizontal)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(ongoingOrganizationMatches) { match in
                        NavigationLink {
                            MatchDetailView(matchId: match.id)
                        } label: {
                            OngoingMatchCardView(
                                match: match,
                                currentUserId: currentUserId
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
            }
        }
    }

    @ViewBuilder
    private var matchHistorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Historique des matchs")
                .font(.title2.weight(.bold))
                .padding(.horizontal, Theme.paddingHorizontal)

            if finishedMatches.isEmpty {
                emptyFeedView
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(finishedMatches) { match in
                        NavigationLink {
                            MatchDetailView(matchId: match.id)
                        } label: {
                            FeedMatchRowView(
                                match: match,
                                currentUserId: currentUserId
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
            }
        }
    }

    private var emptyFeedView: some View {
        VStack(spacing: 12) {
            Image(systemName: "sportscourt")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("Aucun match terminé")
                .font(.headline)

            Text("Vos matchs terminés apparaîtront ici")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .padding(.horizontal, Theme.paddingHorizontal)
    }

    private func initialLoad() async {
        viewModel.initialize(modelContext: modelContext)
        await viewModel.syncMatches()
        recalculateStats()
        if let orgId = organizationViewModel.activeOrganization?.id {
            await organizationViewModel.loadMembers(organizationId: orgId)
        }
    }

    private func refresh() async {
        await viewModel.syncMatches()
        recalculateStats()
    }

    private func recalculateStats() {
        guard !currentUserId.isEmpty else { return }
        viewModel.calculateStats(from: allMatches, userId: currentUserId)
    }
}
