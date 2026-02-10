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

    private var tier: LevelTier {
        LevelTier.tier(for: item.user?.level ?? 1)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    heroPhoto
                        .frame(height: 400)
                        .clipped()

                    VStack(spacing: 20) {
                        profileInfo
                            .padding(.top, 20)

                        Divider()

                        availabilitySection

                        if let desc = item.intent.description, !desc.isEmpty {
                            descriptionSection(desc)
                        }
                    }
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.bottom, 100)
                }
            }
            .ignoresSafeArea(edges: .top)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fermer") { dismiss() }
                        .foregroundStyle(Theme.tintColor)
                }
            }
            .safeAreaInset(edge: .bottom) {
                actionButtons
            }
        }
    }

    // MARK: - Hero Photo

    private var heroPhoto: some View {
        ZStack(alignment: .bottom) {
            photoOrFallback

            LinearGradient(
                colors: [.clear, Theme.primaryBackground],
                startPoint: .center,
                endPoint: .bottom
            )
            .frame(height: 120)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private var photoOrFallback: some View {
        if let imageURL = item.user?.imageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                case .empty:
                    fallbackGradient.overlay { ProgressView().tint(.white) }
                case .failure:
                    fallbackGradient
                @unknown default:
                    fallbackGradient
                }
            }
        } else {
            fallbackGradient
        }
    }

    private var fallbackGradient: some View {
        ZStack {
            LinearGradient(
                colors: [tier.color.opacity(0.7), tier.color.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Text(item.user?.initials ?? "?")
                .font(.system(size: 80, weight: .bold, design: .rounded))
                .foregroundStyle(.white.opacity(0.6))
        }
    }

    // MARK: - Profile Info

    private var profileInfo: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text(item.user?.name ?? "Joueur")
                    .font(.title.weight(.bold))
                    .foregroundStyle(Theme.labelPrimary)

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: tier.icon)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(tier.color)
                    Text("Niv. \(item.user?.level ?? 1)")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.labelSecondary)
                }
            }

            if let org = item.user?.organization {
                HStack(spacing: 6) {
                    Image(systemName: "building.2.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.tintColor)
                    Text(org.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.tintColor)
                }
            }

            if let distance = item.distance {
                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.labelSecondary)
                    Text(distance < 1
                        ? String(format: "%.0f m", distance * 1000)
                        : String(format: "%.1f km", distance))
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.labelSecondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Availability Section

    private var availabilitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Disponibilité")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            VStack(alignment: .leading, spacing: 12) {
                detailRow(icon: item.intent.type.icon, title: "Type", value: item.intent.type.displayName)

                if let date = item.intent.date {
                    detailRow(icon: "calendar", title: "Date", value: formatFullDate(date))
                }

                if let time = item.intent.time {
                    detailRow(icon: "clock", title: "Heure", value: formatTime(time))
                }

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
            Button {
                onPass()
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Theme.destructiveColor)
                    .frame(width: 60, height: 60)
                    .glassEffect(.regular.interactive(), in: .circle)
            }
            .buttonStyle(.plain)

            Button {
                onLike()
                dismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "tennis.racket")
                        .font(.body.weight(.semibold))

                    Text("Proposer un match")
                        .font(.body.weight(.semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .glassEffect(.regular.tint(Theme.accentGreen).interactive(), in: RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium))
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
