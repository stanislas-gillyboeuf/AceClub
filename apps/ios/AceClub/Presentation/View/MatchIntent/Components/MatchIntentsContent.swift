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
                .padding(.bottom, 20)
                .padding(.top, 12)
        }
        .animation(.easeOut(duration: 0.25), value: viewModel.discoverItems.count)
    }

    // MARK: - Card Stack

    private var cardStack: some View {
        ZStack {
            ForEach(Array(viewModel.discoverItems.enumerated()), id: \.element.id) { index, item in
                if index > 0 && index < maxVisibleCards {
                    DiscoverCardView(item: item)
                        .scaleEffect(scaleForCard(at: index))
                        .offset(y: offsetYForCard(at: index))
                        .zIndex(Double(maxVisibleCards - index))
                }
            }

            if let top = viewModel.topCard {
                DiscoverCardView(item: top)
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusXLarge, style: .continuous)
                            .strokeBorder(glowColor, lineWidth: glowWidth)
                            .opacity(glowOpacity)
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
    }

    // MARK: - Glow

    private var glowColor: Color {
        if dragOffset.width > 0 { return .green }
        if dragOffset.width < 0 { return .red }
        return .clear
    }

    private var glowWidth: CGFloat {
        let progress = min(abs(dragOffset.width) / swipeThreshold, 1.0)
        return progress * 4
    }

    private var glowOpacity: Double {
        min(abs(dragOffset.width) / swipeThreshold, 1.0) * 0.8
    }

    // MARK: - Swipe Handling

    private func handleSwipeEnd(translation: CGSize) {
        let width = translation.width

        if width > swipeThreshold {
            hapticSuccess.notificationOccurred(.success)
            Task { await viewModel.like() }
            animateSwipeOut(offset: CGSize(width: 500, height: translation.height))
        } else if width < -swipeThreshold {
            hapticFeedback.impactOccurred()
            Task { await viewModel.pass() }
            animateSwipeOut(offset: CGSize(width: -500, height: translation.height))
        } else {
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

    // MARK: - Action Buttons

    private var actionButtons: some View {
        GlassEffectContainer {
            HStack(spacing: 48) {
                Button {
                    hapticFeedback.impactOccurred()
                    animateSwipeOut(offset: CGSize(width: -500, height: 0))
                    Task { await viewModel.pass() }
                } label: {
                    Image(systemName: "xmark")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .frame(width: 64, height: 64)
                        .glassEffect(.regular.interactive(), in: .circle)
                }
                .buttonStyle(.plain)
                .disabled(viewModel.topCard == nil || viewModel.isSwiping)

                Button {
                    hapticSuccess.notificationOccurred(.success)
                    animateSwipeOut(offset: CGSize(width: 500, height: 0))
                    Task { await viewModel.like() }
                } label: {
                    Image(systemName: "hand.raised.fill")
                        .font(.title)
                        .foregroundStyle(.white)
                        .frame(width: 72, height: 72)
                        .glassEffect(.regular.tint(Theme.accentGreen).interactive(), in: .circle)
                }
                .buttonStyle(.plain)
                .disabled(viewModel.topCard == nil || viewModel.isSwiping)
            }
        }
    }

    // MARK: - Empty State

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

    // MARK: - Match Banner

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
        .glassEffect(.regular.tint(Theme.accentGreen), in: .capsule)
        .padding(.top, 12)
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
}
