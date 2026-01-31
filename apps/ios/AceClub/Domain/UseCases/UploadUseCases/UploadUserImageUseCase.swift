import Foundation
import UIKit

class UploadUserImageUseCase {
    private let uploadDataSource = UploadAPIDataSource()

    /// Uploads a user profile image and returns the public URL
    func execute(image: UIImage) async throws -> String {
        // 1. Compress the image
        let (imageData, contentType) = try uploadDataSource.compressImage(image)

        // 2. Get presigned URL from API
        let uploadResponse = try await uploadDataSource.getUserImageUploadUrl(contentType: contentType)

        // 3. Upload image to presigned URL
        try await uploadDataSource.uploadImageToPresignedUrl(
            uploadUrl: uploadResponse.uploadUrl,
            imageData: imageData,
            contentType: contentType
        )

        // 4. Return the public URL
        return uploadResponse.imageUrl
    }
}
