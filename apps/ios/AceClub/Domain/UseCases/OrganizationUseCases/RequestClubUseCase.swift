import Foundation

class RequestClubUseCase {
    private let repository = OrganizationRepository()

    func execute(name: String, city: String) async throws -> ClubRequestResult {
        return try await repository.requestClub(name: name, city: city)
    }
}
