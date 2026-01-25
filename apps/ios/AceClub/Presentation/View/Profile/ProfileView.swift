import SwiftUI

struct ProfileView: View {
    @ObservedObject var profileViewModel: ProfileViewModel
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if let user = profileViewModel.user {
                        ProfileHeaderCard(user: user)
                            .padding(.horizontal, 20)
                            .padding(.top, 20)

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
                                .padding(.horizontal, 20)
                                .padding(.bottom, 8)

                                Divider()
                                    .padding(.horizontal, 20)
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
                                    .padding(.horizontal, 20)
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
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    } else {
                        Text("Sign Out")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    }
                }
                .buttonStyle(.bordered)
                .tint(.red)
                .padding(.horizontal, 24)
            }
            .navigationTitle("Mon Profil")
            .task {
                await profileViewModel.getMe()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
                await invitationViewModel.loadUserInvitations()
            }
            .refreshable {
                await profileViewModel.getMe()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
                await invitationViewModel.loadUserInvitations()
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
