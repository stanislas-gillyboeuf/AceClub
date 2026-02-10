import SwiftUI

struct PendingInvitationRow: View {
    let invitation: Invitation
    let onCancel: () -> Void
    let onResend: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(invitation.email)
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 4) {
                    Text(invitation.role.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("•")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(statusText)
                        .font(.caption)
                        .foregroundColor(statusColor)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 8) {
                Button("Renvoyer") {
                    onResend()
                }
                .font(.caption)
                .buttonStyle(.bordered)
                .tint(.blue)

                Button("Annuler") {
                    onCancel()
                }
                .font(.caption)
                .buttonStyle(.bordered)
                .tint(.red)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Computed Properties

    private var statusText: String {
        if invitation.isExpired {
            return "Expirée"
        } else {
            return "En attente"
        }
    }

    private var statusColor: Color {
        if invitation.isExpired {
            return .red
        } else {
            return Theme.accentOrange
        }
    }
}
