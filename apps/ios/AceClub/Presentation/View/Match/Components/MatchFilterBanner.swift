//
//  MatchFilterBanner.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI

struct MatchFilterBanner: View {
    let filterText: String
    let onClear: () -> Void

    var body: some View {
        HStack {
            Text(filterText)
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            Button("Effacer", action: onClear)
                .font(.caption)
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.vertical, 8)
        .background(Theme.secondaryBackground)
    }
}
