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
            .padding(.horizontal, 20)

            actionButtons
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
                .padding(.top, 16)
        }
        .animation(.easeOut(duration: 0.25), value: viewModel.discoverItems.count)
    }

    // MARK: - Card stack

    private var cardStack: some View {
        ZStack {
            // Cartes en arrière-plan (pile)
            ForEach(Array(viewModel.discoverItems.enumerated()), id: \.element.id) { index, item in
                if index > 0 && index < maxVisibleCards {
                    DiscoverCardView(item: item)
                        .scaleEffect(scaleForCard(at: index))
                        .offset(y: offsetYForCard(at: index))
                        .zIndex(Double(maxVisibleCards - index))
                }
            }

            // Carte du dessus (draggable)
            if let top = viewModel.topCard {
                DiscoverCardView(item: top)
                    .offset(dragOffset)
                    .rotationEffect(.degrees(rotationForDrag))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                dragOffset = value.translation
                            }
                            .onEnded { value in
                                let width = value.translation.width
                                if width > swipeThreshold {
                                    Task { await viewModel.like() }
                                    animateSwipeOut(offset: CGSize(width: 500, height: value.translation.height))
                                } else if width < -swipeThreshold {
                                    Task { await viewModel.pass() }
                                    animateSwipeOut(offset: CGSize(width: -500, height: value.translation.height))
                                } else {
                                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                                        dragOffset = .zero
                                    }
                                }
                            }
                    )
                    .zIndex(Double(maxVisibleCards))
                    .allowsHitTesting(!viewModel.isSwiping)
            }
        }
        .frame(minHeight: 420)
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
            Button {
                Task { await viewModel.pass() }
            } label: {
                ZStack {
                    Circle()
                        .fill(Color(.systemGray5))
                        .frame(width: 64, height: 64)
                    Image(systemName: "xmark")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)
            .disabled(viewModel.topCard == nil || viewModel.isSwiping)

            Button {
                Task { await viewModel.like() }
            } label: {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(red: 0.95, green: 0.35, blue: 0.38), Color(red: 0.9, green: 0.25, blue: 0.35)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 72, height: 72)
                        .shadow(color: Color(red: 0.9, green: 0.3, blue: 0.35).opacity(0.4), radius: 8, x: 0, y: 4)
                    Image(systemName: "heart.fill")
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
            Image(systemName: "rectangle.stack.fill")
                .font(.system(size: 56))
                .foregroundStyle(.tertiary)
            Text("Plus de profils pour l’instant")
                .font(.headline)
                .foregroundStyle(.secondary)
            Text("Reviens plus tard pour découvrir de nouveaux joueurs.")
                .font(.subheadline)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .padding()
    }

    // MARK: - Match banner

    private func matchBanner(message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "heart.fill")
                .foregroundStyle(.pink)
            Text(message)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.pink.opacity(0.15))
        .clipShape(Capsule())
        .padding(.top, 12)
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
}
