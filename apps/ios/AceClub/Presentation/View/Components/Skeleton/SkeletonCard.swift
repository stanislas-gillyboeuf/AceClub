//
//  SkeletonCard.swift
//  AceClub
//
//  Skeleton générique pour les cartes.
//

import SwiftUI

struct SkeletonCard: View {
    var lineCount: Int = 3
    var showHeader: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if showHeader {
                SkeletonShape(shape: .rectangle(), width: 100, height: 16)
            }

            ForEach(0..<lineCount, id: \.self) { index in
                SkeletonShape(
                    shape: .rectangle(),
                    width: index == lineCount - 1 ? 150 : nil,
                    height: 12
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.paddingCard)
        .cardStyle(withBorder: true)
        .shimmer()
    }
}

#Preview("SkeletonCard") {
    VStack(spacing: 16) {
        SkeletonCard()

        SkeletonCard(lineCount: 2, showHeader: false)
    }
    .padding()
    .background(Theme.primaryBackground)
}
