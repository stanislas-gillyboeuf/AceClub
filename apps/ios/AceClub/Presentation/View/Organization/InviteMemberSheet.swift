import SwiftUI

struct InviteMemberSheet: View {
    @ObservedObject var invitationViewModel: InvitationViewModel
    @Binding var isPresented: Bool

    let organizationId: String
    let organizationName: String
    let canInviteOwner: Bool

    @State private var email: String = ""
    @State private var selectedRole: MemberRole = .member
    @FocusState private var isEmailFocused: Bool

    init(
        invitationViewModel: InvitationViewModel,
        isPresented: Binding<Bool>,
        organizationId: String,
        organizationName: String,
        canInviteOwner: Bool = false
    ) {
        self.invitationViewModel = invitationViewModel
        self._isPresented = isPresented
        self.organizationId = organizationId
        self.organizationName = organizationName
        self.canInviteOwner = canInviteOwner
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.secondary)

                            TextField("", text: $email)
                                .textInputAutocapitalization(.never)
                                .keyboardType(.emailAddress)
                                .autocorrectionDisabled()
                                .focused($isEmailFocused)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 10)
                                .inputFieldStyle()
                        }

                        if !email.isEmpty && !isValidEmail {
                            Label("Adresse email invalide", systemImage: "exclamationmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }

                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Rôle")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)

                        ForEach(availableRoles, id: \.self) { role in
                            RoleSelectionRow(
                                role: role,
                                isSelected: selectedRole == role,
                                onSelect: { selectedRole = role }
                            )
                        }
                    }
                } footer: {
                    Text(roleDescription)
                        .font(.caption)
                }

                if let errorMessage = invitationViewModel.errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                            .font(.subheadline)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Inviter un membre")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Envoyer") {
                        Task {
                            await sendInvitation()
                        }
                    }
                    .fontWeight(.semibold)
                    .disabled(!canSend)
                }
            }
            .onAppear {
                isEmailFocused = true
            }
            .interactiveDismissDisabled(invitationViewModel.isLoading)
            .overlay {
                if invitationViewModel.isLoading {
                    Color.black.opacity(0.2)
                        .ignoresSafeArea()
                        .overlay {
                            VStack(spacing: 12) {
                                ProgressView()
                                    .scaleEffect(1.2)
                                Text("Envoi en cours...")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .padding(24)
                            .background(.regularMaterial)
                            .cornerRadius(16)
                        }
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var availableRoles: [MemberRole] {
        if canInviteOwner {
            return [.member, .admin, .owner]
        } else {
            return [.member, .admin]
        }
    }

    private var isValidEmail: Bool {
        let emailRegex = "^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }

    private var canSend: Bool {
        !email.isEmpty && isValidEmail && !invitationViewModel.isLoading
    }

    private var roleDescription: String {
        switch selectedRole {
        case .member:
            return "Les membres peuvent voir l'organisation et participer aux activités."
        case .admin:
            return "Les administrateurs peuvent gérer les membres et les invitations."
        case .owner:
            return "Les propriétaires ont un contrôle total sur l'organisation."
        }
    }

    // MARK: - Actions

    private func sendInvitation() async {
        if let _ = await invitationViewModel.createInvitation(
            email: email,
            role: selectedRole.rawValue,
            organizationId: organizationId
        ) {
            isPresented = false
        }
    }
}

// MARK: - Role Selection Row

private struct RoleSelectionRow: View {
    let role: MemberRole
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                Image(systemName: roleIcon)
                    .font(.title3)
                    .foregroundColor(roleColor)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(role.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)

                    Text(roleSubtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundColor(.accentColor)
                } else {
                    Image(systemName: "circle")
                        .font(.title3)
                        .foregroundColor(.gray.opacity(0.4))
                }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(isSelected ? Theme.tintColor.opacity(0.1) : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var roleIcon: String {
        switch role {
        case .member:
            return "person.fill"
        case .admin:
            return "person.badge.key.fill"
        case .owner:
            return "crown.fill"
        }
    }

    private var roleColor: Color {
        switch role {
        case .member:
            return .gray
        case .admin:
            return .blue
        case .owner:
            return .purple
        }
    }

    private var roleSubtitle: String {
        switch role {
        case .member:
            return "Accès standard"
        case .admin:
            return "Peut gérer les membres"
        case .owner:
            return "Contrôle total"
        }
    }
}
