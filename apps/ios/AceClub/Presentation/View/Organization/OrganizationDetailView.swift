import SwiftUI
import PhotosUI

struct OrganizationDetailView: View {
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Environment(AuthViewModel.self) private var authViewModel

    let organization: Organization

    @State private var showInviteMemberSheet = false
    @State private var showEditOrganizationSheet = false
    @State private var selectedLogoItem: PhotosPickerItem?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Section 1: Header Card (tous les users)
                OrganizationHeaderCard(
                    organization: currentOrganization,
                    selectedLogo: organizationViewModel.selectedLogo,
                    isUploadingLogo: organizationViewModel.isUploadingLogo,
                    isAdmin: isAdmin,
                    selectedLogoItem: $selectedLogoItem,
                    onSaveLogo: {
                        await organizationViewModel.updateOrganizationLogo(organizationId: organization.id)
                    },
                    onEditOrganization: {
                        showEditOrganizationSheet = true
                    }
                )

                // Section 2: Stats Card (tous les users)
                OrganizationStatsCard(
                    membersCount: organizationViewModel.members.count,
                    createdAt: currentOrganization.createdAt,
                    pendingInvitationsCount: invitationViewModel.pendingOrganizationInvitations.count,
                    isAdmin: isAdmin,
                    organizationStats: organizationViewModel.organizationStats
                )

                // Section 3: Admin Dashboard (conditionnel)
                if isAdmin {
                    adminDashboardSections
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.vertical, 16)
        }
        .background(Theme.primaryBackground)
        .navigationTitle(currentOrganization.name)
        .navigationBarTitleDisplayMode(.large)
        .task {
            await loadData()
        }
        .refreshable {
            await loadData()
        }
        .onChange(of: selectedLogoItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await MainActor.run {
                        organizationViewModel.selectedLogo = image
                    }
                }
            }
        }
        .alert("Erreur", isPresented: .constant(organizationViewModel.errorMessage != nil || invitationViewModel.errorMessage != nil)) {
            Button("OK") {
                organizationViewModel.errorMessage = nil
                invitationViewModel.errorMessage = nil
            }
        } message: {
            Text(organizationViewModel.errorMessage ?? invitationViewModel.errorMessage ?? "")
        }
        .sheet(isPresented: $showInviteMemberSheet) {
            InviteMemberSheet(
                invitationViewModel: invitationViewModel,
                isPresented: $showInviteMemberSheet,
                organizationId: organization.id,
                organizationName: currentOrganization.name,
                canInviteOwner: isOwner
            )
        }
        .sheet(isPresented: $showEditOrganizationSheet) {
            EditOrganizationSheet(
                organizationViewModel: organizationViewModel,
                isPresented: $showEditOrganizationSheet,
                organization: currentOrganization
            )
        }
    }

    // MARK: - Admin Dashboard Sections

    @ViewBuilder
    private var adminDashboardSections: some View {
        // PIN Section
        OrganizationPinSection(
            pin: organizationViewModel.organizationPin,
            isPinEnabled: organizationViewModel.isPinEnabled,
            onToggle: {
                Task {
                    await organizationViewModel.togglePin(organizationId: organization.id)
                }
            },
            onRegenerate: {
                Task {
                    await organizationViewModel.regeneratePin(organizationId: organization.id)
                }
            }
        )

        // Quick Actions
        OrganizationQuickActions(
            onInviteMember: {
                showInviteMemberSheet = true
            },
            onEditOrganization: {
                showEditOrganizationSheet = true
            }
        )

        // Members Section
        OrganizationMembersSection(
            members: organizationViewModel.members,
            currentUserRole: currentUserRole,
            currentUserId: authViewModel.currentUser?.id,
            isLoading: organizationViewModel.isLoading,
            canManageMembers: canManageMembers,
            onRoleChange: { member, role in
                Task {
                    await organizationViewModel.updateMemberRole(
                        memberId: member.id,
                        role: role.rawValue
                    )
                }
            },
            onRemove: { member in
                Task {
                    await organizationViewModel.removeMember(memberIdOrEmail: member.id)
                }
            }
        )

        // Invitations Section (si invitations en attente)
        if !invitationViewModel.pendingOrganizationInvitations.isEmpty {
            OrganizationInvitationsSection(
                invitations: invitationViewModel.pendingOrganizationInvitations,
                onCancel: { invitation in
                    Task {
                        await invitationViewModel.cancelInvitation(invitationId: invitation.id)
                    }
                },
                onResend: { invitation in
                    Task {
                        await invitationViewModel.resendInvitation(invitationId: invitation.id)
                    }
                }
            )
        }

        // Danger Zone (owners only)
        if isOwner {
            OrganizationDangerZone(
                organizationName: currentOrganization.name,
                canLeaveOrganization: canLeaveOrganization,
                onLeave: {
                    Task {
                        await organizationViewModel.leaveOrganization(organizationId: organization.id)
                    }
                }
            )
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        // Use refresh method that survives SwiftUI task cancellation
        await organizationViewModel.refreshFullOrganization(slug: organization.slug)
        await invitationViewModel.refreshOrganizationInvitations(organizationId: organization.id)

        // Load stats and PIN for admins
        if isAdmin {
            await organizationViewModel.loadOrganizationStats(organizationId: organization.id)
            await organizationViewModel.loadOrganizationPin(organizationId: organization.id)
        }
    }

    // MARK: - Computed Properties

    private var currentOrganization: Organization {
        organizationViewModel.activeOrganization ?? organization
    }

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
}
