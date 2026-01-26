//
//  DiscoverCardView.swift
//  AceClub
//

import SwiftUI

struct DiscoverCardView: View {
    let item: MatchIntentDiscoverItem

    private var displayName: String {
        item.user?.name ?? "Joueur"
    }

    private var subtitle: String {
        var parts: [String] = []
        if let date = item.intent.date {
            parts.append(date.formatted(date: .abbreviated, time: .omitted))
        }
        if let time = item.intent.time {
            parts.append(time.formatted(date: .omitted, time: .shortened))
        }
        if item.intent.duration > 0 {
            if item.intent.duration >= 60 {
                let h = item.intent.duration / 60
                let m = item.intent.duration % 60
                parts.append(m > 0 ? "\(h)h \(m)min" : "\(h)h")
            } else {
                parts.append("\(item.intent.duration) min")
            }
        }
        return parts.joined(separator: " • ")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Zone "photo" (placeholder)
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.22, green: 0.35, blue: 0.52),
                        Color(red: 0.18, green: 0.28, blue: 0.42)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.white.opacity(0.6))
            }
            .frame(height: 340)
            .clipped()

            // Infos
            VStack(alignment: .leading, spacing: 6) {
                Text(displayName)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)
                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.12), radius: 12, x: 0, y: 4)
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color(.systemGray5), lineWidth: 0.5)
        )
    }
}