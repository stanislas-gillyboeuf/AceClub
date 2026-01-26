//
//  MatchIntentRow.swift
//  AceClub
//

import SwiftUI

struct MatchIntentRow: View {
    let intent: MatchIntent
    let isDeleting: Bool
    let onDelete: () -> Void

    @State private var offset: CGFloat = 0
    @State private var isSwiping = false

    private let deleteThreshold: CGFloat = -80

    var body: some View {
        ZStack(alignment: .trailing) {
            // Delete button background
            HStack {
                Spacer()
                Button(action: onDelete) {
                    Image(systemName: "trash.fill")
                        .font(.title3)
                        .foregroundStyle(.white)
                        .frame(width: 80)
                        .frame(maxHeight: .infinity)
                }
                .background(Color.red)
            }

            // Main content
            HStack(alignment: .center, spacing: 12) {
                // Date icon
                VStack(spacing: 2) {
                    if let date = intent.date {
                        Text(date, format: .dateTime.day())
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.primary)
                        Text(date, format: .dateTime.month(.abbreviated))
                            .font(.caption.weight(.medium))
                            .foregroundStyle(.secondary)
                            .textCase(.uppercase)
                    } else {
                        Image(systemName: "calendar")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(width: 50)

                // Details
                VStack(alignment: .leading, spacing: 4) {
                    if let time = intent.time {
                        Text(time, format: .dateTime.hour().minute())
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.primary)
                    } else if intent.date != nil {
                        Text("Heure non définie")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    } else {
                        Text("Date non renseignée")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    Text(durationLabel(intent.duration))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if isDeleting {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "chevron.left")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.quaternary)
                        .opacity(offset == 0 ? 1 : 0)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color(.systemGray6))
            .offset(x: offset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        let translation = value.translation.width
                        if translation < 0 {
                            offset = translation
                            isSwiping = true
                        }
                    }
                    .onEnded { value in
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            if offset < deleteThreshold {
                                offset = deleteThreshold
                            } else {
                                offset = 0
                                isSwiping = false
                            }
                        }
                    }
            )
            .onTapGesture {
                if offset != 0 {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        offset = 0
                        isSwiping = false
                    }
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 0))
    }

    private func durationLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "Durée : \(h) h \(m) min" : "Durée : \(h) h"
        }
        return "Durée : \(minutes) min"
    }
}

#Preview {
    VStack(spacing: 0) {
        MatchIntentRow(
            intent: MatchIntent(
                id: "1",
                userId: "user1",
                date: Date(),
                time: Date(),
                duration: 90,
                status: .pending,
                createdAt: Date()
            ),
            isDeleting: false,
            onDelete: {}
        )
        Divider()
            .padding(.leading, 16)
        MatchIntentRow(
            intent: MatchIntent(
                id: "2",
                userId: "user1",
                date: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
                time: Calendar.current.date(bySettingHour: 18, minute: 30, second: 0, of: Date()),
                duration: 60,
                status: .pending,
                createdAt: Date()
            ),
            isDeleting: false,
            onDelete: {}
        )
    }
    .background(Color(.systemGray6))
    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    .padding()
}
