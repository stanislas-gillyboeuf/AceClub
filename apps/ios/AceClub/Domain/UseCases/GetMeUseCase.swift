import Foundation

class GetMeUseCase {
    func execute() async throws -> User {
        return try await UserAPIDataSource().getMe()
    }
}