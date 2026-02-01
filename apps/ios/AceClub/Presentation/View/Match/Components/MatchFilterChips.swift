//
//  MatchFilterChips.swift
//  AceClub
//
//  Created by Nicolas Becharat on 29/01/2026.
//

import SwiftUI

struct MatchFilterChips: View {
    @Binding var selectedStatus: MatchStatus?
    let onFilterChange: (MatchStatus?) async -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(
                    title: "Tous",
                    icon: "list.bullet",
                    isSelected: selectedStatus == nil
                ) {
                    selectedStatus = nil
                    Task { await onFilterChange(nil) }
                }

                FilterChip(
                    title: "Planifiés",
                    icon: "calendar",
                    isSelected: selectedStatus == .scheduled
                ) {
                    selectedStatus = .scheduled
                    Task { await onFilterChange(.scheduled) }
                }

                FilterChip(
                    title: "En cours",
                    icon: "play.circle",
                    isSelected: selectedStatus == .ongoing
                ) {
                    selectedStatus = .ongoing
                    Task { await onFilterChange(.ongoing) }
                }

                FilterChip(
                    title: "Terminés",
                    icon: "checkmark.circle",
                    isSelected: selectedStatus == .finished
                ) {
                    selectedStatus = .finished
                    Task { await onFilterChange(.finished) }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
    }
}

private struct FilterChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption)
                Text(title)
                    .font(.subheadline.weight(.medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? Theme.tintColor : Theme.cardBackground)
            .foregroundStyle(isSelected ? .white : .primary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.2), value: isSelected)
    }
}
