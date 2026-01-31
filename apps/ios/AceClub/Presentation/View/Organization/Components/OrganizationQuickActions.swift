import SwiftUI

struct OrganizationQuickActions: View {
    let onInviteMember: () -> Void
    let onEditOrganization: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Actions rapides", icon: "bolt.fill")

            VStack(spacing: 0) {
                actionRow(
                    icon: "person.badge.plus",
                    title: "Inviter un membre",
                    subtitle: "Envoyer une invitation par email",
                    action: onInviteMember
                )

                Divider()
                    .padding(.leading, 52)

                actionRow(
                    icon: "pencil.circle",
                    title: "Modifier le club",
                    subtitle: "Changer le nom ou le slug",
                    action: onEditOrganization
                )
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Subviews

    private func actionRow(icon: String, title: String, subtitle: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(Theme.tintColor)
                    .frame(width: 28)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)

                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(16)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }
}
