//
//  MatchIntentRow.swift
//  AceClub
//

import SwiftUI

struct MatchIntentRow: View {
    let intent: MatchIntent
    let isDeleting: Bool
    let onDelete: () -> Void

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            // Date icon
            VStack(spacing: 2) {
                if let date = intent.date {
                    Text(date, format: .dateTime.day())
                        .font(.title2.weight(.bold))
                        .foregroundStyle(.primary)
                    Text(date, format: .dateTime.month(.abbreviated))
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                } else {
                    Image(systemName: "calendar")
                        .font(.title2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 50)

            // Details
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Label(intent.type.displayName, systemImage: intent.type.icon)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(intent.type == .match ? .blue : .orange)

                    if let time = intent.time {
                        Text("•")
                            .foregroundStyle(.tertiary)
                        Text(time, format: .dateTime.hour().minute())
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.primary)
                    }
                }

                if intent.time == nil {
                    if intent.date != nil {
                        Text("Heure non définie")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    } else {
                        Text("Date non renseignée")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(durationLabel(intent.duration))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if isDeleting {
                ProgressView()
                    .scaleEffect(0.9)
            } else {
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .contentShape(Rectangle())
    }

    private func durationLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "Durée : \(h) h \(m) min" : "Durée : \(h) h"
        }
        return "Durée : \(minutes) min"
    }
}

#Preview {
    VStack(spacing: 0) {
        MatchIntentRow(
            intent: MatchIntent(
                id: "1",
                userId: "user1",
                date: Date(),
                time: Date(),
                duration: 90,
                type: .match,
                description: "Cherche joueur niveau intermédiaire",
                status: .pending,
                createdAt: Date()
            ),
            isDeleting: false,
            onDelete: {}
        )
        Divider()
            .padding(.leading, 16)
        MatchIntentRow(
            intent: MatchIntent(
                id: "2",
                userId: "user1",
                date: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
                time: Calendar.current.date(bySettingHour: 18, minute: 30, second: 0, of: Date()),
                duration: 60,
                type: .training,
                description: nil,
                status: .pending,
                createdAt: Date()
            ),
            isDeleting: false,
            onDelete: {}
        )
    }
    .background(Theme.cardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    .padding()
}
