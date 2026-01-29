//
//  SkeletonList.swift
//  AceClub
//
//  Conteneur pour répéter des skeletons dans une liste.
//

import SwiftUI

struct SkeletonList<Content: View>: View {
    let count: Int
    @ViewBuilder let content: () -> Content

    var body: some View {
        ForEach(0..<count, id: \.self) { _ in
            content()
        }
    }
}

#Preview("SkeletonList") {
    List {
        SkeletonList(count: 5) {
            SkeletonRow()
        }
    }
    .listStyle(.plain)
}
