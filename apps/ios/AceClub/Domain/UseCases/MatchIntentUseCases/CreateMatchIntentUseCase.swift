import Foundation

class CreateMatchIntentUseCase {
    private let repository = MatchIntentRepository()

    func execute(date: Date, time: Date, duration: Int) async throws -> MatchIntent {
        try await repository.createMatchIntent(date: date, time: time, duration: duration)
    }
}
