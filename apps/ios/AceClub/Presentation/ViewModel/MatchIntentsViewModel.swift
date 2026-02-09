//
//  MatchIntentsViewModel.swift
//  AceClub
//

import Foundation
import Combine

@MainActor
class MatchIntentsViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var discoverItems: [MatchIntentDiscoverItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isSwiping = false

    // Pagination
    @Published var nextCursor: String?
    @Published var hasMore = true

    // Feedback (e.g. "It's a match!")
    @Published var lastSwipeMessage: String?
    @Published var didMatch = false

    // Feature flags
    @Published var isDiscoveryRestricted = false

    // Location & radius filter (hidden when discovery is restricted)
    @Published var selectedRadius: Int? = nil

    // MARK: - Dependencies

    private let discoverUseCase = DiscoverMatchIntentsUseCase()
    private let swipeUseCase = SwipeMatchIntentUseCase()
    let locationManager = LocationManager()

    // MARK: - Public Methods

    func loadDiscover() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        nextCursor = nil
        hasMore = true

        do {
            let result = try await discoverUseCase.execute(
                cursor: nil,
                limit: 20,
                latitude: isDiscoveryRestricted ? nil : locationManager.userLatitude,
                longitude: isDiscoveryRestricted ? nil : locationManager.userLongitude,
                radius: isDiscoveryRestricted ? nil : selectedRadius
            )
            isDiscoveryRestricted = result.isDiscoveryRestricted
            discoverItems = result.data
            nextCursor = result.nextCursor
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func loadMoreIfNeeded() async {
        guard hasMore, let cursor = nextCursor, !isLoading, discoverItems.count < 5 else { return }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await discoverUseCase.execute(
                cursor: cursor,
                limit: 20,
                latitude: isDiscoveryRestricted ? nil : locationManager.userLatitude,
                longitude: isDiscoveryRestricted ? nil : locationManager.userLongitude,
                radius: isDiscoveryRestricted ? nil : selectedRadius
            )
            discoverItems.append(contentsOf: result.data)
            nextCursor = result.nextCursor
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    /// Retourne la carte du dessus (celle affichée)
    var topCard: MatchIntentDiscoverItem? {
        discoverItems.first
    }

    /// Like la carte du dessus
    func like() async {
        guard let item = topCard, !isSwiping else { return }
        await performSwipe(matchIntentId: item.intent.id, action: "like")
    }

    /// Pass (rejette) la carte du dessus
    func pass() async {
        guard let item = topCard, !isSwiping else { return }
        await performSwipe(matchIntentId: item.intent.id, action: "pass")
    }

    /// Retire la carte du dessus de la pile (après swipe ou animation)
    func removeTopCard() {
        guard !discoverItems.isEmpty else { return }
        discoverItems.removeFirst()
        lastSwipeMessage = nil
        didMatch = false
    }

    // MARK: - Private Methods

    private func performSwipe(matchIntentId: String, action: String) async {
        isSwiping = true
        lastSwipeMessage = nil
        didMatch = false

        do {
            let result = try await swipeUseCase.execute(matchIntentId: matchIntentId, action: action)
            lastSwipeMessage = result.message
            didMatch = result.matchRequest != nil
        } catch {
            // Swipe failed (e.g. already swiped) - still remove the card to avoid duplicates
            errorMessage = nil
        }
        removeTopCard()
        Task { await loadMoreIfNeeded() }
        isSwiping = false
    }
}
