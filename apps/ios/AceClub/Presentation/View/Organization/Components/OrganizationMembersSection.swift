import SwiftUI

struct OrganizationMembersSection: View {
    let members: [Member]
    let currentUserRole: MemberRole?
    let currentUserId: String?
    let isLoading: Bool
    let canManageMembers: Bool
    let onRoleChange: (Member, MemberRole) -> Void
    let onRemove: (Member) -> Void

    @State private var memberToDelete: Member?
    @State private var showDeleteConfirmation = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Membres (\(members.count))", icon: "person.3.fill")

            if isLoading && members.isEmpty {
                loadingView
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            } else if members.isEmpty {
                emptyView
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            } else {
                List {
                    ForEach(members) { member in
                        let memberRow = MemberRow(
                            member: member,
                            currentUserRole: currentUserRole,
                            currentUserId: currentUserId,
                            onRoleChange: nil,
                            onRemove: nil
                        )

                        memberRow
                            .listRowBackground(Theme.cardBackground)
                            .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16))
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                if canDeleteMember(member) {
                                    Button(role: .destructive) {
                                        memberToDelete = member
                                        showDeleteConfirmation = true
                                    } label: {
                                        Label("Supprimer", systemImage: "trash")
                                    }
                                }
                            }
                            .swipeActions(edge: .leading, allowsFullSwipe: false) {
                                if canManageMembers && memberRow.canManageRole {
                                    ForEach(availableRoles(for: member), id: \.self) { role in
                                        Button {
                                            onRoleChange(member, role)
                                        } label: {
                                            Label(role.displayName, systemImage: roleIcon(for: role))
                                        }
                                        .tint(roleColor(for: role))
                                    }
                                }
                            }
                    }
                }
                .listStyle(.plain)
                .scrollDisabled(true)
                .frame(height: CGFloat(members.count * 75))
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }
        }
        .confirmationDialog(
            "Supprimer ce membre ?",
            isPresented: $showDeleteConfirmation,
            presenting: memberToDelete
        ) { member in
            Button("Supprimer", role: .destructive) {
                onRemove(member)
                memberToDelete = nil
            }
            Button("Annuler", role: .cancel) {
                memberToDelete = nil
            }
        } message: { member in
            Text("Cette action supprimera \(member.user?.name ?? "ce membre") de l'organisation.")
        }
    }

    // MARK: - Subviews

    private var loadingView: some View {
        HStack {
            Spacer()
            ProgressView()
            Spacer()
        }
        .padding(.vertical, 24)
    }

    private var emptyView: some View {
        Text("Aucun membre")
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }

    private func canDeleteMember(_ member: Member) -> Bool {
        guard canManageMembers else { return false }
        guard member.userId != currentUserId else { return false }
        guard !member.isOwner else { return false }
        return true
    }

    private func availableRoles(for member: Member) -> [MemberRole] {
        let allRoles: [MemberRole] = [.member, .admin, .owner]
        return allRoles.filter { role in
            // Not current role
            guard role != member.role else { return false }
            // Only owners can promote/demote to owner
            if role == .owner || member.role == .owner {
                return currentUserRole == .owner
            }
            return true
        }
    }

    private func roleIcon(for role: MemberRole) -> String {
        switch role {
        case .owner:
            return "crown.fill"
        case .admin:
            return "shield.fill"
        case .member:
            return "person.fill"
        }
    }

    private func roleColor(for role: MemberRole) -> Color {
        switch role {
        case .owner:
            return .purple
        case .admin:
            return .blue
        case .member:
            return .gray
        }
    }
}
