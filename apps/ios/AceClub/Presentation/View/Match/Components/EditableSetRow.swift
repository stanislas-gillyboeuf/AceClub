//
//  EditableSetRow.swift
//  AceClub
//
//  Created by Nicolas Becharat on 23/01/2026.
//

import SwiftUI

struct EditableSetRow: View {
    let setNumber: Int
    @Binding var homeScore: Int
    @Binding var awayScore: Int
    let canRemove: Bool
    let onRemove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header avec numéro du set et bouton supprimer
            HStack {
                Text("Set \(setNumber)")
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                if canRemove {
                    Button(role: .destructive, action: onRemove) {
                        Image(systemName: "minus.circle.fill")
                            .foregroundStyle(.red)
                            .font(.title3)
                    }
                }
            }

            // Scores avec TextField et boutons +/-
            HStack(spacing: 16) {
                // Score Domicile
                VStack(alignment: .leading, spacing: 8) {
                    Text("Domicile")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 8) {
                        Button {
                            if homeScore > 0 {
                                homeScore -= 1
                            }
                        } label: {
                            Image(systemName: "minus.circle")
                                .font(.title3)
                        }
                        .disabled(homeScore <= 0)

                        TextField("0", value: $homeScore, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .font(.body)
                            .fontWeight(.semibold)
                            .frame(width: 60)
                            .textFieldStyle(.roundedBorder)

                        Button {
                            homeScore += 1
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.title3)
                        }
                    }
                }

                Text(":")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                    .padding(.top, 20)

                // Score Extérieur
                VStack(alignment: .leading, spacing: 8) {
                    Text("Extérieur")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 8) {
                        Button {
                            if awayScore > 0 {
                                awayScore -= 1
                            }
                        } label: {
                            Image(systemName: "minus.circle")
                                .font(.title3)
                        }
                        .disabled(awayScore <= 0)

                        TextField("0", value: $awayScore, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .font(.body)
                            .fontWeight(.semibold)
                            .frame(width: 60)
                            .textFieldStyle(.roundedBorder)

                        Button {
                            awayScore += 1
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.title3)
                        }
                    }
                }
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    VStack {
        EditableSetRow(
            setNumber: 1,
            homeScore: .constant(11),
            awayScore: .constant(9),
            canRemove: true,
            onRemove: {}
        )

        Divider()

        EditableSetRow(
            setNumber: 2,
            homeScore: .constant(0),
            awayScore: .constant(0),
            canRemove: false,
            onRemove: {}
        )
    }
    .padding()
}
