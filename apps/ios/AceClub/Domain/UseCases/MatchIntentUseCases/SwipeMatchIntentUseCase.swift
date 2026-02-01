import Foundation

class SwipeMatchIntentUseCase {
    private let repository = MatchIntentRepository()

    func execute(matchIntentId: String, action: String) async throws -> SwipeResult {
        guard action == "like" || action == "pass" else {
            throw ValidationError.invalidSwipeAction
        }
        return try await repository.swipe(matchIntentId: matchIntentId, action: action)
    }
}
