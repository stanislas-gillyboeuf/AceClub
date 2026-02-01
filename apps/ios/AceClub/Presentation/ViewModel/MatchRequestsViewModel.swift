//
//  MatchRequestsViewModel.swift
//  AceClub
//

import Foundation
import Combine

@MainActor
class MatchRequestsViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var requests: [MatchRequestWithDetails] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Use Cases

    private let listRequestsUseCase = ListMatchRequestsUseCase()
    private let acceptRequestUseCase = AcceptMatchRequestUseCase()
    private let rejectRequestUseCase = RejectMatchRequestUseCase()

    // MARK: - Public API

    func loadRequests() async {
        isLoading = true
        errorMessage = nil

        do {
            let result = try await listRequestsUseCase.execute()
            requests = result
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func accept(request: MatchRequestWithDetails) async -> AcceptMatchRequestResult? {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            let result = try await acceptRequestUseCase.execute(requestId: request.id)

            // Quand une demande est acceptée, les autres sont rejetées automatiquement côté backend.
            // On peut donc retirer toutes les demandes liées à ce matchIntent de la liste locale.
            requests.removeAll { $0.request.matchIntentId == request.request.matchIntentId }

            return result
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func reject(request: MatchRequestWithDetails) async {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            _ = try await rejectRequestUseCase.execute(requestId: request.id)
            requests.removeAll { $0.id == request.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed

    var pendingRequests: [MatchRequestWithDetails] {
        requests.filter { $0.request.status == .pending }
    }

    var hasPendingRequests: Bool {
        !pendingRequests.isEmpty
    }
}

