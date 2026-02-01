//
//  EditMatchScoresView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 23/01/2026.
//

import SwiftUI

// MARK: - Editable Set Model
struct EditableSet: Identifiable {
    let id = UUID()
    var setNumber: Int
    var homeScore: Int
    var awayScore: Int
}

// MARK: - Edit Match Scores View
struct EditMatchScoresView: View {
    @ObservedObject var viewModel: MatchViewModel
    @Binding var isPresented: Bool
    let matchDetail: MatchDetail

    @State private var editableSets: [EditableSet] = []
    @State private var showingConfirmation = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    ForEach($editableSets) { $set in
                        EditableSetRow(
                            setNumber: set.setNumber,
                            homeScore: $set.homeScore,
                            awayScore: $set.awayScore,
                            canRemove: editableSets.count > 1,
                            onRemove: {
                                removeSet(set)
                            }
                        )
                    }
                } header: {
                    Text("Sets")
                } footer: {
                    Text("Modifiez les scores existants")
                        .font(.caption)
                }

                Section("Participants") {
                    if let home = matchDetail.homeParticipant {
                        HStack {
                            Text("Domicile")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(home.userName ?? "N/A")
                                .fontWeight(.medium)
                        }
                    }

                    if let away = matchDetail.awayParticipant {
                        HStack {
                            Text("Extérieur")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(away.userName ?? "N/A")
                                .fontWeight(.medium)
                        }
                    }
                }
            }
            .navigationTitle("Modifier les scores")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                    .disabled(viewModel.isUpdatingScores)
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Sauvegarder") {
                        showingConfirmation = true
                    }
                    .disabled(viewModel.isUpdatingScores || editableSets.isEmpty)
                }
            }
            .overlay {
                if viewModel.isUpdatingScores {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()

                        ProgressView("Mise à jour des scores...")
                            .padding()
                            .cardStyle()
                    }
                }
            }
            .alert("Confirmer la modification", isPresented: $showingConfirmation) {
                Button("Annuler", role: .cancel) { }
                Button("Confirmer") {
                    Task {
                        await saveScores()
                    }
                }
            } message: {
                Text("Voulez-vous vraiment mettre à jour les scores de ce match ?")
            }
            .onAppear {
                initializeEditableSets()
            }
        }
    }

    // MARK: - Private Methods

    /// Initialise les sets éditables depuis le match detail
    private func initializeEditableSets() {
        if matchDetail.sets.isEmpty {
            // Aucun set existant, créer un set vide
            editableSets = [
                EditableSet(setNumber: 1, homeScore: 0, awayScore: 0)
            ]
        } else {
            // Charger les sets existants
            editableSets = matchDetail.sets
                .sorted { $0.setNumber < $1.setNumber }
                .map { set in
                    // Récupérer les scores pour home et away
                    let homeScore = set.scores.first { $0.side == .home }?.games ?? 0
                    let awayScore = set.scores.first { $0.side == .away }?.games ?? 0

                    return EditableSet(
                        setNumber: set.setNumber,
                        homeScore: homeScore,
                        awayScore: awayScore
                    )
                }
        }
    }


    /// Supprime un set
    private func removeSet(_ set: EditableSet) {
        guard editableSets.count > 1 else { return }
        editableSets.removeAll { $0.id == set.id }

        // Réindexer les sets
        for (index, _) in editableSets.enumerated() {
            editableSets[index].setNumber = index + 1
        }
    }

    /// Sauvegarde les scores
    private func saveScores() async {
        guard let homeParticipant = matchDetail.homeParticipant,
              let awayParticipant = matchDetail.awayParticipant else {
            return
        }

        // Transformer editableSets vers le format API
        let apiSets: [(setNumber: Int, scores: [(userId: String, score: Int)])] = editableSets.map { editableSet in
            let scores: [(userId: String, score: Int)] = [
                (homeParticipant.userId, editableSet.homeScore),
                (awayParticipant.userId, editableSet.awayScore)
            ]
            return (editableSet.setNumber, scores)
        }

        // Appeler le ViewModel
        let success = await viewModel.updateScores(sets: apiSets)

        if success {
            isPresented = false
        }
    }
}
