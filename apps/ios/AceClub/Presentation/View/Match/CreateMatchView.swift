//
//  CreateMatchView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import Combine

struct CreateMatchView: View {
    @Binding var isPresented: Bool
    @StateObject private var viewModel = CreateMatchViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showingCreateMatch = false
    var onMatchCreated: (() -> Void)? = nil

    var body: some View {
        NavigationStack {
            Form {
                MatchTypeSection(type: $viewModel.type)
                MatchStatusSection(status: $viewModel.status)
                ParticipantsSection(homeUser: $viewModel.homeUser, awayUser: $viewModel.awayUser)
                if viewModel.status != .scheduled {
                    SetsSection(sets: $viewModel.sets, addSet: viewModel.addSet, removeSet: viewModel.removeSet)
                }
                if viewModel.status == .finished {
                    WinnerSection(winnerSide: $viewModel.winnerSide)
                }
                DatesSection(status: viewModel.status, startedAt: $viewModel.startedAt, finishedAt: $viewModel.finishedAt)
            }
            .navigationTitle("Nouveau match")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Créer") {
                        Task { await viewModel.createMatch() }
                    }
                    .disabled(!viewModel.isValid || viewModel.isCreating)
                }
            }
            .overlay {
                if viewModel.isCreating {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()
                        ProgressView("Création du match...")
                            .padding()
                            .cardStyle()
                    }
                }
            }
            .sheet(isPresented: $showingCreateMatch) {
                CreateMatchView(isPresented: $showingCreateMatch)
            }
            .alert("Erreur", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") { viewModel.clearError() }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
            .onChange(of: viewModel.createdMatch != nil) { _, becameNonNil in
                if becameNonNil {
                    onMatchCreated?()
                    dismiss()
                }
            }
        }
    }
}

private struct MatchTypeSection: View {
    @Binding var type: MatchType
    var body: some View {
        Section("Type") {
            Picker("Type", selection: $type) {
                ForEach(MatchType.allCases, id: \.self) { matchType in
                    Label(matchType.displayName, systemImage: matchType.icon)
                        .tag(matchType as MatchType)
                }
            }
            .pickerStyle(.segmented)
        }
    }
}

private struct MatchStatusSection: View {
    @Binding var status: MatchStatus
    var body: some View {
        Section("Statut du match") {
            Picker("Statut", selection: $status) {
                ForEach(MatchStatus.allCases, id: \.self) { status in
                    Text(status.displayName).tag(status as MatchStatus)
                }
            }
            .pickerStyle(.segmented)
        }
    }
}

private struct ParticipantsSection: View {
    @Binding var homeUser: User?
    @Binding var awayUser: User?
    var body: some View {
        Section("Participants") {
            VStack(alignment: .leading, spacing: 12) {
                UserSearchField(label: "Joueur Domicile", selectedUser: $homeUser)
                Divider()
                UserSearchField(label: "Joueur Extérieur", selectedUser: $awayUser)
            }
        }
    }
}

private struct SetsSection: View {
    @Binding var sets: [SetInput]
    var addSet: () -> Void
    var removeSet: (Int) -> Void
    var body: some View {
        Section {
            ForEach(Array(sets.enumerated()), id: \.offset) { index, _ in
                SetRow(index: index, homeScore: $sets[index].homeScore, awayScore: $sets[index].awayScore, canRemove: sets.count > 1) {
                    removeSet(index)
                }
            }
            if sets.count < 5 {
                Button(action: addSet) {
                    Label("Ajouter un set", systemImage: "plus.circle.fill")
                }
            }
        } header: {
            Text("Sets")
        } footer: {
            Text("Un match de ping-pong peut avoir jusqu'à 5 sets.")
                .font(.caption)
        }
    }
}

private struct SetRow: View {
    let index: Int
    @Binding var homeScore: Int
    @Binding var awayScore: Int
    let canRemove: Bool
    let onRemove: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Set \(index + 1)")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                if canRemove {
                    Button(role: .destructive, action: onRemove) {
                        Image(systemName: "minus.circle.fill")
                            .foregroundStyle(.red)
                    }
                }
            }
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Domicile")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    TextField("Score", value: $homeScore, format: .number)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.roundedBorder)
                }
                Text(":")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Extérieur")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    TextField("Score", value: $awayScore, format: .number)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.roundedBorder)
                }
            }
        }
    }
}

private struct WinnerSection: View {
    @Binding var winnerSide: MatchSide?
    var body: some View {
        Section("Vainqueur") {
            Picker("Sélectionner le vainqueur", selection: $winnerSide) {
                Text("Aucun").tag(nil as MatchSide?)
                Text("Domicile").tag(MatchSide.home as MatchSide?)
                Text("Extérieur").tag(MatchSide.away as MatchSide?)
            }
        }
    }
}

private struct DatesSection: View {
    let status: MatchStatus
    @Binding var startedAt: Date
    @Binding var finishedAt: Date
    var body: some View {
        Section("Dates") {
            if status == .scheduled {
                DatePicker(
                    "Date prévue",
                    selection: $startedAt,
                    displayedComponents: [.date, .hourAndMinute]
                )
            }
            if status == .ongoing || status == .finished {
                DatePicker(
                    "Début du match",
                    selection: $startedAt,
                    displayedComponents: [.date, .hourAndMinute]
                )
            }
            if status == .finished {
                DatePicker(
                    "Fin du match",
                    selection: $finishedAt,
                    displayedComponents: [.date, .hourAndMinute]
                )
            }
        }
    }
}

// MARK: - Create Match ViewModel

@MainActor
class CreateMatchViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var homeUser: User? = nil
    @Published var awayUser: User? = nil
    @Published var type: MatchType = .match
    @Published var status: MatchStatus = .scheduled
    @Published var sets: [SetInput] = [SetInput()]
    @Published var winnerSide: MatchSide? = nil
    @Published var startedAt: Date = Date()
    @Published var finishedAt: Date = Date()

    @Published var isCreating: Bool = false
    @Published var errorMessage: String? = nil
    @Published var createdMatch: MatchDetail? = nil

    // MARK: - Use Cases

    private let createMatchUseCase = CreateMatchUseCase()
    private let getMeUseCase = GetMeUseCase()

    // MARK: - Computed Properties

    var isValid: Bool {
        guard let homeUser = homeUser, let awayUser = awayUser else { return false }
        guard homeUser.id != awayUser.id else { return false }

        if status == .scheduled {
            return true
        }

        guard !sets.isEmpty else { return false }

        for set in sets {
            // Vérifier uniquement que les scores sont positifs
            guard set.homeScore >= 0 && set.awayScore >= 0 else { return false }
        }

        if status == .ongoing || status == .finished {
            guard startedAt <= Date() else { return false }
        }

        if status == .finished {
            guard finishedAt >= startedAt else { return false }
        }

        return true
    }

    // MARK: - Public Methods

    func addSet() {
        guard sets.count < 5 else { return }
        sets.append(SetInput())
    }

    func removeSet(at index: Int) {
        guard sets.count > 1 else { return }
        sets.remove(at: index)
    }

    func clearError() {
        errorMessage = nil
    }

    func createMatch() async {
        guard isValid else {
            errorMessage = "Veuillez remplir tous les champs correctement"
            return
        }

        isCreating = true
        errorMessage = nil

        guard let homeUser = homeUser, let awayUser = awayUser else {
            errorMessage = "Veuillez sélectionner les deux joueurs"
            isCreating = false
            return
        }

        do {
            let currentUser = try await getMeUseCase.execute()

            let participants: [(userId: String, side: MatchSide, isWinner: Bool)] = [
                (homeUser.id, .home, winnerSide == .home),
                (awayUser.id, .away, winnerSide == .away)
            ]

            // Pour les matchs scheduled, pas de sets
            let setsData: [(setNumber: Int, scores: [(userId: String, score: Int)])]
            if status == .scheduled {
                setsData = []
            } else {
                setsData = sets.enumerated().map { index, setInput in
                    let scores: [(userId: String, score: Int)] = [
                        (homeUser.id, setInput.homeScore),
                        (awayUser.id, setInput.awayScore)
                    ]
                    return (index + 1, scores)
                }
            }

            // scheduledAt = date prévue (pour tous les statuts)
            // startedAt = date réelle de début (seulement ongoing/finished)
            // finishedAt = date réelle de fin (seulement finished)
            let scheduledDate: Date? = status == .scheduled ? startedAt : nil
            let startDate: Date? = (status == .ongoing || status == .finished) ? startedAt : nil
            let endDate: Date? = status == .finished ? finishedAt : nil

            let now = Date()
            var creationDate = now

            if let startDate = startDate, startDate < now {
                creationDate = startDate
            }

            if let endDate = endDate, endDate < creationDate {
                creationDate = endDate
            }

            // Create match
            let match = try await createMatchUseCase.execute(
                createdBy: currentUser.id,
                status: status,
                type: type,
                createdAt: creationDate,
                scheduledAt: scheduledDate,
                startedAt: startDate,
                finishedAt: endDate,
                participants: participants,
                sets: setsData
            )

            createdMatch = match

        } catch {
            errorMessage = error.localizedDescription
        }

        isCreating = false
    }
}

// MARK: - Set Input Model

struct SetInput {
    var homeScore: Int = 0
    var awayScore: Int = 0
}

#Preview {
    CreateMatchView(isPresented: .constant(true))
}
