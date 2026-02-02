import SwiftUI

struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    let url: URL?
    let content: (Image) -> Content
    let placeholder: () -> Placeholder

    @State private var retryCount = 0
    private let maxRetries = 3
    private let retryDelay: TimeInterval = 1.0

    init(
        url: URL?,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.content = content
        self.placeholder = placeholder
    }

    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                content(image)
            case .failure:
                if retryCount < maxRetries {
                    placeholder()
                        .onAppear {
                            scheduleRetry()
                        }
                } else {
                    placeholder()
                }
            case .empty:
                placeholder()
            @unknown default:
                placeholder()
            }
        }
        .id("\(url?.absoluteString ?? "nil")_\(retryCount)")
    }

    private func scheduleRetry() {
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: UInt64(retryDelay * 1_000_000_000))
            retryCount += 1
        }
    }
}
