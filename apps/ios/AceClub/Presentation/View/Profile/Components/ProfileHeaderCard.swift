import SwiftUI

struct ProfileHeaderCard: View {
    let user: User
    let organizationName: String?
    let level: String?
    let bio: String?
    let totalMatches: Int
    let winRate: Int
    let monthlyMatches: Int

    var body: some View {
        VStack(spacing: 16) {
            avatar

            Text(user.name.isEmpty ? "—" : user.name)
                .font(.title2.weight(.semibold))
                .foregroundStyle(.primary)

            if let level {
                Text(level)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.tintColor)
            }

            if let orgName = organizationName {
                HStack(spacing: 6) {
                    Image(systemName: "mappin.circle.fill")
                        .foregroundStyle(Theme.tintColor)
                    Text(orgName)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.tintColor)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Theme.tintColor.opacity(0.1))
                .clipShape(Capsule())
            }

            // Stats
            statsRow
                .padding(.top, 8)
        }
        .padding(.vertical, 24)
        .padding(.horizontal, Theme.paddingCard)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Avatar avec badge

    private var avatar: some View {
        ZStack(alignment: .bottomTrailing) {

            Circle()
                .fill(Color(.tertiarySystemFill))

            Text(initials(from: user.name))
                .font(.system(size: 36, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            if let imageURL = user.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .tint(Theme.tintColor)
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
        }.frame(width: 100, height: 100)
            .clipShape(Circle())
            .overlay {
                Circle()
                    .strokeBorder(Theme.tintColor.opacity(0.3), lineWidth: 2)
            }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 0) {
            StatItem(icon: "trophy.fill", value: "\(totalMatches)", label: "Matchs")

            Divider()
                .frame(height: 40)

            StatItem(icon: "chart.line.uptrend.xyaxis", value: "\(winRate)%", label: "Victoires")

            Divider()
                .frame(height: 40)

            StatItem(icon: "rosette", value: "\(monthlyMatches)", label: "Ce mois")
        }
        .padding(.vertical, 12)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: 1)
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
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.tintColor)

            Text(value)
                .font(.title2.weight(.bold))
                .foregroundStyle(.primary)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}
