import SwiftUI

struct MatchIntentsView: View {

    @StateObject private var viewModel = MatchIntentsViewModel()
    @State private var selectedItem: MatchIntentDiscoverItem?
    @State private var showCreateSheet = false

    private let radiusOptions: [(label: String, value: Int?)] = [
        ("5 km", 5),
        ("10 km", 10),
        ("25 km", 25),
        ("50 km", 50),
        ("Tous", nil),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if !viewModel.isDiscoveryRestricted {
                    radiusPicker
                        .padding(.horizontal, Theme.paddingHorizontal)
                        .padding(.vertical, 8)
                }

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
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("Trouver un partenaire")
            .task {
                await viewModel.loadDiscover()
                if !viewModel.isDiscoveryRestricted {
                    viewModel.locationManager.requestPermission()
                    viewModel.locationManager.requestLocation()
                }
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

    // MARK: - Radius Picker

    private var radiusPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(radiusOptions, id: \.label) { option in
                    Button {
                        viewModel.selectedRadius = option.value
                        Task { await viewModel.loadDiscover() }
                    } label: {
                        Text(option.label)
                            .font(.subheadline.weight(.medium))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .foregroundStyle(
                                viewModel.selectedRadius == option.value
                                    ? .white
                                    : Theme.labelPrimary
                            )
                            .glassEffect(
                                viewModel.selectedRadius == option.value
                                    ? .regular.tint(Theme.accentGreen).interactive()
                                    : .regular.interactive(),
                                in: .capsule
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}
