import Foundation

class SearchOrganizationsUseCase {
    private let repository = OrganizationRepository()

    func execute(query: String?, limit: Int = 20, offset: Int = 0) async throws -> (organizations: [Organization], total: Int, hasMore: Bool) {
        return try await repository.searchOrganizations(query: query, limit: limit, offset: offset)
    }
}

