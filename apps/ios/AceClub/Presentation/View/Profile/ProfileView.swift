import SwiftUI
import SwiftData

struct ProfileView: View {
    @ObservedObject var profileViewModel: ProfileViewModel
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showCreateMatchIntentSheet = false
    @State private var showSettingsSheet = false

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    var body: some View {
        NavigationStack {
            List {
                if let user = profileViewModel.user {
                    Section {
                        ProfileHeaderCard(
                            user: user,
                            organizationName: profileViewModel.userPreferences?.organizationName,
                            level: profileViewModel.skillLevelDisplayName,
                            bio: nil,
                            totalMatches: profileViewModel.userStats.totalMatches,
                            winRate: Int(profileViewModel.userStats.winRate * 100),
                            monthlyMatches: profileViewModel.userStats.matchesThisMonth
                        )
                            .padding(.top, 8)
                            .padding(.bottom, 4)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 0, leading: Theme.paddingHorizontal, bottom: 0, trailing: Theme.paddingHorizontal))
                            .listRowBackground(Color.clear)
                    }

                    Section {
                        Button {
                            showCreateMatchIntentSheet = true
                        } label: {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title3)
                                    .foregroundStyle(Theme.tintColor)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Publier ma dispo")
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(.primary)
                                    Text("Indique quand tu es dispo pour un match, tu apparaîtras dans le feed.")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .multilineTextAlignment(.leading)
                                }
                            }
                        }
                        .buttonStyle(.plain)

                        if profileViewModel.isLoadingIntents {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else if profileViewModel.myMatchIntents.isEmpty {
                            ContentUnavailableView {
                                Label("Aucune dispo", systemImage: "calendar")
                            } description: {
                                Text("Publie une dispo pour apparaître dans le feed.")
                            }
                        } else {
                            ForEach(profileViewModel.myMatchIntents) { intent in
                                MatchIntentRow(
                                    intent: intent,
                                    isDeleting: profileViewModel.deletingIntentId == intent.id,
                                    onDelete: {
                                        Task { await profileViewModel.deleteMatchIntent(id: intent.id) }
                                    }
                                )
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button(role: .destructive) {
                                        Task { await profileViewModel.deleteMatchIntent(id: intent.id) }
                                    }
                                }
                                .disabled(profileViewModel.deletingIntentId == intent.id)
                            }
                        }

                        if let msg = profileViewModel.errorMessageIntents {
                            Text(msg)
                                .font(.caption)
                                .foregroundStyle(.red)
                        }
                    } header: {
                        Label("Mes dispos", systemImage: "calendar")
                    }

                    Section {
                        if !invitationViewModel.pendingUserInvitations.isEmpty {
                            ForEach(invitationViewModel.pendingUserInvitations) { invitation in
                                InvitationCard(
                                    invitation: invitation,
                                    onAccept: {
                                        Task {
                                            if let _ = await invitationViewModel.acceptInvitation(invitationId: invitation.id) {
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
                                .listRowSeparator(.hidden)
                                .listRowBackground(Color.clear)
                            }
                        }

                        if organizationViewModel.isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else if organizationViewModel.organizations.isEmpty {
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
                                        style: .listRow,
                                        showsChevron: false,
                                        onTap: nil
                                    )
                                }
                            }
                        }
                    } header: {
                        Label("Mes Clubs", systemImage: "building.2.fill")
                    }

                    Section {
                        if authViewModel.isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            Button(role: .destructive, action: handleSignOut) {
                                Text("Déconnexion")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                    }
                } else {
                    Section {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    }
                }

                if let errorMessage = profileViewModel.errorMessage {
                    Section {
                        Text("Erreur: \(errorMessage)")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }

                if let errorMessage = organizationViewModel.errorMessage {
                    Section {
                        Text("Erreur organisations: \(errorMessage)")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .navigationTitle("Mon Profil")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSettingsSheet = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
            }
            .task(id: "profile-load") {
                if profileViewModel.user == nil {
                    await profileViewModel.getMe()
                }
                profileViewModel.calculateStats(from: allMatches)
                await profileViewModel.loadUserPreferences()
                await profileViewModel.loadMyMatchIntents()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
                await invitationViewModel.loadUserInvitations()
            }
            .onChange(of: allMatches.count) {
                profileViewModel.calculateStats(from: allMatches)
            }
            .refreshable {
                async let userTask: () = profileViewModel.refreshUser()
                async let prefsTask: () = profileViewModel.refreshUserPreferences()
                async let intentsTask: () = profileViewModel.refreshMatchIntents()
                async let orgsTask: () = organizationViewModel.refreshOrganizations()
                async let memberTask: () = organizationViewModel.refreshActiveMember()
                async let invitationsTask: () = invitationViewModel.refreshUserInvitations()
                _ = await (userTask, prefsTask, intentsTask, orgsTask, memberTask, invitationsTask)
            }
            .sheet(isPresented: $showCreateMatchIntentSheet) {
                CreateMatchIntentSheet(isPresented: $showCreateMatchIntentSheet) {
                    Task { await profileViewModel.loadMyMatchIntents() }
                }
            }
            .fullScreenCover(isPresented: $showSettingsSheet) {
                SettingsView { updatedUser in
                    authViewModel.currentUser = updatedUser
                    profileViewModel.user = updatedUser
                    Task {
                        await profileViewModel.loadUserPreferences()
                    }
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
