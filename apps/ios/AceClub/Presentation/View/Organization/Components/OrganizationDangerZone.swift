import SwiftUI

struct OrganizationDangerZone: View {
    let organizationName: String
    let canLeaveOrganization: Bool
    let onLeave: () -> Void

    @State private var showLeaveConfirmation = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Zone dangereuse", icon: "exclamationmark.triangle.fill")

            VStack(spacing: 0) {
                Button(role: .destructive) {
                    showLeaveConfirmation = true
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.body)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Quitter l'organisation")
                                .font(.subheadline.weight(.medium))

                            if !canLeaveOrganization {
                                Text("Transférez d'abord la propriété")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        Spacer()

                        if canLeaveOrganization {
                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.tertiary)
                        }
                    }
                    .padding(16)
                }
                .disabled(!canLeaveOrganization)
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(Color.red.opacity(0.3), lineWidth: Theme.borderWidth)
            }
        }
        .confirmationDialog(
            "Quitter l'organisation",
            isPresented: $showLeaveConfirmation
        ) {
            Button("Quitter", role: .destructive) {
                onLeave()
            }
            Button("Annuler", role: .cancel) {}
        } message: {
            Text("Êtes-vous sûr de vouloir quitter \(organizationName) ? Cette action est irréversible.")
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.red)
            .textCase(.uppercase)
    }
}
