import Foundation
import Combine
import UIKit

@MainActor
final class OnboardingViewModel: ObservableObject {
    enum OnboardingStep: Int, CaseIterable {
        case welcome = 0
        case clubSelection = 1
        case sportSelection = 2
        case skillLevelSelection = 3
        case profilePhoto = 4
        case phoneNumber = 5
    }

    // MARK: - State
    @Published var currentStep: OnboardingStep = .welcome

    @Published var selectedOrganization: Organization?
    @Published var selectedSport: Sport?
    @Published var selectedSkillLevel: SkillLevel?
    @Published var selectedProfileImage: UIImage?
    @Published var isUploadingProfileImage: Bool = false
    @Published var uploadedProfileImageURL: String?
    @Published var phoneNumber: String = ""

    @Published var organizations: [Organization] = []
    @Published var searchQuery: String = ""
    @Published var isLoadingOrganizations: Bool = false

    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?

    // MARK: - PIN State
    @Published var pin: String = ""
    @Published var showPinSheet: Bool = false
    @Published var pinError: String?
    @Published var isPinVerified: Bool = false
    @Published var isVerifyingPin: Bool = false

    // MARK: - Club Request State
    @Published var showRequestClubSheet: Bool = false
    @Published var clubRequestName: String = ""
    @Published var clubRequestCity: String = ""
    @Published var isSubmittingClubRequest: Bool = false
    @Published var clubRequestSuccess: Bool = false
    @Published var clubRequestMessage: String?

    // MARK: - UseCases
    private let searchOrganizationsUseCase = SearchOrganizationsUseCase()
    private let completeOnboardingUseCase = CompleteOnboardingUseCase()
    private let uploadUserImageUseCase = UploadUserImageUseCase()
    private let requestClubUseCase = RequestClubUseCase()
    private let verifyPinUseCase = VerifyPinUseCase()

    // MARK: - Tasks
    private var searchTask: Task<Void, Never>?

    // MARK: - Computed
    var isLastStep: Bool { currentStep == .phoneNumber }

    var canGoBack: Bool { currentStep.rawValue > OnboardingStep.welcome.rawValue }

    var canGoNext: Bool {
        switch currentStep {
        case .welcome:
            return true
        case .clubSelection:
            guard let org = selectedOrganization else { return false }
            if org.pinEnabled { return isPinVerified }
            return true
        case .sportSelection:
            return selectedSport != nil
        case .skillLevelSelection:
            return selectedSkillLevel != nil
        case .profilePhoto:
            return selectedProfileImage != nil
        case .phoneNumber:
            return isPhoneNumberValid(phoneNumber)
        }
    }

    private func isPhoneNumberValid(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let digits = trimmed.filter(\.isNumber)
        return !trimmed.isEmpty && digits.count >= 8
    }

    // MARK: - Navigation
    func goNext() {
        guard canGoNext else { return }
        guard let next = OnboardingStep(rawValue: currentStep.rawValue + 1) else { return }
        triggerTransitionHaptic()
        currentStep = next
        errorMessage = nil
    }

    func goBack() {
        guard canGoBack else { return }
        guard let prev = OnboardingStep(rawValue: currentStep.rawValue - 1) else { return }
        triggerTransitionHaptic()
        currentStep = prev
        errorMessage = nil
    }

    private func triggerTransitionHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .soft)
        generator.impactOccurred()
    }

    // MARK: - Organization Selection

    func selectOrganization(_ org: Organization) {
        if org.pinEnabled {
            selectedOrganization = org
            pin = ""
            pinError = nil
            isPinVerified = false
            showPinSheet = true
        } else {
            selectedOrganization = org
            pin = ""
            isPinVerified = false
        }
    }

    func validatePin(_ pinValue: String) async {
        guard let orgId = selectedOrganization?.id else { return }

        isVerifyingPin = true
        pinError = nil
        defer { isVerifyingPin = false }

        do {
            let isValid = try await verifyPinUseCase.execute(organizationId: orgId, pin: pinValue)
            if isValid {
                pin = pinValue
                isPinVerified = true
                showPinSheet = false
            } else {
                pinError = "Code PIN incorrect"
                isPinVerified = false
            }
        } catch {
            pinError = "Erreur de vérification"
            isPinVerified = false
        }
    }

    // MARK: - Organizations Search (debounced)
    func onSearchQueryChanged() {
        searchTask?.cancel()

        let query = searchQuery
        searchTask = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(nanoseconds: 350_000_000) // 350ms
            guard !Task.isCancelled else { return }
            await self.searchOrganizations(query: query)
        }
    }

    func searchOrganizations(query: String? = nil, limit: Int = 20, offset: Int = 0) async {
        isLoadingOrganizations = true
        errorMessage = nil
        defer { isLoadingOrganizations = false }

        do {
            let result = try await searchOrganizationsUseCase.execute(query: query, limit: limit, offset: offset)
            organizations = result.organizations
        } catch is CancellationError {
            // ignore
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Club Request
    var canSubmitClubRequest: Bool {
        !clubRequestName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !clubRequestCity.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func submitClubRequest() async {
        guard canSubmitClubRequest else { return }

        isSubmittingClubRequest = true
        clubRequestMessage = nil
        defer { isSubmittingClubRequest = false }

        do {
            let result = try await requestClubUseCase.execute(
                name: clubRequestName.trimmingCharacters(in: .whitespacesAndNewlines),
                city: clubRequestCity.trimmingCharacters(in: .whitespacesAndNewlines)
            )
            clubRequestSuccess = result.success
            clubRequestMessage = result.message
        } catch {
            clubRequestSuccess = false
            clubRequestMessage = error.localizedDescription
        }
    }

    func resetClubRequest() {
        clubRequestName = ""
        clubRequestCity = ""
        clubRequestSuccess = false
        clubRequestMessage = nil
    }

    // MARK: - Submit
    func submit() async throws -> User {
        guard let selectedOrganization else {
            throw NSError(domain: "Onboarding", code: 1, userInfo: [NSLocalizedDescriptionKey: "Veuillez sélectionner un club."])
        }
        guard let selectedSport else {
            throw NSError(domain: "Onboarding", code: 2, userInfo: [NSLocalizedDescriptionKey: "Veuillez sélectionner un sport."])
        }
        guard let selectedSkillLevel else {
            throw NSError(domain: "Onboarding", code: 3, userInfo: [NSLocalizedDescriptionKey: "Veuillez sélectionner un niveau."])
        }
        guard selectedProfileImage != nil else {
            throw NSError(domain: "Onboarding", code: 4, userInfo: [NSLocalizedDescriptionKey: "Veuillez ajouter une photo de profil."])
        }
        guard isPhoneNumberValid(phoneNumber) else {
            throw NSError(domain: "Onboarding", code: 5, userInfo: [NSLocalizedDescriptionKey: "Veuillez renseigner un numéro de téléphone valide."])
        }

        isSubmitting = true
        errorMessage = nil
        defer { isSubmitting = false }

        // Upload profile photo if not already uploaded
        if let image = selectedProfileImage, uploadedProfileImageURL == nil {
            isUploadingProfileImage = true
            defer { isUploadingProfileImage = false }
            uploadedProfileImageURL = try await uploadUserImageUseCase.execute(image: image)
        }

        let updatedUser = try await completeOnboardingUseCase.execute(
            organizationId: selectedOrganization.id,
            sport: selectedSport.rawValue,
            skillLevel: selectedSkillLevel.value,
            phoneNumber: phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines),
            imageUrl: uploadedProfileImageURL,
            pin: selectedOrganization.pinEnabled ? pin : nil
        )
        return updatedUser
    }
}

