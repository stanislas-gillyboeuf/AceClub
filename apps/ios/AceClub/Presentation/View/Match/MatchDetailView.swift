//
//  MatchDetailView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import SwiftData

struct MatchDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let matchId: String

    // SwiftData query for the specific match
    @Query private var matches: [MatchModel]

    private var match: MatchModel? {
        matches.first { $0.id == matchId }
    }

    @State private var syncService: MatchSyncService?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    @State private var showingDeleteAlert = false
    @State private var showingEditScores = false

    init(matchId: String) {
        self.matchId = matchId
        // Filter query to only fetch matches with this ID
        let id = matchId
        _matches = Query(filter: #Predicate { $0.id == id })
    }

    var body: some View {
        Group {
            if isLoading && match == nil {
                ProgressView("Chargement du match...")
            } else if let match {
                matchDetailContent(match: match)
            } else if errorMessage != nil {
                errorView
            } else {
                ContentUnavailableView(
                    "Match introuvable",
                    systemImage: "exclamationmark.triangle",
                    description: Text("Ce match n'existe pas ou a été supprimé")
                )
            }
        }
        .navigationTitle("Détails du match")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await refresh()
        }
        .alert("Supprimer le match", isPresented: $showingDeleteAlert) {
            Button("Annuler", role: .cancel) { }
            Button("Supprimer", role: .destructive) {
                Task {
                    await deleteMatch()
                }
            }
        } message: {
            Text("Cette action est irréversible. Toutes les données du match seront supprimées.")
        }
        .alert(
            errorMessage != nil ? "Erreur" : "Succès",
            isPresented: .constant(errorMessage != nil || successMessage != nil)
        ) {
            Button("OK") {
                errorMessage = nil
                successMessage = nil
            }
        } message: {
            Text(errorMessage ?? successMessage ?? "")
        }
        .sheet(isPresented: $showingEditScores) {
            if let match {
                EditMatchScoresViewSwiftData(
                    match: match,
                    isPresented: $showingEditScores
                )
            }
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            await loadMatch()
        }
    }

    // MARK: - Private Methods

    private func loadMatch() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        do {
            try await syncService?.syncMatch(id: matchId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        do {
            try await syncService?.syncMatch(id: matchId)
        } catch {
            print("Refresh error: \(error)")
        }
        isLoading = false
    }

    private func startMatch() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        do {
            _ = try await syncService?.updateMatch(
                id: matchId,
                status: .ongoing,
                startedAt: Date()
            )
            successMessage = "Match démarré"
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func finishMatch() async {
        guard !isLoading, let match else { return }
        isLoading = true
        errorMessage = nil
        do {
            let winnerId = calculateWinner(match: match)
            _ = try await syncService?.updateMatch(
                id: matchId,
                status: .finished,
                finishedAt: Date(),
                winnerId: winnerId
            )
            successMessage = "Match terminé"
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func deleteMatch() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        do {
            let success = try await syncService?.deleteMatch(id: matchId) ?? false
            if success {
                dismiss()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func calculateWinner(match: MatchModel) -> String? {
        guard !match.sets.isEmpty else { return nil }

        var setsWonByUser: [String: Int] = [:]

        for set in match.sets {
            guard set.scores.count == 2 else { continue }

            let sortedScores = set.scores.sorted { $0.games > $1.games }
            guard let winner = sortedScores.first, winner.games > sortedScores.last!.games else {
                continue
            }

            setsWonByUser[winner.userId, default: 0] += 1
        }

        guard let (winnerId, _) = setsWonByUser.max(by: { $0.value < $1.value }) else {
            return nil
        }

        return winnerId
    }

    // MARK: - Computed Properties

    private var canStartMatch: Bool {
        match?.isScheduled ?? false
    }

    private var canFinishMatch: Bool {
        match?.isOngoing ?? false
    }

    private var canEditScores: Bool {
        match?.isOngoing ?? false
    }

    // MARK: - Content

    private func matchDetailContent(match: MatchModel) -> some View {
        Form {
            // Section 1: Résultat principal (score global proéminent)
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        // Score global en grand
                        Text(match.formattedMatchScore)
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .contentTransition(.numericText())

                        // Badge statut
                        Text(match.matchStatus.displayName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(statusColor(for: match.matchStatus))
                            .clipShape(Capsule())
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
            }

            // Section 2: Participants
            Section("Participants") {
                if let home = match.homeParticipant {
                    participantRow(participant: home)
                }
                if let away = match.awayParticipant {
                    participantRow(participant: away)
                }
            }

            // Section 3: Sets (si présents)
            if !match.sets.isEmpty {
                Section("Sets (\(match.sets.count))") {
                    ForEach(match.sets.sorted { $0.setNumber < $1.setNumber }) { set in
                        LabeledContent(set.displayName) {
                            Text(set.formattedScore)
                                .font(.headline)
                                .contentTransition(.numericText())
                        }
                    }
                }
            }

            // Section 4: Informations
            Section("Informations") {
                LabeledContent("Type") {
                    Label(match.matchType.displayName, systemImage: match.matchType.icon)
                }

                if let scheduledAt = match.formattedScheduledAt {
                    LabeledContent("Date prévue", value: scheduledAt)
                }

                if let startedAt = match.formattedStartedAt {
                    LabeledContent("Démarré le", value: startedAt)
                }

                if let finishedAt = match.formattedFinishedAt {
                    LabeledContent("Terminé le", value: finishedAt)
                }

                if let duration = match.formattedDuration {
                    LabeledContent("Durée", value: duration)
                }

                LabeledContent("Créé le", value: match.formattedCreatedAt)
            }

            // Section 5: Actions
            Section("Actions") {
                if canStartMatch {
                    Button {
                        Task { await startMatch() }
                    } label: {
                        Label("Démarrer le match", systemImage: "play.circle")
                    }
                }

                if canFinishMatch {
                    Button {
                        Task { await finishMatch() }
                    } label: {
                        Label("Terminer le match", systemImage: "checkmark.circle")
                    }
                }

                if canEditScores {
                    Button {
                        showingEditScores = true
                    } label: {
                        Label("Modifier les scores", systemImage: "pencil")
                    }
                }

                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    Label("Supprimer le match", systemImage: "trash")
                }
            }
        }
        .animation(.smooth, value: match.formattedMatchScore)
    }

    // MARK: - Row Components

    private func participantRow(participant: MatchParticipantModel) -> some View {
        HStack(spacing: 12) {
            // Avatar avec image de profil ou initiales
            participantAvatar(participant: participant)

            VStack(alignment: .leading, spacing: 2) {
                Text(participant.matchSide.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(participant.userName ?? "N/A")
                    .font(.body)
                    .fontWeight(participant.isWinner ? .bold : .regular)
            }
            Spacer()
            if participant.isWinner {
                Label("Vainqueur", systemImage: "crown.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }
        }
    }

    @ViewBuilder
    private func participantAvatar(participant: MatchParticipantModel) -> some View {
        if let imageURL = participant.userImageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 44, height: 44)
                        .clipShape(Circle())
                case .failure:
                    avatarPlaceholder(initials: participant.userInitials)
                case .empty:
                    ProgressView()
                        .frame(width: 44, height: 44)
                @unknown default:
                    avatarPlaceholder(initials: participant.userInitials)
                }
            }
        } else {
            avatarPlaceholder(initials: participant.userInitials)
        }
    }

    private func avatarPlaceholder(initials: String) -> some View {
        Circle()
            .fill(Color.blue.opacity(0.2))
            .frame(width: 44, height: 44)
            .overlay {
                Text(initials)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.blue)
            }
    }

    // MARK: - Error View

    private var errorView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 60))
                .foregroundStyle(.red)

            Text("Erreur")
                .font(.title2)
                .fontWeight(.bold)

            Text(errorMessage ?? "Une erreur est survenue")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Réessayer") {
                Task {
                    await loadMatch()
                }
            }
            .buttonStyle(.appPrimary)
        }
        .padding()
    }

    // MARK: - Helpers

    private func statusColor(for status: MatchStatus) -> Color {
        switch status {
        case .scheduled:
            return .blue
        case .ongoing:
            return .orange
        case .finished:
            return .green
        }
    }
}

// MARK: - EditMatchScoresViewSwiftData

struct EditMatchScoresViewSwiftData: View {
    @Environment(\.modelContext) private var modelContext

    let match: MatchModel
    @Binding var isPresented: Bool

    @State private var syncService: MatchSyncService?
    @State private var editedSets: [[String: Int]] = []  // [setIndex: [userId: score]]
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                ForEach(Array(match.sets.sorted { $0.setNumber < $1.setNumber }.enumerated()), id: \.offset) { index, set in
                    Section("Set \(set.setNumber)") {
                        ForEach(set.scores, id: \.id) { score in
                            HStack {
                                Text(getParticipantName(for: score.userId))
                                Spacer()
                                TextField("Score", value: binding(for: index, userId: score.userId), format: .number)
                                    .keyboardType(.numberPad)
                                    .multilineTextAlignment(.trailing)
                                    .frame(width: 60)
                            }
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
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        Task { await saveScores() }
                    }
                    .disabled(isLoading)
                }
            }
            .alert("Erreur", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            initializeEditedSets()
        }
    }

    private func initializeEditedSets() {
        editedSets = match.sets.sorted { $0.setNumber < $1.setNumber }.map { set in
            var scores: [String: Int] = [:]
            for score in set.scores {
                scores[score.userId] = score.games
            }
            return scores
        }
    }

    private func binding(for setIndex: Int, userId: String) -> Binding<Int> {
        Binding(
            get: {
                guard setIndex < editedSets.count else { return 0 }
                return editedSets[setIndex][userId] ?? 0
            },
            set: { newValue in
                guard setIndex < editedSets.count else { return }
                editedSets[setIndex][userId] = newValue
            }
        )
    }

    private func getParticipantName(for userId: String) -> String {
        match.participants.first { $0.userId == userId }?.userName ?? "N/A"
    }

    private func saveScores() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        let sortedSets = match.sets.sorted { $0.setNumber < $1.setNumber }

        let setsData: [(setNumber: Int, scores: [(userId: String, score: Int)])] = sortedSets.enumerated().map { index, set in
            let scores = editedSets[index].map { (userId: $0.key, score: $0.value) }
            return (setNumber: set.setNumber, scores: scores)
        }

        do {
            let success = try await syncService?.updateScores(matchId: match.id, sets: setsData) ?? false
            if success {
                isPresented = false
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
