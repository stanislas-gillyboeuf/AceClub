//
//  WaveformView.swift
//  AceClub
//

import SwiftUI

struct WaveformView: View {

    let messageId: String
    let barCount: Int
    let progress: Double
    let tintColor: Color

    init(
        messageId: String,
        barCount: Int = 30,
        progress: Double = 0,
        tintColor: Color = Theme.accentGreen
    ) {
        self.messageId = messageId
        self.barCount = barCount
        self.progress = progress
        self.tintColor = tintColor
    }

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<barCount, id: \.self) { index in
                let height = barHeight(for: index)
                let filled = Double(index) / Double(barCount) <= progress

                RoundedRectangle(cornerRadius: 1)
                    .fill(filled ? tintColor : tintColor.opacity(0.3))
                    .frame(width: 2.5, height: height)
            }
        }
        .frame(height: 24)
    }

    private func barHeight(for index: Int) -> CGFloat {
        // Pseudo-random height seeded by messageId + index
        let seed = messageId.hashValue &+ index
        let normalized = abs(Double(seed % 100)) / 100.0
        return 4 + normalized * 20
    }
}
