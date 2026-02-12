//
//  AudioPlayerManager.swift
//  AceClub
//

import Foundation
import AVFoundation
import Combine

@MainActor
class AudioPlayerManager: ObservableObject {

    static let shared = AudioPlayerManager()

    @Published var isPlaying = false
    @Published var currentMessageId: String?
    @Published var progress: Double = 0
    @Published var currentTime: TimeInterval = 0
    @Published var isLoading = false

    private var audioPlayer: AVAudioPlayer?
    private var displayLink: CADisplayLink?
    private var downloadCache: [String: URL] = [:]

    private init() {}

    // MARK: - Public Methods

    func play(url: URL, messageId: String) {
        // Stop current playback
        if isPlaying {
            stop()
        }

        currentMessageId = messageId

        if url.isFileURL {
            startPlayback(url: url, messageId: messageId)
            return
        }

        // Check cache
        if let cachedURL = downloadCache[url.absoluteString] {
            startPlayback(url: cachedURL, messageId: messageId)
            return
        }

        // Download remote file with auth token
        isLoading = true
        Task {
            do {
                let token = try KeychainManager.shared.getAuthToken()
                var request = URLRequest(url: url)
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

                let (data, response) = try await URLSession.shared.data(for: request)

                guard let httpResponse = response as? HTTPURLResponse,
                      httpResponse.statusCode == 200,
                      !data.isEmpty else {
                    // Try without auth as fallback (public URL)
                    let (publicData, _) = try await URLSession.shared.data(from: url)
                    let tempURL = FileManager.default.temporaryDirectory
                        .appendingPathComponent(UUID().uuidString + ".m4a")
                    try publicData.write(to: tempURL)
                    downloadCache[url.absoluteString] = tempURL
                    isLoading = false
                    startPlayback(url: tempURL, messageId: messageId)
                    return
                }

                let tempURL = FileManager.default.temporaryDirectory
                    .appendingPathComponent(UUID().uuidString + ".m4a")
                try data.write(to: tempURL)
                downloadCache[url.absoluteString] = tempURL
                isLoading = false
                startPlayback(url: tempURL, messageId: messageId)
            } catch {
                isLoading = false
                currentMessageId = nil
                print("[AudioPlayer] Download failed: \(error)")
            }
        }
    }

    func pause() {
        audioPlayer?.pause()
        isPlaying = false
        stopDisplayLink()
    }

    func resume() {
        audioPlayer?.play()
        isPlaying = true
        startDisplayLink()
    }

    func stop() {
        audioPlayer?.stop()
        audioPlayer = nil
        isPlaying = false
        currentMessageId = nil
        progress = 0
        currentTime = 0
        stopDisplayLink()
    }

    func togglePlayback(url: URL, messageId: String) {
        if currentMessageId == messageId {
            if isPlaying {
                pause()
            } else if audioPlayer != nil {
                resume()
            } else {
                play(url: url, messageId: messageId)
            }
        } else {
            play(url: url, messageId: messageId)
        }
    }

    // MARK: - Private Methods

    private func startPlayback(url: URL, messageId: String) {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)

            let player = try AVAudioPlayer(contentsOf: url)
            player.prepareToPlay()
            player.play()
            audioPlayer = player
            isPlaying = true
            currentMessageId = messageId
            progress = 0
            currentTime = 0
            startDisplayLink()
        } catch {
            print("[AudioPlayer] Playback failed: \(error)")
            currentMessageId = nil
        }
    }

    private func startDisplayLink() {
        stopDisplayLink()
        displayLink = CADisplayLink(target: AudioPlayerDisplayLinkTarget { [weak self] in
            Task { @MainActor [weak self] in
                self?.updateProgress()
            }
        }, selector: #selector(AudioPlayerDisplayLinkTarget.tick))
        displayLink?.preferredFrameRateRange = CAFrameRateRange(minimum: 10, maximum: 20)
        displayLink?.add(to: .main, forMode: .common)
    }

    private func stopDisplayLink() {
        displayLink?.invalidate()
        displayLink = nil
    }

    private func updateProgress() {
        guard let player = audioPlayer else { return }
        if !player.isPlaying && isPlaying {
            stop()
            return
        }
        currentTime = player.currentTime
        progress = player.duration > 0 ? player.currentTime / player.duration : 0
    }
}

// Helper class for CADisplayLink target (avoids retain cycle)
private class AudioPlayerDisplayLinkTarget {
    let callback: () -> Void
    init(_ callback: @escaping () -> Void) { self.callback = callback }
    @objc func tick() { callback() }
}
