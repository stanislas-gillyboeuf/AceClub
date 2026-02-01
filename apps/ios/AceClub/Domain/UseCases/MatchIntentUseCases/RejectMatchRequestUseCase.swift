import Foundation

class RejectMatchRequestUseCase {
    private let repository = MatchIntentRepository()

    func execute(requestId: String) async throws -> RejectMatchRequestResult {
        try await repository.rejectRequest(id: requestId)
    }
}
