import Foundation

struct Member: Identifiable {
    let id: String
    let organizationId: String
    let userId: String
    let role: MemberRole
    let createdAt: String
    let user: User?

    var isOwner: Bool { role == .owner }
    var isAdmin: Bool { role == .admin || role == .owner }
}

enum MemberRole: String, Codable {
    case owner
    case admin
    case member

    var displayName: String {
        switch self {
        case .owner: return "Propriétaire"
        case .admin: return "Administrateur"
        case .member: return "Membre"
        }
    }
}
