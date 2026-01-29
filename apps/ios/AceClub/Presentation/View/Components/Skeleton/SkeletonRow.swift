//
//  SkeletonRow.swift
//  AceClub
//
//  Skeleton générique pour les lignes de liste.
//

import SwiftUI

struct SkeletonRow: View {
    var showAvatar: Bool = true
    var avatarSize: CGFloat = 44
    var lineCount: Int = 2
    var titleWidth: CGFloat = 120
    var subtitleWidth: CGFloat? = nil

    var body: some View {
        HStack(spacing: 12) {
            if showAvatar {
                SkeletonShape(shape: .circle, width: avatarSize, height: avatarSize)
            }

            VStack(alignment: .leading, spacing: 8) {
                SkeletonShape(shape: .rectangle(), width: titleWidth, height: 14)

                if lineCount > 1 {
                    SkeletonShape(shape: .rectangle(), width: subtitleWidth, height: 12)
                }

                if lineCount > 2 {
                    SkeletonShape(shape: .rectangle(), width: 80, height: 10)
                }
            }

            Spacer(minLength: 0)
        }
        .shimmer()
    }
}

#Preview("SkeletonRow Variants") {
    List {
        SkeletonRow()

        SkeletonRow(showAvatar: false, lineCount: 1, titleWidth: 150)

        SkeletonRow(avatarSize: 56, lineCount: 3, titleWidth: 140, subtitleWidth: 200)
    }
    .listStyle(.plain)
}
