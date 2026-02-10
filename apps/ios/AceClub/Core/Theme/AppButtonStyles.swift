//
//  AppButtonStyles.swift
//  AceClub
//
//  Styles de boutons cohérents dans l'app.
//

import SwiftUI

// MARK: - Primary (CTA principal : Connexion, Publier, Créer, etc.)

struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity)
            .frame(height: Theme.buttonHeight)
            .foregroundStyle(isEnabled ? .white : Theme.labelTertiary)
            .background(isEnabled ? Theme.tintColor : Theme.borderColor.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
            .opacity(configuration.isPressed ? 0.9 : 1)
    }
}

// MARK: - Secondary (contour : Annuler, Effacer, actions secondaires)

struct SecondaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity)
            .frame(height: Theme.buttonHeight)
            .foregroundStyle(Theme.labelPrimary)
            .background(Theme.primaryBackground)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous)
                    .stroke(Theme.borderColorSubtle, lineWidth: Theme.borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
            .opacity(configuration.isPressed ? 0.9 : 1)
    }
}

// MARK: - Outlined (bouton type "Continuer avec Google")

struct OutlinedButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.medium))
            .frame(maxWidth: .infinity)
            .frame(height: Theme.buttonHeight)
            .foregroundStyle(Theme.labelPrimary)
            .background(Theme.primaryBackground)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous)
                    .stroke(Theme.borderColorSubtle, lineWidth: Theme.borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
            .opacity(configuration.isPressed ? 0.9 : 1)
    }
}

// MARK: - Destructive (Sign out, Supprimer)

struct DestructiveOutlinedButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity)
            .frame(height: Theme.buttonHeight)
            .foregroundStyle(Theme.destructiveColor)
            .background(Theme.primaryBackground)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous)
                    .stroke(Theme.destructiveColor.opacity(0.5), lineWidth: Theme.borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
            .opacity(configuration.isPressed ? 0.9 : 1)
    }
}

// MARK: - Card row (bouton pour lignes type "Publier ma dispo", Organisation)

struct CardRowButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, Theme.paddingCard)
            .padding(.vertical, Theme.paddingButtonVertical)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            .opacity(configuration.isPressed ? 0.9 : 1)
    }
}

// MARK: - Convenience extension

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var appPrimary: PrimaryButtonStyle { PrimaryButtonStyle() }
}

extension ButtonStyle where Self == SecondaryButtonStyle {
    static var appSecondary: SecondaryButtonStyle { SecondaryButtonStyle() }
}

extension ButtonStyle where Self == OutlinedButtonStyle {
    static var appOutlined: OutlinedButtonStyle { OutlinedButtonStyle() }
}

extension ButtonStyle where Self == DestructiveOutlinedButtonStyle {
    static var appDestructiveOutlined: DestructiveOutlinedButtonStyle { DestructiveOutlinedButtonStyle() }
}

extension ButtonStyle where Self == CardRowButtonStyle {
    static var appCardRow: CardRowButtonStyle { CardRowButtonStyle() }
}

// MARK: - Glass Button (pour les actions flottantes)

struct GlassButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.medium))
            .padding(.horizontal, Theme.paddingButtonHorizontal)
            .padding(.vertical, 10)
            .glassEffect(.regular.tint(Theme.accentGreen).interactive(), in: .capsule)
            .opacity(configuration.isPressed ? 0.8 : 1)
    }
}

extension ButtonStyle where Self == GlassButtonStyle {
    static var appGlass: GlassButtonStyle { GlassButtonStyle() }
}
