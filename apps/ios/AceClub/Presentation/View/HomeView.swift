import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.modelContext) private var modelContext

    @Query(
        sort: \MatchModel.createdAt,
        order: .reverse
    )
    private var allMatches: [MatchModel]

    @State private var viewModel = HomeFeedViewModel()

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
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
                        statsLoadingPlaceholder
                            .padding(.horizontal, Theme.paddingHorizontal)
                    }

                    matchHistorySection
                }
                .padding(.top, 16)
                .padding(.bottom, 32)
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Activité")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NotificationBellButton()
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

    private var statsLoadingPlaceholder: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(0..<3, id: \.self) { index in
                    VStack(spacing: 8) {
                        Circle()
                            .fill(Color.secondary.opacity(0.2))
                            .frame(width: 28, height: 28)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.secondary.opacity(0.2))
                            .frame(width: 50, height: 28)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.secondary.opacity(0.2))
                            .frame(width: 60, height: 12)
                    }
                    .frame(maxWidth: .infinity)

                    if index < 2 {
                        Divider()
                            .frame(height: 60)
                    }
                }
            }
            .padding(.vertical, 20)

            Divider()

            VStack(alignment: .leading, spacing: 10) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 100, height: 20)

                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(height: 8)

                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 120, height: 16)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .redacted(reason: .placeholder)
    }

    private func initialLoad() async {
        viewModel.initialize(modelContext: modelContext)
        await viewModel.syncMatches()
        recalculateStats()
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
