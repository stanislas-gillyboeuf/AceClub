import Foundation

class CreateMatchIntentUseCase {
    private let repository = MatchIntentRepository()

    func execute(date: Date, time: Date, duration: Int, type: MatchIntentType = .match, description: String? = nil) async throws -> MatchIntent {
        try await repository.createMatchIntent(date: date, time: time, duration: duration, type: type, description: description)
    }
}
