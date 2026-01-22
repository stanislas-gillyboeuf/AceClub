//
//  MatchListViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import Combine

@MainActor
class MatchListViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var matches: [MatchListItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil

    // Pagination
    @Published var currentPage: Int = 1
    @Published var totalPages: Int = 1
    @Published var totalMatches: Int = 0
    @Published var hasMorePages: Bool = false

    // Filters
    @Published var selectedStatus: MatchStatus? = nil
    @Published var filterUserId: String? = nil
    @Published var participantOnly: Bool = true
    @Published var pageLimit: Int = 10

    // MARK: - Use Cases

    private let listMatchesUseCase = ListMatchesUseCase()

    // MARK: - Public Methods

    /// Charge la première page de matchs
    func loadMatches() async {
        currentPage = 1
        await fetchMatches(clearExisting: true)
    }

    /// Recharge les matchs (refresh)
    func refreshMatches() async {
        currentPage = 1
        await fetchMatches(clearExisting: true)
    }

    /// Charge la page suivante
    func loadNextPage() async {
        guard !isLoading && hasMorePages else { return }
        currentPage += 1
        await fetchMatches(clearExisting: false)
    }

    /// Charge la page précédente
    func loadPreviousPage() async {
        guard !isLoading && currentPage > 1 else { return }
        currentPage -= 1
        await fetchMatches(clearExisting: true)
    }

    /// Change le filtre de statut et recharge
    func filterByStatus(_ status: MatchStatus?) async {
        selectedStatus = status
        await loadMatches()
    }

    /// Change le filtre d'utilisateur et recharge
    func filterByUser(_ userId: String?) async {
        filterUserId = userId
        await loadMatches()
    }

    /// Change le filtre participantOnly et recharge
    func setParticipantOnly(_ value: Bool) async {
        participantOnly = value
        await loadMatches()
    }

    /// Supprime tous les filtres
    func clearFilters() async {
        selectedStatus = nil
        filterUserId = nil
        participantOnly = true
        await loadMatches()
    }

    // MARK: - Private Methods

    private func fetchMatches(clearExisting: Bool) async {
        isLoading = true
        errorMessage = nil

        do {
            let result = try await listMatchesUseCase.execute(
                status: selectedStatus,
                userId: filterUserId,
                participantOnly: participantOnly,
                page: currentPage,
                limit: pageLimit
            )

            if clearExisting {
                matches = result.matches
            } else {
                matches.append(contentsOf: result.matches)
            }

            currentPage = result.page
            totalPages = result.totalPages
            totalMatches = result.total
            hasMorePages = result.hasNextPage

        } catch {
            errorMessage = error.localizedDescription
            print("❌ Erreur fetchMatches: \(error)")
        }

        isLoading = false
    }

    // MARK: - Computed Properties

    /// Indique si des filtres sont actifs
    var hasActiveFilters: Bool {
        selectedStatus != nil || filterUserId != nil || !participantOnly
    }

    /// Nombre de matchs affichés
    var displayedMatchesCount: Int {
        matches.count
    }

    /// Texte de pagination
    var paginationText: String {
        if totalMatches == 0 {
            return "Aucun match"
        }
        let startIndex = (currentPage - 1) * pageLimit + 1
        let endIndex = min(currentPage * pageLimit, totalMatches)
        return "\(startIndex)-\(endIndex) sur \(totalMatches) matchs"
    }

    // MARK: - Helper Methods

    /// Groupe les matchs par statut
    func matchesGroupedByStatus() -> [MatchStatus: [MatchListItem]] {
        Dictionary(grouping: matches) { $0.status }
    }

    /// Filtre les matchs par date
    func matchesSortedByDate(ascending: Bool = false) -> [MatchListItem] {
        matches.sorted {
            ascending ? $0.createdAt < $1.createdAt : $0.createdAt > $1.createdAt
        }
    }

    /// Trouve un match par ID
    func match(withId id: String) -> MatchListItem? {
        matches.first { $0.id == id }
    }
}
