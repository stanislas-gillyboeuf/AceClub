import Foundation

class AcceptMatchRequestUseCase {
    private let repository = MatchIntentRepository()

    func execute(requestId: String) async throws -> AcceptMatchRequestResult {
        try await repository.acceptRequest(id: requestId)
    }
}
