import Foundation
import UIKit


class UploadUserImageUseCase {
    private let uploadDataSource = UploadAPIDataSource()

    func execute(image: UIImage) async throws -> String {
        let response = try await uploadDataSource.uploadUserImage(image)
        return response.imageUrl
    }
}

