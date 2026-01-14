import Foundation
import Combine

@MainActor
class AdminViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var totalUsers: Int = 0
    @Published var limit: Int?
    @Published var offset: Int?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let listUsersUseCase = AdminListUsersUseCase()
    private let createUserUseCase = AdminCreateUserUseCase()
    private let updateUserUseCase = AdminUpdateUserUseCase()
    private let setUserRoleUseCase = AdminSetUserRoleUseCase()
    private let setUserPasswordUseCase = AdminSetUserPasswordUseCase()
    private let banUserUseCase = AdminBanUserUseCase()
    private let unbanUserUseCase = AdminUnbanUserUseCase()
    private let revokeUserSessionUseCase = AdminRevokeUserSessionUseCase()
    private let revokeUserSessionsUseCase = AdminRevokeUserSessionsUseCase()

    func loadUsers() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await listUsersUseCase.execute()
            users = result.users
            totalUsers = result.total
            limit = result.limit
            offset = result.offset
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createUser(name: String, email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await createUserUseCase.execute(name: name, email: email, password: password)
            upsertUser(user)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateUser(userId: String, name: String, email: String, password: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await updateUserUseCase.execute(userId: userId, name: name, email: email, password: password)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func setRole(userId: String, role: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await setUserRoleUseCase.execute(userId: userId, role: role.lowercased())
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func setPassword(userId: String, password: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await setUserPasswordUseCase.execute(userId: userId, password: password)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func banUser(userId: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await banUserUseCase.execute(userId: userId)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func unbanUser(userId: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await unbanUserUseCase.execute(userId: userId)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func revokeUserSession(userId: String, sessionId: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await revokeUserSessionUseCase.execute(userId: userId, sessionId: sessionId)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func revokeUserSessions(userId: String) async -> User? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let user = try await revokeUserSessionsUseCase.execute(userId: userId)
            upsertUser(user)
            return user
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    private func upsertUser(_ user: User) {
        if let index = users.firstIndex(where: { $0.id == user.id }) {
            users[index] = user
        } else {
            users.insert(user, at: 0)
        }
    }
}
