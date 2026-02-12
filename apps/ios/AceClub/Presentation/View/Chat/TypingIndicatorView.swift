//
//  TypingIndicatorView.swift
//  AceClub
//

import SwiftUI

struct TypingIndicatorView: View {

    @State private var phase: Int = 0

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .fill(Theme.labelTertiary)
                        .frame(width: 7, height: 7)
                        .offset(y: phase == index ? -4 : 0)
                        .animation(
                            .easeInOut(duration: 0.4)
                                .repeatForever(autoreverses: true)
                                .delay(Double(index) * 0.15),
                            value: phase
                        )
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .glassEffect(
                .regular,
                in: UnevenRoundedRectangle(
                    topLeadingRadius: 18,
                    bottomLeadingRadius: 4,
                    bottomTrailingRadius: 18,
                    topTrailingRadius: 18
                )
            )

            Spacer(minLength: 60)
        }
        .onAppear {
            phase = 2
        }
    }
}
