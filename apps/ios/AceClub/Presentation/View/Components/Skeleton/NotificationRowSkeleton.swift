//
//  NotificationRowSkeleton.swift
//  AceClub
//
//  Skeleton pour les lignes de notification (NotificationRowView).
//

import SwiftUI

struct NotificationRowSkeleton: View {
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Icon
            SkeletonShape(shape: .rectangle(cornerRadius: 6), width: 32, height: 32)

            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    SkeletonShape(shape: .rectangle(), width: 140, height: 14)

                    Spacer()

                    SkeletonShape(shape: .rectangle(), width: 50, height: 10)
                }

                SkeletonShape(shape: .rectangle(), height: 12)

                SkeletonShape(shape: .rectangle(), width: 180, height: 12)
            }

            // Unread indicator placeholder
            SkeletonShape(shape: .circle, width: 8, height: 8)
        }
        .padding(.vertical, 8)
        .shimmer()
    }
}

#Preview("NotificationRowSkeleton") {
    List {
        NotificationRowSkeleton()
        NotificationRowSkeleton()
        NotificationRowSkeleton()
        NotificationRowSkeleton()
    }
    .listStyle(.plain)
}
