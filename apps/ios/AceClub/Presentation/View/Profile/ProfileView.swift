import SwiftUI
import SwiftData

struct ProfileView: View {
    @ObservedObject var profileViewModel: ProfileViewModel
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @ObservedObject var invitationViewModel: InvitationViewModel
    @ObservedObject var progressionViewModel: ProgressionViewModel
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showCreateMatchIntentSheet = false
    @State private var showSettingsSheet = false

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    var body: some View {
            List {
                if let user = profileViewModel.user {
                    Section {
                        ProfileHeaderCard(
                            user: user,
                            organizationName: profileViewModel.userPreferences?.organizationName,
                            level: profileViewModel.skillLevelDisplayName,
                            bio: nil,
                            playerLevel: progressionViewModel.userLevel.level,
                            levelProgress: progressionViewModel.userLevel.progressPercent,
                            totalMatches: profileViewModel.userStats.totalMatches,
                            winRate: Int(profileViewModel.userStats.winRate * 100),
                            totalPlayTime: profileViewModel.userStats.formattedPlayTime
                        )
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets())
                        .listRowBackground(Color.clear)
                    }

                    if !progressionViewModel.allBadges.isEmpty {
                        Section {
                            ProfileBadgeSection(badges: progressionViewModel.allBadges)
                        } header: {
                            Label("Badges", systemImage: "medal.fill")
                        }
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
                            SkeletonList(count: 2) {
                                SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 100)
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
                            SkeletonRow(lineCount: 2, titleWidth: 140)
                        } else if let organization = organizationViewModel.organizations.first {
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
                        } else {
                            ContentUnavailableView {
                                Label("Aucun club", systemImage: "building.2")
                            } description: {
                                Text("Rejoins un club dans les paramètres")
                            }
                        }
                    } header: {
                        Label("Mon Club", systemImage: "building.2.fill")
                    }

                    Section {
                        if authViewModel.isLoading {
                            SkeletonRow(showAvatar: false, lineCount: 1, titleWidth: 100)
                        } else {
                            Button(role: .destructive, action: handleSignOut) {
                                Text("Déconnexion")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                    }
                } else {
                    Section {
                        SkeletonRow(lineCount: 2, titleWidth: 120)
                    }
                    Section {
                        SkeletonList(count: 2) {
                            SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 100)
                        }
                    }
                    Section {
                        SkeletonList(count: 2) {
                            SkeletonRow(lineCount: 2, titleWidth: 140)
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
                await progressionViewModel.loadLevel()
                await progressionViewModel.loadBadges()
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
                async let levelTask: () = progressionViewModel.loadLevel()
                async let badgesTask: () = progressionViewModel.loadBadges()
                _ = await (userTask, prefsTask, intentsTask, orgsTask, memberTask, invitationsTask, levelTask, badgesTask)
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

    private func getMemberRole(for organizationId: String) -> MemberRole? {
        guard let currentUserId = authViewModel.currentUser?.id else { return nil }
        return organizationViewModel.allMembers
            .first { $0.organizationId == organizationId && $0.userId == currentUserId }?
            .role
    }

    private func handleSignOut() {
        Task {
            await authViewModel.signOut()
        }
    }
}
