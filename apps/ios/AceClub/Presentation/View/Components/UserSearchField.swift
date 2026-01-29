//
//  UserSearchField.swift
//  AceClub
//
//  Created by Claude on 21/01/2026.
//

import SwiftUI

struct UserSearchField: View {
    let label: String
    @Binding var selectedUser: User?
    @State private var searchQuery: String = ""
    @State private var searchResults: [User] = []
    @State private var isSearching: Bool = false
    @State private var showResults: Bool = false
    @State private var searchTask: Task<Void, Never>?

    private let searchUseCase = SearchUsersUseCase()

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)

            if let user = selectedUser {
                selectedUserView(user: user)
            } else {
                searchField
            }
        }
    }

    private func selectedUserView(user: User) -> some View {
        HStack {
            HStack(spacing: 8) {
                userAvatar(user: user, size: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(user.displayName)
                        .font(.subheadline)
                    Text(user.email)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Button(role: .destructive) {
                selectedUser = nil
                searchQuery = ""
                searchResults = []
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(.secondary)
            }
        }
        .padding(8)
        .inputFieldStyle()
    }

    @ViewBuilder
    private func userAvatar(user: User, size: CGFloat) -> some View {
        if let imageURL = user.imageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: size, height: size)
                        .clipShape(Circle())
                case .failure:
                    avatarPlaceholder(user: user, size: size)
                case .empty:
                    ProgressView()
                        .frame(width: size, height: size)
                @unknown default:
                    avatarPlaceholder(user: user, size: size)
                }
            }
        } else {
            avatarPlaceholder(user: user, size: size)
        }
    }

    private func avatarPlaceholder(user: User, size: CGFloat) -> some View {
        Circle()
            .fill(Theme.tintColor.opacity(0.2))
            .frame(width: size, height: size)
            .overlay {
                Text(user.initials)
                    .font(size > 32 ? .subheadline : .caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.tintColor)
            }
    }

    private var searchField: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)
                    .font(.caption)

                TextField("Rechercher par nom ou email", text: $searchQuery)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .onChange(of: searchQuery) { _, newValue in
                        performSearch(query: newValue)
                    }

                if isSearching {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
            .padding(8)
            .inputFieldStyle()

            if showResults && !searchResults.isEmpty {
                searchResultsList
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
    }

    private var searchResultsList: some View {
        VStack(spacing: 0) {
            ForEach(searchResults) { user in
                Button {
                    selectedUser = user
                    searchQuery = ""
                    searchResults = []
                    showResults = false
                } label: {
                    HStack(spacing: 8) {
                        userAvatar(user: user, size: 32)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.displayName)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                            Text(user.email)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()
                    }
                    .padding(8)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)

                if user.id != searchResults.last?.id {
                    Divider()
                }
            }
        }
        .background(Theme.primaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
        .padding(.top, 4)
    }

    private func performSearch(query: String) {
        searchTask?.cancel()

        guard !query.isEmpty else {
            searchResults = []
            showResults = false
            return
        }

        guard query.count >= 2 else {
            return
        }

        showResults = true
        isSearching = true

        searchTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000) // Debounce 300ms

            guard !Task.isCancelled else { return }

            do {
                let results = try await searchUseCase.execute(query: query, limit: 10)

                guard !Task.isCancelled else { return }

                await MainActor.run {
                    searchResults = results
                    isSearching = false
                }
            } catch {
                await MainActor.run {
                    searchResults = []
                    isSearching = false
                }
            }
        }
    }
}