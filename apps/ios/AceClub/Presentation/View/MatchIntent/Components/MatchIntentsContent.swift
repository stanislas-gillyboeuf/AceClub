//
//  MatchIntentsContent.swift
//  AceClub
//

import SwiftUI

private let swipeThreshold: CGFloat = 100
private let maxCardRotation: Double = 12
private let cardStackSpacing: CGFloat = 8
private let maxVisibleCards = 3

struct MatchIntentsContent: View {
    @ObservedObject var viewModel: MatchIntentsViewModel

    @State private var dragOffset: CGSize = .zero
    @Binding var selectedItem: MatchIntentDiscoverItem?
    var onCreateIntent: (() -> Void)?

    private let hapticFeedback = UIImpactFeedbackGenerator(style: .medium)
    private let hapticSuccess = UINotificationFeedbackGenerator()

    var body: some View {
        VStack(spacing: 0) {
            if let message = viewModel.lastSwipeMessage, viewModel.didMatch {
                matchBanner(message: message)
            }

            ZStack(alignment: .center) {
                if viewModel.discoverItems.isEmpty && !viewModel.isLoading {
                    emptyState
                } else {
                    cardStack
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, Theme.paddingHorizontal)

            actionButtons
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.bottom, 32)
                .padding(.top, 16)
        }
        .animation(.easeOut(duration: 0.25), value: viewModel.discoverItems.count)
    }

    // MARK: - Card stack

    private var cardStack: some View {
        ZStack {
            // Background cards (stack)
            ForEach(Array(viewModel.discoverItems.enumerated()), id: \.element.id) { index, item in
                if index > 0 && index < maxVisibleCards {
                    DiscoverCardView(item: item)
                        .scaleEffect(scaleForCard(at: index))
                        .offset(y: offsetYForCard(at: index))
                        .zIndex(Double(maxVisibleCards - index))
                }
            }

            // Top card (draggable + tappable)
            if let top = viewModel.topCard {
                ZStack {
                    DiscoverCardView(item: top)

                    // Swipe feedback overlays
                    swipeOverlays
                }
                .offset(dragOffset)
                .rotationEffect(.degrees(rotationForDrag))
                .gesture(
                    DragGesture(minimumDistance: 10)
                        .onChanged { value in
                            dragOffset = value.translation
                        }
                        .onEnded { value in
                            handleSwipeEnd(translation: value.translation)
                        }
                )
                .simultaneousGesture(
                    TapGesture()
                        .onEnded {
                            selectedItem = top
                        }
                )
                .zIndex(Double(maxVisibleCards))
                .allowsHitTesting(!viewModel.isSwiping)
            }
        }
        .frame(minHeight: 480)
    }

    // MARK: - Swipe Overlays

    private var swipeOverlays: some View {
        ZStack {
            // Like overlay (right swipe)
            likeOverlay
                .opacity(likeOverlayOpacity)

            // Pass overlay (left swipe)
            passOverlay
                .opacity(passOverlayOpacity)
        }
    }

    private var likeOverlay: some View {
        VStack {
            HStack {
                Spacer()
                Text("LIKE")
                    .font(.title.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.green)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .rotationEffect(.degrees(-15))
                    .padding(.top, 40)
                    .padding(.trailing, 20)
            }
            Spacer()
        }
    }

    private var passOverlay: some View {
        VStack {
            HStack {
                Text("NOPE")
                    .font(.title.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.red)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .rotationEffect(.degrees(15))
                    .padding(.top, 40)
                    .padding(.leading, 20)
                Spacer()
            }
            Spacer()
        }
    }

    private var likeOverlayOpacity: Double {
        let threshold: CGFloat = 30
        let maxOpacity: Double = 1.0
        if dragOffset.width > threshold {
            return min(Double(dragOffset.width - threshold) / 70, maxOpacity)
        }
        return 0
    }

    private var passOverlayOpacity: Double {
        let threshold: CGFloat = 30
        let maxOpacity: Double = 1.0
        if dragOffset.width < -threshold {
            return min(Double(abs(dragOffset.width) - threshold) / 70, maxOpacity)
        }
        return 0
    }

    // MARK: - Swipe Handling

    private func handleSwipeEnd(translation: CGSize) {
        let width = translation.width

        if width > swipeThreshold {
            // Like
            hapticSuccess.notificationOccurred(.success)
            Task { await viewModel.like() }
            animateSwipeOut(offset: CGSize(width: 500, height: translation.height))
        } else if width < -swipeThreshold {
            // Pass
            hapticFeedback.impactOccurred()
            Task { await viewModel.pass() }
            animateSwipeOut(offset: CGSize(width: -500, height: translation.height))
        } else {
            // Bounce back
            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                dragOffset = .zero
            }
        }
    }

    private var rotationForDrag: Double {
        let w = dragOffset.width
        let maxW: CGFloat = 200
        let ratio = min(max(abs(w) / maxW, 0), 1.0)
        return Double(w > 0 ? ratio * maxCardRotation : -ratio * maxCardRotation)
    }

    private func scaleForCard(at index: Int) -> CGFloat {
        let step: CGFloat = 0.04
        return 1.0 - step * CGFloat(index)
    }

    private func offsetYForCard(at index: Int) -> CGFloat {
        CGFloat(index) * cardStackSpacing
    }

    private func animateSwipeOut(offset: CGSize) {
        withAnimation(.easeOut(duration: 0.2)) {
            dragOffset = offset
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            dragOffset = .zero
        }
    }

    // MARK: - Action buttons

    private var actionButtons: some View {
        HStack(spacing: 48) {
            // Pass button
            Button {
                hapticFeedback.impactOccurred()
                animateSwipeOut(offset: CGSize(width: -500, height: 0))
                Task { await viewModel.pass() }
            } label: {
                ZStack {
                    Circle()
                        .fill(Theme.cardBackground)
                        .frame(width: 64, height: 64)
                        .overlay {
                            Circle()
                                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)
                        }

                    Image(systemName: "xmark")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)
            .disabled(viewModel.topCard == nil || viewModel.isSwiping)

            // Like button
            Button {
                hapticSuccess.notificationOccurred(.success)
                animateSwipeOut(offset: CGSize(width: 500, height: 0))
                Task { await viewModel.like() }
            } label: {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Theme.tintColor, Theme.tintColor.opacity(0.8)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 72, height: 72)
                        .shadow(color: Theme.tintColor.opacity(0.4), radius: 8, x: 0, y: 4)

                    Image(systemName: "hand.raised.fill")
                        .font(.title)
                        .foregroundStyle(.white)
                }
            }
            .buttonStyle(.plain)
            .disabled(viewModel.topCard == nil || viewModel.isSwiping)
        }
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 16) {
            ContentUnavailableView {
                Label("Plus de profils pour l'instant", systemImage: "person.2.slash")
            } description: {
                Text("Reviens plus tard pour découvrir de nouveaux joueurs de ton club.")
            } actions: {
                Button {
                    onCreateIntent?()
                } label: {
                    Label("Créer une annonce", systemImage: "plus.circle.fill")
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.tintColor)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
    }

    // MARK: - Match banner

    private func matchBanner(message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "hands.clap.fill")
                .foregroundStyle(Theme.tintColor)
            Text(message)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.tintColor.opacity(0.15))
        .clipShape(Capsule())
        .padding(.top, 12)
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
}
