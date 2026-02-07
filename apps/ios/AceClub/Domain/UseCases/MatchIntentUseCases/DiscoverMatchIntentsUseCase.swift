import Foundation

class DiscoverMatchIntentsUseCase {
    private let repository = MatchIntentRepository()

    func execute(cursor: String? = nil, limit: Int = 20, latitude: Double? = nil, longitude: Double? = nil, radius: Int? = nil) async throws -> DiscoverListResult {
        try await repository.discover(cursor: cursor, limit: limit, latitude: latitude, longitude: longitude, radius: radius)
    }
}
