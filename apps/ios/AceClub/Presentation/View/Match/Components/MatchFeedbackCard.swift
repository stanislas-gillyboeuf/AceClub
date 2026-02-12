//
//  MatchFeedbackCard.swift
//  AceClub
//
//  Displays the user's feedback for a finished match
//

import SwiftUI

struct MatchFeedbackCard: View {
    let feedback: MatchFeedbackModel
    var onEdit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Section header
            Text("MES SENSATIONS")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)

            Button {
                onEdit()
            } label: {
                HStack(spacing: 12) {
                    Text(feedback.sensationEmoji)
                        .font(.system(size: 32))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(feedback.sensationLabel)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.labelPrimary)

                        if let comment = feedback.comment, !comment.isEmpty {
                            Text(comment)
                                .font(.caption)
                                .foregroundStyle(Theme.labelSecondary)
                                .lineLimit(2)
                        }
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.labelTertiary)
                }
                .padding(Theme.paddingCard)
                .background(Theme.inputBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .padding(Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }
}
