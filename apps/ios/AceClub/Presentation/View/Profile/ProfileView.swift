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
                            .padding(.horizontal, 20)
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
                                        .foregroundStyle(.tint)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Publier ma dispo")
                                            .font(.subheadline.weight(.medium))
                                            .foregroundStyle(.primary)
                                        Text("Indique quand tu es dispo pour un match, tu apparaîtras dans le feed.")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .multilineTextAlignment(.leading)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(.tertiary)
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal, 20)
                            if profileViewModel.isLoadingIntents {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 20)
                            }
                            else {
                                List {
                                    ForEach(profileViewModel.myMatchIntents) { intent in
                                        HStack(alignment: .center, spacing: 12) {
                                            VStack(alignment: .leading, spacing: 2) {
                                                if let displayDate = intent.date ?? intent.time {
                                                    Text(displayDate, style: .date)
                                                        .font(.subheadline.weight(.medium))
                                                    Text(displayDate, style: .time)
                                                        .font(.caption)
                                                        .foregroundStyle(.secondary)
                                                } else {
                                                    Text("Date non renseignée")
                                                        .font(.subheadline)
                                                        .foregroundStyle(.secondary)
                                                }
                                                Text(durationLabel(intent.duration))
                                                    .font(.caption2)
                                                    .foregroundStyle(.tertiary)
                                            }
                                            if profileViewModel.deletingIntentId == intent.id {
                                                Spacer()
                                                ProgressView()
                                                    .scaleEffect(0.8)
                                            }
                                        }
                                        .padding(.vertical, 4)
                                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                            Button(role: .destructive) {
                                                Task { await profileViewModel.deleteMatchIntent(id: intent.id) }
                                            } label: {
                                                Label("Supprimer", systemImage: "trash")
                                            }
                                        }
                                        .disabled(profileViewModel.deletingIntentId != nil)
                                    }
                                }
                                .listStyle(.insetGrouped)
                                .scrollContentBackground(.hidden)
                                .scrollDisabled(true)
                                .frame(minHeight: CGFloat(profileViewModel.myMatchIntents.count) * 72)
                            }
                            if let msg = profileViewModel.errorMessageIntents {
                                Text(msg)
                                    .font(.caption)
                                    .foregroundStyle(.red)
                                    .padding(.horizontal, 20)
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
                await profileViewModel.loadMyMatchIntents()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
                await invitationViewModel.loadUserInvitations()
            }
            .refreshable {
                await profileViewModel.getMe()
                await profileViewModel.loadMyMatchIntents()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
                await invitationViewModel.loadUserInvitations()
            }
            .sheet(isPresented: $showCreateMatchIntentSheet) {
                CreateMatchIntentSheet(isPresented: $showCreateMatchIntentSheet) {
                    Task { await profileViewModel.loadMyMatchIntents() }
                }
            }
        }
    }

    private func durationLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h) h \(m) min" : "\(h) h"
        }
        return "\(minutes) min"
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
