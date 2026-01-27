import Foundation

struct User: Identifiable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool?
    let image: String?
    let createdAt: String?
    let updatedAt: String?
    let role: String?
    let banned: Bool?
    let banReason: String?
    let banExpires: String?
    let onboardingCompleted: Bool?

    // MARK: - Derived safe accessors
    /// URL construite à partir de `image` si valide, sinon `nil`.
    var imageURL: URL? {
        guard let image, !image.isEmpty else { return nil }
        return URL(string: image)
    }

    /// Indique si l'email est vérifié.
    var isEmailVerified: Bool { emailVerified ?? false }

    /// Message convivial pour l'état de vérification.
    var emailVerificationStatusText: String {
        (emailVerified ?? false) ? "Email vérifié" : "Email non vérifié"
    }

    /// Indique si l'utilisateur est banni.
    var isBanned: Bool { banned ?? false }

    /// Indique si l'onboarding est complété.
    var isOnboardingCompleted: Bool { onboardingCompleted ?? false }

    /// Nom d'affichage de l'utilisateur
    var displayName: String { name }

    /// Initiales de l'utilisateur pour l'affichage dans les avatars
    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            let firstInitial = components[0].prefix(1)
            let lastInitial = components[1].prefix(1)
            return "\(firstInitial)\(lastInitial)".uppercased()
        } else if let first = components.first {
            return String(first.prefix(2)).uppercased()
        }
        return "??"
    }
}
