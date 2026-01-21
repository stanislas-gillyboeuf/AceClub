import Foundation

class GetMeUseCase {

    let userRepository = UserRepository()
    func execute() async throws -> User {
        return try await userRepository.getMe()
    }
}