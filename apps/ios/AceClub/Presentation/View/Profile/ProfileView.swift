import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var profileViewModel: ProfileViewModel
    @EnvironmentObject private var organizationViewModel: OrganizationViewModel

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

                            if organizationViewModel.isLoading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 40)
                            } else if organizationViewModel.organizations.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "building.2.slash")
                                        .font(.system(size: 48))
                                        .foregroundColor(.secondary.opacity(0.5))

                                    Text("Aucun club")
                                        .font(.headline)
                                        .foregroundColor(.secondary)

                                    Text("Vous n'êtes membre d'aucun club pour le moment")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                            } else {
                                ForEach(organizationViewModel.organizations) { organization in
                                    let memberRole = getMemberRole(for: organization.id)
                                    OrganizationCard(
                                        organization: organization,
                                        memberRole: memberRole,
                                        onTap: {
                                            Task {
                                                await organizationViewModel.setActiveOrganization(slug: organization.slug)
                                            }
                                        }
                                    )
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
                .padding(.bottom, 20)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Mon Profil")
            .task {
                await profileViewModel.getMe()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
            }
            .refreshable {
                await profileViewModel.getMe()
                await organizationViewModel.loadOrganizations()
                await organizationViewModel.loadActiveMember()
            }
        }
    }

    private func getMemberRole(for organizationId: String) -> MemberRole? {
        organizationViewModel.members
            .first { $0.organizationId == organizationId }?
            .role
    }
}
