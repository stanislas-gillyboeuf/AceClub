//
//  SkeletonShape.swift
//  AceClub
//
//  Forme de base pour les composants skeleton.
//

import SwiftUI

struct SkeletonShape: View {
    enum ShapeType {
        case rectangle(cornerRadius: CGFloat = 4)
        case circle
        case capsule
    }

    let shape: ShapeType
    var width: CGFloat? = nil
    var height: CGFloat = 16

    private let placeholderColor = Color.secondary.opacity(0.2)

    var body: some View {
        Group {
            switch shape {
            case .rectangle(let cornerRadius):
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(placeholderColor)

            case .circle:
                Circle()
                    .fill(placeholderColor)

            case .capsule:
                Capsule()
                    .fill(placeholderColor)
            }
        }
        .frame(width: width, height: height)
    }
}

#Preview("Shapes") {
    VStack(spacing: 16) {
        SkeletonShape(shape: .rectangle(), width: 100, height: 16)
        SkeletonShape(shape: .rectangle(cornerRadius: 8), width: 150, height: 24)
        SkeletonShape(shape: .circle, width: 44, height: 44)
        SkeletonShape(shape: .capsule, width: 80, height: 28)
    }
    .padding()
}
