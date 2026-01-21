import SwiftUI

struct InvitationCard: View {
  let invitation: Invitation
  let onAccept: () -> Void
  let onReject: () -> Void

  var body: some View {
    HStack(spacing: 12) {
      VStack(alignment: .leading, spacing: 4) {
        Text(invitation.organizationName ?? "Invitation")
          .font(.subheadline)
          .foregroundColor(.primary)

        Text("as \(invitation.role.displayName)")
          .font(.caption)
          .foregroundColor(.secondary)
      }

      Spacer()

      Button("Reject", action: onReject)
        .font(.caption)
        .fontWeight(.medium)
        .buttonStyle(.bordered)
        .tint(.red)

      Button("Accept", action: onAccept)
        .font(.caption)
        .fontWeight(.medium)
        .buttonStyle(.bordered)
        .tint(.green)
    }
    .padding(.vertical, 8)
  }
}
