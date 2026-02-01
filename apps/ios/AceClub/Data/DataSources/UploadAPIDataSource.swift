import Foundation
import UIKit
import ImageIO

enum UploadError: Error, LocalizedError {
    case invalidURL
    case requestFailed
    case decodingFailed
    case imageCompressionFailed
    case uploadFailed(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide"
        case .requestFailed:
            return "Échec de la requête"
        case .decodingFailed:
            return "Échec du décodage de la réponse"
        case .imageCompressionFailed:
            return "Échec de la compression de l'image"
        case .uploadFailed(let statusCode):
            return "Échec de l'envoi (code \(statusCode))"
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

    func compressImage(_ image: UIImage, maxSize: CGFloat = 1200, targetFileSizeKB: Int = 500) throws -> (data: Data, contentType: String) {
        // Resize if needed while maintaining aspect ratio
        let resizedImage: UIImage
        if max(image.size.width, image.size.height) > maxSize {
            let scale = maxSize / max(image.size.width, image.size.height)
            let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)

            let renderer = UIGraphicsImageRenderer(size: newSize)
            resizedImage = renderer.image { _ in
                image.draw(in: CGRect(origin: .zero, size: newSize))
            }
        } else {
            resizedImage = image
        }

        // Try HEIC first (better compression, same quality) - available iOS 11+
        if let heicData = compressToHEIC(resizedImage, targetFileSizeKB: targetFileSizeKB) {
            return (data: heicData, contentType: "image/heic")
        }

        // Fallback to JPEG with adaptive quality
        guard let jpegData = compressToJPEG(resizedImage, targetFileSizeKB: targetFileSizeKB) else {
            throw UploadError.imageCompressionFailed
        }

        return (data: jpegData, contentType: "image/jpeg")
    }

    private func compressToHEIC(_ image: UIImage, targetFileSizeKB: Int) -> Data? {
        guard let cgImage = image.cgImage else { return nil }

        let targetBytes = targetFileSizeKB * 1024

        // Try different quality levels to hit target size while maintaining quality
        for quality in stride(from: 1.0, through: 0.5, by: -0.1) {
            let data = NSMutableData()
            guard let destination = CGImageDestinationCreateWithData(
                data as CFMutableData,
                "public.heic" as CFString,
                1,
                nil
            ) else { continue }

            let options: [CFString: Any] = [
                kCGImageDestinationLossyCompressionQuality: quality
            ]

            CGImageDestinationAddImage(destination, cgImage, options as CFDictionary)

            if CGImageDestinationFinalize(destination) {
                if data.length <= targetBytes || quality <= 0.5 {
                    return data as Data
                }
            }
        }

        return nil
    }

    private func compressToJPEG(_ image: UIImage, targetFileSizeKB: Int) -> Data? {
        let targetBytes = targetFileSizeKB * 1024

        // Start with high quality and reduce until we hit target size
        for quality in stride(from: 0.95, through: 0.5, by: -0.05) {
            if let data = image.jpegData(compressionQuality: quality) {
                if data.count <= targetBytes || quality <= 0.5 {
                    return data
                }
            }
        }

        return image.jpegData(compressionQuality: 0.5)
    }
}
