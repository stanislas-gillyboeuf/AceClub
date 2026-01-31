import Foundation
import UIKit

enum UploadError: Error, LocalizedError {
    case invalidURL
    case requestFailed
    case decodingFailed
    case imageCompressionFailed
    case uploadFailed(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .requestFailed:
            return "Request failed"
        case .decodingFailed:
            return "Failed to decode response"
        case .imageCompressionFailed:
            return "Failed to compress image"
        case .uploadFailed(let statusCode):
            return "Upload failed with status code \(statusCode)"
        }
    }
}

class UploadAPIDataSource {

    // MARK: - Get Presigned URL for User Image

    func getUserImageUploadUrl(contentType: String) async throws -> UserImageUploadResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/upload/user-image") else {
            throw UploadError.invalidURL
        }

        let requestBody = UserImageUploadRequestDTO(contentType: contentType)
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: body)

        guard response.statusCode == 200 else {
            throw UploadError.requestFailed
        }

        do {
            return try JSONDecoder().decode(UserImageUploadResponseDTO.self, from: data)
        } catch {
            throw UploadError.decodingFailed
        }
    }

    // MARK: - Get Presigned URL for Organization Logo

    func getOrgLogoUploadUrl(organizationId: String, contentType: String) async throws -> OrgLogoUploadResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/upload/organization-logo") else {
            throw UploadError.invalidURL
        }

        let requestBody = OrgLogoUploadRequestDTO(organizationId: organizationId, contentType: contentType)
        let body = try JSONEncoder().encode(requestBody)
        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url, method: "POST", body: body)

        guard response.statusCode == 200 else {
            throw UploadError.requestFailed
        }

        do {
            return try JSONDecoder().decode(OrgLogoUploadResponseDTO.self, from: data)
        } catch {
            throw UploadError.decodingFailed
        }
    }

    // MARK: - Upload Image to Presigned URL

    func uploadImageToPresignedUrl(uploadUrl: String, imageData: Data, contentType: String) async throws {
        guard let url = URL(string: uploadUrl) else {
            throw UploadError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.httpBody = imageData

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw UploadError.requestFailed
        }

        guard httpResponse.statusCode == 200 else {
            throw UploadError.uploadFailed(statusCode: httpResponse.statusCode)
        }
    }

    // MARK: - Helper: Compress Image

    func compressImage(_ image: UIImage, maxSize: CGFloat = 800, quality: CGFloat = 0.8) throws -> (data: Data, contentType: String) {
        // Resize if needed
        let resizedImage: UIImage
        if max(image.size.width, image.size.height) > maxSize {
            let scale = maxSize / max(image.size.width, image.size.height)
            let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
            UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
            image.draw(in: CGRect(origin: .zero, size: newSize))
            resizedImage = UIGraphicsGetImageFromCurrentImageContext() ?? image
            UIGraphicsEndImageContext()
        } else {
            resizedImage = image
        }

        // Compress to JPEG
        guard let data = resizedImage.jpegData(compressionQuality: quality) else {
            throw UploadError.imageCompressionFailed
        }

        return (data: data, contentType: "image/jpeg")
    }
}
