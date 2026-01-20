import Foundation

// MARK: - Organization DTO
struct OrganizationDTO: Codable {
    let id: String
    let name: String
    let slug: String
    let logo: String?
    let createdAt: String?
    let metadata: String?
}

// MARK: - Full Organization Response
struct FullOrganizationDTO: Codable {
    let id: String
    let name: String
    let slug: String
    let logo: String?
    let createdAt: Date
    let metadata: String?
    let members: [MemberDTO]
}

// MARK: - List Organizations Response
struct ListOrganizationsResponseDTO: Codable {
    let organizations: [OrganizationDTO]?

    // Handle array response directly
    init(from decoder: Decoder) throws {
        if let container = try? decoder.container(keyedBy: CodingKeys.self) {
            organizations = try container.decodeIfPresent([OrganizationDTO].self, forKey: .organizations)
        } else if let array = try? decoder.singleValueContainer().decode([OrganizationDTO].self) {
            organizations = array
        } else {
            organizations = nil
        }
    }

    private enum CodingKeys: String, CodingKey {
        case organizations
    }
}
