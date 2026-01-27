//
//  MatchDetailView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI

struct MatchDetailView: View {
    let matchId: String
    @StateObject private var viewModel = MatchViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showingDeleteAlert = false
    @State private var showingEditScores = false

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.matchDetail == nil {
                ProgressView("Chargement du match...")
            } else if let detail = viewModel.matchDetail {
                matchDetailContent(detail: detail)
            } else if viewModel.errorMessage != nil {
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
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    if viewModel.canStartMatch {
                        Button {
                            Task {
                                await viewModel.startMatch()
                            }
                        } label: {
                            Label("Démarrer le match", systemImage: "play.circle")
                        }
                    }

                    if viewModel.canFinishMatch {
                        Button {
                            Task {
                                await viewModel.finishMatch()
                            }
                        } label: {
                            Label("Terminer le match", systemImage: "checkmark.circle")
                        }
                    }

                    if viewModel.canEditScores {
                        Button {
                            showingEditScores = true
                        } label: {
                            Label("Modifier les scores", systemImage: "pencil")
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
        .refreshable {
            await viewModel.refreshMatch()
        }
        .alert("Supprimer le match", isPresented: $showingDeleteAlert) {
            Button("Annuler", role: .cancel) { }
            Button("Supprimer", role: .destructive) {
                Task {
                    let success = await viewModel.deleteMatch()
                    if success {
                        dismiss()
                    }
                }
            }
        } message: {
            Text("Cette action est irréversible. Toutes les données du match seront supprimées.")
        }
        .alert(
            viewModel.errorMessage != nil ? "Erreur" : "Succès",
            isPresented: .constant(viewModel.errorMessage != nil || viewModel.successMessage != nil)
        ) {
            Button("OK") {
                viewModel.clearMessages()
            }
        } message: {
            Text(viewModel.errorMessage ?? viewModel.successMessage ?? "")
        }
        .sheet(isPresented: $showingEditScores) {
            if let detail = viewModel.matchDetail {
                EditMatchScoresView(
                    viewModel: viewModel,
                    isPresented: $showingEditScores,
                    matchDetail: detail
                )
            }
        }
        .task {
            await viewModel.loadMatch(matchId: matchId)
        }
    }

    private func matchDetailContent(detail: MatchDetail) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                matchStatusCard(match: detail.match)

                participantsCard(detail: detail)

                setsCard(sets: detail.sets)

                matchInfoCard(match: detail.match)
            }
            .padding()
        }
    }

    private func matchStatusCard(match: Match) -> some View {
        VStack(spacing: 12) {
            HStack {
                Text("Statut")
                    .font(.headline)
                Spacer()
                Text(match.status.displayName)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(statusColor(for: match.status))
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }


            if let duration = match.formattedDuration {
                HStack {
                    Image(systemName: "clock")
                        .foregroundStyle(.secondary)
                    Text("Durée: \(duration)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
            }
        }
        .padding()
        .cardStyle()
    }

    private func participantsCard(detail: MatchDetail) -> some View {
        VStack(spacing: 16) {
            HStack {
                Text("Participants")
                    .font(.headline)
                Spacer()
                Text(detail.formattedMatchScore)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                    .contentTransition(.numericText())
            }

            if let home = detail.homeParticipant {
                participantRow(participant: home, isWinner: detail.winner?.id == home.id)
            }

            Divider()

            if let away = detail.awayParticipant {
                participantRow(participant: away, isWinner: detail.winner?.id == away.id)
            }
        }
        .padding()
        .cardStyle()
        .animation(.smooth, value: detail.formattedMatchScore)
    }

    private func participantRow(participant: MatchParticipant, isWinner: Bool) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(participant.side.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(participant.user?.name ?? "NA")
                    .font(.body)
                    .fontWeight(isWinner ? .bold : .regular)
            }

            Spacer()

            if isWinner {
                HStack(spacing: 4) {
                    Image(systemName: "crown.fill")
                        .foregroundStyle(.yellow)
                    Text("Vainqueur")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
            }
        }
        .onAppear {
            print(participant)
        }
    }

    private func setsCard(sets: [MatchSet]) -> some View {
        VStack(spacing: 12) {
            HStack {
                Text("Sets")
                    .font(.headline)
                Spacer()
                Text("\(sets.count) set(s)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            if sets.isEmpty {
                Text("Aucun set enregistré")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                ForEach(sets) { set in
                    setRow(set: set)
                    if set.id != sets.last?.id {
                        Divider()
                    }
                }
            }
        }
        .padding()
        .cardStyle()
        .onTapGesture {
            showingEditScores = true
        }
    }

    private func setRow(set: MatchSet) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(set.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Text(set.formattedScore)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
            }

            if set.scores.count == 2 {
                HStack(spacing: 20) {
                    ForEach(set.scores.sorted(by: { $0.side.rawValue < $1.side.rawValue })) { score in
                        VStack(alignment: .leading, spacing: 2) {
                            if let participant = viewModel.matchDetail?.participants.first(where: { $0.userId == score.userId }) {
                                Text(participant.user?.name ?? score.side.displayName)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            } else {
                                Text(score.side.displayName)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            Text("\(score.games)")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .contentTransition(.numericText())
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
            }
        }
        .animation(.smooth, value: set.formattedScore)
    }

    private func matchInfoCard(match: Match) -> some View {
        VStack(spacing: 12) {
            HStack {
                Text("Informations")
                    .font(.headline)
                Spacer()
            }

            infoRow(label: "ID", value: match.id)
            Divider()
            infoRow(label: "Créé par", value: match.createdBy)
            Divider()
            infoRow(label: "Créé le", value: match.formattedCreatedAt)

            if let startedAt = match.formattedStartedAt {
                Divider()
                infoRow(label: "Démarré le", value: startedAt)
            }

            if let finishedAt = match.formattedFinishedAt {
                Divider()
                infoRow(label: "Terminé le", value: finishedAt)
            }
        }
        .padding()
        .cardStyle()
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .lineLimit(1)
                .truncationMode(.middle)
        }
    }

    private var errorView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 60))
                .foregroundStyle(.red)

            Text("Erreur")
                .font(.title2)
                .fontWeight(.bold)

            Text(viewModel.errorMessage ?? "Une erreur est survenue")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Réessayer") {
                Task {
                    await viewModel.loadMatch(matchId: matchId)
                }
            }
            .buttonStyle(.appPrimary)
        }
        .padding()
    }

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
