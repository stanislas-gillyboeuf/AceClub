import SwiftUI

struct MatchIntentsView: View {

    @StateObject private var viewModel = MatchIntentsViewModel()
    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.isLoading, viewModel.discoverItems.isEmpty {
                    ProgressView("Chargement des intents de match...")
                } else {
                    MatchIntentsContent(viewModel: viewModel)
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
        }
    }
}