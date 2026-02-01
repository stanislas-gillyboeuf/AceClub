//
//  UserProfileSheet.swift
//  AceClub
//
//  Composant partagé pour afficher le profil utilisateur
//

import SwiftUI

// MARK: - User Profile Data Protocol

protocol UserProfileData {
    var profileName: String { get }
    var profileImageURL: URL? { get }
    var profileLevel: Int { get }
    var profileInitials: String { get }
    var profileOrganizationName: String? { get }
    var profileTotalAces: Int { get }
    var profileTitle: String? { get }
    var profileBadges: [UserProfileBadge] { get }
    var profileCurrentStreak: Int { get }
    var profileLongestStreak: Int { get }
    var profileGlobalRank: Int? { get }
}

struct UserProfileBadge: Identifiable {
    var id: String { code }
    let code: String
    let imageUrl: String
    let localizedName: String

    var imageURL: URL? {
        URL(string: imageUrl)
    }
}

// MARK: - User Profile Sheet

struct UserProfileSheet: View {
    let profile: UserProfileData
    let showAvailability: Bool
    let availabilityContent: (() -> AnyView)?
    let actionButtons: (() -> AnyView)?

    @Environment(\.dismiss) private var dismiss

    init(
        profile: UserProfileData,
        showAvailability: Bool = false,
        availabilityContent: (() -> AnyView)? = nil,
        actionButtons: (() -> AnyView)? = nil
    ) {
        self.profile = profile
        self.showAvailability = showAvailability
        self.availabilityContent = availabilityContent
        self.actionButtons = actionButtons
    }

    private var tier: LevelTier {
        LevelTier.tier(for: profile.profileLevel)
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

                    // Availability section (optional - for discover)
                    if showAvailability, let content = availabilityContent {
                        content()
                    }

                    // Statistiques section
                    statistiquesSection

                    // Badges section (if any)
                    if !profile.profileBadges.isEmpty {
                        badgesSection
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.bottom, actionButtons != nil ? 100 : 32)
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
                if let buttons = actionButtons {
                    buttons()
                }
            }
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Large avatar
            largeAvatar

            // Name
            Text(profile.profileName)
                .font(.title.weight(.bold))
                .foregroundStyle(Theme.labelPrimary)

            // Level with tier
            HStack(spacing: 8) {
                Image(systemName: tier.icon)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(tier.color)

                Text("Niveau \(profile.profileLevel) \u{2022} \(tier.displayName)")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.labelSecondary)
            }

            // Organization badge if present
            if let orgName = profile.profileOrganizationName {
                HStack(spacing: 6) {
                    Image(systemName: "building.2.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.tintColor)

                    Text(orgName)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.tintColor)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Theme.tintColor.opacity(0.1))
                .clipShape(Capsule())
            }

            // Title badge if present
            if let title = profile.profileTitle {
                HStack(spacing: 6) {
                    Image(systemName: "rosette")
                        .font(.caption)
                        .foregroundStyle(Theme.tintColor)

                    Text(title)
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

            if let url = profile.profileImageURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .empty:
                        ProgressView()
                            .tint(Theme.tintColor)
                    case .failure:
                        Text(profile.profileInitials)
                            .font(.system(size: 44, weight: .semibold, design: .rounded))
                            .foregroundStyle(Theme.labelSecondary)
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                Text(profile.profileInitials)
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

            statItem(icon: "star.fill", value: "\(profile.profileLevel)", label: "Niveau")
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

    // MARK: - Statistiques Section

    private var statistiquesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Statistiques")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            VStack(alignment: .leading, spacing: 12) {
                // Nom
                detailRow(icon: "person.fill", title: "Nom", value: profile.profileName)

                // Niveau
                detailRow(icon: "star.fill", title: "Niveau", value: "\(profile.profileLevel)")

                // Total Aces
                if profile.profileTotalAces > 0 {
                    detailRow(icon: "bolt.fill", title: "Aces totaux", value: "\(profile.profileTotalAces)")
                }

                // Classement
                if let rank = profile.profileGlobalRank {
                    detailRow(icon: "trophy.fill", title: "Classement", value: "#\(rank)")
                }

                // Streak
                if profile.profileCurrentStreak > 0 {
                    detailRow(icon: "flame.fill", title: "Serie en cours", value: "\(profile.profileCurrentStreak) sem.")
                }

                // Record streak
                if profile.profileLongestStreak > 0 {
                    detailRow(icon: "crown.fill", title: "Record serie", value: "\(profile.profileLongestStreak) sem.")
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

    // MARK: - Badges Section

    private var badgesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Badges")
                .font(.headline)
                .foregroundStyle(Theme.labelPrimary)

            HStack(spacing: 16) {
                ForEach(profile.profileBadges.prefix(4)) { badge in
                    VStack(spacing: 6) {
                        if let url = badge.imageURL {
                            AsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .scaledToFit()
                            } placeholder: {
                                Circle()
                                    .fill(Color(.tertiarySystemFill))
                            }
                            .frame(width: 48, height: 48)
                            .clipShape(Circle())
                        }

                        Text(badge.localizedName)
                            .font(.caption2)
                            .foregroundStyle(Theme.labelSecondary)
                            .lineLimit(1)
                    }
                }
                Spacer()
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
}
