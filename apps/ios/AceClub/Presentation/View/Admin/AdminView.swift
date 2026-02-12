//
//  AdminView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import SwiftUI

struct AdminView: View {
    @StateObject private var viewModel = AdminViewModel()
    @State private var selectedUser: User? = nil
    @State private var isCreateUserPresented = false
    @State private var isCreateOrganizationPresented = false
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        NavigationStack {
            List {
                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text(errorMessage)
                            .font(.footnote)
                            .foregroundColor(.red)
                    }
                }

                Section("Utilisateurs") {
                    if viewModel.isLoading && viewModel.users.isEmpty {
                        SkeletonList(count: 5) {
                            SkeletonRow(showAvatar: false, lineCount: 2, titleWidth: 120)
                        }
                    } else if viewModel.users.isEmpty {
                        Text("Aucun utilisateur.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(viewModel.users) { user in
                            Button {
                                selectedUser = user
                            } label: {
                                userRow(user)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Admin")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button {
                            isCreateUserPresented = true
                        } label: {
                            Label("Créer un utilisateur", systemImage: "person")
                        }
                        Button {
                            isCreateOrganizationPresented = true
                        } label: {
                            Label("Créer une organisation", systemImage: "building")
                        }
                    } label: {
                        Label("Actions", systemImage: "plus")
                    }
                }
            }
            .task {
                await viewModel.loadUsers()
            }
            .refreshable {
                await viewModel.loadUsers()
            }
            .sheet(item: $selectedUser) { user in
                AdminUserDetailView(user: user, viewModel: viewModel)
            }
            .sheet(isPresented: $isCreateUserPresented) {
                CreateUserSheet(viewModel: viewModel, isPresented: $isCreateUserPresented)
            }
            .sheet(isPresented: $isCreateOrganizationPresented) {
                CreateOrganizationSheet(viewModel: viewModel, isPresented: $isCreateOrganizationPresented)
            }
        }
    }

    private func userRow(_ user: User) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Text(user.name)
                    .font(.headline)

                if user.banned! {
                    Text("BANNI")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red.opacity(0.15))
                        .foregroundColor(.red)
                        .clipShape(Capsule())
                } else if let role = user.role, !role.isEmpty {
                    Text(role.uppercased())
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.15))
                        .foregroundColor(.blue)
                        .clipShape(Capsule())
                }
            }

            Text(user.email)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct AdminUserDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    @ObservedObject var viewModel: AdminViewModel

    @State private var user: User
    @State private var name: String
    @State private var email: String
    @State private var updatePassword: String
    @State private var role: String
    @State private var newPassword: String
    @State private var sessionId: String

    private enum Role: String, CaseIterable, Identifiable {
        case admin = "admin"
        case user = "user"
        var id: String { rawValue }
        var label: String { rawValue.capitalized }
    }

    init(user: User, viewModel: AdminViewModel) {
        _user = State(initialValue: user)
        _name = State(initialValue: user.name)
        _email = State(initialValue: user.email)
        _updatePassword = State(initialValue: "")
        _role = State(initialValue: Role(rawValue: user.role?.lowercased() ?? "")?.rawValue ?? "")
        _newPassword = State(initialValue: "")
        _sessionId = State(initialValue: "")
        self.viewModel = viewModel
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Utilisateur") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(user.name)
                            .font(.headline)
                        Text(user.email)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    if user.isBanned {
                        Text("Utilisateur banni")
                            .font(.footnote)
                            .foregroundColor(.red)
                    }
                }

                Section("Modifier les infos") {
                    TextField("Nom", text: $name)
                    TextField("Email", text: $email)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    SecureField("Mot de passe (optionnel)", text: $updatePassword)
                    Button("Mettre à jour") {
                        Task {
                            if let updated = await viewModel.updateUser(userId: user.id, name: name, email: email, password: updatePassword) {
                                user = updated
                                syncCurrentUserIfNeeded(updated)
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || name.isEmpty || email.isEmpty)
                }

                Section("Mot de passe") {
                    SecureField("Nouveau mot de passe", text: $newPassword)
                    Button("Définir le mot de passe") {
                        Task {
                            if let updated = await viewModel.setPassword(userId: user.id, password: newPassword) {
                                user = updated
                                syncCurrentUserIfNeeded(updated)
                                newPassword = ""
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || newPassword.isEmpty)
                }

                Section("Sessions") {
                    TextField("ID de session", text: $sessionId)
                    Button("Révoquer la session") {
                        Task {
                            if let updated = await viewModel.revokeUserSession(userId: user.id, sessionId: sessionId) {
                                user = updated
                                syncCurrentUserIfNeeded(updated)
                                sessionId = ""
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || sessionId.isEmpty)

                    Button("Révoquer toutes les sessions") {
                        Task {
                            if let updated = await viewModel.revokeUserSessions(userId: user.id) {
                                user = updated
                                syncCurrentUserIfNeeded(updated)
                            }
                        }
                    }
                    .disabled(viewModel.isLoading)
                }

                Section("Accès") {
                    Button(user.isBanned ? "Débannir l'utilisateur" : "Bannir l'utilisateur") {
                        Task {
                            if user.isBanned {
                                if let updated = await viewModel.unbanUser(userId: user.id) {
                                    user = updated
                                    syncCurrentUserIfNeeded(updated)
                                }
                            } else {
                                if let updated = await viewModel.banUser(userId: user.id) {
                                    user = updated
                                    syncCurrentUserIfNeeded(updated)
                                }
                            }
                        }
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .scrollContentBackground(.hidden)
            .navigationTitle("Gérer l'utilisateur")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.labelTertiary)
                    }
                }
            }
        }
        .presentationBackground(.regularMaterial)
    }

    private func syncCurrentUserIfNeeded(_ updated: User) {
        if authViewModel.currentUser?.id == updated.id {
            authViewModel.currentUser = updated
        }
    }
}

struct CreateUserSheet: View {
    @ObservedObject var viewModel: AdminViewModel
    @Binding var isPresented: Bool
    @State private var name: String = ""
    @State private var email: String = ""
    @State private var password: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Créer un utilisateur") {
                    TextField("Nom", text: $name)
                    TextField("Email", text: $email)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    SecureField("Mot de passe", text: $password)
                }
            }
            .scrollContentBackground(.hidden)
            .navigationTitle("Créer un utilisateur")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Créer") {
                        Task {
                            await viewModel.createUser(name: name, email: email, password: password)
                            if viewModel.errorMessage == nil {
                                isPresented = false
                                name = ""
                                email = ""
                                password = ""
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || !isFormValid)
                }
            }
        }
        .presentationBackground(.regularMaterial)
    }

    private var isFormValid: Bool {
        !name.isEmpty && !email.isEmpty && !password.isEmpty
    }
}
