//
//  DynamicSheet.swift
//  AceClub
//

import SwiftUI

struct DynamicSheet<Content: View>: View {
    var animation: Animation = .snappy(duration: 0.3, extraBounce: 0)
    @ViewBuilder var content: Content

    @State private var sheetHeight: CGFloat = 0

    var body: some View {
        content
            .fixedSize(horizontal: false, vertical: true)
            .onGeometryChange(for: CGFloat.self) { proxy in
                proxy.size.height
            } action: { newHeight in
                sheetHeight = newHeight
            }
            .presentationDetents([.height(sheetHeight)])
            .presentationBackground(.clear)
            .animation(animation, value: sheetHeight)
    }
}

extension View {
    func disabledWithOpacity(_ disabled: Bool) -> some View {
        self
            .disabled(disabled)
            .opacity(disabled ? 0.6 : 1)
    }
}
