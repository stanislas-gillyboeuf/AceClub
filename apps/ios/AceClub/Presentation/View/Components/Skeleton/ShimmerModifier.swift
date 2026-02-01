//
//  ShimmerModifier.swift
//  AceClub
//
//  Animation shimmer pour les composants skeleton.
//

import SwiftUI

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay {
                GeometryReader { geometry in
                    LinearGradient(
                        colors: [
                            .clear,
                            Color.white.opacity(0.4),
                            .clear
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geometry.size.width * 2)
                    .offset(x: -geometry.size.width + (geometry.size.width * 2 * phase))
                }
                .mask(content)
            }
            .onAppear {
                withAnimation(
                    .linear(duration: 1.2)
                    .repeatForever(autoreverses: false)
                ) {
                    phase = 1
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

#Preview("Shimmer Effect") {
    VStack(spacing: 16) {
        RoundedRectangle(cornerRadius: 8)
            .fill(Color.secondary.opacity(0.2))
            .frame(width: 200, height: 20)
            .shimmer()

        HStack(spacing: 12) {
            Circle()
                .fill(Color.secondary.opacity(0.2))
                .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 120, height: 14)

                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 180, height: 12)
            }
        }
        .shimmer()
    }
    .padding()
}
