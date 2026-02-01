import Foundation

// MARK: - User Image Upload

struct UserImageUploadResponseDTO: Codable {
    let imageUrl: String
}

// MARK: - Organization Logo Upload

struct OrgLogoUploadResponseDTO: Codable {
    let logoUrl: String
}

// MARK: - Update Organization

struct UpdateOrganizationRequestDTO: Codable {
    let organizationId: String
    let data: UpdateOrganizationDataDTO
}

struct UpdateOrganizationDataDTO: Codable {
    let name: String?
    let slug: String?
    let logo: String?
}
