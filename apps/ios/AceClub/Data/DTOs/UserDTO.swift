// MARK: - User DTO
struct UserDTO: Codable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool?
    let image: String?
    let createdAt: String?
    let updatedAt: String?
    let role: String?
    let banned: Bool?
    let banReason: String?
    let banExpires: String?
}

struct ListUsersResponseDTO: Codable {
    let users: [UserDTO]
    let total: Int
    let limit: Int?
    let offset: Int?
}
