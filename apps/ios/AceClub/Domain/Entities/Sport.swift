import Foundation

enum Sport: String, CaseIterable, Identifiable, Codable {
    case tennis
    case padel

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .tennis: return "Tennis"
        case .padel: return "Padel"
        }
    }

    /// SF Symbol name
    var icon: String {
        switch self {
        case .tennis: return "figure.tennis"
        case .padel: return "figure.tennis" // iOS doesn't ship a padel symbol
        }
    }
}

