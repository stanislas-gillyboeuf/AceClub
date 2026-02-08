import Foundation

// MARK: - Organization DTO
struct OrganizationDTO: Codable {
    let id: String
    let name: String
    let slug: String
    let logo: String?
    let createdAt: String?
    let metadata: String?
    let address: String?
    let latitude: Double?
    let longitude: Double?
    let pinEnabled: Bool?
}

// MARK: - Full Organization Response
struct FullOrganizationDTO: Codable {
    let id: String
    let name: String
    let slug: String
    let logo: String?
    let createdAt: String
    let metadata: String?
    let address: String?
    let latitude: Double?
    let longitude: Double?
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


// MARK: - Create Organization Request
struct CreateOrganizationRequestDTO: Codable {
    let name: String
    let slug: String
    let logo: String?
    let metadata: String?
}

// MARK: - Search Organizations Response

struct SearchOrganizationsResponseDTO: Codable {
    let organizations: [OrganizationDTO]
    let total: Int
    let hasMore: Bool
}

// MARK: - Club Request

struct ClubRequestDTO: Codable {
    let name: String
    let city: String
}

struct ClubRequestResponseDTO: Codable {
    let success: Bool
    let message: String
    let requestCount: Int
    let status: String
}

// MARK: - Organization PIN

struct OrganizationPinDTO: Codable {
    let pin: String?
    let pinEnabled: Bool
}