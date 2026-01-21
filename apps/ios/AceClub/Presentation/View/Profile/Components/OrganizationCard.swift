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
        Button(action: {
            onTap?()
        }) {
            HStack(spacing: 16) {
                // Organization Logo
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [.purple, .blue]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 70, height: 70)

                    if let logoURL = organization.logoURL {
                        AsyncImage(url: logoURL) { image in
                            image
                                .resizable()
                                .scaledToFill()
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(width: 70, height: 70)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    } else {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.white)
                    }
                }
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)

                VStack(alignment: .leading, spacing: 6) {
                    Text(organization.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                        .lineLimit(1)

                    HStack(spacing: 4) {
                        Image(systemName: "link")
                            .font(.caption2)
                        Text(organization.slug)
                            .font(.subheadline)
                    }
                    .foregroundColor(.secondary)

                    if let role = memberRole {
                        HStack(spacing: 4) {
                            Image(systemName: getRoleIcon(for: role))
                                .font(.caption)
                            Text(role.displayName)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(getRoleColor(for: role))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(getRoleColor(for: role).opacity(0.15))
                        )
                    }
                }

                Spacer()

                // Chevron
                if onTap != nil {
                    Image(systemName: "chevron.right")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func getRoleIcon(for role: MemberRole) -> String {
        switch role {
        case .owner:
            return "crown.fill"
        case .admin:
            return "shield.fill"
        case .member:
            return "person.fill"
        }
    }

    private func getRoleColor(for role: MemberRole) -> Color {
        switch role {
        case .owner:
            return .orange
        case .admin:
            return .blue
        case .member:
            return .green
        }
    }
}
