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

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header

            Divider()

            availabilitySection

            Spacer(minLength: 0)

            footerHint
        }
        .padding(Theme.paddingCard)
        .frame(maxWidth: .infinity)
        .frame(minHeight: 420, alignment: .topLeading)
        .cardStyle(cornerRadius: Theme.cornerRadiusLarge, withBorder: true)
        .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 8)
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 12) {
            avatarWithLevelBadge

            VStack(alignment: .leading, spacing: 3) {
                Text(displayName)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.labelPrimary)
                    .lineLimit(1)

                if let user = item.user {
                    levelLabel(for: user.level)
                }
            }

            Spacer(minLength: 0)

            typeBadge
        }
    }

    private func levelLabel(for level: Int) -> some View {
        let tier = LevelTier.tier(for: level)
        return HStack(spacing: 4) {
            Image(systemName: tier.icon)
                .font(.caption2)
                .foregroundStyle(tier.color)
            Text("Niveau \(level)")
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)
        }
    }

    private var typeBadge: some View {
        Label(item.intent.type.displayName, systemImage: item.intent.type.icon)
            .font(.caption.weight(.semibold))
            .foregroundStyle(item.intent.type == .match ? .blue : .orange)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                (item.intent.type == .match ? Color.blue : Color.orange)
                    .opacity(0.12)
            )
            .clipShape(Capsule())
    }

    private var availabilitySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Disponibilité")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            VStack(alignment: .leading, spacing: 8) {
                if let date = item.intent.date {
                    infoLine(icon: "calendar", title: date.formatted(date: .abbreviated, time: .omitted))
                } else {
                    infoLine(icon: "calendar", title: "Date à définir")
                }

                if let time = item.intent.time {
                    infoLine(icon: "clock", title: time.formatted(date: .omitted, time: .shortened))
                } else {
                    infoLine(icon: "clock", title: "Heure à définir")
                }

                if item.intent.duration > 0 {
                    infoLine(icon: "timer", title: durationLabel(minutes: item.intent.duration))
                }
            }

            if let description = item.intent.description, !description.isEmpty {
                Divider()
                    .padding(.vertical, 4)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Note")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.labelSecondary)

                    Text(description)
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelPrimary)
                        .lineLimit(3)
                }
            }
        }
    }

    private var footerHint: some View {
        HStack(spacing: 8) {
            Image(systemName: "hand.draw")
                .foregroundStyle(Theme.labelTertiary)
            Text("Glisse pour passer ou liker")
                .font(.caption)
                .foregroundStyle(Theme.labelTertiary)
        }
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.top, 4)
    }

    private var avatar: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            Text(initials(from: displayName))
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundStyle(Theme.labelSecondary)
        }
        .frame(width: 44, height: 44)
        .overlay {
            Circle()
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .accessibilityLabel("Avatar")
    }

    private var avatarWithLevelBadge: some View {
        let tier = LevelTier.tier(for: item.user?.level ?? 1)
        return ZStack(alignment: .bottomTrailing) {
            avatar

            ZStack {
                Circle()
                    .fill(tier.color)
                    .frame(width: 18, height: 18)

                Image(systemName: tier.icon)
                    .font(.system(size: 8, weight: .bold))
                    .foregroundStyle(.white)
            }
            .overlay {
                Circle()
                    .strokeBorder(Theme.cardBackground, lineWidth: 2)
            }
            .offset(x: 2, y: 2)
        }
    }

    private func durationLabel(minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h)h \(m)min" : "\(h)h"
        }
        return "\(minutes)min"
    }

    private func infoLine(icon: String, title: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline)
            .foregroundStyle(Theme.labelPrimary)
    }

    private func initials(from name: String) -> String {
        let parts = name
            .split(whereSeparator: { $0.isWhitespace })
            .prefix(2)
        let letters = parts.compactMap { $0.first }.map { String($0).uppercased() }
        let value = letters.joined()
        return value.isEmpty ? "?" : value
    }
}