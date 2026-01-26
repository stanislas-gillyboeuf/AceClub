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

    func getMe() async {
        isLoading = true
        errorMessage = nil
        do {
            let result = try await getMeUseCase.execute()
            user = result
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
        } catch {
            errorMessageIntents = error.localizedDescription
        }
        isLoadingIntents = false
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

