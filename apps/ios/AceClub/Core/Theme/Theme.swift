//
//  Theme.swift
//  AceClub
//
//  Design tokens pour cohérence boutons, bordures, backgrounds.
//

import SwiftUI

enum Theme {

    // MARK: - Corner radius

    static let cornerRadiusSmall: CGFloat = 8
    static let cornerRadiusMedium: CGFloat = 12
    static let cornerRadiusLarge: CGFloat = 16

    // MARK: - Spacing

    static let paddingHorizontal: CGFloat = 20
    static let paddingCard: CGFloat = 16
    static let paddingButtonVertical: CGFloat = 14
    static let paddingButtonHorizontal: CGFloat = 16
    static let buttonHeight: CGFloat = 50

    // MARK: - Border

    static let borderWidth: CGFloat = 1
    static let borderWidthSubtle: CGFloat = 0.5

    // MARK: - Semantic colors (adapt to light/dark)

    static var primaryBackground: Color { Color(.systemGray6) }
    static var secondaryBackground: Color { Color(.systemBackground)}
    static var tertiaryBackground: Color { Color(.systemGray5) }
    static var cardBackground: Color { Color(.systemGray6) }
    static var borderColor: Color { Color(.systemGray5) }
    static var borderColorSubtle: Color { Color.secondary.opacity(0.3) }
    static var labelPrimary: Color { Color.primary }
    static var labelSecondary: Color { Color.secondary }
    static var labelTertiary: Color { Color(.tertiaryLabel) }
    static var tintColor: Color { Color.accentColor }
    static var destructiveColor: Color { Color.red }
}

// MARK: - Card style

struct CardStyle: ViewModifier {
    var cornerRadius: CGFloat = Theme.cornerRadiusMedium
    var withBorder: Bool = false

    func body(content: Content) -> some View {
        content
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay {
                if withBorder {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                }
            }
    }
}

extension View {
    func cardStyle(cornerRadius: CGFloat = Theme.cornerRadiusMedium, withBorder: Bool = false) -> some View {
        modifier(CardStyle(cornerRadius: cornerRadius, withBorder: withBorder))
    }
}

// MARK: - Input / field container (champs de formulaire, search)

struct InputFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Theme.secondaryBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
    }
}

extension View {
    func inputFieldStyle() -> some View {
        modifier(InputFieldStyle())
    }
}
