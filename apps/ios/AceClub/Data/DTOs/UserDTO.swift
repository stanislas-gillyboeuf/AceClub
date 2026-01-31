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
    let phoneNumber: String?
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
    let isGhost: Bool?
}

// MARK: - Ghost User DTOs
struct CreateGhostRequestDTO: Codable {
    let name: String
    let email: String
}

struct GhostUserDTO: Codable {
    let id: String
    let name: String
    let email: String
    let image: String?
    let isGhost: Bool
    let createdAt: String
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
    let phoneNumber: String
}

// MARK: - User Preferences DTOs

struct UserPreferencesResponseDTO: Codable {
    let id: String
    let userId: String
    let organizationId: String
    let organizationName: String?
    let sport: String
    let skillLevel: String
    let createdAt: String
    let updatedAt: String
}

struct UpdateProfileRequestDTO: Codable {
    let name: String?
    let image: String?
    let phoneNumber: String?
    let organizationId: String?
    let sport: String?
    let skillLevel: String?
}
