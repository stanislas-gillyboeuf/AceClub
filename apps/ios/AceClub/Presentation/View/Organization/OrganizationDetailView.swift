import SwiftUI

struct OrganizationDetailView: View {
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Environment(AuthViewModel.self) private var authViewModel

    let organization: Organization

    @State private var memberToDelete: Member?
    @State private var showDeleteConfirmation = false
    @State private var showLeaveConfirmation = false
    @State private var showInviteMemberSheet = false

    var body: some View {
        Form {
            // Section 1: Organization Info
            Section("Organisation") {
                LabeledContent("Nom", value: organization.name)
                LabeledContent("Slug", value: organization.slug)

                if let logoURL = organization.logoURL {
                    LabeledContent("Logo") {
                        AsyncImage(url: logoURL) { image in
                            image
                                .resizable()
                                .scaledToFit()
                                .frame(width: 50, height: 50)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        } placeholder: {
                            ProgressView()
                        }
                    }
                }
            }

            // Section 2: Statistics
            Section("Statistiques") {
                LabeledContent("Membres", value: "\(organizationViewModel.members.count)")
                LabeledContent("Créée le", value: formatDate(organization.createdAt))

                if !invitationViewModel.pendingOrganizationInvitations.isEmpty {
                    LabeledContent(
                        "Invitations en attente",
                        value: "\(invitationViewModel.pendingOrganizationInvitations.count)"
                    )
                }
            }

            // Section 3: Members List
            Section("Membres (\(organizationViewModel.members.count))") {
                if organizationViewModel.isLoading && organizationViewModel.members.isEmpty {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                } else if organizationViewModel.members.isEmpty {
                    Text("Aucun membre")
                        .foregroundColor(.secondary)
                } else {
                    ForEach(organizationViewModel.members) { member in
                        MemberRow(
                            member: member,
                            currentUserRole: currentUserRole,
                            currentUserId: authViewModel.currentUser?.id,
                            onRoleChange: canManageMembers ? { newRole in
                                Task {
                                    await organizationViewModel.updateMemberRole(
                                        memberId: member.id,
                                        role: newRole.rawValue
                                    )
                                }
                            } : nil,
                            onRemove: canManageMembers && !member.isOwner ? {
                                memberToDelete = member
                                showDeleteConfirmation = true
                            } : nil
                        )
                    }
                }
            }
            .confirmationDialog(
                "Êtes-vous sûr de vouloir supprimer ce membre ?",
                isPresented: $showDeleteConfirmation,
                presenting: memberToDelete
            ) { member in
                Button("Supprimer", role: .destructive) {
                    Task {
                        await organizationViewModel.removeMember(memberIdOrEmail: member.id)
                        memberToDelete = nil
                    }
                }
                Button("Annuler", role: .cancel) {
                    memberToDelete = nil
                }
            } message: { member in
                Text("Cette action supprimera \(member.user?.name ?? "ce membre") de l'organisation.")
            }

            // Section 4: Invite New Members (admin+)
            if canManageMembers {
                Section("Inviter des membres") {
                    Button {
                        showInviteMemberSheet = true
                    } label: {
                        HStack {
                            Image(systemName: "person.badge.plus")
                                .foregroundColor(.accentColor)
                            Text("Inviter un nouveau membre")
                                .foregroundColor(.accentColor)
                        }
                    }
                }
            }

            // Section 5: Pending Invitations (admin+)
            if canManageMembers && !invitationViewModel.pendingOrganizationInvitations.isEmpty {
                Section("Invitations en attente (\(invitationViewModel.pendingOrganizationInvitations.count))") {
                    ForEach(invitationViewModel.pendingOrganizationInvitations) { invitation in
                        PendingInvitationRow(
                            invitation: invitation,
                            onCancel: {
                                Task {
                                    await invitationViewModel.cancelInvitation(invitationId: invitation.id)
                                }
                            },
                            onResend: {
                                Task {
                                    await invitationViewModel.resendInvitation(invitationId: invitation.id)
                                }
                            }
                        )
                    }
                }
            }

            // Section 6: Danger Zone (owner only)
            if isOwner {
                Section("Zone dangereuse") {
                    Button("Quitter l'organisation", role: .destructive) {
                        showLeaveConfirmation = true
                    }
                    .disabled(!canLeaveOrganization)

                    if !canLeaveOrganization {
                        Text("Vous devez transférer la propriété à un autre membre avant de quitter")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .navigationTitle(organization.name)
        .navigationBarTitleDisplayMode(.large)
        .task {
            await organizationViewModel.loadFullOrganization(slug: organization.slug)
            await invitationViewModel.loadOrganizationInvitations(organizationId: organization.id)
        }
        .refreshable {
            await organizationViewModel.loadFullOrganization(slug: organization.slug)
            await invitationViewModel.loadOrganizationInvitations(organizationId: organization.id)
        }
        .alert("Erreur", isPresented: .constant(organizationViewModel.errorMessage != nil || invitationViewModel.errorMessage != nil)) {
            Button("OK") {
                organizationViewModel.errorMessage = nil
                invitationViewModel.errorMessage = nil
            }
        } message: {
            Text(organizationViewModel.errorMessage ?? invitationViewModel.errorMessage ?? "")
        }
        .confirmationDialog(
            "Quitter l'organisation",
            isPresented: $showLeaveConfirmation
        ) {
            Button("Quitter", role: .destructive) {
                Task {
                    await organizationViewModel.leaveOrganization(organizationId: organization.id)
                }
            }
            Button("Annuler", role: .cancel) {}
        } message: {
            Text("Êtes-vous sûr de vouloir quitter \(organization.name) ? Cette action est irréversible.")
        }
        .sheet(isPresented: $showInviteMemberSheet) {
            InviteMemberSheet(
                invitationViewModel: invitationViewModel,
                isPresented: $showInviteMemberSheet,
                organizationId: organization.id,
                organizationName: organization.name,
                canInviteOwner: isOwner
            )
        }
    }

    // MARK: - Computed Properties

    private var currentUserMember: Member? {
        guard let currentUserId = authViewModel.currentUser?.id else { return nil }
        return organizationViewModel.members.first { $0.userId == currentUserId }
    }

    private var currentUserRole: MemberRole? {
        currentUserMember?.role
    }

    private var isOwner: Bool {
        currentUserRole == .owner
    }

    private var isAdmin: Bool {
        currentUserRole == .owner || currentUserRole == .admin
    }

    private var canManageMembers: Bool {
        isAdmin
    }

    private var canLeaveOrganization: Bool {
        // An owner can only leave if there's at least one other owner
        let ownerCount = organizationViewModel.members.filter { $0.role == .owner }.count
        return ownerCount > 1
    }

    // MARK: - Helper Methods

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = formatter.date(from: dateString) else {
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: dateString) else {
                return dateString
            }
            return formatDateToString(date)
        }
        return formatDateToString(date)
    }

    private func formatDateToString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.string(from: date)
    }

}
