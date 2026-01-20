import Foundation

struct User: Identifiable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String?
    let createdAt: String
    let updatedAt: String
    let role: String?
    let banned: Bool
    let banReason: String?
    let banExpires: String?

    // MARK: - Derived safe accessors
    /// URL construite à partir de `image` si valide, sinon `nil`.
    var imageURL: URL? {
        guard let image, !image.isEmpty else { return nil }
        return URL(string: image)
    }

    /// Indique si l'email est vérifié.
    var isEmailVerified: Bool { emailVerified }

    /// Message convivial pour l'état de vérification.
    var emailVerificationStatusText: String {
        emailVerified ? "Email vérifié" : "Email non vérifié"
    }
}
