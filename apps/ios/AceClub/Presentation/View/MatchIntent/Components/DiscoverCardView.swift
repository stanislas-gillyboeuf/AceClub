//
//  DiscoverCardView.swift
//  AceClub
//

import SwiftUI

struct DiscoverCardView: View {
    let item: MatchIntentDiscoverItem

    private var displayName: String {
        item.user?.name ?? "Joueur"
    }

    private var tier: LevelTier {
        LevelTier.tier(for: item.user?.level ?? 1)
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header section with profile
            profileSection
                .padding(.top, 32)
                .padding(.bottom, 24)

            Divider()
                .padding(.horizontal, Theme.paddingCard)

            // Availability section
            availabilitySection
                .padding(.vertical, 20)
                .padding(.horizontal, Theme.paddingCard)

            Spacer(minLength: 0)

            // Footer hint
            footerHint
                .padding(.bottom, 20)
        }
        .frame(maxWidth: .infinity)
        .frame(minHeight: 480, alignment: .top)
        .cardStyle(cornerRadius: Theme.cornerRadiusLarge, withBorder: true)
        .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 8)
    }

    // MARK: - Profile Section

    private var profileSection: some View {
        VStack(spacing: 16) {
            // Large avatar with tier badge
            largeAvatarWithBadge

            // Name
            Text(displayName)
                .font(.title2.weight(.bold))
                .foregroundStyle(Theme.labelPrimary)
                .lineLimit(1)

            // Level badge
            levelBadge

            // Organization badge (if member of a club)
            if let org = item.user?.organization {
                organizationBadge(org)
            }

            // Distance badge
            if let distance = item.distance {
                distanceBadge(distance)
            }
        }
    }

    private var largeAvatarWithBadge: some View {
        ZStack(alignment: .bottomTrailing) {
            // Avatar
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
                                .font(.system(size: 36, weight: .semibold, design: .rounded))
                                .foregroundStyle(Theme.labelSecondary)
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    Text(item.user?.initials ?? "?")
                        .font(.system(size: 36, weight: .semibold, design: .rounded))
                        .foregroundStyle(Theme.labelSecondary)
                }
            }
            .frame(width: 100, height: 100)
            .clipShape(Circle())
            .overlay {
                Circle()
                    .strokeBorder(tier.color.opacity(0.5), lineWidth: 3)
            }

            // Tier badge
            ZStack {
                Circle()
                    .fill(tier.color)
                    .frame(width: 28, height: 28)

                Image(systemName: tier.icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.white)
            }
            .overlay {
                Circle()
                    .strokeBorder(Theme.cardBackground, lineWidth: 3)
            }
            .offset(x: 4, y: 4)
        }
    }

    private var levelBadge: some View {
        HStack(spacing: 6) {
            Image(systemName: tier.icon)
                .font(.caption.weight(.semibold))
                .foregroundStyle(tier.color)

            Text("Niveau \(item.user?.level ?? 1)")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.labelSecondary)
        }
    }

    private func organizationBadge(_ org: OrganizationBrief) -> some View {
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

    private func distanceBadge(_ distance: Double) -> some View {
        HStack(spacing: 4) {
            Image(systemName: "location.fill")
                .font(.caption2)
                .foregroundStyle(Theme.labelSecondary)

            Text(distance < 1 ? String(format: "%.0f m", distance * 1000) : String(format: "%.1f km", distance))
                .font(.caption.weight(.medium))
                .foregroundStyle(Theme.labelSecondary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(Theme.secondaryBackground)
        .clipShape(Capsule())
    }

    // MARK: - Availability Section

    private var availabilitySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Type badge + date/time in a horizontal layout
            HStack(spacing: 12) {
                typeBadge

                Spacer()

                // Compact date/time display
                if let date = item.intent.date, let time = item.intent.time {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(formatDate(date))
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Theme.labelPrimary)

                        Text(formatTime(time))
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                    }
                }
            }

            // Duration
            if item.intent.duration > 0 {
                HStack(spacing: 6) {
                    Image(systemName: "clock")
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)

                    Text(durationLabel(minutes: item.intent.duration))
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
            }

            // Description if present
            if let description = item.intent.description, !description.isEmpty {
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
                    .lineLimit(3)
                    .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var typeBadge: some View {
        Label(item.intent.type.displayName, systemImage: item.intent.type.icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(item.intent.type == .match ? .blue : Theme.accentOrange)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                (item.intent.type == .match ? Color.blue : Theme.accentOrange)
                    .opacity(0.12)
            )
            .clipShape(Capsule())
    }

    // MARK: - Footer

    private var footerHint: some View {
        HStack(spacing: 8) {
            Image(systemName: "hand.tap")
                .foregroundStyle(Theme.labelTertiary)
            Text("Appuie pour voir le profil")
                .font(.caption)
                .foregroundStyle(Theme.labelTertiary)
        }
        .frame(maxWidth: .infinity, alignment: .center)
    }

    // MARK: - Helpers

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEE d MMM"
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
        return "\(minutes)min"
    }
}
