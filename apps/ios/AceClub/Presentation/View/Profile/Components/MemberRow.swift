import SwiftUI

struct MemberRow: View {
    let member: Member
    let currentUserRole: MemberRole?
    let currentUserId: String?
    let onRoleChange: ((MemberRole) -> Void)?
    let onRemove: (() -> Void)?

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(member.user?.name ?? "Unknown")
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(member.user?.email ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Role badge (simple, sans menu)
            Text(member.role.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(roleColor.opacity(0.15))
                .foregroundColor(roleColor)
                .clipShape(Capsule())
        }
        .padding(.vertical, 4)
    }

    // MARK: - Computed Properties

    private var isCurrentUser: Bool {
        guard let currentUserId else { return false }
        return member.userId == currentUserId
    }

    var canManageRole: Bool {
        // Can't change own role
        guard !isCurrentUser else { return false }
        // Need to be admin or owner to manage roles
        guard let currentUserRole, (currentUserRole == .admin || currentUserRole == .owner) else { return false }
        return true
    }

    var canDelete: Bool {
        // Can't delete yourself
        guard !isCurrentUser else { return false }
        // Can't delete owners
        guard !member.isOwner else { return false }
        // Need to be admin or owner to delete
        guard let currentUserRole, (currentUserRole == .admin || currentUserRole == .owner) else { return false }
        return true
    }

    func canChangeToRole(_ role: MemberRole) -> Bool {
        // Already has this role
        if member.role == role { return false }

        // Only owners can promote to owner or demote owners
        if role == .owner || member.role == .owner {
            return currentUserRole == .owner
        }

        // Admins can change between member and admin
        return true
    }

    var availableRoles: [MemberRole] {
        [MemberRole.member, .admin, .owner].filter { canChangeToRole($0) }
    }

    private var roleColor: Color {
        switch member.role {
        case .owner:
            return .purple
        case .admin:
            return .blue
        case .member:
            return .gray
        }
    }
}
