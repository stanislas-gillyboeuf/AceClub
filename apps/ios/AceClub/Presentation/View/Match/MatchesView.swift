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
                    Menu {
                        Button {
                            Task {
                                await viewModel.filterByStatus(nil)
                            }
                        } label: {
                            Label("Tous", systemImage: "list.bullet")
                        }

                        Button {
                            Task {
                                await viewModel.filterByStatus(.scheduled)
                            }
                        } label: {
                            Label("Planifiés", systemImage: "calendar")
                        }

                        Button {
                            Task {
                                await viewModel.filterByStatus(.ongoing)
                            }
                        } label: {
                            Label("En cours", systemImage: "play.circle")
                        }

                        Button {
                            Task {
                                await viewModel.filterByStatus(.finished)
                            }
                        } label: {
                            Label("Terminés", systemImage: "checkmark.circle")
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
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
            .background(Theme.primaryBackground)
        }
    }
}
