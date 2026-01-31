import SwiftUI

struct ProfileHeaderCard: View {
    let user: User
    let organizationName: String?
    let level: String?
    let bio: String?
    let playerLevel: Int
    let levelProgress: Double // 0.0 to 1.0
    let totalMatches: Int
    let winRate: Int
    let totalPlayTime: String

    var body: some View {
        VStack(spacing: 0) {
            // Avatar + Info
            HStack(spacing: 16) {
                avatar

                VStack(alignment: .leading, spacing: 4) {
                    Text(user.name.isEmpty ? "—" : user.name)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.primary)

                    if let level, let orgName = organizationName {
                        Text("\(level) · \(orgName)")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    } else if let level {
                        Text(level)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    } else if let orgName = organizationName {
                        Text(orgName)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 16)

            // Level progress
            levelProgressSection
                .padding(.horizontal, 20)
                .padding(.bottom, 20)

            Divider()
                .padding(.horizontal, 20)

            // Stats
            statsSection
                .padding(.vertical, 20)
        }
        .frame(maxWidth: .infinity)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    // MARK: - Stats Section

    private var statsSection: some View {
        HStack(spacing: 0) {
            StatItem(
                icon: "trophy.fill",
                value: "\(totalMatches)",
                label: "Matchs\ntotaux"
            )

            Divider()
                .frame(height: 50)

            StatItem(
                icon: "chart.line.uptrend.xyaxis",
                value: "\(winRate)%",
                label: "Taux de\nvictoire"
            )

            Divider()
                .frame(height: 50)

            StatItem(
                icon: "clock.fill",
                value: totalPlayTime,
                label: "Temps de jeu"
            )
        }
    }

    // MARK: - Avatar

    private var avatar: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            Text(initials(from: user.name))
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            if let imageURL = user.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .tint(.secondary)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .failure:
                        EmptyView()
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(width: 72, height: 72)
        .clipShape(Circle())
    }

    // MARK: - Level Progress

    private var levelProgressSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Niveau \(playerLevel)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)

                Spacer()

                Text("\(Int(levelProgress * 100))%")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4, style: .continuous)
                        .fill(Color(.tertiarySystemFill))
                        .frame(height: 8)

                    RoundedRectangle(cornerRadius: 4, style: .continuous)
                        .fill(Theme.tintColor)
                        .frame(width: geometry.size.width * levelProgress, height: 8)
                }
            }
            .frame(height: 8)
        }
    }

    // MARK: - Helpers

    private func initials(from name: String) -> String {
        let parts =
            name
            .split(whereSeparator: { $0.isWhitespace })
            .prefix(2)
        let letters = parts.compactMap { $0.first }.map { String($0).uppercased() }
        let value = letters.joined()
        return value.isEmpty ? "?" : value
    }
}

// MARK: - Stat Item

private struct StatItem: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.tintColor)

            Text(value)
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(.primary)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
    }
}

