//
//  CreateMatchSheet.swift
//  AceClub
//

import SwiftUI
import SwiftData

// MARK: - Step enum

private enum CreateMatchStep: CaseIterable {
    case activityType
    case opponent
    case venue
    case dateTime
}

// MARK: - CreateMatchSheet

struct CreateMatchSheet: View {
    @Binding var isPresented: Bool
    var onCreated: (() -> Void)?

    @Environment(\.modelContext) private var modelContext

    @State private var currentStep: CreateMatchStep = .activityType
    @State private var matchType: MatchType?
    @State private var opponent: User?
    @State private var matchDate = Date()
    @State private var selectedSlot: TimeSlot?
    @State private var selectedVenue: Organization?
    @State private var organizations: [Organization] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var currentUser: User?

    private let getMeUseCase = GetMeUseCase()
    private let listOrganizationsUseCase = ListOrganizationsUseCase()
    private let organizationRepository = OrganizationRepository()

    private var combinedDateTime: Date? {
        guard let slot = selectedSlot else { return nil }
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: matchDate)
        components.hour = slot.hour
        components.minute = slot.minute
        return calendar.date(from: components)
    }

    private var availableSlots: [TimeSlot] {
        let calendar = Calendar.current
        let minimumDate = calendar.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        let isToday = calendar.isDateInToday(matchDate)

        return TimeSlot.allSlots.filter { slot in
            guard isToday else { return true }
            var components = calendar.dateComponents([.year, .month, .day], from: matchDate)
            components.hour = slot.hour
            components.minute = slot.minute
            guard let slotDate = calendar.date(from: components) else { return false }
            return slotDate >= minimumDate
        }
    }

    private var stepIndex: Int {
        switch currentStep {
        case .activityType: return 0
        case .opponent: return 1
        case .venue: return 2
        case .dateTime: return 3
        }
    }

    private var canContinue: Bool {
        switch currentStep {
        case .activityType: return matchType != nil
        case .opponent: return opponent != nil
        case .venue: return true
        case .dateTime: return selectedSlot != nil
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 24) {
                        progressIndicator

                        ZStack {
                            switch currentStep {
                            case .activityType:
                                activityTypeContent
                                    .geometryGroup()
                                    .transition(.blurReplace(.upUp))
                            case .opponent:
                                opponentContent
                                    .geometryGroup()
                                    .transition(.blurReplace(.upUp))
                            case .venue:
                                venueContent
                                    .geometryGroup()
                                    .transition(.blurReplace(.upUp))
                            case .dateTime:
                                dateTimeContent
                                    .geometryGroup()
                                    .transition(.blurReplace(.upUp))
                            }
                        }
                        .geometryGroup()
                        .animation(.snappy(duration: 0.3), value: currentStep)
                    }
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.top, 8)
                    .padding(.bottom, 24)
                }

                bottomButtons
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.bottom, 16)
                    .padding(.top, 12)
                    .background(
                        Theme.primaryBackground
                            .shadow(color: .black.opacity(0.06), radius: 8, y: -4)
                            .ignoresSafeArea(edges: .bottom)
                    )
            }
            .navigationTitle(stepTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if currentStep != .activityType {
                        Button {
                            triggerHaptic()
                            goBack()
                        } label: {
                            Image(systemName: "chevron.left")
                        }
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        isPresented = false
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.labelTertiary)
                    }
                }
            }
            .overlay {
                if isLoading {
                    ZStack {
                        Color.black.opacity(0.2).ignoresSafeArea()
                        ProgressView()
                            .scaleEffect(1.2)
                            .padding(24)
                            .background(.regularMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                    }
                }
            }
        }
        .task {
            await loadCurrentUser()
            await loadOrganizations()
        }
    }

    // MARK: - Progress Indicator

    private var progressIndicator: some View {
        HStack(spacing: 8) {
            ForEach(0..<CreateMatchStep.allCases.count, id: \.self) { index in
                Capsule()
                    .fill(index <= stepIndex ? Theme.tintColor : Theme.borderColor)
                    .frame(height: 4)
                    .animation(.easeOut(duration: 0.25), value: stepIndex)
            }
        }
    }

    private var stepTitle: String {
        switch currentStep {
        case .activityType: return "Type d'activit\u{00e9}"
        case .opponent: return "Adversaire"
        case .venue: return "Lieu"
        case .dateTime: return "Quand ?"
        }
    }

    // MARK: - Bottom Buttons (pinned)

    @ViewBuilder
    private var bottomButtons: some View {
        VStack(spacing: 12) {
            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Theme.destructiveColor)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            switch currentStep {
            case .activityType:
                Button("Continuer") {
                    triggerHaptic()
                    currentStep = .opponent
                }
                .buttonStyle(.appPrimary)
                .disabledWithOpacity(!canContinue)

                Button {
                    isPresented = false
                } label: {
                    Text("Annuler")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
                .buttonStyle(.plain)

            case .opponent:
                Button("Continuer") {
                    triggerHaptic()
                    Task { await loadOrganizations() }
                    currentStep = .venue
                }
                .buttonStyle(.appPrimary)
                .disabledWithOpacity(!canContinue)

                Button {
                    triggerHaptic()
                    goBack()
                } label: {
                    Text("Retour")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
                .buttonStyle(.plain)

            case .venue:
                Button("Continuer") {
                    triggerHaptic()
                    currentStep = .dateTime
                }
                .buttonStyle(.appPrimary)

                Button {
                    triggerHaptic()
                    goBack()
                } label: {
                    Text("Retour")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
                .buttonStyle(.plain)

            case .dateTime:
                Button {
                    Task { await createMatch() }
                } label: {
                    Label("Planifier le match", systemImage: "calendar.badge.plus")
                }
                .buttonStyle(.appPrimary)
                .disabledWithOpacity(!canContinue || isLoading)

                Button {
                    triggerHaptic()
                    goBack()
                } label: {
                    Text("Retour")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Step 1: Activity Type

    private var activityTypeContent: some View {
        VStack(spacing: 20) {
            Text("Quel type de rencontre ?")
                .font(.title3.weight(.semibold))
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 16) {
                ForEach(MatchType.allCases, id: \.self) { type in
                    activityTile(type: type)
                }
            }
        }
    }

    private func activityTile(type: MatchType) -> some View {
        let isSelected = matchType == type

        return Button {
            withAnimation(.easeOut(duration: 0.25)) {
                matchType = type
            }
            triggerHaptic()
        } label: {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Theme.tintColor.opacity(0.15) : Theme.tintColor.opacity(0.06))
                        .frame(width: 80, height: 80)

                    Image(systemName: type.icon)
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                }

                Text(type.displayName)
                    .font(.headline)
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 28)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .fill(Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .stroke(
                        isSelected ? Theme.tintColor : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.tintColor)
                            .frame(width: 26, height: 26)

                        Image(systemName: "checkmark")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .padding(10)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .shadow(
                color: isSelected ? Theme.tintColor.opacity(0.12) : .clear,
                radius: 8, y: 3
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Step 2: Opponent

    private var opponentContent: some View {
        VStack(spacing: 20) {
            Text("Contre qui ?")
                .font(.title3.weight(.semibold))
                .frame(maxWidth: .infinity, alignment: .leading)

            UserSearchField(
                label: "Rechercher un adversaire",
                selectedUser: $opponent,
                excludedUserIds: currentUser.map { [$0.id] } ?? []
            )
        }
    }

    // MARK: - Step 3: Venue

    private var venueContent: some View {
        VStack(spacing: 20) {
            Text("O\u{00f9} jouer ?")
                .font(.title3.weight(.semibold))
                .frame(maxWidth: .infinity, alignment: .leading)

            if organizations.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "building.2")
                        .font(.system(size: 40))
                        .foregroundStyle(Theme.labelTertiary)
                    Text("Aucun club trouv\u{00e9}")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                    Text("Le lieu sera d\u{00e9}termin\u{00e9} automatiquement")
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 32)
            } else {
                VStack(spacing: 12) {
                    ForEach(organizations) { org in
                        venueTile(organization: org)
                    }
                }
            }
        }
    }

    private func venueTile(organization: Organization) -> some View {
        let isSelected = selectedVenue?.id == organization.id

        return Button {
            withAnimation(.easeOut(duration: 0.2)) {
                if isSelected {
                    selectedVenue = nil
                } else {
                    selectedVenue = organization
                }
            }
            triggerHaptic()
        } label: {
            HStack(spacing: 14) {
                if let url = organization.logoURL {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Theme.tintColor.opacity(0.15))
                            .overlay {
                                Image(systemName: "building.2")
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.tintColor)
                            }
                    }
                    .frame(width: 44, height: 44)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Theme.tintColor.opacity(0.15))
                        .frame(width: 44, height: 44)
                        .overlay {
                            Image(systemName: "building.2")
                                .font(.subheadline)
                                .foregroundStyle(Theme.tintColor)
                        }
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(organization.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.labelPrimary)

                    if let address = organization.address, !address.isEmpty {
                        Text(address)
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(Theme.tintColor)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(Theme.paddingCard)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .fill(isSelected ? Theme.tintColor.opacity(0.08) : Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .stroke(
                        isSelected ? Theme.tintColor : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .animation(.easeOut(duration: 0.2), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Step 4: Date & Time

    private var dateTimeContent: some View {
        VStack(spacing: 20) {
            Text("Quand jouer ?")
                .font(.title3.weight(.semibold))
                .frame(maxWidth: .infinity, alignment: .leading)

            DatePicker("Date", selection: $matchDate, in: Date()..., displayedComponents: .date)
                .padding(.horizontal, Theme.paddingCard)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                        .fill(Theme.cardBackground)
                )
                .onChange(of: matchDate) { _, _ in
                    if let slot = selectedSlot, !availableSlots.contains(slot) {
                        selectedSlot = nil
                    }
                }

            VStack(alignment: .leading, spacing: 10) {
                Text("Heure")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.labelSecondary)

                if availableSlots.isEmpty {
                    Text("Aucun cr\u{00e9}neau disponible pour cette date")
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 16)
                } else {
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 8),
                        GridItem(.flexible(), spacing: 8),
                        GridItem(.flexible(), spacing: 8),
                        GridItem(.flexible(), spacing: 8)
                    ], spacing: 8) {
                        ForEach(availableSlots) { slot in
                            timeSlotChip(slot: slot)
                        }
                    }
                }
            }
        }
    }

    private func timeSlotChip(slot: TimeSlot) -> some View {
        let isSelected = selectedSlot == slot

        return Button {
            withAnimation(.easeOut(duration: 0.2)) {
                selectedSlot = slot
            }
            triggerHaptic()
        } label: {
            Text(slot.label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? .white : Theme.labelPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous)
                        .fill(isSelected ? Theme.tintColor : Theme.cardBackground)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous)
                        .stroke(
                            isSelected ? Theme.tintColor : Theme.borderColor,
                            lineWidth: isSelected ? 1.5 : Theme.borderWidthSubtle
                        )
                )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Navigation

    private func goBack() {
        switch currentStep {
        case .activityType:
            break
        case .opponent:
            currentStep = .activityType
        case .venue:
            currentStep = .opponent
        case .dateTime:
            currentStep = .venue
        }
    }

    // MARK: - Helpers

    private func triggerHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }

    private func loadCurrentUser() async {
        do {
            currentUser = try await getMeUseCase.execute()
        } catch {
            errorMessage = "Impossible de charger votre profil"
        }
    }

    private func loadOrganizations() async {
        do {
            var allOrgs = try await listOrganizationsUseCase.execute()

            // Also fetch opponent's organizations if available
            if let opponentId = opponent?.id {
                let opponentOrgs = try await organizationRepository.listUserOrganizations(userId: opponentId)
                let existingIds = Set(allOrgs.map(\.id))
                for org in opponentOrgs where !existingIds.contains(org.id) {
                    allOrgs.append(org)
                }
            }

            organizations = allOrgs
        } catch {
            // Silent fail - venue step will show empty state
        }
    }

    // MARK: - Create Match

    private func createMatch() async {
        guard let currentUser, let opponent, let matchType, let scheduledAt = combinedDateTime else { return }

        errorMessage = nil
        isLoading = true

        let syncService = MatchSyncService(modelContext: modelContext)

        let participants: [(userId: String, side: MatchSide, isWinner: Bool)] = [
            (currentUser.id, .home, false),
            (opponent.id, .away, false)
        ]

        do {
            let createdMatch = try await syncService.createMatch(
                createdBy: currentUser.id,
                status: .scheduled,
                type: matchType,
                createdAt: Date(),
                scheduledAt: scheduledAt,
                startedAt: nil,
                finishedAt: nil,
                participants: participants,
                sets: []
            )

            if let venue = selectedVenue {
                try await syncService.updateVenue(matchId: createdMatch.id, venueOrganizationId: venue.id)
            }

            onCreated?()
            isPresented = false
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - TimeSlot

private struct TimeSlot: Identifiable, Equatable {
    let hour: Int
    let minute: Int

    var id: Int { hour * 60 + minute }

    var label: String {
        String(format: "%02d:%02d", hour, minute)
    }

    static let allSlots: [TimeSlot] = {
        var slots: [TimeSlot] = []
        for h in 7...22 {
            slots.append(TimeSlot(hour: h, minute: 0))
            if h < 22 {
                slots.append(TimeSlot(hour: h, minute: 30))
            }
        }
        return slots
    }()
}
