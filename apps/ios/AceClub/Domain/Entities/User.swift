import Foundation

struct User: Identifiable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String?
    let createdAt: String
    let updatedAt: String
}
