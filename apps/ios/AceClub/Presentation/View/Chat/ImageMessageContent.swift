//
//  ImageMessageContent.swift
//  AceClub
//

import SwiftUI

struct ImageMessageContent: View {

    let message: Message
    @State private var showFullScreen = false

    private var imageWidth: CGFloat {
        let w = CGFloat(message.attachmentWidth ?? 240)
        let h = CGFloat(message.attachmentHeight ?? 240)
        let ratio = w / h
        return min(240, max(120, 240 * ratio))
    }

    private var imageHeight: CGFloat {
        let w = CGFloat(message.attachmentWidth ?? 240)
        let h = CGFloat(message.attachmentHeight ?? 240)
        let ratio = h / w
        return min(300, max(120, imageWidth * ratio))
    }

    var body: some View {
        if let url = message.attachmentURL {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: imageWidth, height: imageHeight)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium))
                case .failure:
                    placeholderView
                default:
                    placeholderView
                        .overlay {
                            ProgressView()
                                .tint(message.isFromMe ? .white : Theme.tintColor)
                        }
                }
            }
            .onTapGesture {
                showFullScreen = true
            }
            .fullScreenCover(isPresented: $showFullScreen) {
                FullScreenImageViewer(imageURL: url)
            }
        }
    }

    private var placeholderView: some View {
        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium)
            .fill(Color(.systemGray4))
            .frame(width: imageWidth, height: imageHeight)
    }
}
