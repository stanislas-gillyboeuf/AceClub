import Foundation
import UIKit

enum UploadError: Error, LocalizedError {
    case invalidURL
    case requestFailed
    case decodingFailed
    case imageConversionFailed
    case uploadFailed(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide"
        case .requestFailed:
            return "Échec de la requête"
        case .decodingFailed:
            return "Échec du décodage de la réponse"
        case .imageConversionFailed:
            return "Échec de la conversion de l'image"
        case .uploadFailed(let statusCode):
            return "Échec de l'envoi (code \(statusCode))"
        }
    }
}

class UploadAPIDataSource {

    // MARK: - Upload User Image

    func uploadUserImage(_ image: UIImage) async throws -> UserImageUploadResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/upload/user-image") else {
            throw UploadError.invalidURL
        }

        guard let imageData = image.jpegData(compressionQuality: 0.9) else {
            throw UploadError.imageConversionFailed
        }

        let (data, response) = try await APIClient.shared.authenticatedMultipartRequest(
            url: url,
            fileField: "image",
            fileData: imageData,
            fileName: "profile.jpg",
            mimeType: "image/jpeg"
        )

        guard response.statusCode == 200 else {
            throw UploadError.uploadFailed(statusCode: response.statusCode)
        }

        do {
            return try JSONDecoder().decode(UserImageUploadResponseDTO.self, from: data)
        } catch {
            throw UploadError.decodingFailed
        }
    }

    // MARK: - Upload Organization Logo

    func uploadOrgLogo(organizationId: String, image: UIImage) async throws -> OrgLogoUploadResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/upload/organization-logo") else {
            throw UploadError.invalidURL
        }

        guard let imageData = image.jpegData(compressionQuality: 0.9) else {
            throw UploadError.imageConversionFailed
        }

        let (data, response) = try await APIClient.shared.authenticatedMultipartRequest(
            url: url,
            formFields: ["organizationId": organizationId],
            fileField: "image",
            fileData: imageData,
            fileName: "logo.jpg",
            mimeType: "image/jpeg"
        )

        guard response.statusCode == 200 else {
            throw UploadError.uploadFailed(statusCode: response.statusCode)
        }

        do {
            return try JSONDecoder().decode(OrgLogoUploadResponseDTO.self, from: data)
        } catch {
            throw UploadError.decodingFailed
        }
    }
}
