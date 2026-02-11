//
//  MatchCongratulationsSheet.swift
//  AceClub
//

import SwiftUI
import SwiftData

struct MatchCongratulationsSheet: View {
    @Environment(\.modelContext) private var modelContext

    let match: MatchModel
    @Binding var isPresented: Bool

    @Query(filter: #Predicate<MatchModel> { $0.status == "finished" })
    private var finishedMatches: [MatchModel]

    private var totalFinished: Int {
        finishedMatches.count
    }

    private var matchTypeLabel: String {
        match.matchType == .training ? "entra\u{00EE}nement" : "match"
    }

    var body: some View {
        DynamicSheet {
            VStack(spacing: 20) {
                // Celebration emoji
                Text("\u{1F3C6}")
                    .font(.system(size: 64))

                // Title
                Text("F\u{00E9}licitations !")
                    .font(.title2.weight(.bold))

                // Message
                Text("Tu as fini ton \(totalFinished)\(ordinalSuffix(totalFinished)) \(matchTypeLabel) sur Ace Club. Continue comme \u{00E7}a et on te revoit \u{00E0} Roland \u{1F4AA}\u{1F3FB}")
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Close button
                Button("Fermer") {
                    isPresented = false
                }
                .buttonStyle(.appPrimary)
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 24)
            .padding(.bottom, 16)
        }
    }

    private func ordinalSuffix(_ n: Int) -> String {
        n == 1 ? "er" : "e"
    }
}
