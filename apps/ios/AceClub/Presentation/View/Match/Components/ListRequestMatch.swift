import SwiftUI

struct ListRequestMatch: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(DeepLinkManager.self) private var deepLinkManager
    @StateObject private var viewModel = MatchRequestsViewModel()
    var onAccepted: (() -> Void)?

    @State private var acceptedConversationId: String?

    private var showErrorAlert: Binding<Bool> {
        Binding(
            get: { viewModel.errorMessage != nil },
            set: { if !$0 { viewModel.errorMessage = nil } }
        )
    }

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.pendingRequests.isEmpty {
                    ProgressView("Chargement des demandes...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if !viewModel.hasPendingRequests {
                    ContentUnavailableView(
                        "Aucune demande en attente",
                        systemImage: "tennis.racket",
                        description: Text("Quand un joueur veut matcher avec toi, sa demande apparaîtra ici.")
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.pendingRequests) { item in
                                MatchRequestCard(
                                    item: item,
                                    onAccept: { Task { await handleAccept(item: item) } },
                                    onReject: { Task { await viewModel.reject(request: item) } }
                                )
                            }
                        }
                        .padding(.horizontal, Theme.paddingHorizontal)
                        .padding(.top, 8)
                        .padding(.bottom, 24)
                    }
                }
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Demandes de match")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if viewModel.hasPendingRequests {
                        Text("\(viewModel.pendingRequests.count) en attente")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Theme.tintColor)
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.labelTertiary)
                    }
                }
            }
            .task {
                await viewModel.loadRequests()
            }
            .alert("Erreur", isPresented: showErrorAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
        .presentationBackground(.regularMaterial)
    }

    private func handleAccept(item: MatchRequestWithDetails) async {
        let result = await viewModel.accept(request: item)
        if let result = result, let conversationId = result.conversationId {
            onAccepted?()
            dismiss()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                deepLinkManager.pendingConversationId = conversationId
            }
        } else if result != nil {
            onAccepted?()
            dismiss()
        }
    }
}

// MARK: - MatchRequestCard

struct MatchRequestCard: View {
    let item: MatchRequestWithDetails
    let onAccept: () -> Void
    let onReject: () -> Void

    @State private var isAccepting = false
    @State private var isRejecting = false

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEEE d MMMM 'à' HH'h'mm"
        return formatter
    }()

    private var requesterName: String {
        item.requester?.name ?? "Joueur inconnu"
    }

    private var requesterInitials: String {
        item.requester?.initials ?? "??"
    }

    private var dateDescription: String {
        guard let date = item.matchIntent?.date else {
            return "Date à définir"
        }
        return Self.dateFormatter.string(from: date).capitalized
    }

    private var matchTypeLabel: String {
        item.matchIntent?.type.displayName ?? "Match"
    }

    private var matchTypeIcon: String {
        item.matchIntent?.type.icon ?? "sportscourt"
    }

    private var timeAgo: String {
        let interval = Date().timeIntervalSince(item.request.createdAt)
        if interval < 60 {
            return "À l'instant"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "Il y a \(minutes) min"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "Il y a \(hours)h"
        } else {
            let days = Int(interval / 86400)
            return "Il y a \(days)j"
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header: avatar + nom + heure
            HStack(spacing: 12) {
                // Avatar
                if let imageURL = item.requester?.imageURL {
                    AsyncImage(url: imageURL) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        initialsAvatar
                    }
                    .frame(width: 44, height: 44)
                    .clipShape(Circle())
                } else {
                    initialsAvatar
                        .frame(width: 44, height: 44)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("\(requesterName) veut jouer avec toi")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.labelPrimary)

                    Text(timeAgo)
                        .font(.caption)
                        .foregroundStyle(Theme.labelSecondary)
                }

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 12)

            Divider()
                .padding(.horizontal, 16)

            // Infos du match
            HStack(spacing: 16) {
                // Type
                Label(matchTypeLabel, systemImage: matchTypeIcon)
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)

                Spacer()

                // Date
                Label(dateDescription, systemImage: "calendar")
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            Divider()
                .padding(.horizontal, 16)

            // Boutons d'action
            HStack(spacing: 12) {
                Button {
                    isRejecting = true
                    onReject()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "xmark")
                        Text("Refuser")
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.red.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(isAccepting || isRejecting)

                Button {
                    isAccepting = true
                    onAccept()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark")
                        Text("Accepter & discuter")
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Theme.tintColor)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(isAccepting || isRejecting)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay {
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private var initialsAvatar: some View {
        Circle()
            .fill(Theme.tintColor.opacity(0.15))
            .overlay {
                Text(requesterInitials)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.tintColor)
            }
    }
}
