import SwiftUI

struct ProfileView: View {
    @ObservedObject var profileViewModel: ProfileViewModel
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showCreateMatchIntentSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if let user = profileViewModel.user {
                        ProfileHeaderCard(user: user)
                            .padding(.horizontal, Theme.paddingHorizontal)
                            .padding(.top, 20)

                        // Section : Mes dispos publiées
                        VStack(alignment: .leading, spacing: 12) {
                            ProfileSectionHeader(title: "Mes dispos", icon: "calendar")
                            Button {
                                showCreateMatchIntentSheet = true
                            } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: "plus.circle.fill")
                                        .font(.title2)
                                        .foregroundStyle(Theme.tintColor)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Publier ma dispo")
                                            .font(.subheadline.weight(.medium))
                                            .foregroundStyle(Theme.labelPrimary)
                                        Text("Indique quand tu es dispo pour un match, tu apparaîtras dans le feed.")
                                            .font(.caption)
                                            .foregroundStyle(Theme.labelSecondary)
                                            .multilineTextAlignment(.leading)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(Theme.labelTertiary)
                                }
                            }
                            .buttonStyle(.appCardRow)
                            .padding(.horizontal, Theme.paddingHorizontal)
                            if profileViewModel.isLoadingIntents {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 20)
                            }
                            else if !profileViewModel.myMatchIntents.isEmpty {
                                VStack(spacing: 0) {
                                    ForEach(profileViewModel.myMatchIntents) { intent in
                                        MatchIntentRow(
                                            intent: intent,
                                            isDeleting: profileViewModel.deletingIntentId == intent.id,
                                            onDelete: {
                                                Task { await profileViewModel.deleteMatchIntent(id: intent.id) }
                                            }
                                        )
                                        .disabled(profileViewModel.deletingIntentId != nil)

                                        if intent.id != profileViewModel.myMatchIntents.last?.id {
                                            Divider()
                                                .padding(.leading, 16)
                                        }
                                    }
                                }
                                .background(Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .padding(.horizontal, 20)
                            }
                            if let msg = profileViewModel.errorMessageIntents {
                                Text(msg)
                                    .font(.caption)
                                    .foregroundStyle(.red)
                                    .padding(.horizontal, Theme.paddingHorizontal)
                            }
                        }
                        .padding(.bottom, 8)

                        VStack(alignment: .leading, spacing: 12) {
                            ProfileSectionHeader(
                                title: "Mes Clubs",
                                icon: "building.2.fill"
                            )

                            if !invitationViewModel.pendingUserInvitations.isEmpty {
                                VStack(spacing: 8) {
                                    ForEach(invitationViewModel.pendingUserInvitations) { invitation in
                                        InvitationCard(
                                            invitation: invitation,
                                            onAccept: {
                                                Task {
                                                    if let member = await invitationViewModel.acceptInvitation(invitationId: invitation.id) {
                                                        await organizationViewModel.loadOrganizations()
                                                        await organizationViewModel.loadActiveMember()
                                                    }
                                                }
                                            },
                                            onReject: {
                                                Task {
                                                    await invitationViewModel.rejectInvitation(invitationId: invitation.id)
                                                }
                                            }
                                        )
                                    }
                                }
                                .padding(.horizontal, Theme.paddingHorizontal)
                                .padding(.bottom, 8)

                                Divider()
                                    .padding(.horizontal, Theme.paddingHorizontal)
                            }

                            if organizationViewModel.isLoading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 40)
                            } else if organizationViewModel.organizations.isEmpty {
                                
                                VStack(alignment: .leading, spacing: 12) {
                                    
                                    
                                }
                                ContentUnavailableView {
                                    Label("No Club", systemImage: "tray.fill")
                                } description: {
                                    Text("Check later for invitation")
                                }
                            } else {
                                ForEach(organizationViewModel.organizations) { organization in
                                    let memberRole = getMemberRole(for: organization.id)

                                    NavigationLink {
                                        OrganizationDetailView(
                                            organizationViewModel: organizationViewModel,
                                            invitationViewModel: invitationViewModel,
                                            organization: organization
                                        )
                                    } label: {
                                        OrganizationCard(
                                            organization: organization,
                                            memberRole: memberRole,
                                            onTap: nil
                                        )
                                    }
                                    .padding(.horizontal, Theme.paddingHorizontal)
                                }
                            }
                        }
                        .padding(.vertical, 12)


                    } else {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 100)
                    }

                    if let errorMessage = profileViewModel.errorMessage {
                        Text("Erreur: \(errorMessage)")
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding()
                    }

                    if let errorMessage = organizationViewModel.errorMessage {
                        Text("Erreur organisations: \(errorMessage)")
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding()
                    }
                }
                Spacer()
                
                Button(action: handleSignOut) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: Theme.destructiveColor))
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.buttonHeight)
                    } else {
                        Text("Déconnexion")
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.buttonHeight)
                    }
                }
                .buttonStyle(.appDestructiveOutlined)
                .padding(.horizontal, Theme.paddingHorizontal)
            }
            .navigationTitle("Mon Profil")
            .task(id: "profile-load") {
                if profileViewModel.user == nil {
                    await profileViewModel.getMe()
                    await profileViewModel.loadMyMatchIntents()
                    await organizationViewModel.loadOrganizations()
                    await organizationViewModel.loadActiveMember()
                    await invitationViewModel.loadUserInvitations()
                }
            }
            .refreshable {
                async let userTask: () = profileViewModel.refreshUser()
                async let intentsTask: () = profileViewModel.refreshMatchIntents()
                async let orgsTask: () = organizationViewModel.refreshOrganizations()
                async let memberTask: () = organizationViewModel.refreshActiveMember()
                async let invitationsTask: () = invitationViewModel.refreshUserInvitations()
                _ = await (userTask, intentsTask, orgsTask, memberTask, invitationsTask)
            }
            .sheet(isPresented: $showCreateMatchIntentSheet) {
                CreateMatchIntentSheet(isPresented: $showCreateMatchIntentSheet) {
                    Task { await profileViewModel.loadMyMatchIntents() }
                }
            }
        }
    }

    private func getMemberRole(for organizationId: String) -> MemberRole? {
        organizationViewModel.allMembers
            .first { $0.organizationId == organizationId }?
            .role
    }

    private func handleSignOut() {
        Task {
            await authViewModel.signOut()
        }
    }
}
