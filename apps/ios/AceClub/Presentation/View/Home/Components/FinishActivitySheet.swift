import SwiftUI
import SwiftData

struct FinishActivitySheet: View {
    @Environment(\.modelContext) private var modelContext

    let match: MatchModel
    let totalFinishedCount: Int
    @Binding var isPresented: Bool

    @State private var syncService: MatchSyncService?
    @State private var editedSets: [EditableSet] = []
    @State private var selectedSensation: Sensation?
    @State private var comment: String = ""
    @State private var showToClub: Bool = true
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showCongratulations = false

    struct EditableSet: Identifiable {
        let id = UUID()
        var setNumber: Int
        var homeScore: Int
        var awayScore: Int
    }

    enum Sensation: String, CaseIterable, Identifiable {
        case bad = "bad"
        case average = "average"
        case good = "good"
        case fire = "fire"

        var id: String { rawValue }

        var emoji: String {
            switch self {
            case .bad: return "\u{1F61E}"
            case .average: return "\u{1F610}"
            case .good: return "\u{1F642}"
            case .fire: return "\u{1F525}"
            }
        }

        var label: String {
            switch self {
            case .bad: return "Mauvais"
            case .average: return "Moyen"
            case .good: return "Bon"
            case .fire: return "Tr\u{00e8}s bon"
            }
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if showCongratulations {
                    congratulationsView
                } else {
                    formContent
                }
            }
            .navigationTitle("Terminer l'activit\u{00e9}")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if !showCongratulations {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Annuler") {
                            isPresented = false
                        }
                        .disabled(isLoading)
                    }
                }
            }
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            initializeSets()
        }
        .interactiveDismissDisabled(isLoading || showCongratulations)
    }

    // MARK: - Form

    private var formContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Match header
                matchHeader
                    .padding(.top, 8)

                // Score section
                scoreSection

                // Sensation picker
                sensationSection

                // Comment
                commentSection

                // Club visibility toggle
                visibilitySection

                // Submit button
                submitButton
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 32)
        }
        .background(Color(.systemGroupedBackground))
        .overlay {
            if isLoading {
                loadingOverlay
            }
        }
        .alert("Erreur", isPresented: .constant(errorMessage != nil)) {
            Button("OK") { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    // MARK: - Match Header

    private var matchHeader: some View {
        HStack(spacing: 24) {
            VStack(spacing: 4) {
                participantAvatar(for: match.homeParticipant)
                Text(homeName)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
            }

            VStack(spacing: 2) {
                Text(globalScore)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
                Text("Sets")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 4) {
                participantAvatar(for: match.awayParticipant)
                Text(awayName)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
            }
        }
        .padding(Theme.paddingCard)
        .frame(maxWidth: .infinity)
        .cardStyle(cornerRadius: Theme.cornerRadiusLarge)
    }

    // MARK: - Score Section

    private var scoreSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Scores")
                .font(.headline)

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

            Button {
                withAnimation(.snappy) { addSet() }
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
    }

    // MARK: - Sensation Section

    private var sensationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Sensations de jeu")
                .font(.headline)

            HStack(spacing: 12) {
                ForEach(Sensation.allCases) { sensation in
                    sensationButton(sensation)
                }
            }
        }
    }

    private func sensationButton(_ sensation: Sensation) -> some View {
        Button {
            withAnimation(.snappy) {
                if selectedSensation == sensation {
                    selectedSensation = nil
                } else {
                    selectedSensation = sensation
                }
            }
        } label: {
            VStack(spacing: 6) {
                Text(sensation.emoji)
                    .font(.system(size: 28))

                Text(sensation.label)
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(selectedSensation == sensation ? .white : .secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                selectedSensation == sensation
                    ? AnyShapeStyle(Theme.accentGreen)
                    : AnyShapeStyle(Theme.cardBackground)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(
                        selectedSensation == sensation ? Theme.accentGreen : Theme.borderColor,
                        lineWidth: selectedSensation == sensation ? 2 : Theme.borderWidthSubtle
                    )
            }
        }
        .buttonStyle(.plain)
        .scaleEffect(selectedSensation == sensation ? 1.05 : 1.0)
    }

    // MARK: - Comment Section

    private var commentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Commentaire")
                .font(.headline)

            TextField("Comment s'est pass\u{00e9} ton match ?", text: $comment, axis: .vertical)
                .lineLimit(3...6)
                .aceTextFieldStyle()

            HStack {
                Text("\(comment.count)/500")
                    .font(.caption2)
                    .foregroundStyle(comment.count > 500 ? .red : .secondary)
                Spacer()
            }
        }
    }

    // MARK: - Visibility Toggle

    private var visibilitySection: some View {
        Toggle(isOn: $showToClub) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Montrer au club")
                    .font(.subheadline.weight(.medium))
                Text("Tes co\u{00e9}quipiers verront ton r\u{00e9}sultat et ton commentaire")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .tint(Theme.accentGreen)
        .padding(Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }

    // MARK: - Submit

    private var submitButton: some View {
        Button {
            Task { await submit() }
        } label: {
            Text("Valider")
        }
        .buttonStyle(.appPrimary)
        .disabled(isLoading)
    }

    // MARK: - Congratulations

    private var congratulationsView: some View {
        VStack(spacing: 24) {
            Spacer()

            Text("\u{1F3C6}")
                .font(.system(size: 80))

            VStack(spacing: 8) {
                Text("F\u{00e9}licitations !")
                    .font(.title.weight(.bold))

                let activityName = match.matchType == .training ? "entra\u{00ee}nement" : "match"
                let ordinal = totalFinishedCount + 1

                Text("Tu as fini ton \(ordinal)\(ordinalSuffix(ordinal)) \(activityName) sur Ace Club. Continue comme \u{00e7}a et on te revois \u{00e0} Roland \u{1F4AA}\u{1F3FB}")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }

            Spacer()

            Button {
                isPresented = false
            } label: {
                Text("Continuer")
            }
            .buttonStyle(.appPrimary)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity)
        .background(Theme.primaryBackground)
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }

    // MARK: - Loading Overlay

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

    // MARK: - Helpers

    @ViewBuilder
    private func participantAvatar(for participant: MatchParticipantModel?) -> some View {
        if let imageURL = participant?.cacheBustedImageURL() {
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

    private func ordinalSuffix(_ n: Int) -> String {
        n == 1 ? "er" : "e"
    }

    // MARK: - Set Management

    private func initializeSets() {
        let sortedSets = match.sets.sorted { $0.setNumber < $1.setNumber }

        if sortedSets.isEmpty {
            editedSets = [EditableSet(setNumber: 1, homeScore: 0, awayScore: 0)]
        } else {
            editedSets = sortedSets.map { set in
                let homeScore = set.scores.first { $0.userId == homeUserId }?.games ?? 0
                let awayScore = set.scores.first { $0.userId == awayUserId }?.games ?? 0
                return EditableSet(
                    setNumber: set.setNumber,
                    homeScore: homeScore,
                    awayScore: awayScore
                )
            }
        }
    }

    private func addSet() {
        let nextNumber = (editedSets.map(\.setNumber).max() ?? 0) + 1
        editedSets.append(EditableSet(setNumber: nextNumber, homeScore: 0, awayScore: 0))
    }

    private func removeSet(_ set: EditableSet) {
        editedSets.removeAll { $0.id == set.id }
        for i in editedSets.indices {
            editedSets[i].setNumber = i + 1
        }
    }

    // MARK: - Submit

    private func submit() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        do {
            // 1. Save scores
            let setsData: [(setNumber: Int, scores: [(userId: String, score: Int)])] = editedSets.map { set in
                let scores: [(userId: String, score: Int)] = [
                    (homeUserId, set.homeScore),
                    (awayUserId, set.awayScore)
                ]
                return (setNumber: set.setNumber, scores: scores)
            }

            _ = try await syncService?.updateScores(matchId: match.id, sets: setsData)

            // 2. Finish the match
            let winnerId = calculateWinner()
            _ = try await syncService?.updateMatch(
                id: match.id,
                status: .finished,
                finishedAt: Date(),
                winnerId: winnerId
            )

            // 3. End Live Activity
            await MatchLiveActivityManager.shared.endActivity(withFinalState: match)

            // 4. Post comment if showToClub and there's content
            let commentParts = buildCommentText()
            if showToClub && !commentParts.isEmpty {
                _ = try await syncService?.createComment(matchId: match.id, content: commentParts)
            }

            isLoading = false

            // Show congratulations
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                showCongratulations = true
            }
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    private func calculateWinner() -> String? {
        guard !editedSets.isEmpty else { return nil }

        var setsWonByUser: [String: Int] = [:]

        for set in editedSets {
            if set.homeScore > set.awayScore {
                setsWonByUser[homeUserId, default: 0] += 1
            } else if set.awayScore > set.homeScore {
                setsWonByUser[awayUserId, default: 0] += 1
            }
        }

        guard let (winnerId, _) = setsWonByUser.max(by: { $0.value < $1.value }) else {
            return nil
        }

        return winnerId
    }

    private func buildCommentText() -> String {
        var parts: [String] = []

        if let sensation = selectedSensation {
            parts.append("\(sensation.emoji) \(sensation.label)")
        }

        let trimmedComment = comment.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedComment.isEmpty {
            parts.append(trimmedComment)
        }

        return parts.joined(separator: " \u{2022} ")
    }
}
