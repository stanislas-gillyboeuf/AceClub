//
//  E2EERecoveryView.swift
//  AceClub
//

import SwiftUI

struct E2EERecoveryView: View {

    @Environment(\.dismiss) private var dismiss
    @State private var passphrase = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var isSuccess = false

    private let recoverUseCase = RecoverE2EEKeyUseCase()

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Entrez votre phrase secrète pour récupérer votre clé de chiffrement et accéder à vos messages chiffrés.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }

                Section("Phrase secrète") {
                    SecureField("Votre phrase secrète", text: $passphrase)
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
                        Task { await recover() }
                    } label: {
                        HStack {
                            Spacer()
                            if isLoading {
                                ProgressView()
                            } else {
                                Text("Récupérer")
                            }
                            Spacer()
                        }
                    }
                    .disabled(passphrase.isEmpty || isLoading)
                }
            }
            .navigationTitle("Récupération E2EE")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
            .alert("Récupération réussie", isPresented: $isSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Votre clé de chiffrement a été récupérée. Vos messages chiffrés sont à nouveau accessibles.")
            }
        }
    }

    private func recover() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await recoverUseCase.execute(passphrase: passphrase)
            isSuccess = true
        } catch {
            errorMessage = String(localized: "Phrase secrète incorrecte ou backup introuvable.")
        }
    }
}
