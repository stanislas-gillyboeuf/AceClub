import Foundation

// MARK: - User Image Upload

struct UserImageUploadRequestDTO: Codable {
    let contentType: String
}

struct UserImageUploadResponseDTO: Codable {
    let uploadUrl: String
    let imageUrl: String
    let expiresIn: Int
}

// MARK: - Organization Logo Upload

struct OrgLogoUploadRequestDTO: Codable {
    let organizationId: String
    let contentType: String
}

struct OrgLogoUploadResponseDTO: Codable {
    let uploadUrl: String
    let logoUrl: String
    let expiresIn: Int
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
