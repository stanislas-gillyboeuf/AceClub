//
//  MatchesView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI

struct MatchesView: View {
    @StateObject private var viewModel = MatchListViewModel()
    @State private var showingCreateMatch = false
    @State private var showingListRequestMatch = false

    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.isLoading && viewModel.matches.isEmpty {
                    ProgressView("Chargement des matchs...")
                } else {
                    MatchListContent(viewModel: viewModel)
                }
            }
            .navigationTitle("Matchs")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showingCreateMatch = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .disabled(viewModel.isLoading)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingListRequestMatch = true
                    } label: {
                        Image(systemName: "envelope.badge")
                    }
                }
            }
            .sheet(isPresented: $showingCreateMatch) {
                CreateMatchView(isPresented: $showingCreateMatch) {
                    Task {
                        await viewModel.refreshMatches()
                    }
                }
            }
            .fullScreenCover(isPresented: $showingListRequestMatch) {
                ListRequestMatch {
                    Task {
                        await viewModel.refreshMatches()
                    }
                }
            }
            .task {
                if viewModel.matches.isEmpty {
                    await viewModel.loadMatches()
                }
            }
        }
    }
}
