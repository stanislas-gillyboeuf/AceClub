import Foundation

class ListMatchIntentsUseCase {
    private let repository = MatchIntentRepository()

    func execute(cursor: String? = nil, limit: Int = 20) async throws -> MatchIntentListResult {
        try await repository.listMatchIntents(cursor: cursor, limit: limit)
    }
}
