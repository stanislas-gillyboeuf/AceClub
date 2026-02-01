import Foundation

class DiscoverMatchIntentsUseCase {
    private let repository = MatchIntentRepository()

    func execute(cursor: String? = nil, limit: Int = 20) async throws -> DiscoverListResult {
        try await repository.discover(cursor: cursor, limit: limit)
    }
}
