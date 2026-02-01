import Foundation

class ListMatchRequestsUseCase {
    private let repository = MatchIntentRepository()

    func execute() async throws -> [MatchRequestWithDetails] {
        try await repository.listRequests()
    }
}
