import Foundation
import Combine
import SwiftData

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User? = nil
    @Published var errorMessage: String? = nil
    @Published var isLoading: Bool = false

    @Published var myMatchIntents: [MatchIntent] = []
    @Published var isLoadingIntents: Bool = false
    @Published var errorMessageIntents: String? = nil
    @Published var deletingIntentId: String? = nil

    // User Preferences
    @Published var userPreferences: UserPreferences? = nil
    @Published var isLoadingPreferences: Bool = false

    // User Stats
    @Published var userStats: UserMatchStats = .empty

    private let getMeUseCase = GetMeUseCase()
    private let listMatchIntentsUseCase = ListMatchIntentsUseCase()
    private let deleteMatchIntentUseCase = DeleteMatchIntentUseCase()
    private let getUserPreferencesUseCase = GetUserPreferencesUseCase()

    private var refreshUserTask: Task<Void, Never>?
    private var refreshIntentsTask: Task<Void, Never>?
    private var refreshPreferencesTask: Task<Void, Never>?

    func getMe() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await getMeUseCase.execute()
            guard !Task.isCancelled else { return }
            user = result
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    func loadMyMatchIntents() async {
        isLoadingIntents = true
        errorMessageIntents = nil
        defer { isLoadingIntents = false }

        do {
            let result = try await listMatchIntentsUseCase.execute(cursor: nil, limit: 50)
            guard !Task.isCancelled else { return }
            myMatchIntents = result.data
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            guard !Task.isCancelled else { return }
            errorMessageIntents = error.localizedDescription
        }
        isLoadingIntents = false
    }

    /// Refresh user data - survives SwiftUI task cancellation
    func refreshUser() async {
        // Cancel any ongoing refresh
        refreshUserTask?.cancel()

        // Create unstructured task that won't be cancelled by SwiftUI's refreshable
        refreshUserTask = Task { [weak self] in
            guard let self else { return }
            await MainActor.run { self.isLoading = true; self.errorMessage = nil }
            do {
                let result = try await self.getMeUseCase.execute()
                await MainActor.run { self.user = result }
            } catch is CancellationError {
                // Only ignore if we intentionally cancelled
            } catch {
                await MainActor.run { self.errorMessage = error.localizedDescription }
            }
            await MainActor.run { self.isLoading = false }
        }

        // Wait for completion
        await refreshUserTask?.value
    }

    /// Refresh match intents - survives SwiftUI task cancellation
    func refreshMatchIntents() async {
        // Cancel any ongoing refresh
        refreshIntentsTask?.cancel()

        // Create unstructured task that won't be cancelled by SwiftUI's refreshable
        refreshIntentsTask = Task { [weak self] in
            guard let self else { return }
            await MainActor.run { self.isLoadingIntents = true; self.errorMessageIntents = nil }
            do {
                let result = try await self.listMatchIntentsUseCase.execute(cursor: nil, limit: 50)
                await MainActor.run { self.myMatchIntents = result.data }
            } catch is CancellationError {
                // Only ignore if we intentionally cancelled
            } catch {
                await MainActor.run { self.errorMessageIntents = error.localizedDescription }
            }
            await MainActor.run { self.isLoadingIntents = false }
        }

        // Wait for completion
        await refreshIntentsTask?.value
    }

    func deleteMatchIntent(id: String) async {
        deletingIntentId = id
        errorMessageIntents = nil
        do {
            try await deleteMatchIntentUseCase.execute(id: id)
            myMatchIntents.removeAll { $0.id == id }
        } catch {
            errorMessageIntents = error.localizedDescription
        }
        deletingIntentId = nil
    }

    // MARK: - User Preferences

    func loadUserPreferences() async {
        isLoadingPreferences = true
        defer { isLoadingPreferences = false }

        do {
            let preferences = try await getUserPreferencesUseCase.execute()
            guard !Task.isCancelled else { return }
            userPreferences = preferences
        } catch is CancellationError {
            // Ignore cancellation
        } catch {
            // Silently fail - preferences are optional
            print("Failed to load preferences: \(error)")
        }
    }

    func refreshUserPreferences() async {
        refreshPreferencesTask?.cancel()

        refreshPreferencesTask = Task { [weak self] in
            guard let self else { return }
            await MainActor.run { self.isLoadingPreferences = true }
            do {
                let preferences = try await self.getUserPreferencesUseCase.execute()
                await MainActor.run { self.userPreferences = preferences }
            } catch is CancellationError {
                // Ignore
            } catch {
                print("Failed to refresh preferences: \(error)")
            }
            await MainActor.run { self.isLoadingPreferences = false }
        }

        await refreshPreferencesTask?.value
    }

    // MARK: - User Stats

    func calculateStats(from matches: [MatchModel]) {
        guard let userId = user?.id else {
            userStats = .empty
            return
        }

        let finishedMatches = matches.filter { $0.isFinished }

        let userMatches = finishedMatches.filter { match in
            match.participants.contains { $0.userId == userId }
        }

        let wins = userMatches.filter { match in
            match.participants.first { $0.userId == userId }?.isWinner ?? false
        }.count

        let totalPlayTime = userMatches.compactMap { $0.duration }.reduce(0, +)

        let calendar = Calendar.current
        let now = Date()
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) ?? now
        let matchesThisMonth = userMatches.filter { match in
            let matchDate = match.finishedAt ?? match.createdAt
            return matchDate >= startOfMonth
        }.count

        userStats = UserMatchStats(
            totalMatches: userMatches.count,
            totalWins: wins,
            totalPlayTime: totalPlayTime,
            matchesThisMonth: matchesThisMonth,
            monthlyGoal: 10
        )
    }

    // MARK: - Computed Properties

    /// Display name for skill level
    var skillLevelDisplayName: String? {
        guard let prefs = userPreferences else { return nil }
        if let sport = Sport(rawValue: prefs.sport),
           let level = SkillLevel.levels(for: sport).first(where: { $0.value == prefs.skillLevel }) {
            return level.displayName
        }
        return prefs.skillLevel
    }
}

