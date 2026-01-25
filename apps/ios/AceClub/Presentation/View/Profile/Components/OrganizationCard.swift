import SwiftUI

struct OrganizationCard: View {
    let organization: Organization
    let memberRole: MemberRole?
    let onTap: (() -> Void)?

    init(organization: Organization, memberRole: MemberRole? = nil, onTap: (() -> Void)? = nil) {
        self.organization = organization
        self.memberRole = memberRole
        self.onTap = onTap
    }

    var body: some View {
        cardContent
    }

    @ViewBuilder
    private var cardContent: some View {
        if let onTap = onTap {
            Button(action: onTap) {
                cardView(showChevron: true)
            }
            .buttonStyle(PlainButtonStyle())
        } else {
            cardView(showChevron: true)
        }
    }

    private func cardView(showChevron: Bool) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(organization.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)

                if let role = memberRole {
                    Text(role.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            if showChevron {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}
