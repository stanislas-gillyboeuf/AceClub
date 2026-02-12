//
//  MatchListContent.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI
import SwiftData

// MARK: - Date Section Model

private struct MatchDateSection: Identifiable {
    let id: String // "yyyy-MM-dd" format
    let date: Date
    let matches: [MatchModel]

    var isToday: Bool {
        Calendar.current.isDateInToday(date)
    }
}

// MARK: - MatchListContent using SwiftData @Query

struct MatchListContent: View {
    @Environment(\.modelContext) private var modelContext

    @Query(sort: \MatchModel.createdAt, order: .reverse)
    private var allMatches: [MatchModel]

    @State private var syncService: MatchSyncService?
    @State private var isLoading = false
    @State private var hasScrolledToToday = false

    private static let groupKeyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    // MARK: - Grouped Sections

    private var groupedSections: [MatchDateSection] {
        let calendar = Calendar.current
        let keyFormatter = Self.groupKeyFormatter

        var grouped = Dictionary(grouping: allMatches) { match -> String in
            let date = match.scheduledAt ?? match.startedAt ?? match.createdAt
            let dayStart = calendar.startOfDay(for: date)
            return keyFormatter.string(from: dayStart)
        }

        // Always include today even if no matches
        let today = calendar.startOfDay(for: Date())
        let todayKey = keyFormatter.string(from: today)
        if grouped[todayKey] == nil {
            grouped[todayKey] = []
        }

        return grouped.map { key, matches in
            let date = keyFormatter.date(from: key) ?? Date()
            let sorted = matches.sorted { lhs, rhs in
                let lhsDate = lhs.scheduledAt ?? lhs.startedAt ?? lhs.createdAt
                let rhsDate = rhs.scheduledAt ?? rhs.startedAt ?? rhs.createdAt
                return lhsDate < rhsDate
            }
            return MatchDateSection(id: key, date: date, matches: sorted)
        }
        .sorted { $0.date < $1.date }
    }

    // MARK: - Body

    var body: some View {
        if !isLoading && allMatches.isEmpty {
            ContentUnavailableView(
                "Aucun match",
                systemImage: "tennis.racket",
                description: Text("Tes matchs apparaitront ici une fois planifies ou joues.")
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                        ForEach(groupedSections) { section in
                            Section {
                                if section.matches.isEmpty && section.isToday {
                                    TodayEmptyView()
                                        .padding(.horizontal, Theme.paddingHorizontal)
                                        .padding(.vertical, 8)
                                } else {
                                    VStack(spacing: 12) {
                                        ForEach(section.matches) { match in
                                            NavigationLink(value: match.id) {
                                                MatchRowView(match: match)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                    .padding(.horizontal, Theme.paddingHorizontal)
                                    .padding(.vertical, 8)
                                }
                            } header: {
                                DateSectionHeader(date: section.date, isToday: section.isToday)
                            }
                            .id(section.id)
                        }
                    }
                }
                .refreshable {
                    await refresh()
                }
                .onAppear {
                    if !hasScrolledToToday && !allMatches.isEmpty {
                        scrollToToday(proxy)
                    }
                }
                .onChange(of: isLoading) { oldValue, newValue in
                    if oldValue && !newValue && !hasScrolledToToday {
                        scrollToToday(proxy)
                    }
                }
            }
            .task {
                syncService = MatchSyncService(modelContext: modelContext)
                await initialSync()
            }
        }
    }

    // MARK: - Scroll to Today

    private func scrollToToday(_ proxy: ScrollViewProxy) {
        guard !groupedSections.isEmpty else { return }
        hasScrolledToToday = true

        let today = Calendar.current.startOfDay(for: Date())
        let todayKey = Self.groupKeyFormatter.string(from: today)

        withAnimation {
            proxy.scrollTo(todayKey, anchor: .top)
        }
    }

    // MARK: - Sync

    private func initialSync() async {
        guard !isLoading else { return }
        isLoading = true
        hasScrolledToToday = false
        do {
            // purgeOnFirstPage loads ALL pages, so all matches end up in SwiftData
            _ = try await syncService?.syncMatchesPage(page: 1, limit: 20, purgeOnFirstPage: true)
        } catch {
            print("Initial sync error: \(error)")
        }
        isLoading = false
    }

    private func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        hasScrolledToToday = false
        do {
            _ = try await syncService?.syncMatchesPage(page: 1, limit: 20, purgeOnFirstPage: true)
        } catch {
            print("Refresh error: \(error)")
        }
        isLoading = false
    }
}

// MARK: - Date Section Header

private struct DateSectionHeader: View {
    let date: Date
    let isToday: Bool

    private static let headerFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEEE - d MMM"
        return formatter
    }()

    var body: some View {
        HStack(spacing: 8) {
            if isToday {
                Circle()
                    .fill(Theme.accentGreen)
                    .frame(width: 8, height: 8)
            }

            Text(Self.headerFormatter.string(from: date).capitalized)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(isToday ? Theme.accentGreen : .primary)

            if isToday {
                Text("Aujourd'hui")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .glassEffect(.regular.tint(Theme.accentGreen).interactive(), in: .capsule)
            }

            Spacer()
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .glassEffect(.regular)
    }
}

// MARK: - Today Empty View

private struct TodayEmptyView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "figure.tennis")
                .font(.system(size: 32))
                .foregroundStyle(Theme.tintColor.opacity(0.6))

            Text("Pas de match aujourd'hui")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.primary)

            Text("Planifie un match et lance-toi !")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }
}
