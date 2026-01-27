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
    let onboardingCompleted: Bool?
}

struct ListUsersResponseDTO: Codable {
    let users: [UserDTO]
    let total: Int
    let limit: Int?
    let offset: Int?
}


struct UserSearchResponseDTO: Codable {
    let users: [UserSearchItemDTO]
    let count: Int
}

// MARK: - User Search Item
struct UserSearchItemDTO: Codable {
    let id: String
    let name: String
    let email: String
    let image: String?
}

// MARK: - Onboarding DTOs

struct UserPreferenceDTO: Codable {
    let id: String
    let userId: String
    let organizationId: String
    let sport: String
    let skillLevel: String
    let createdAt: String
    let updatedAt: String
}

struct CompleteOnboardingRequestDTO: Codable {
    let organizationId: String
    let sport: String
    let skillLevel: String
}
