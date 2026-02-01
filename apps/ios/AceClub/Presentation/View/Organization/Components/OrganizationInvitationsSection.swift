import SwiftUI

struct OrganizationInvitationsSection: View {
    let invitations: [Invitation]
    let onCancel: (Invitation) -> Void
    let onResend: (Invitation) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Invitations en attente (\(invitations.count))", icon: "envelope.badge.fill")

            VStack(spacing: 0) {
                ForEach(Array(invitations.enumerated()), id: \.element.id) { index, invitation in
                    VStack(spacing: 0) {
                        PendingInvitationRow(
                            invitation: invitation,
                            onCancel: { onCancel(invitation) },
                            onResend: { onResend(invitation) }
                        )
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)

                        if index < invitations.count - 1 {
                            Divider()
                                .padding(.leading, 16)
                        }
                    }
                }
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }
}
