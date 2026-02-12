//
//  ChatBottomBar.swift
//  AceClub
//

import SwiftUI
import PhotosUI

struct ChatBottomBar: View {

    @Binding var message: String
    var sendMessage: () -> Void
    var onRecordingStart: () -> Void
    var onRecordingFinished: (_ discarded: Bool) -> Void
    var onSendImage: (Data, CGSize) -> Void
    var onTyping: () -> Void

    // Gesture Properties
    @GestureState private var isHolding: Bool = false
    @GestureState private var isRecording: Bool = false
    @GestureState private var recorderOffset: CGFloat = 0
    @State private var lastRecorderOffset: CGFloat = 0
    @State private var recorderStartTimeStamp: Date = .now
    @State private var disableBottomBar: Bool = false
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var textFieldHeight: CGFloat = 0

    private var isMultiLine: Bool {
        textFieldHeight > 36
    }

    var body: some View {
        GlassEffectContainer {
        HStack(spacing: 10) {
            HStack(spacing: 6) {
                AnimatedMenuButton(
                    isRecording: isRecording,
                    disableBottomBar: $disableBottomBar,
                    selectedPhoto: $selectedPhoto,
                    onSendImage: onSendImage
                )

                TextField("Message...", text: $message, axis: .vertical)
                    .lineLimit(5)
                    .opacity(isRecording ? 0 : 1)
                    .overlay(alignment: .trailing) {
                        if isRecording {
                            HStack(spacing: 0) {
                                Text(recorderStartTimeStamp, style: .timer)
                                    .font(.callout)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.gray)

                                Spacer(minLength: 0)

                                SlideToCancelText(text: "Glisser pour annuler")
                            }
                            .padding(.trailing, 10)
                        }
                    }
                    .animation(.interpolatingSpring(duration: 0.3), value: isRecording)
                    .onChange(of: message) { _, _ in
                        onTyping()
                    }
                    .background {
                        GeometryReader { geo in
                            Color.clear
                                .onChange(of: geo.size.height, initial: true) { _, newHeight in
                                    textFieldHeight = newHeight
                                }
                        }
                    }
            }
            .padding(.horizontal, 12)
            .frame(minHeight: 48)
            .glassEffect(.regular, in: RoundedRectangle(cornerRadius: isMultiLine ? 20 : 24, style: .continuous))
            .animation(.easeInOut(duration: 0.2), value: isMultiLine)
            .mask {
                Rectangle()
                    .padding(-50)
                    .padding(.trailing, abs(recorderOffset))
            }

            Image(systemName: mainActionSymbol)
                .font(.system(size: 20, weight: .medium))
                .foregroundStyle(.white)
                .contentTransition(.symbolEffect(.replace, options: .default.speed(1.2)))
                .frame(width: 48, height: 48)
                .glassEffect(.regular.tint(Theme.accentGreen).interactive(), in: .circle)
                .scaleEffect(isHolding ? 1.28 : 1)
                .offset(x: recorderOffset)
                .gesture(sendMessageGesture, isEnabled: !message.isEmpty)
                .gesture(
                    LongPressGesture(minimumDuration: 0.3)
                        .sequenced(before: DragGesture(minimumDistance: 10))
                        .updating($isHolding, body: { _, out, _ in
                            out = true
                        }).updating($isRecording, body: { value, out, _ in
                            if case .second(_, _) = value {
                                out = true
                            }
                        }).updating($recorderOffset, body: { value, out, _ in
                            if case let .second(_, gesture) = value, let gesture {
                                let translation = gesture.translation.width
                                let cappedOffset = max(min(translation, 0), -200)
                                out = cappedOffset
                            }
                        }),
                    isEnabled: message.isEmpty
                )
        }
        .animation(.interpolatingSpring(duration: 0.4), value: isHolding)
        .animation(.interactiveSpring(duration: 0.3), value: recorderOffset == 0)
        .onChange(of: isRecording) { oldValue, newValue in
            if newValue {
                recorderStartTimeStamp = .now
                onRecordingStart()
            } else {
                if -lastRecorderOffset > 50 {
                    disableBottomBar = true
                    onRecordingFinished(true)
                } else {
                    onRecordingFinished(false)
                }
                lastRecorderOffset = 0
            }
        }
        .onChange(of: recorderOffset) { oldValue, newValue in
            if isRecording {
                lastRecorderOffset = newValue
            }
        }
        .overlay {
            if disableBottomBar {
                Rectangle()
                    .foregroundStyle(.clear)
                    .contentShape(.rect)
                    .transition(.identity)
            }
        }
        } // GlassEffectContainer
    }

    var mainActionSymbol: String {
        let recordingSymbol: String = isRecording ? "waveform" : "mic.fill"
        return message.isEmpty ? recordingSymbol : "paperplane.fill"
    }

    var sendMessageGesture: some Gesture {
        TapGesture(count: 1).onEnded { _ in
            sendMessage()
        }
    }
}

// MARK: - Animated Menu Button (Photo Picker + Trash Animation)

struct AnimatedMenuButton: View {
    var isRecording: Bool
    @Binding var disableBottomBar: Bool
    @Binding var selectedPhoto: PhotosPickerItem?
    var onSendImage: (Data, CGSize) -> Void

    @State private var keyFrameTrigger: Bool = false
    @State private var isTrashOpen: Bool = false

    var body: some View {
        ZStack {
            if isRecording || disableBottomBar {
                Image(systemName: "mic")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.primary)
                    .transition(.scale(scale: 0.5).combined(with: .opacity))
                    .keyframeAnimator(initialValue: KeyFrame(), trigger: keyFrameTrigger) { content, frame in
                        content
                            .scaleEffect(frame.scale, anchor: .bottom)
                            .rotationEffect(.init(degrees: frame.rotation))
                            .offset(y: frame.offset)
                            .opacity(frame.opacity)
                    } keyframes: { _ in
                        CubicKeyframe(KeyFrame(offset: -50, rotation: 360), duration: 0.25)
                        CubicKeyframe(KeyFrame(scale: 0.5, offset: 0, rotation: 360), duration: 0.25)
                        CubicKeyframe(KeyFrame(opacity: 0, scale: 0.5, offset: 0, rotation: 360), duration: 0.1)
                    }
            } else {
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    Image(systemName: "photo")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.primary)
                }
                .transition(.scale(scale: 0.5).combined(with: .opacity))
                .onChange(of: selectedPhoto) { _, newValue in
                    handleSelectedPhoto(newValue)
                }
            }

            CustomTrashCanView(isTrashOpen)
                .keyframeAnimator(initialValue: KeyFrame(opacity: 0, scale: 0.5), trigger: keyFrameTrigger) { content, frame in
                    content
                        .scaleEffect(frame.scale)
                        .opacity(frame.opacity)
                } keyframes: { _ in
                    CubicKeyframe(KeyFrame(scale: 1), duration: 0.2)
                    CubicKeyframe(KeyFrame(scale: 1), duration: 0.5)
                    CubicKeyframe(KeyFrame(opacity: 0, scale: 0.5), duration: 0.2)
                }
        }
        .frame(width: 30)
        .allowsHitTesting(!isRecording)
        .animation(.easeInOut(duration: 0.3), value: isRecording)
        .animation(.easeInOut(duration: 0.3), value: disableBottomBar)
        .onChange(of: disableBottomBar) { oldValue, newValue in
            if newValue {
                keyFrameTrigger.toggle()

                Task { @MainActor in
                    isTrashOpen = true
                    try? await Task.sleep(for: .seconds(0.5))
                    isTrashOpen = false
                    try? await Task.sleep(for: .seconds(0.2))
                    disableBottomBar = false
                }
            }
        }
    }

    @ViewBuilder
    func CustomTrashCanView(_ isOpen: Bool) -> some View {
        VStack(spacing: 2) {
            VStack(spacing: 0) {
                UnevenRoundedRectangle(
                    topLeadingRadius: 10,
                    bottomLeadingRadius: 0,
                    bottomTrailingRadius: 0,
                    topTrailingRadius: 10
                )
                .frame(width: 15, height: 6)

                Capsule()
                    .frame(height: 4)
            }
            .compositingGroup()
            .rotationEffect(.init(degrees: isOpen ? -90 : 0), anchor: .bottomLeading)
            .offset(y: isOpen ? 10 : 0)

            UnevenRoundedRectangle(
                topLeadingRadius: 0,
                bottomLeadingRadius: 5,
                bottomTrailingRadius: 5,
                topTrailingRadius: 0
            )
            .frame(width: 20, height: 20)
        }
        .frame(width: 25)
        .foregroundStyle(.gray)
        .compositingGroup()
        .scaleEffect(0.8)
        .animation(.easeInOut(duration: 0.3), value: isOpen)
    }

    @Animatable
    struct KeyFrame {
        var opacity: CGFloat = 1
        var scale: CGFloat = 1
        var offset: CGFloat = 0
        var rotation: CGFloat = 0
    }

    // MARK: - Photo Handling

    private func handleSelectedPhoto(_ item: PhotosPickerItem?) {
        guard let item else { return }

        Task {
            guard let data = try? await item.loadTransferable(type: Data.self),
                  let uiImage = UIImage(data: data) else { return }

            let compressed = compressImage(uiImage)
            let size = uiImage.size
            onSendImage(compressed, size)
            await MainActor.run { selectedPhoto = nil }
        }
    }

    private func compressImage(_ image: UIImage) -> Data {
        let maxDimension: CGFloat = 1200
        var targetSize = image.size

        if targetSize.width > maxDimension || targetSize.height > maxDimension {
            let ratio = min(maxDimension / targetSize.width, maxDimension / targetSize.height)
            targetSize = CGSize(width: targetSize.width * ratio, height: targetSize.height * ratio)
        }

        let renderer = UIGraphicsImageRenderer(size: targetSize)
        let resizedImage = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: targetSize))
        }

        return resizedImage.jpegData(compressionQuality: 0.7) ?? Data()
    }
}
