struct User: Codable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String?
    let createdAt: Date
    let updatedAt: Date
}

struct Session: Codable {
    let id: String
    let expiresAt: Date
}

struct UserDTO: Codable {
    let user: User
    let session: Session
}

