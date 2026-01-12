import Foundation

struct UserEntity :Identifiable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String?
    let createdAt: Date
    let updatedAt: Date
}

struct Session :Identifiable {
    let id: String
    let expiresAt: Date
}

struct User :Identifiable {
    let user: UserEntity
    let session: Session
}