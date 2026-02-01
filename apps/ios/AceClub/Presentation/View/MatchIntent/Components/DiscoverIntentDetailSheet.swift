//
//  DiscoverIntentDetailSheet.swift
//  AceClub
//

import SwiftUI

struct DiscoverIntentDetailSheet: View {
    let item: MatchIntentDiscoverItem
    let onLike: () -> Void
    let onPass: () -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        if let user = item.user {
            UserProfileSheet(
                profile: user,
                showAvailability: true,
                availabilityContent: {
                    AnyView(availabilitySection)
                },
                actionButtons: {
                    AnyView(actionButtons)
                }
            )
        } else {
            // Fallback si pas d'utilisateur
            ContentUnavailableView(
                "Utilisateur introuvable",
                systemImage: "person.slash",
                description: Text("Les informations de cet utilisateur ne sont pas disponibles.")
            )
        }
    }

    // MARK: - Availability Section

    private var availabilitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Disponibilite")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            VStack(alignment: .leading, spacing: 12) {
                // Type
                detailRow(icon: item.intent.type.icon, title: "Type", value: item.intent.type.displayName)

                // Date
                if let date = item.intent.date {
                    detailRow(icon: "calendar", title: "Date", value: formatFullDate(date))
                }

                // Time
                if let time = item.intent.time {
                    detailRow(icon: "clock", title: "Heure", value: formatTime(time))
                }

                // Duration
                if item.intent.duration > 0 {
                    detailRow(icon: "timer", title: "Duree", value: durationLabel(minutes: item.intent.duration))
                }
            }
            .padding(Theme.paddingCard)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
            }

            // Description if present
            if let description = item.intent.description, !description.isEmpty {
                descriptionSection(description)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func detailRow(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Theme.tintColor)
                .frame(width: 24)

            Text(title)
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)

            Spacer()

            Text(value)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.labelPrimary)
        }
    }

    // MARK: - Description Section

    private func descriptionSection(_ description: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Note")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            Text(description)
                .font(.body)
                .foregroundStyle(Theme.labelSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Theme.paddingCard)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                        .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: 16) {
            // Pass button
            Button {
                onPass()
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .frame(width: 60, height: 60)
                    .background(Theme.cardBackground)
                    .clipShape(Circle())
                    .overlay {
                        Circle()
                            .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)
                    }
            }
            .buttonStyle(.plain)

            // Like button (CTA)
            Button {
                onLike()
                dismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "hand.raised.fill")
                        .font(.body.weight(.semibold))

                    Text("Proposer un match")
                        .font(.body.weight(.semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(
                    LinearGradient(
                        colors: [Theme.tintColor, Theme.tintColor.opacity(0.8)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.vertical, 16)
        .background(.ultraThinMaterial)
    }

    // MARK: - Helpers

    private func formatFullDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEEE d MMMM"
        return formatter.string(from: date).capitalized
    }

    private func formatTime(_ time: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: time)
    }

    private func durationLabel(minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h)h \(m)min" : "\(h)h"
        }
        return "\(minutes) min"
    }
}
