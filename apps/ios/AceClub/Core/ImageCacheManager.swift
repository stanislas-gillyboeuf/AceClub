//
//  ImageCacheManager.swift
//  AceClub
//
//  Manages image cache invalidation to force refresh of user profile images.
//

import Foundation

@Observable
final class ImageCacheManager {
    static let shared = ImageCacheManager()

    /// Dictionary [userId: timestamp] to track when each user's image was invalidated
    private(set) var imageVersions: [String: TimeInterval] = [:]

    private init() {}

    /// Invalidate the cached image for a specific user
    /// Call this after syncing a match participant to force image refresh
    func invalidateImage(for userId: String) {
        imageVersions[userId] = Date().timeIntervalSince1970
    }

    /// Get a cache-busted URL for an image
    /// Appends ?v=<timestamp> to force URLCache to fetch a fresh copy
    func cacheBustedURL(for baseURL: String, userId: String) -> URL? {
        guard let url = URL(string: baseURL) else { return nil }

        let version = imageVersions[userId] ?? 0
        // Only add cache buster if we have an invalidation timestamp
        guard version > 0 else { return url }

        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        var queryItems = components?.queryItems ?? []
        queryItems.append(URLQueryItem(name: "v", value: String(Int(version))))
        components?.queryItems = queryItems
        return components?.url ?? url
    }

    /// Clear all cached images from URLCache and reset version tracking
    func invalidateAllImages() {
        URLCache.shared.removeAllCachedResponses()
        imageVersions.removeAll()
    }
}
