//
//  SetScoreEditorRow.swift
//  AceClub
//
//  Composant d'édition de score pour un set - Style scoreboard moderne
//

import SwiftUI

struct SetScoreEditorRow: View {
    let setNumber: Int
    let homeName: String
    let awayName: String
    @Binding var homeScore: Int
    @Binding var awayScore: Int
    let canDelete: Bool
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            // Header du set
            HStack {
                Text("Set \(setNumber)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)

                Spacer()

                if canDelete {
                    Button(action: onDelete) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 22))
                            .symbolRenderingMode(.hierarchical)
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                }
            }

            // Scoreboard
            HStack(spacing: 12) {
                // Joueur Home
                playerScoreCard(
                    name: homeName,
                    score: $homeScore,
                    isLeading: homeScore > awayScore,
                    accentColor: .blue
                )

                // Séparateur VS
                VStack(spacing: 4) {
                    Text("VS")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(.tertiary)
                }
                .frame(width: 32)

                // Joueur Away
                playerScoreCard(
                    name: awayName,
                    score: $awayScore,
                    isLeading: awayScore > homeScore,
                    accentColor: Theme.accentOrange
                )
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
    }

    @ViewBuilder
    private func playerScoreCard(
        name: String,
        score: Binding<Int>,
        isLeading: Bool,
        accentColor: Color
    ) -> some View {
        VStack(spacing: 12) {
            // Nom du joueur
            HStack(spacing: 4) {
                if isLeading {
                    Image(systemName: "chevron.right")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(accentColor)
                }

                Text(name)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(isLeading ? .primary : .secondary)
                    .lineLimit(1)
            }

            // Score stepper
            ScoreStepperView(
                value: score,
                minValue: 0,
                maxValue: 99,
                accentColor: accentColor
            )
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    VStack(spacing: 16) {
        SetScoreEditorRow(
            setNumber: 1,
            homeName: "Nicolas",
            awayName: "Thomas",
            homeScore: .constant(6),
            awayScore: .constant(4),
            canDelete: true,
            onDelete: {}
        )

        SetScoreEditorRow(
            setNumber: 2,
            homeName: "Nicolas",
            awayName: "Thomas",
            homeScore: .constant(3),
            awayScore: .constant(6),
            canDelete: true,
            onDelete: {}
        )

        SetScoreEditorRow(
            setNumber: 3,
            homeName: "Nicolas",
            awayName: "Thomas",
            homeScore: .constant(0),
            awayScore: .constant(0),
            canDelete: false,
            onDelete: {}
        )
    }
    .padding()
    .background(Theme.primaryBackground)
}
