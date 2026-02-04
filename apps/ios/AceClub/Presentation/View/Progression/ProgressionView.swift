import SwiftUI

struct ProgressionView: View {
    @ObservedObject var viewModel: ProgressionViewModel

    var body: some View {
        NavigationStack {
            List {
                levelSection

                streakSection

                challengesSection

                badgesSection

                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text("Erreur: \(errorMessage)")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .navigationTitle("Progression")
            .task(id: "progression-load") {
                await viewModel.loadAll()
            }
            .refreshable {
                await viewModel.loadAll()
            }
        }
    }

    // MARK: - Level Section

    @ViewBuilder
    private var levelSection: some View {
        Section {
            if viewModel.isLoadingLevel {
                SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 150)
            } else {
                LevelProgressCard(userLevel: viewModel.userLevel)
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
        }
    }

    // MARK: - Streak Section

    @ViewBuilder
    private var streakSection: some View {
        Section {
            if viewModel.isLoadingStreak {
                SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 120)
            } else {
                StreakCard(streak: viewModel.userStreak)
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
        } header: {
            Label("Série", systemImage: "flame.fill")
        }
    }

    // MARK: - Challenges Section

    @ViewBuilder
    private var challengesSection: some View {
        Section {
            if viewModel.isLoadingChallenges {
                SkeletonList(count: 3) {
                    SkeletonRow(showAvatar: false, lineCount: 3, titleWidth: 180)
                }
            } else if viewModel.challenges.isEmpty {
                ContentUnavailableView {
                    Label("Aucun défi", systemImage: "flag.checkered")
                } description: {
                    Text("Les défis hebdomadaires arrivent bientôt.")
                }
                .padding(.vertical, 24)
                .frame(maxWidth: .infinity)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                        .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                }
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
            } else {
                ForEach(viewModel.challenges) { challenge in
                    ChallengeRow(challenge: challenge)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                        .listRowBackground(Color.clear)
                }
            }
        } header: {
            HStack {
                Label("Défis de la semaine", systemImage: "target")

                Spacer()

                if !viewModel.challenges.isEmpty {
                    Text("\(viewModel.activeChallengesCount) actif\(viewModel.activeChallengesCount > 1 ? "s" : "")")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    // MARK: - Badges Section

    @ViewBuilder
    private var badgesSection: some View {
        Section {
            if viewModel.isLoadingBadges {
                SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 100)
            } else if viewModel.allBadges.isEmpty {
                ContentUnavailableView {
                    Label("Aucun badge", systemImage: "rosette")
                } description: {
                    Text("Les badges seront bientôt disponibles.")
                }
                .padding(.vertical, 24)
                .frame(maxWidth: .infinity)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                        .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                }
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
            } else {
                BadgeGrid(badges: viewModel.badges, allBadges: viewModel.allBadges)
                    .padding(Theme.paddingCard)
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                            .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
        } header: {
            HStack {
                Label("Badges", systemImage: "rosette")

                Spacer()

                Text("\(viewModel.unlockedBadgesCount)/\(viewModel.totalBadgesCount)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

#Preview {
    ProgressionView(viewModel: ProgressionViewModel())
}
