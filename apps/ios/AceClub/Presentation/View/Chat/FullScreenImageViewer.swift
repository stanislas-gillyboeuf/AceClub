//
//  FullScreenImageViewer.swift
//  AceClub
//

import SwiftUI

struct FullScreenImageViewer: View {

    let imageURL: URL
    @Environment(\.dismiss) private var dismiss
    @State private var scale: CGFloat = 1.0

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFit()
                        .scaleEffect(scale)
                        .gesture(
                            MagnifyGesture()
                                .onChanged { value in
                                    scale = min(max(value.magnification, 1.0), 3.0)
                                }
                                .onEnded { _ in
                                    withAnimation(.interpolatingSpring(duration: 0.3)) {
                                        if scale < 1.2 {
                                            scale = 1.0
                                        }
                                    }
                                }
                        )
                        .onTapGesture(count: 2) {
                            withAnimation(.interpolatingSpring(duration: 0.3)) {
                                scale = scale > 1.0 ? 1.0 : 2.0
                            }
                        }
                case .failure:
                    Image(systemName: "photo")
                        .font(.largeTitle)
                        .foregroundStyle(.gray)
                default:
                    ProgressView()
                        .tint(.white)
                }
            }
        }
        .overlay(alignment: .topTrailing) {
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 36, height: 36)
                    .glassEffect(.regular.interactive(), in: .circle)
            }
            .padding()
        }
        .statusBarHidden()
    }
}
