import Foundation
import Combine

enum LeaderboardType: String, CaseIterable {
    case global
    case organization
    case weekly

    var displayName: String {
        switch self {
        case .global: return "Global"
        case .organization: return "Club"
        case .weekly: return "Semaine"
        }
    }
}

@MainActor
class LeaderboardViewModel: ObservableObject {
    @Published var selectedType: LeaderboardType = .global
    @Published var leaderboard: Leaderboard?
    @Published var weeklyLeaderboard: WeeklyLeaderboard?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil

    var currentOrganizationId: String?

    private let getGlobalLeaderboardUseCase = GetGlobalLeaderboardUseCase()
    private let getOrganizationLeaderboardUseCase = GetOrganizationLeaderboardUseCase()
    private let getWeeklyLeaderboardUseCase = GetWeeklyLeaderboardUseCase()

    func loadLeaderboard() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            switch selectedType {
            case .global:
                let result = try await getGlobalLeaderboardUseCase.execute()
                guard !Task.isCancelled else { return }
                leaderboard = result
                weeklyLeaderboard = nil

            case .organization:
                guard let orgId = currentOrganizationId else {
                    errorMessage = "Aucune organisation sélectionnée"
                    return
                }
                let result = try await getOrganizationLeaderboardUseCase.execute(orgId: orgId)
                guard !Task.isCancelled else { return }
                leaderboard = result
                weeklyLeaderboard = nil

            case .weekly:
                let result = try await getWeeklyLeaderboardUseCase.execute()
                guard !Task.isCancelled else { return }
                weeklyLeaderboard = result
                leaderboard = nil
            }
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    func loadNextPage() async {
        guard !isLoading else { return }

        if selectedType == .weekly {
            guard let current = weeklyLeaderboard, current.hasNextPage else { return }
            isLoading = true
            defer { isLoading = false }

            do {
                let result = try await getWeeklyLeaderboardUseCase.execute(page: current.page + 1)
                guard !Task.isCancelled else { return }
                weeklyLeaderboard = WeeklyLeaderboard(
                    entries: current.entries + result.entries,
                    page: result.page,
                    totalPages: result.totalPages,
                    weekStartDate: result.weekStartDate
                )
            } catch {
                // Ignore pagination errors
            }
        } else {
            guard let current = leaderboard, current.hasNextPage else { return }
            isLoading = true
            defer { isLoading = false }

            do {
                let result: Leaderboard
                switch selectedType {
                case .global:
                    result = try await getGlobalLeaderboardUseCase.execute(page: current.page + 1)
                case .organization:
                    guard let orgId = currentOrganizationId else { return }
                    result = try await getOrganizationLeaderboardUseCase.execute(orgId: orgId, page: current.page + 1)
                case .weekly:
                    return
                }
                guard !Task.isCancelled else { return }
                leaderboard = Leaderboard(
                    entries: current.entries + result.entries,
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                )
            } catch {
                // Ignore pagination errors
            }
        }
    }

    func selectType(_ type: LeaderboardType) async {
        selectedType = type
        await loadLeaderboard()
    }
}
