//
//  CreateGhostSheet.swift
//  AceClub
//
//  Created by Claude on 30/01/2026.
//

import SwiftUI

struct CreateGhostSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var name: String = ""
    @State private var email: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?

    let initialName: String
    let onGhostCreated: (User) -> Void

    private let createGhostUseCase = CreateGhostUserUseCase()

    init(initialName: String = "", onGhostCreated: @escaping (User) -> Void) {
        self.initialName = initialName
        self.onGhostCreated = onGhostCreated
        _name = State(initialValue: initialName)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                headerSection

                formSection

                Spacer()

                createButton
            }
            .padding()
            .background(Theme.secondaryBackground)
            .navigationTitle("Ajouter un invité")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.badge.plus")
                .font(.system(size: 48))
                .foregroundStyle(Theme.tintColor)

            Text("Créer un joueur invité")
                .font(.title3.weight(.semibold))

            Text("Ce joueur pourra récupérer son historique en créant un compte avec le même email.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }

    // MARK: - Form Section

    private var formSection: some View {
        VStack(spacing: 16) {
            // Name field
            VStack(alignment: .leading, spacing: 8) {
                Text("Nom")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.secondary)

                TextField("Prénom Nom", text: $name)
                    .font(.body)
                    .textContentType(.name)
                    .autocorrectionDisabled()
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            // Email field
            VStack(alignment: .leading, spacing: 8) {
                Text("Email")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.secondary)

                TextField("", text: $email)
                    .font(.body)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    // MARK: - Create Button

    private var createButton: some View {
        Button {
            createGhost()
        } label: {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: "person.badge.plus")
                    Text("Créer l'invité")
                }
            }
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isFormValid ? Theme.tintColor : Theme.tintColor.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
        .disabled(!isFormValid || isLoading)
    }

    // MARK: - Validation

    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        email.contains("@")
    }

    // MARK: - Actions

    private func createGhost() {
        guard isFormValid else { return }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                let ghost = try await createGhostUseCase.execute(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    email: email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
                )

                await MainActor.run {
                    onGhostCreated(ghost)
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

#Preview {
    CreateGhostSheet(initialName: "Jean") { ghost in
        print("Ghost created: \(ghost.name)")
    }
}
