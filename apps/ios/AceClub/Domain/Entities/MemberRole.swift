import Foundation

enum MemberRole: String, CaseIterable, Identifiable {
    case owner
    case admin
    case member

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .owner: return "Propriétaire"
        case .admin: return "Admin"
        case .member: return "Membre"
        }
    }
}
