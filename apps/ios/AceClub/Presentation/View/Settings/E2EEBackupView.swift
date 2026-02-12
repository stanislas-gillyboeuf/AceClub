//
//  E2EEBackupView.swift
//  AceClub
//

import SwiftUI

struct E2EEBackupView: View {

    @Environment(\.dismiss) private var dismiss
    @State private var passphrase = ""
    @State private var passphraseConfirm = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var isSuccess = false

    private let backupUseCase = BackupE2EEKeyUseCase()

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Sauvegardez votre clé de chiffrement avec une phrase secrète. Vous en aurez besoin pour récupérer vos messages chiffrés sur un nouvel appareil.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }

                Section("Phrase secrète") {
                    SecureField("Phrase secrète (min. 6 caractères)", text: $passphrase)
                    SecureField("Confirmer", text: $passphraseConfirm)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(Theme.destructiveColor)
                            .font(.caption)
                    }
                }

                Section {
                    Button {
                        Task { await backup() }
                    } label: {
                        HStack {
                            Spacer()
                            if isLoading {
                                ProgressView()
                            } else {
                                Text("Sauvegarder")
                            }
                            Spacer()
                        }
                    }
                    .disabled(!isValid || isLoading)
                }
            }
            .navigationTitle("Backup E2EE")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
            .alert("Backup réussi", isPresented: $isSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Votre clé de chiffrement a été sauvegardée. Conservez votre phrase secrète en lieu sûr.")
            }
        }
    }

    private var isValid: Bool {
        passphrase.count >= 6 && passphrase == passphraseConfirm
    }

    private func backup() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await backupUseCase.execute(passphrase: passphrase)
            isSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
