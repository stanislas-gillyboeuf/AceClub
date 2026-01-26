import Foundation
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User? = nil
    @Published var errorMessage: String? = nil
    @Published var isLoading: Bool = false

    @Published var myMatchIntents: [MatchIntent] = []
    @Published var isLoadingIntents: Bool = false
    @Published var errorMessageIntents: String? = nil
    @Published var deletingIntentId: String? = nil

    private let getMeUseCase = GetMeUseCase()
    private let listMatchIntentsUseCase = ListMatchIntentsUseCase()
    private let deleteMatchIntentUseCase = DeleteMatchIntentUseCase()

    private var refreshUserTask: Task<Void, Never>?
    private var refreshIntentsTask: Task<Void, Never>?

    func getMe() async {
        isLoading = true
        errorMessage = nil
        do {
            let result = try await getMeUseCase.execute()
            user = result
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func loadMyMatchIntents() async {
        isLoadingIntents = true
        errorMessageIntents = nil
        do {
            let result = try await listMatchIntentsUseCase.execute(cursor: nil, limit: 50)
            myMatchIntents = result.data
        } catch is CancellationError {
            // Ignore cancellation - this happens during pull-to-refresh
        } catch {
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
}

