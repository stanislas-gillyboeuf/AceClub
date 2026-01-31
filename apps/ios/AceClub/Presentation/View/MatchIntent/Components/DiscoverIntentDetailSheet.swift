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

    private var displayName: String {
        item.user?.name ?? "Joueur"
    }

    private var tier: LevelTier {
        LevelTier.tier(for: item.user?.level ?? 1)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile header
                    profileHeader
                        .padding(.top, 8)

                    // Stats row
                    statsRow

                    Divider()

                    // Availability details
                    availabilitySection

                    // Description if present
                    if let description = item.intent.description, !description.isEmpty {
                        descriptionSection(description)
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.bottom, 100)
            }
            .navigationTitle("Profil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fermer") {
                        dismiss()
                    }
                    .foregroundStyle(Theme.tintColor)
                }
            }
            .safeAreaInset(edge: .bottom) {
                actionButtons
            }
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Large avatar
            largeAvatar

            // Name
            Text(displayName)
                .font(.title.weight(.bold))
                .foregroundStyle(Theme.labelPrimary)

            // Level
            HStack(spacing: 8) {
                Image(systemName: tier.icon)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(tier.color)

                Text("Niveau \(item.user?.level ?? 1) • \(tier.displayName)")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.labelSecondary)
            }

            // Organization
            if let org = item.user?.organization {
                HStack(spacing: 6) {
                    Image(systemName: "building.2.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.tintColor)

                    Text(org.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.tintColor)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Theme.tintColor.opacity(0.1))
                .clipShape(Capsule())
            }
        }
    }

    private var largeAvatar: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            if let imageURL = item.user?.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .empty:
                        ProgressView()
                            .tint(Theme.tintColor)
                    case .failure:
                        Text(item.user?.initials ?? "?")
                            .font(.system(size: 44, weight: .semibold, design: .rounded))
                            .foregroundStyle(Theme.labelSecondary)
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                Text(item.user?.initials ?? "?")
                    .font(.system(size: 44, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.labelSecondary)
            }
        }
        .frame(width: 120, height: 120)
        .clipShape(Circle())
        .overlay {
            Circle()
                .strokeBorder(tier.color.opacity(0.5), lineWidth: 4)
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 0) {
            statItem(icon: "sportscourt", value: "--", label: "Matchs")

            Divider()
                .frame(height: 40)

            statItem(icon: "chart.line.uptrend.xyaxis", value: "--%", label: "Victoires")

            Divider()
                .frame(height: 40)

            statItem(icon: "calendar", value: formatShortDate(item.intent.date), label: "Dispo")
        }
        .padding(.vertical, 12)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private func statItem(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.tintColor)

            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(Theme.labelPrimary)

            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.labelSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Availability Section

    private var availabilitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Disponibilité")
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
                    detailRow(icon: "timer", title: "Durée", value: durationLabel(minutes: item.intent.duration))
                }
            }
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

    private func formatShortDate(_ date: Date?) -> String {
        guard let date = date else { return "--" }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "d MMM"
        return formatter.string(from: date)
    }

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
