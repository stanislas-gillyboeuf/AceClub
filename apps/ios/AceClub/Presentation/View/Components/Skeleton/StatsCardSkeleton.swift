//
//  StatsCardSkeleton.swift
//  AceClub
//
//  Skeleton pour la carte de statistiques (HomeView).
//

import SwiftUI

struct StatsCardSkeleton: View {
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(0..<3, id: \.self) { index in
                    VStack(spacing: 8) {
                        SkeletonShape(shape: .circle, width: 28, height: 28)

                        SkeletonShape(shape: .rectangle(), width: 50, height: 28)

                        SkeletonShape(shape: .rectangle(), width: 60, height: 12)
                    }
                    .frame(maxWidth: .infinity)

                    if index < 2 {
                        Divider()
                            .frame(height: 60)
                    }
                }
            }
            .padding(.vertical, 20)

            Divider()

            VStack(alignment: .leading, spacing: 10) {
                SkeletonShape(shape: .rectangle(), width: 100, height: 20)

                SkeletonShape(shape: .rectangle(), height: 8)

                SkeletonShape(shape: .rectangle(), width: 120, height: 16)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .shimmer()
    }
}

#Preview("StatsCardSkeleton") {
    StatsCardSkeleton()
        .padding()
        .background(Theme.primaryBackground)
}
