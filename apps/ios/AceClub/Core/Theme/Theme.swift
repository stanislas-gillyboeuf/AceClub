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
    static let cornerRadiusXLarge: CGFloat = 24
    static let cornerRadiusGlass: CGFloat = 16
    static let glassInset: CGFloat = 12

    // MARK: - Spacing

    static let paddingHorizontal: CGFloat = 20
    static let paddingCard: CGFloat = 16
    static let paddingButtonVertical: CGFloat = 14
    static let paddingButtonHorizontal: CGFloat = 16
    static let buttonHeight: CGFloat = 52

    // MARK: - Border

    static let borderWidth: CGFloat = 1
    static let borderWidthSubtle: CGFloat = 0.5

    // MARK: - Semantic colors (adapt to light/dark)

    static var primaryBackground: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? .systemBackground
                : .secondarySystemBackground
        })
    }

    static var secondaryBackground: Color { Color(.secondarySystemBackground) }

    static var tertiaryBackground: Color { Color(.tertiarySystemBackground) }      
    static var cardBackground: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? .secondarySystemBackground
                : .systemBackground
        })
    }

    static var inputBackground: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor.tertiarySystemBackground 
                : UIColor.systemBackground
        })
    }

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
            .background(Theme.inputBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
    }
}

extension View {
    func inputFieldStyle() -> some View {
        modifier(InputFieldStyle())
    }
}

// MARK: - TextField style (style unifié pour tous les TextFields)

struct AceTextFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.body)
            .padding(.horizontal, 14)
            .padding(.vertical, 14)
            .background(Theme.inputBackground)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}

extension View {
    func aceTextFieldStyle() -> some View {
        modifier(AceTextFieldStyle())
    }
}
