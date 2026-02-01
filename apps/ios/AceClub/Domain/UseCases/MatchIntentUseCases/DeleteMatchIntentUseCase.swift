import Foundation

class DeleteMatchIntentUseCase {
    private let repository = MatchIntentRepository()

    func execute(id: String) async throws {
        try await repository.deleteMatchIntent(id: id)
    }
}
