//
//  MatchFeedbackSheet.swift
//  AceClub
//

import SwiftUI
import SwiftData

struct MatchFeedbackSheet: View {
    @Environment(\.modelContext) private var modelContext

    let match: MatchModel
    let existingFeedback: MatchFeedbackModel?
    @Binding var isPresented: Bool
    var onComplete: () -> Void

    @State private var syncService: MatchSyncService?
    @State private var selectedSensation: String? = nil
    @State private var comment: String = ""
    @State private var visibleToClub: Bool = true
    @State private var isLoading = false
    @State private var errorMessage: String?

    private var isEditing: Bool {
        existingFeedback != nil
    }

    private var canSubmit: Bool {
        selectedSensation != nil && comment.count <= 500
    }

    private let sensations: [(id: String, emoji: String, label: String)] = [
        ("bad", "\u{1F61E}", "Mauvaises"),
        ("average", "\u{1F610}", "Moyen"),
        ("good", "\u{1F642}", "Bon"),
        ("great", "\u{1F525}", "Tr\u{00E8}s bon"),
    ]

    var body: some View {
        DynamicSheet {
            VStack(spacing: 20) {
                // Title
                Text(isEditing ? "Modifier tes sensations" : "Comment tu te sens ?")
                    .font(.title3.weight(.bold))
                    .frame(maxWidth: .infinity, alignment: .leading)

                // Sensation picker
                HStack(spacing: 12) {
                    ForEach(sensations, id: \.id) { sensation in
                        Button {
                            withAnimation(.snappy) {
                                selectedSensation = sensation.id
                            }
                        } label: {
                            VStack(spacing: 6) {
                                Text(sensation.emoji)
                                    .font(.system(size: 32))
                                Text(sensation.label)
                                    .font(.caption2.weight(.medium))
                                    .foregroundStyle(selectedSensation == sensation.id ? Theme.tintColor : Theme.labelSecondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                                    .fill(selectedSensation == sensation.id ? Theme.tintColor.opacity(0.12) : Theme.inputBackground)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                                    .strokeBorder(selectedSensation == sensation.id ? Theme.tintColor : .clear, lineWidth: 2)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Comment field
                VStack(alignment: .leading, spacing: 6) {
                    TextField("Un commentaire ? (optionnel)", text: $comment, axis: .vertical)
                        .lineLimit(3...5)
                        .aceTextFieldStyle()

                    HStack {
                        Spacer()
                        Text("\(comment.count)/500")
                            .font(.caption2)
                            .foregroundStyle(comment.count > 500 ? Theme.destructiveColor : Theme.labelTertiary)
                    }
                }

                // Visibility toggle
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Montrer au club")
                            .font(.subheadline.weight(.medium))
                        Text("Le match appara\u{00EE}tra dans le feed de ton club")
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                    }
                    Spacer()
                    Toggle("", isOn: $visibleToClub)
                        .labelsHidden()
                }
                .padding(Theme.paddingCard)
                .background(Theme.inputBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))

                // Submit button
                Button {
                    Task { await submitFeedback() }
                } label: {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text(isEditing ? "Modifier" : "Valider")
                    }
                }
                .buttonStyle(.appPrimary)
                .disabled(!canSubmit || isLoading)

                // Delete button (edit mode only)
                if isEditing {
                    Button(role: .destructive) {
                        Task { await deleteFeedback() }
                    } label: {
                        Label("Supprimer le feedback", systemImage: "trash")
                            .font(.subheadline.weight(.medium))
                    }
                    .disabled(isLoading)
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 24)
            .padding(.bottom, 16)
        }
        .alert("Erreur", isPresented: .constant(errorMessage != nil)) {
            Button("OK") { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
        .task {
            syncService = MatchSyncService(modelContext: modelContext)
            if let existingFeedback {
                selectedSensation = existingFeedback.sensation
                comment = existingFeedback.comment ?? ""
                visibleToClub = existingFeedback.visibleToClub
            }
        }
    }

    // MARK: - Methods

    private func submitFeedback() async {
        guard let selectedSensation, !isLoading else { return }
        isLoading = true
        errorMessage = nil

        let trimmedComment = comment.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            if isEditing {
                _ = try await syncService?.updateFeedback(
                    matchId: match.id,
                    sensation: selectedSensation,
                    comment: trimmedComment.isEmpty ? nil : trimmedComment,
                    visibleToClub: visibleToClub
                )
            } else {
                _ = try await syncService?.createFeedback(
                    matchId: match.id,
                    sensation: selectedSensation,
                    comment: trimmedComment.isEmpty ? nil : trimmedComment,
                    visibleToClub: visibleToClub
                )
            }
            isPresented = false
            onComplete()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func deleteFeedback() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        do {
            _ = try await syncService?.deleteFeedback(matchId: match.id)
            isPresented = false
            onComplete()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
