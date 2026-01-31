import SwiftUI

struct MatchIntentsView: View {

    @StateObject private var viewModel = MatchIntentsViewModel()
    @State private var selectedItem: MatchIntentDiscoverItem?
    @State private var showCreateSheet = false

    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.isLoading, viewModel.discoverItems.isEmpty {
                    ProgressView("Chargement...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    MatchIntentsContent(
                        viewModel: viewModel,
                        selectedItem: $selectedItem,
                        onCreateIntent: { showCreateSheet = true }
                    )
                }
            }
            .navigationTitle("Découvrir")
            .task {
                await viewModel.loadDiscover()
            }
            .refreshable {
                await viewModel.loadDiscover()
            }
            .alert("Erreur", isPresented: Binding(
                get: { viewModel.errorMessage != nil },
                set: { if !$0 { viewModel.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) { viewModel.errorMessage = nil }
            } message: {
                if let msg = viewModel.errorMessage {
                    Text(msg)
                }
            }
            .sheet(item: $selectedItem) { item in
                DiscoverIntentDetailSheet(
                    item: item,
                    onLike: {
                        Task { await viewModel.like() }
                    },
                    onPass: {
                        Task { await viewModel.pass() }
                    }
                )
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
            .sheet(isPresented: $showCreateSheet) {
                CreateMatchIntentSheet(isPresented: $showCreateSheet) {
                    Task { await viewModel.loadDiscover() }
                }
            }
            .background(Theme.primaryBackground)
        }
    }
}
