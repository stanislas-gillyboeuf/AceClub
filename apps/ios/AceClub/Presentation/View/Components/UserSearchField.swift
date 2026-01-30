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
    @FocusState private var isSearchFocused: Bool

    private let searchUseCase = SearchUsersUseCase()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)

            if let user = selectedUser {
                selectedUserCard(user: user)
            } else {
                searchFieldCard
            }
        }
    }

    // MARK: - Selected User Card

    private func selectedUserCard(user: User) -> some View {
        HStack(spacing: 12) {
            UserAvatarView(user: user, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(user.displayName)
                    .font(.body.weight(.medium))
                Text(user.email)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                withAnimation(.snappy(duration: 0.25)) {
                    selectedUser = nil
                    searchQuery = ""
                    searchResults = []
                }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.tertiary)
            }
            .buttonStyle(.plain)
        }
        .padding(12)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.tintColor.opacity(0.3), lineWidth: 1.5)
        }
        .transition(.asymmetric(
            insertion: .scale(scale: 0.95).combined(with: .opacity),
            removal: .opacity
        ))
    }

    // MARK: - Search Field Card

    private var searchFieldCard: some View {
        VStack(spacing: 0) {
            // Search input
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.body)
                    .foregroundStyle(isSearchFocused ? Theme.tintColor : .secondary)

                TextField("Rechercher un joueur...", text: $searchQuery)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($isSearchFocused)
                    .onChange(of: searchQuery) { _, newValue in
                        performSearch(query: newValue)
                    }

                if isSearching {
                    ProgressView()
                        .scaleEffect(0.8)
                        .transition(.scale.combined(with: .opacity))
                } else if !searchQuery.isEmpty {
                    Button {
                        withAnimation(.snappy(duration: 0.2)) {
                            searchQuery = ""
                            searchResults = []
                            showResults = false
                        }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.tertiary)
                    }
                    .buttonStyle(.plain)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Theme.secondaryBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(
                        isSearchFocused ? Theme.tintColor.opacity(0.5) : Color.clear,
                        lineWidth: 1.5
                    )
            }
            .animation(.easeInOut(duration: 0.2), value: isSearchFocused)

            // Results dropdown
            if showResults {
                searchResultsDropdown
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .animation(.snappy(duration: 0.25), value: showResults)
        .animation(.snappy(duration: 0.25), value: searchResults.count)
    }

    // MARK: - Search Results Dropdown

    private var searchResultsDropdown: some View {
        VStack(spacing: 0) {
            if searchResults.isEmpty && !isSearching && searchQuery.count >= 2 {
                // Empty state
                HStack {
                    Spacer()
                    VStack(spacing: 6) {
                        Image(systemName: "person.slash")
                            .font(.title3)
                            .foregroundStyle(.tertiary)
                        Text("Aucun joueur trouvé")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 20)
                    Spacer()
                }
            } else {
                ForEach(searchResults) { user in
                    searchResultRow(user: user)

                    if user.id != searchResults.last?.id {
                        Divider()
                            .padding(.leading, 56)
                    }
                }
            }
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 4)
        .padding(.top, 6)
    }

    private func searchResultRow(user: User) -> some View {
        Button {
            withAnimation(.snappy(duration: 0.25)) {
                selectedUser = user
                searchQuery = ""
                searchResults = []
                showResults = false
                isSearchFocused = false
            }
        } label: {
            HStack(spacing: 12) {
                UserAvatarView(user: user, size: 40)

                VStack(alignment: .leading, spacing: 2) {
                    Text(user.displayName)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)
                    Text(user.email)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Search Logic

    private func performSearch(query: String) {
        searchTask?.cancel()

        guard !query.isEmpty else {
            withAnimation(.snappy(duration: 0.2)) {
                searchResults = []
                showResults = false
            }
            return
        }

        guard query.count >= 2 else {
            return
        }

        showResults = true
        isSearching = true

        searchTask = Task {
            try? await Task.sleep(for: .milliseconds(300))

            guard !Task.isCancelled else { return }

            do {
                let results = try await searchUseCase.execute(query: query, limit: 10)

                guard !Task.isCancelled else { return }

                await MainActor.run {
                    withAnimation(.snappy(duration: 0.2)) {
                        searchResults = results
                        isSearching = false
                    }
                }
            } catch {
                await MainActor.run {
                    withAnimation(.snappy(duration: 0.2)) {
                        searchResults = []
                        isSearching = false
                    }
                }
            }
        }
    }
}

// MARK: - User Avatar View (Reusable)

struct UserAvatarView: View {
    let user: User
    let size: CGFloat

    var body: some View {
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
                    avatarPlaceholder
                case .empty:
                    shimmerPlaceholder
                @unknown default:
                    avatarPlaceholder
                }
            }
        } else {
            avatarPlaceholder
        }
    }

    private var avatarPlaceholder: some View {
        Circle()
            .fill(
                LinearGradient(
                    colors: [Theme.tintColor.opacity(0.2), Theme.tintColor.opacity(0.1)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: size, height: size)
            .overlay {
                Text(user.initials)
                    .font(size > 36 ? .subheadline.weight(.semibold) : .caption.weight(.semibold))
                    .foregroundStyle(Theme.tintColor)
            }
    }

    private var shimmerPlaceholder: some View {
        Circle()
            .fill(Theme.secondaryBackground)
            .frame(width: size, height: size)
            .overlay {
                ProgressView()
                    .scaleEffect(size > 36 ? 0.8 : 0.6)
            }
    }
}
