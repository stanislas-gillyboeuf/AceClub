import Foundation
import UIKit

class UploadOrgLogoUseCase {
    private let uploadDataSource = UploadAPIDataSource()

    /// Uploads an organization logo and returns the public URL
    func execute(organizationId: String, image: UIImage) async throws -> String {
        let response = try await uploadDataSource.uploadOrgLogo(organizationId: organizationId, image: image)
        return response.logoUrl
    }
}
