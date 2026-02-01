import SwiftUI

struct OrganizationStatsCard: View {
    let membersCount: Int
    let createdAt: String
    let pendingInvitationsCount: Int
    let isAdmin: Bool
    let organizationStats: OrganizationStats?

    var body: some View {
        VStack(spacing: 0) {
            // Primary stats row
            HStack(spacing: 0) {
                statItem(
                    icon: "person.3.fill",
                    value: "\(membersCount)",
                    label: "Membres"
                )

                divider

                statItem(
                    icon: "calendar",
                    value: formattedDate,
                    label: "Création"
                )

                // Pending invitations (admins only)
                if isAdmin && pendingInvitationsCount > 0 {
                    divider

                    statItem(
                        icon: "envelope.badge",
                        value: "\(pendingInvitationsCount)",
                        label: "En attente"
                    )
                }
            }
            .padding(.vertical, 16)

            // Advanced stats for admins
            if isAdmin, let stats = organizationStats {
                Divider()

                HStack(spacing: 0) {
                    statItem(
                        icon: "sportscourt.fill",
                        value: "\(stats.matchesThisMonth)",
                        label: "Matchs ce mois"
                    )

                    divider

                    statItem(
                        icon: "figure.run",
                        value: "\(stats.activeMembers)",
                        label: "Actifs"
                    )

                    divider

                    statItem(
                        icon: "chart.line.uptrend.xyaxis",
                        value: "\(stats.activityRate)%",
                        label: "Activité"
                    )
                }
                .padding(.vertical, 16)
            }
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    // MARK: - Subviews

    private func statItem(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.tintColor)

            Text(value)
                .font(.system(size: 18, weight: .bold, design: .rounded))

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Divider()
            .frame(height: 50)
    }

    // MARK: - Helpers

    private var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = formatter.date(from: createdAt) else {
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: createdAt) else {
                return createdAt
            }
            return formatDateToString(date)
        }
        return formatDateToString(date)
    }

    private func formatDateToString(_ date: Date) -> String {
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "MMM yyyy"
        displayFormatter.locale = Locale(identifier: "fr_FR")
        return displayFormatter.string(from: date)
    }
}
