import SwiftUI

struct LeaderboardView: View {
    @ObservedObject var viewModel: LeaderboardViewModel
    @EnvironmentObject private var organizationViewModel: OrganizationViewModel

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                LeaderboardTypePicker(selectedType: $viewModel.selectedType)
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.vertical, 12)

                leaderboardContent
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Classement")
            .task(id: "leaderboard-load") {
                updateOrganizationId()
                await viewModel.loadLeaderboard()
            }
            .onChange(of: viewModel.selectedType) {
                Task {
                    updateOrganizationId()
                    await viewModel.selectType(viewModel.selectedType)
                }
            }
            .refreshable {
                updateOrganizationId()
                await viewModel.loadLeaderboard()
            }
        }
    }

    private func updateOrganizationId() {
        viewModel.currentOrganizationId = organizationViewModel.activeMember?.organizationId
            ?? organizationViewModel.organizations.first?.id
    }

    @ViewBuilder
    private var leaderboardContent: some View {
        if viewModel.isLoading && !hasData {
            loadingView
        } else if let errorMessage = viewModel.errorMessage {
            errorView(message: errorMessage)
        } else if viewModel.selectedType == .weekly {
            weeklyLeaderboardList
        } else {
            standardLeaderboardList
        }
    }

    private var hasData: Bool {
        if viewModel.selectedType == .weekly {
            return viewModel.weeklyLeaderboard != nil
        } else {
            return viewModel.leaderboard != nil
        }
    }

    // MARK: - Standard Leaderboard

    @ViewBuilder
    private var standardLeaderboardList: some View {
        if let leaderboard = viewModel.leaderboard {
            List {
                ForEach(leaderboard.entries) { entry in
                    LeaderboardRow(entry: entry)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 2, leading: Theme.paddingHorizontal, bottom: 2, trailing: Theme.paddingHorizontal))
                        .listRowBackground(Color.clear)
                        .onAppear {
                            if entry.id == leaderboard.entries.last?.id {
                                Task {
                                    await viewModel.loadNextPage()
                                }
                            }
                        }
                }

                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
        } else {
            emptyView
        }
    }

    // MARK: - Weekly Leaderboard

    @ViewBuilder
    private var weeklyLeaderboardList: some View {
        if let weeklyLeaderboard = viewModel.weeklyLeaderboard {
            List {
                Section {
                    Text(weekLabel(from: weeklyLeaderboard.weekStartDate))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                }

                ForEach(weeklyLeaderboard.entries) { entry in
                    WeeklyLeaderboardRow(entry: entry)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 2, leading: Theme.paddingHorizontal, bottom: 2, trailing: Theme.paddingHorizontal))
                        .listRowBackground(Color.clear)
                        .onAppear {
                            if entry.id == weeklyLeaderboard.entries.last?.id {
                                Task {
                                    await viewModel.loadNextPage()
                                }
                            }
                        }
                }

                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
        } else {
            emptyView
        }
    }

    // MARK: - State Views

    private var loadingView: some View {
        List {
            SkeletonList(count: 10) {
                SkeletonRow(lineCount: 2, titleWidth: 150)
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private func errorView(message: String) -> some View {
        ContentUnavailableView {
            Label("Erreur", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        } actions: {
            Button("Réessayer") {
                Task {
                    await viewModel.loadLeaderboard()
                }
            }
        }
    }

    private var emptyView: some View {
        ContentUnavailableView {
            Label("Aucun classement", systemImage: "chart.bar.xaxis")
        } description: {
            Text("Le classement sera disponible quand des joueurs auront gagné des Aces.")
        }
    }

    // MARK: - Helpers

    private func weekLabel(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "'Semaine du' d MMMM"
        return formatter.string(from: date)
    }
}
