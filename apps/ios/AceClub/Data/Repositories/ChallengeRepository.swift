import Foundation

class ChallengeRepository {
    let dataSource = ChallengeAPIDataSource()

    func getMyChallenges() async throws -> [Challenge] {
        let dto = try await dataSource.getMyChallenges()
        return ChallengeMapper.map(challengesDTO: dto)
    }
}
