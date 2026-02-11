//
//  MatchLiveTimerCard.swift
//  AceClub
//
//  Live timer card for ongoing matches
//

import SwiftUI

struct MatchLiveTimerCard: View {
    let startedAt: Date

    var body: some View {
        MatchElapsedTimeView(startedAt: startedAt, style: .card)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .strokeBorder(Color.red.opacity(0.3), lineWidth: 1.5)
            )
            .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
}
