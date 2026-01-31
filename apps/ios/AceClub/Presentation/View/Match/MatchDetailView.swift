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
    @Environment(AuthViewModel.self) private var authViewModel

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
    @State private var showingCommentSheet = false

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

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
        .toolbar {
            // Only participants can manage the match
            if isParticipant {
                ToolbarItemGroup(placement: .primaryAction) {
                    if canEditScores {
                        Button {
                            showingEditScores = true
                        } label: {
                            Image(systemName: "pencil")
                        }
                    }

                    Menu {
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

                        Divider()

                        Button(role: .destructive) {
                            showingDeleteAlert = true
                        } label: {
                            Label("Supprimer le match", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
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
        .sheet(isPresented: $showingEditScores) {
            if let match {
                EditMatchScoresViewSwiftData(
                    match: match,
                    isPresented: $showingEditScores
                )
            }
        }
        .sheet(isPresented: $showingCommentSheet) {
            if let match {
                MatchCommentSheet(
                    match: match,
                    existingComment: userComment,
                    isPresented: $showingCommentSheet
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
                    HStack(spacing: 6) {
                        Image(systemName: match.matchType.icon)
                        Text(match.matchType.displayName)
                    }
                    .foregroundStyle(match.matchType == .match ? .blue : .orange)
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

            // Section 5: Commentaires (seulement pour les matchs terminés)
            if match.isFinished {
                Section("Commentaires") {
                    ForEach(match.comments.sorted { $0.createdAt < $1.createdAt }) { comment in
                        commentRow(comment: comment)
                    }

                    if !hasUserCommented && isParticipant {
                        Button {
                            showingCommentSheet = true
                        } label: {
                            Label("Ajouter un commentaire", systemImage: "plus.bubble")
                        }
                    }
                }
            }

        }
        .animation(.smooth, value: match.formattedMatchScore)
    }

    // MARK: - Comment Helpers

    private var hasUserCommented: Bool {
        guard let match else { return false }
        return match.comments.contains { $0.userId == currentUserId }
    }

    private var isParticipant: Bool {
        guard let match else { return false }
        return match.participants.contains { $0.userId == currentUserId }
    }

    private var userComment: MatchCommentModel? {
        guard let match else { return nil }
        return match.comments.first { $0.userId == currentUserId }
    }

    private func commentRow(comment: MatchCommentModel) -> some View {
        HStack(alignment: .top, spacing: 12) {
            commentAvatar(comment: comment)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.userName)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    if comment.wasEdited {
                        Text("(modifié)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Text(comment.formattedDate)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Text(comment.content)
                    .font(.body)
                    .foregroundStyle(.primary)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if comment.userId == currentUserId {
                showingCommentSheet = true
            }
        }
    }

    @ViewBuilder
    private func commentAvatar(comment: MatchCommentModel) -> some View {
        if let imageURL = comment.userImageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 36, height: 36)
                        .clipShape(Circle())
                case .failure:
                    avatarPlaceholder(initials: comment.userInitials)
                case .empty:
                    ProgressView()
                        .frame(width: 36, height: 36)
                @unknown default:
                    avatarPlaceholder(initials: comment.userInitials)
                }
            }
        } else {
            Circle()
                .fill(Theme.tintColor.opacity(0.2))
                .frame(width: 36, height: 36)
                .overlay {
                    Text(comment.userInitials)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(Theme.tintColor)
                }
        }
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
            .fill(Theme.tintColor.opacity(0.2))
            .frame(width: 44, height: 44)
            .overlay {
                Text(initials)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.tintColor)
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
    @State private var editedSets: [EditableSetData] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showConfirmation = false

    // Données d'un set éditable
    private struct EditableSetData: Identifiable {
        let id = UUID()
        var setNumber: Int
        var homeScore: Int
        var awayScore: Int
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Header avec les participants
                    matchHeader
                        .padding(.bottom, 8)

                    // Sets éditables
                    ForEach($editedSets) { $setData in
                        SetScoreEditorRow(
                            setNumber: setData.setNumber,
                            homeName: homeName,
                            awayName: awayName,
                            homeScore: $setData.homeScore,
                            awayScore: $setData.awayScore,
                            canDelete: editedSets.count > 1,
                            onDelete: {
                                withAnimation(.snappy) {
                                    removeSet(setData)
                                }
                            }
                        )
                    }

                    // Bouton ajouter un set
                    addSetButton
                }
                .padding(Theme.paddingHorizontal)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Modifier les scores")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                    .disabled(isLoading)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        showConfirmation = true
                    }
                    .fontWeight(.semibold)
                    .disabled(isLoading || editedSets.isEmpty)
                }
            }
            .overlay {
                if isLoading {
                    loadingOverlay
                }
            }
            .alert("Confirmer les modifications", isPresented: $showConfirmation) {
                Button("Annuler", role: .cancel) { }
                Button("Enregistrer") {
                    Task { await saveScores() }
                }
            } message: {
                Text("Les scores du match seront mis à jour.")
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

    // MARK: - Subviews

    private var matchHeader: some View {
        VStack(spacing: 12) {
            // Score global actuel
            HStack(spacing: 24) {
                VStack(spacing: 4) {
                    participantAvatar(for: match.homeParticipant)
                    Text(homeName)
                        .font(.subheadline.weight(.medium))
                        .lineLimit(1)
                }

                VStack(spacing: 2) {
                    Text(globalScore)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)
                    Text("Sets")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 4) {
                    participantAvatar(for: match.awayParticipant)
                    Text(awayName)
                        .font(.subheadline.weight(.medium))
                        .lineLimit(1)
                }
            }
        }
        .padding(Theme.paddingCard)
        .frame(maxWidth: .infinity)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
    }

    @ViewBuilder
    private func participantAvatar(for participant: MatchParticipantModel?) -> some View {
        if let imageURL = participant?.userImageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 48, height: 48)
                        .clipShape(Circle())
                default:
                    avatarPlaceholder(initials: participant?.userInitials ?? "?")
                }
            }
        } else {
            avatarPlaceholder(initials: participant?.userInitials ?? "?")
        }
    }

    private func avatarPlaceholder(initials: String) -> some View {
        Circle()
            .fill(Color.accentColor.opacity(0.15))
            .frame(width: 48, height: 48)
            .overlay {
                Text(initials)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.accentColor)
            }
    }

    private var addSetButton: some View {
        Button {
            withAnimation(.snappy) {
                addSet()
            }
        } label: {
            Label("Ajouter un set", systemImage: "plus.circle.fill")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Color.accentColor)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.accentColor.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 12) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Enregistrement...")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Computed Properties

    private var homeName: String {
        match.homeParticipant?.userName ?? "Joueur 1"
    }

    private var awayName: String {
        match.awayParticipant?.userName ?? "Joueur 2"
    }

    private var homeUserId: String {
        match.homeParticipant?.userId ?? ""
    }

    private var awayUserId: String {
        match.awayParticipant?.userId ?? ""
    }

    private var globalScore: String {
        var homeSets = 0
        var awaySets = 0
        for set in editedSets {
            if set.homeScore > set.awayScore {
                homeSets += 1
            } else if set.awayScore > set.homeScore {
                awaySets += 1
            }
        }
        return "\(homeSets) - \(awaySets)"
    }

    // MARK: - Methods

    private func initializeEditedSets() {
        let sortedSets = match.sets.sorted { $0.setNumber < $1.setNumber }

        if sortedSets.isEmpty {
            // Créer un set par défaut
            editedSets = [EditableSetData(setNumber: 1, homeScore: 0, awayScore: 0)]
        } else {
            editedSets = sortedSets.map { set in
                let homeScore = set.scores.first { $0.userId == homeUserId }?.games ?? 0
                let awayScore = set.scores.first { $0.userId == awayUserId }?.games ?? 0
                return EditableSetData(
                    setNumber: set.setNumber,
                    homeScore: homeScore,
                    awayScore: awayScore
                )
            }
        }
    }

    private func addSet() {
        let nextSetNumber = (editedSets.map(\.setNumber).max() ?? 0) + 1
        editedSets.append(EditableSetData(setNumber: nextSetNumber, homeScore: 0, awayScore: 0))
    }

    private func removeSet(_ set: EditableSetData) {
        editedSets.removeAll { $0.id == set.id }
        // Réindexer les sets
        for i in editedSets.indices {
            editedSets[i].setNumber = i + 1
        }
    }

    private func saveScores() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        let setsData: [(setNumber: Int, scores: [(userId: String, score: Int)])] = editedSets.map { set in
            let scores: [(userId: String, score: Int)] = [
                (homeUserId, set.homeScore),
                (awayUserId, set.awayScore)
            ]
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

// MARK: - MatchCommentSheet

struct MatchCommentSheet: View {
    @Environment(\.modelContext) private var modelContext

    let match: MatchModel
    let existingComment: MatchCommentModel?
    @Binding var isPresented: Bool

    @State private var syncService: MatchSyncService?
    @State private var content: String = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingDeleteConfirmation = false

    private var isEditing: Bool {
        existingComment != nil
    }

    private var canSave: Bool {
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && content.count <= 500
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Votre commentaire...", text: $content, axis: .vertical)
                        .lineLimit(5...10)
                } footer: {
                    HStack {
                        Text("\(content.count)/500")
                            .foregroundStyle(content.count > 500 ? .red : .secondary)
                        Spacer()
                    }
                }

                if isEditing {
                    Section {
                        Button(role: .destructive) {
                            showingDeleteConfirmation = true
                        } label: {
                            HStack {
                                Spacer()
                                Label("Supprimer le commentaire", systemImage: "trash")
                                Spacer()
                            }
                        }
                    }
                }
            }
            .navigationTitle(isEditing ? "Modifier" : "Ajouter un commentaire")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                    .disabled(isLoading)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        Task { await saveComment() }
                    }
                    .fontWeight(.semibold)
                    .disabled(isLoading || !canSave)
                }
            }
            .overlay {
                if isLoading {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()

                        VStack(spacing: 12) {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Enregistrement...")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(24)
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                    }
                }
            }
            .alert("Supprimer le commentaire", isPresented: $showingDeleteConfirmation) {
                Button("Annuler", role: .cancel) { }
                Button("Supprimer", role: .destructive) {
                    Task { await deleteComment() }
                }
            } message: {
                Text("Cette action est irréversible.")
            }
            .alert("Erreur", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            if let existingComment {
                content = existingComment.content
            }
        }
    }

    // MARK: - Methods

    private func saveComment() async {
        guard !isLoading, canSave else { return }
        isLoading = true
        errorMessage = nil

        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            if isEditing {
                _ = try await syncService?.updateComment(matchId: match.id, content: trimmedContent)
            } else {
                _ = try await syncService?.createComment(matchId: match.id, content: trimmedContent)
            }
            isPresented = false
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func deleteComment() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        do {
            let success = try await syncService?.deleteComment(matchId: match.id) ?? false
            if success {
                isPresented = false
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
