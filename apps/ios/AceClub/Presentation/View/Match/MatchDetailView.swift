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
        .navigationBarTitleDisplayMode(.large)
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

    // MARK: - Content

    private func matchDetailContent(detail: MatchDetail) -> some View {
        Form {
            // Section 1: Résultat principal (score global proéminent)
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        // Score global en grand
                        Text(detail.formattedMatchScore)
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .contentTransition(.numericText())

                        // Badge statut
                        Text(detail.match.status.displayName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(statusColor(for: detail.match.status))
                            .clipShape(Capsule())
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
            }

            // Section 2: Participants
            Section("Participants") {
                if let home = detail.homeParticipant {
                    participantRow(participant: home, isWinner: detail.winner?.id == home.id)
                }
                if let away = detail.awayParticipant {
                    participantRow(participant: away, isWinner: detail.winner?.id == away.id)
                }
            }

            // Section 3: Sets (si présents)
            if !detail.sets.isEmpty {
                Section("Sets (\(detail.sets.count))") {
                    ForEach(detail.sets) { set in
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
                    Label(detail.match.type.displayName, systemImage: detail.match.type.icon)
                }

                if let scheduledAt = detail.match.formattedScheduledAt {
                    LabeledContent("Date prévue", value: scheduledAt)
                }

                if let startedAt = detail.match.formattedStartedAt {
                    LabeledContent("Démarré le", value: startedAt)
                }

                if let finishedAt = detail.match.formattedFinishedAt {
                    LabeledContent("Terminé le", value: finishedAt)
                }

                if let duration = detail.match.formattedDuration {
                    LabeledContent("Durée", value: duration)
                }

                LabeledContent("Créé le", value: detail.match.formattedCreatedAt)
            }

            // Section 5: Actions
            Section("Actions") {
                if viewModel.canStartMatch {
                    Button {
                        Task { await viewModel.startMatch() }
                    } label: {
                        Label("Démarrer le match", systemImage: "play.circle")
                    }
                }

                if viewModel.canFinishMatch {
                    Button {
                        Task { await viewModel.finishMatch() }
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

                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    Label("Supprimer le match", systemImage: "trash")
                }
            }
        }
        .animation(.smooth, value: detail.formattedMatchScore)
    }

    // MARK: - Row Components

    private func participantRow(participant: MatchParticipant, isWinner: Bool) -> some View {
        HStack(spacing: 12) {
            // Avatar avec image de profil ou initiales
            participantAvatar(user: participant.user)

            VStack(alignment: .leading, spacing: 2) {
                Text(participant.side.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(participant.user?.name ?? "N/A")
                    .font(.body)
                    .fontWeight(isWinner ? .bold : .regular)
            }
            Spacer()
            if isWinner {
                Label("Vainqueur", systemImage: "crown.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }
        }
    }

    @ViewBuilder
    private func participantAvatar(user: User?) -> some View {
        if let imageURL = user?.imageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 44, height: 44)
                        .clipShape(Circle())
                case .failure:
                    avatarPlaceholder(user: user)
                case .empty:
                    ProgressView()
                        .frame(width: 44, height: 44)
                @unknown default:
                    avatarPlaceholder(user: user)
                }
            }
        } else {
            avatarPlaceholder(user: user)
        }
    }

    private func avatarPlaceholder(user: User?) -> some View {
        Circle()
            .fill(Color.blue.opacity(0.2))
            .frame(width: 44, height: 44)
            .overlay {
                Text(user?.initials ?? "??")
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
