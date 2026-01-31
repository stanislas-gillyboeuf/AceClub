import Foundation
import UIKit

class UploadOrgLogoUseCase {
    private let uploadDataSource = UploadAPIDataSource()

    /// Uploads an organization logo and returns the public URL
    func execute(organizationId: String, image: UIImage) async throws -> String {
        // 1. Compress the image
        let (imageData, contentType) = try uploadDataSource.compressImage(image)

        // 2. Get presigned URL from API
        let uploadResponse = try await uploadDataSource.getOrgLogoUploadUrl(
            organizationId: organizationId,
            contentType: contentType
        )

        // 3. Upload image to presigned URL
        try await uploadDataSource.uploadImageToPresignedUrl(
            uploadUrl: uploadResponse.uploadUrl,
            imageData: imageData,
            contentType: contentType
        )

        // 4. Return the public URL
        return uploadResponse.logoUrl
    }
}
