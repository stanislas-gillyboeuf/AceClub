//
//  MatchListContent.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI

struct MatchListContent: View {
    @ObservedObject var viewModel: MatchListViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Chips de filtre scrollables
            MatchFilterChips(
                selectedStatus: $viewModel.selectedStatus,
                onFilterChange: { status in
                    await viewModel.filterByStatus(status)
                }
            )

            // Match list
            List {
                ForEach(viewModel.matches) { match in
                    NavigationLink {
                        MatchDetailView(matchId: match.id)
                    } label: {
                        MatchRowView(match: match)
                    }
                    .onAppear {
                        if match.id == viewModel.matches.last?.id && viewModel.hasMorePages && !viewModel.isLoading {
                            Task {
                                await viewModel.loadNextPage()
                            }
                        }
                    }
                }

                if viewModel.hasMorePages && viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.primaryBackground)
            .refreshable {
                await viewModel.refreshMatches()
            }
        }
        .background(Theme.primaryBackground)
    }
}
