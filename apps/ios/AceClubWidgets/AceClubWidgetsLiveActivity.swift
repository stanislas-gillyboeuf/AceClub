//
//  AceClubWidgetsLiveActivity.swift
//  AceClubWidgets
//
//  Live Activity widget for ongoing matches
//

import ActivityKit
import WidgetKit
import SwiftUI

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
                        avatarURL: context.attributes.homePlayerAvatarURL
                    )
                }

                DynamicIslandExpandedRegion(.trailing) {
                    MatchPlayerAvatarView(
                        name: context.attributes.awayPlayerName,
                        avatarURL: context.attributes.awayPlayerAvatarURL
                    )
                }

                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 4) {
                        // Set score
                        Text(context.state.formattedSetScore)
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .contentTransition(.numericText())

                        // Current set label
                        Text("Set \(context.state.currentSetNumber)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        // Timer since start
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text(context.attributes.startedAt, style: .timer)
                                .font(.caption.monospacedDigit())
                        }
                        .foregroundStyle(.secondary)

                        Spacer()

                        // Current set score
                        Text("Set actuel: \(context.state.formattedCurrentSetScore)")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                    .padding(.horizontal, 8)
                }
            } compactLeading: {
                // COMPACT LEADING (left side of Dynamic Island)
                Image(systemName: "tennisball.fill")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            } compactTrailing: {
                // COMPACT TRAILING (right side of Dynamic Island)
                Text(context.state.formattedSetScore)
                    .font(.caption2.weight(.bold).monospacedDigit())
            } minimal: {
                // MINIMAL (when multiple activities)
                Text(context.state.formattedSetScore)
                    .font(.caption.weight(.bold))
            }
            .widgetURL(URL(string: "aceclub://match/\(context.attributes.matchId)/edit-scores"))
        }
    }
}

// MARK: - Lock Screen View

struct MatchLockScreenView: View {
    let context: ActivityViewContext<MatchLiveActivityAttributes>

    var body: some View {
        VStack(spacing: 12) {
            // Header with players
            HStack {
                MatchPlayerInfoView(
                    name: context.attributes.homePlayerName,
                    avatarURL: context.attributes.homePlayerAvatarURL,
                    alignment: .leading
                )

                Spacer()

                // Central score
                VStack(spacing: 2) {
                    Text(context.state.formattedSetScore)
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .contentTransition(.numericText())

                    Text("Sets")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                MatchPlayerInfoView(
                    name: context.attributes.awayPlayerName,
                    avatarURL: context.attributes.awayPlayerAvatarURL,
                    alignment: .trailing
                )
            }

            // Footer with timer and current set
            HStack {
                // Timer
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)
                    Text(context.attributes.startedAt, style: .timer)
                        .font(.caption.monospacedDigit())
                }
                .foregroundStyle(.secondary)

                Spacer()

                // Current set
                Text("Set \(context.state.currentSetNumber): \(context.state.formattedCurrentSetScore)")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.orange)
            }
        }
        .padding()
        .activityBackgroundTint(.black.opacity(0.8))
    }
}

// MARK: - Subviews

struct MatchPlayerInfoView: View {
    let name: String
    let avatarURL: String?
    let alignment: HorizontalAlignment

    var body: some View {
        VStack(alignment: alignment, spacing: 4) {
            MatchPlayerAvatarView(name: name, avatarURL: avatarURL)

            Text(name)
                .font(.caption)
                .lineLimit(1)
        }
        .frame(maxWidth: 80)
    }
}

struct MatchPlayerAvatarView: View {
    let name: String
    let avatarURL: String?

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.orange.opacity(0.3))

            Text(initials)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.orange)
        }
        .frame(width: 32, height: 32)
        .clipShape(Circle())
    }

    private var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

// MARK: - Preview

#Preview("Lock Screen", as: .content, using: MatchLiveActivityAttributes(
    matchId: "preview-1",
    startedAt: Date().addingTimeInterval(-1800),
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
        currentSetHomeGames: 7,
        currentSetAwayGames: 5
    )
}
