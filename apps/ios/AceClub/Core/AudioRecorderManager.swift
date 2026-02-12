//
//  AudioRecorderManager.swift
//  AceClub
//

import Foundation
import AVFoundation
import Combine

@MainActor
class AudioRecorderManager: ObservableObject {

    static let shared = AudioRecorderManager()

    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var audioLevels: [CGFloat] = []

    private var audioRecorder: AVAudioRecorder?
    private var timer: Timer?
    private var recordingURL: URL?

    private init() {}

    // MARK: - Public Methods

    func startRecording() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            return
        }

        let fileName = UUID().uuidString + ".m4a"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        recordingURL = url

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100.0,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
            AVEncoderBitRateKey: 128000,
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.isMeteringEnabled = true
            audioRecorder?.record()
            isRecording = true
            recordingDuration = 0
            audioLevels = []
            startTimer()
        } catch {
            // Recording failed to start
        }
    }

    func stopRecording() -> (URL, TimeInterval)? {
        guard isRecording, let recorder = audioRecorder else { return nil }

        recorder.stop()
        stopTimer()
        isRecording = false

        let duration = recordingDuration
        guard let url = recordingURL, duration > 0.5 else {
            // Too short, discard
            cleanupRecording()
            return nil
        }

        return (url, duration)
    }

    func cancelRecording() {
        audioRecorder?.stop()
        stopTimer()
        isRecording = false
        cleanupRecording()
    }

    // MARK: - Private Methods

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self, self.isRecording else { return }
                self.recordingDuration += 0.05
                self.audioRecorder?.updateMeters()
                let level = self.audioRecorder?.averagePower(forChannel: 0) ?? -160
                // Normalize from dB (-160...0) to 0...1
                let normalized = max(0, min(1, CGFloat((level + 50) / 50)))
                self.audioLevels.append(normalized)
                // Keep last 60 levels (3 seconds at 50ms)
                if self.audioLevels.count > 60 {
                    self.audioLevels.removeFirst()
                }
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func cleanupRecording() {
        if let url = recordingURL {
            try? FileManager.default.removeItem(at: url)
        }
        recordingURL = nil
        recordingDuration = 0
        audioLevels = []
    }
}
