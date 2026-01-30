//
//  LevelTier.swift
//  AceClub
//

import SwiftUI

enum LevelTier: String, CaseIterable {
    case bronze
    case silver
    case gold
    case platinum
    case diamond

    static func tier(for level: Int) -> LevelTier {
        switch level {
        case 1...10:
            return .bronze
        case 11...25:
            return .silver
        case 26...50:
            return .gold
        case 51...75:
            return .platinum
        default:
            return .diamond
        }
    }

    var color: Color {
        switch self {
        case .bronze:
            return Color(red: 0.804, green: 0.498, blue: 0.196) // #CD7F32
        case .silver:
            return Color(red: 0.753, green: 0.753, blue: 0.753) // #C0C0C0
        case .gold:
            return Color(red: 1.0, green: 0.843, blue: 0.0) // #FFD700
        case .platinum:
            return Color(red: 0.898, green: 0.894, blue: 0.886) // #E5E4E2
        case .diamond:
            return Color(red: 0.725, green: 0.949, blue: 1.0) // #B9F2FF
        }
    }

    var icon: String {
        switch self {
        case .bronze, .silver:
            return "circle.fill"
        case .gold:
            return "star.fill"
        case .platinum, .diamond:
            return "diamond.fill"
        }
    }

    var displayName: String {
        switch self {
        case .bronze:
            return "Bronze"
        case .silver:
            return "Argent"
        case .gold:
            return "Or"
        case .platinum:
            return "Platine"
        case .diamond:
            return "Diamant"
        }
    }
}
