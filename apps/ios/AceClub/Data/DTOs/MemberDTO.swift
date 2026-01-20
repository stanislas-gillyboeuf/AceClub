import Foundation

// MARK: - Member DTO
struct MemberDTO: Codable {
    let id: String
    let organizationId: String
    let userId: String
    let role: String
    let createdAt: String
    let user: UserDTO?
}

// MARK: - List Members Response
struct ListMembersResponseDTO: Codable {
    let members: [MemberDTO]?
    let total: Int?
    let limit: Int?
    let offset: Int?

    // Handle array response directly
    init(from decoder: Decoder) throws {
        if let container = try? decoder.container(keyedBy: CodingKeys.self) {
            members = try container.decodeIfPresent([MemberDTO].self, forKey: .members)
            total = try container.decodeIfPresent(Int.self, forKey: .total)
            limit = try container.decodeIfPresent(Int.self, forKey: .limit)
            offset = try container.decodeIfPresent(Int.self, forKey: .offset)
        } else if let array = try? decoder.singleValueContainer().decode([MemberDTO].self) {
            members = array
            total = array.count
            limit = nil
            offset = nil
        } else {
            members = nil
            total = nil
            limit = nil
            offset = nil
        }
    }

    private enum CodingKeys: String, CodingKey {
        case members, total, limit, offset
    }
}

// MARK: - Active Member Response
struct ActiveMemberDTO: Codable {
    let id: String
    let organizationId: String
    let userId: String
    let role: String
    let createdAt: String
}

// MARK: - Active Member Role Response
struct ActiveMemberRoleDTO: Codable {
    let role: String
}
