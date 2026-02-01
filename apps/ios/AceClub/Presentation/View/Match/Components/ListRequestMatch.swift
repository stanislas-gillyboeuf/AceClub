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
                } else if !viewModel.hasPendingRequests {
                    ContentUnavailableView(
                        "Aucune demande en attente",
                        systemImage: "envelope.badge",
                        description: Text("Quand quelqu'un like ton intent de match, tu verras la demande ici.")
                    )
                } else {
                    List(viewModel.pendingRequests) { item in
                        MatchRequestRow(
                            item: item,
                            onAccept: { Task { await handleAccept(item: item) } },
                            onReject: { Task { await viewModel.reject(request: item) } }
                        )
                    }
                    .listStyle(.insetGrouped)
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("Demandes de match")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
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
            // Navigate to chat
            onAccepted?()
            dismiss()
            // Use deep link to navigate to chat after dismiss
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                deepLinkManager.pendingConversationId = conversationId
            }
        } else if result != nil {
            onAccepted?()
            dismiss()
        }
    }
}

// MARK: - MatchRequestRow

struct MatchRequestRow: View {
    let item: MatchRequestWithDetails
    let onAccept: () -> Void
    let onReject: () -> Void

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()

    private var requesterName: String {
        item.requester?.name ?? "Joueur inconnu"
    }

    private var dateDescription: String {
        guard let date = item.matchIntent?.date else {
            return "Date à définir"
        }
        return Self.dateFormatter.string(from: date)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(requesterName)
                    .font(.headline)
                Spacer()
                Text("Demande")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Theme.tintColor.opacity(0.15))
                    .clipShape(Capsule())
            }

            Text(dateDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack {
                Button("Refuser", role: .destructive, action: onReject)

                Spacer()

                Button("Accepter", action: onAccept)
                    .fontWeight(.semibold)
                    .buttonStyle(.borderedProminent)
            }
            .padding(.top, 4)
        }
        .padding(.vertical, 8)
    }
}
