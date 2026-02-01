//
//  MatchRowSkeleton.swift
//  AceClub
//
//  Skeleton pour les lignes de match (FeedMatchRowView).
//

import SwiftUI

struct MatchRowSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: date + badge
            HStack {
                HStack(spacing: 6) {
                    SkeletonShape(shape: .rectangle(), width: 16, height: 16)
                    SkeletonShape(shape: .rectangle(), width: 80, height: 14)
                }

                Spacer()

                SkeletonShape(shape: .capsule, width: 70, height: 24)
            }

            // Players row
            HStack(alignment: .center, spacing: 12) {
                // Home player
                playerSkeleton

                SkeletonShape(shape: .rectangle(), width: 20, height: 12)

                // Away player
                playerSkeleton

                Spacer()

                // Score
                VStack(alignment: .trailing, spacing: 4) {
                    SkeletonShape(shape: .rectangle(), width: 60, height: 24)
                    SkeletonShape(shape: .rectangle(), width: 40, height: 12)
                }
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .shimmer()
    }

    private var playerSkeleton: some View {
        HStack(spacing: 8) {
            SkeletonShape(shape: .circle, width: 40, height: 40)

            SkeletonShape(shape: .rectangle(), width: 60, height: 14)
        }
    }
}

#Preview("MatchRowSkeleton") {
    VStack(spacing: 12) {
        MatchRowSkeleton()
        MatchRowSkeleton()
        MatchRowSkeleton()
    }
    .padding()
    .background(Theme.primaryBackground)
}
