//
//  AceClubWidgetsLiveActivity.swift
//  AceClubWidgets
//
//  Live Activity widget for ongoing matches
//

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Design Constants

private enum MatchLiveActivityDesign {
    static let backgroundColor = Color(red: 0.04, green: 0.04, blue: 0.04) // #0A0A0A
    static let accentColor = Color.orange
    static let completedSetColor = Color.orange
    static let lostSetColor = Color.gray.opacity(0.5)
    static let futureSetColor = Color.gray.opacity(0.3)
    static let currentSetGradient = LinearGradient(
        colors: [Color.orange.opacity(0.15), Color.orange.opacity(0.05)],
        startPoint: .top,
        endPoint: .bottom
    )
}

// MARK: - Main Widget

struct AceClubWidgetsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MatchLiveActivityAttributes.self) { context in
            // LOCK SCREEN VIEW
            MatchLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // EXPANDED VIEW (long press on Dynamic Island)
                DynamicIslandExpandedRegion(.leading) {
                    MatchPlayerAvatarView(
                        name: context.attributes.homePlayerName,
                        avatarURL: context.attributes.homePlayerAvatarURL,
                        size: 48,
                        isLeading: context.state.isHomeLeading
                    )
                }

                DynamicIslandExpandedRegion(.trailing) {
                    MatchPlayerAvatarView(
                        name: context.attributes.awayPlayerName,
                        avatarURL: context.attributes.awayPlayerAvatarURL,
                        size: 48,
                        isLeading: context.state.isAwayLeading
                    )
                }

                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 2) {
                        // Set score (large)
                        Text(context.state.formattedSetScore)
                            .font(.system(size: 38, weight: .bold, design: .rounded))
                            .contentTransition(.numericText())

                        Text("SETS")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .tracking(1)
                    }
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 12) {
                        // Timer since start
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text(context.attributes.startedAt, style: .timer)
                                .font(.caption.monospacedDigit())
                        }
                        .foregroundStyle(.secondary)

                        Spacer()

                        // Mini progress indicator
                        HStack(spacing: 4) {
                            ForEach(1...5, id: \.self) { setNum in
                                MiniSetIndicator(
                                    setNumber: setNum,
                                    currentSetNumber: context.state.currentSetNumber,
                                    completedSets: context.state.completedSets
                                )
                            }
                        }

                        Spacer()

                        // Current set score
                        Text("Set \(context.state.currentSetNumber): \(context.state.formattedCurrentSetScore)")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(MatchLiveActivityDesign.accentColor)
                    }
                    .padding(.horizontal, 8)
                }
            } compactLeading: {
                // COMPACT LEADING (left side of Dynamic Island)
                HStack(spacing: 4) {
                    MatchPlayerAvatarView(
                        name: context.attributes.homePlayerName,
                        avatarURL: context.attributes.homePlayerAvatarURL,
                        size: 20,
                        isLeading: context.state.isHomeLeading
                    )
                    Image(systemName: "tennisball.fill")
                        .font(.system(size: 10))
                        .foregroundStyle(MatchLiveActivityDesign.accentColor)
                }
            } compactTrailing: {
                // COMPACT TRAILING (right side of Dynamic Island)
                HStack(spacing: 2) {
                    Text(context.state.formattedSetScore)
                        .font(.caption2.weight(.bold).monospacedDigit())
                    Text("|")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(context.state.formattedCurrentSetScore)
                        .font(.caption2.monospacedDigit())
                        .foregroundStyle(MatchLiveActivityDesign.accentColor)
                }
            } minimal: {
                // MINIMAL (when multiple activities)
                Text(context.state.formattedSetScore)
                    .font(.system(size: 12, weight: .bold))
            }
            .widgetURL(URL(string: "aceclub://match/\(context.attributes.matchId)/edit-scores"))
        }
    }
}

// MARK: - Lock Screen View (Compact)

struct MatchLockScreenView: View {
    let context: ActivityViewContext<MatchLiveActivityAttributes>

    var body: some View {
        VStack(spacing: 8) {
            // Compact header: names + set score
            HStack {
                // Home player
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.attributes.homePlayerName)
                        .font(.system(size: 13, weight: .medium))
                        .lineLimit(1)
                    Text("\(context.state.homeSetScore) set\(context.state.homeSetScore != 1 ? "s" : "")")
                        .font(.system(size: 11))
                        .foregroundStyle(MatchLiveActivityDesign.accentColor)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Current set score (compact)
                VStack(spacing: 0) {
                    Text("Set \(context.state.currentSetNumber)")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(.secondary)
                    Text("\(context.state.currentSetHomeGames) - \(context.state.currentSetAwayGames)")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .contentTransition(.numericText())
                }

                // Away player
                VStack(alignment: .trailing, spacing: 2) {
                    Text(context.attributes.awayPlayerName)
                        .font(.system(size: 13, weight: .medium))
                        .lineLimit(1)
                    Text("\(context.state.awaySetScore) set\(context.state.awaySetScore != 1 ? "s" : "")")
                        .font(.system(size: 11))
                        .foregroundStyle(MatchLiveActivityDesign.accentColor)
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
            }

            // Compact sets timeline
            CompactSetsProgressView(
                currentSetNumber: context.state.currentSetNumber,
                completedSets: context.state.completedSets
            )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .activityBackgroundTint(MatchLiveActivityDesign.backgroundColor)
    }
}

// MARK: - Set State

enum SetState {
    case completed(wonByHome: Bool)
    case current
    case future
}

// MARK: - Compact Sets Progress View

struct CompactSetsProgressView: View {
    let currentSetNumber: Int
    let completedSets: [MatchLiveActivityAttributes.CompletedSetScore]

    private let totalSets = 5

    var body: some View {
        HStack(spacing: 0) {
            ForEach(1...totalSets, id: \.self) { setNum in
                if setNum > 1 {
                    Rectangle()
                        .fill(connectorColor(for: setNum))
                        .frame(height: 1.5)
                }

                CompactSetCircleView(
                    setNumber: setNum,
                    state: stateForSet(setNum),
                    score: scoreText(for: setNum)
                )
            }
        }
    }

    private func stateForSet(_ setNumber: Int) -> SetState {
        if setNumber < currentSetNumber {
            let completedSet = completedSets.first { $0.setNumber == setNumber }
            return .completed(wonByHome: completedSet?.homeWon ?? false)
        } else if setNumber == currentSetNumber {
            return .current
        } else {
            return .future
        }
    }

    private func connectorColor(for setNumber: Int) -> Color {
        if setNumber <= currentSetNumber {
            return MatchLiveActivityDesign.accentColor.opacity(0.5)
        }
        return MatchLiveActivityDesign.futureSetColor
    }

    private func scoreText(for setNumber: Int) -> String {
        if let set = completedSets.first(where: { $0.setNumber == setNumber }) {
            return set.formattedScore
        }
        return ""
    }
}

// MARK: - Compact Set Circle View

struct CompactSetCircleView: View {
    let setNumber: Int
    let state: SetState
    let score: String

    var body: some View {
        VStack(spacing: 2) {
            ZStack {
                Circle()
                    .fill(backgroundColor)
                    .frame(width: 20, height: 20)

                if case .current = state {
                    Circle()
                        .stroke(MatchLiveActivityDesign.accentColor, lineWidth: 1.5)
                        .frame(width: 20, height: 20)
                }

                Text("\(setNumber)")
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundStyle(textColor)
            }

            if !score.isEmpty {
                Text(score)
                    .font(.system(size: 8, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 24)
    }

    private var backgroundColor: Color {
        switch state {
        case .completed(let wonByHome):
            return wonByHome ? MatchLiveActivityDesign.completedSetColor : MatchLiveActivityDesign.lostSetColor
        case .current:
            return MatchLiveActivityDesign.accentColor.opacity(0.2)
        case .future:
            return MatchLiveActivityDesign.futureSetColor
        }
    }

    private var textColor: Color {
        switch state {
        case .completed:
            return .white
        case .current:
            return MatchLiveActivityDesign.accentColor
        case .future:
            return .gray
        }
    }
}


// MARK: - Player Avatar View

struct MatchPlayerAvatarView: View {
    let name: String
    let avatarURL: String?
    let size: CGFloat
    let isLeading: Bool

    init(name: String, avatarURL: String?, size: CGFloat = 48, isLeading: Bool = false) {
        self.name = name
        self.avatarURL = avatarURL
        self.size = size
        self.isLeading = isLeading
    }

    var body: some View {
        ZStack {
            // Background gradient
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            MatchLiveActivityDesign.accentColor.opacity(0.4),
                            MatchLiveActivityDesign.accentColor.opacity(0.2)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            // Initials
            Text(initials)
                .font(.system(size: fontSize, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(
            // Leader border
            Circle()
                .stroke(
                    isLeading ? MatchLiveActivityDesign.accentColor : .clear,
                    lineWidth: isLeading ? 2 : 0
                )
        )
        .overlay(alignment: .bottomTrailing) {
            // Leader badge
            if isLeading && size >= 40 {
                Circle()
                    .fill(MatchLiveActivityDesign.accentColor)
                    .frame(width: 12, height: 12)
                    .overlay(
                        Image(systemName: "arrow.up")
                            .font(.system(size: 7, weight: .bold))
                            .foregroundStyle(.white)
                    )
                    .offset(x: 2, y: 2)
            }
        }
    }

    private var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    private var fontSize: CGFloat {
        switch size {
        case ...24: return 9
        case 25...36: return 12
        case 37...48: return 16
        default: return 20
        }
    }
}

// MARK: - Mini Set Indicator (for Dynamic Island bottom)

struct MiniSetIndicator: View {
    let setNumber: Int
    let currentSetNumber: Int
    let completedSets: [MatchLiveActivityAttributes.CompletedSetScore]

    var body: some View {
        Circle()
            .fill(indicatorColor)
            .frame(width: 6, height: 6)
    }

    private var indicatorColor: Color {
        if setNumber < currentSetNumber {
            let completedSet = completedSets.first { $0.setNumber == setNumber }
            return (completedSet?.homeWon ?? false)
                ? MatchLiveActivityDesign.accentColor
                : MatchLiveActivityDesign.lostSetColor
        } else if setNumber == currentSetNumber {
            return MatchLiveActivityDesign.accentColor
        } else {
            return MatchLiveActivityDesign.futureSetColor
        }
    }
}

// MARK: - Previews

#Preview("Lock Screen - En cours", as: .content, using: MatchLiveActivityAttributes(
    matchId: "preview-1",
    startedAt: Date().addingTimeInterval(-6452), // ~1h47
    homePlayerName: "Nicolas B.",
    homePlayerAvatarURL: nil,
    awayPlayerName: "Thomas M.",
    awayPlayerAvatarURL: nil
)) {
    AceClubWidgetsLiveActivity()
} contentStates: {
    MatchLiveActivityAttributes.ContentState(
        homeSetScore: 2,
        awaySetScore: 1,
        currentSetNumber: 4,
        currentSetHomeGames: 5,
        currentSetAwayGames: 4,
        completedSets: [
            .init(setNumber: 1, homeGames: 6, awayGames: 4),
            .init(setNumber: 2, homeGames: 7, awayGames: 5),
            .init(setNumber: 3, homeGames: 4, awayGames: 6)
        ]
    )
}

#Preview("Lock Screen - Premier set", as: .content, using: MatchLiveActivityAttributes(
    matchId: "preview-2",
    startedAt: Date().addingTimeInterval(-900), // 15 min
    homePlayerName: "Nicolas B.",
    homePlayerAvatarURL: nil,
    awayPlayerName: "Thomas M.",
    awayPlayerAvatarURL: nil
)) {
    AceClubWidgetsLiveActivity()
} contentStates: {
    MatchLiveActivityAttributes.ContentState(
        homeSetScore: 0,
        awaySetScore: 0,
        currentSetNumber: 1,
        currentSetHomeGames: 3,
        currentSetAwayGames: 2,
        completedSets: []
    )
}

#Preview("Dynamic Island Expanded", as: .dynamicIsland(.expanded), using: MatchLiveActivityAttributes(
    matchId: "preview-3",
    startedAt: Date().addingTimeInterval(-3600),
    homePlayerName: "Nicolas B.",
    homePlayerAvatarURL: nil,
    awayPlayerName: "Thomas M.",
    awayPlayerAvatarURL: nil
)) {
    AceClubWidgetsLiveActivity()
} contentStates: {
    MatchLiveActivityAttributes.ContentState(
        homeSetScore: 2,
        awaySetScore: 1,
        currentSetNumber: 4,
        currentSetHomeGames: 5,
        currentSetAwayGames: 4,
        completedSets: [
            .init(setNumber: 1, homeGames: 6, awayGames: 4),
            .init(setNumber: 2, homeGames: 7, awayGames: 5),
            .init(setNumber: 3, homeGames: 4, awayGames: 6)
        ]
    )
}

#Preview("Dynamic Island Compact", as: .dynamicIsland(.compact), using: MatchLiveActivityAttributes(
    matchId: "preview-4",
    startedAt: Date().addingTimeInterval(-3600),
    homePlayerName: "Nicolas B.",
    homePlayerAvatarURL: nil,
    awayPlayerName: "Thomas M.",
    awayPlayerAvatarURL: nil
)) {
    AceClubWidgetsLiveActivity()
} contentStates: {
    MatchLiveActivityAttributes.ContentState(
        homeSetScore: 2,
        awaySetScore: 1,
        currentSetNumber: 4,
        currentSetHomeGames: 5,
        currentSetAwayGames: 4,
        completedSets: [
            .init(setNumber: 1, homeGames: 6, awayGames: 4),
            .init(setNumber: 2, homeGames: 7, awayGames: 5),
            .init(setNumber: 3, homeGames: 4, awayGames: 6)
        ]
    )
}

#Preview("Dynamic Island Minimal", as: .dynamicIsland(.minimal), using: MatchLiveActivityAttributes(
    matchId: "preview-5",
    startedAt: Date().addingTimeInterval(-3600),
    homePlayerName: "Nicolas B.",
    homePlayerAvatarURL: nil,
    awayPlayerName: "Thomas M.",
    awayPlayerAvatarURL: nil
)) {
    AceClubWidgetsLiveActivity()
} contentStates: {
    MatchLiveActivityAttributes.ContentState(
        homeSetScore: 2,
        awaySetScore: 1,
        currentSetNumber: 4,
        currentSetHomeGames: 5,
        currentSetAwayGames: 4,
        completedSets: [
            .init(setNumber: 1, homeGames: 6, awayGames: 4),
            .init(setNumber: 2, homeGames: 7, awayGames: 5),
            .init(setNumber: 3, homeGames: 4, awayGames: 6)
        ]
    )
}
