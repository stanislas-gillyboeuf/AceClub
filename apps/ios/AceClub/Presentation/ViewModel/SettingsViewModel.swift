import Foundation
import Combine
import UIKit

@MainActor
final class SettingsViewModel: ObservableObject {
    // MARK: - State
    @Published var name: String = ""
    @Published var phoneNumber: String = ""
    @Published var selectedOrganization: Organization?
    @Published var selectedSport: Sport?
    @Published var selectedSkillLevel: SkillLevel?
    @Published var selectedImage: UIImage?
    @Published var isUploadingImage: Bool = false

    @Published var organizations: [Organization] = []
    @Published var searchQuery: String = ""
    @Published var isLoadingOrganizations: Bool = false

    @Published var isLoadingPreferences: Bool = false
    @Published var isSaving: Bool = false
    @Published var errorMessage: String?
    @Published var successMessage: String?

    // Original values to detect changes
    private var originalName: String = ""
    private var originalPhoneNumber: String = ""
    private var originalOrganizationId: String?
    private var originalSport: String?
    private var originalSkillLevel: String?
    private var uploadedImageURL: String?

    // MARK: - UseCases
    private let getUserPreferencesUseCase = GetUserPreferencesUseCase()
    private let updateProfileUseCase = UpdateProfileUseCase()
    private let searchOrganizationsUseCase = SearchOrganizationsUseCase()
    private let uploadUserImageUseCase = UploadUserImageUseCase()

    // MARK: - Tasks
    private var searchTask: Task<Void, Never>?

    // MARK: - Computed
    var hasChanges: Bool {
        name != originalName ||
        phoneNumber != originalPhoneNumber ||
        selectedOrganization?.id != originalOrganizationId ||
        selectedSport?.rawValue != originalSport ||
        selectedSkillLevel?.value != originalSkillLevel ||
        selectedImage != nil
    }

    var canSave: Bool {
        hasChanges && !name.isEmpty && isPhoneNumberValid(phoneNumber)
    }

    private func isPhoneNumberValid(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let digits = trimmed.filter(\.isNumber)
        return !trimmed.isEmpty && digits.count >= 8
    }

    // MARK: - Load Data
    func loadData(user: User) async {
        isLoadingPreferences = true
        errorMessage = nil
        defer { isLoadingPreferences = false }

        // Set user data
        name = user.name
        originalName = user.name
        phoneNumber = user.phoneNumber ?? ""
        originalPhoneNumber = user.phoneNumber ?? ""

        do {
            let preferences = try await getUserPreferencesUseCase.execute()

            // Set preferences
            if let sport = Sport(rawValue: preferences.sport) {
                selectedSport = sport
                originalSport = preferences.sport

                if let level = SkillLevel.levels(for: sport).first(where: { $0.value == preferences.skillLevel }) {
                    selectedSkillLevel = level
                    originalSkillLevel = preferences.skillLevel
                }
            }

            originalOrganizationId = preferences.organizationId

            // Load organizations to find the selected one
            await searchOrganizations(query: nil)

            if let org = organizations.first(where: { $0.id == preferences.organizationId }) {
                selectedOrganization = org
            }
        } catch {
            errorMessage = error.localizedDescription
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

    // MARK: - Sport Selection
    func selectSport(_ sport: Sport) {
        selectedSport = sport
        // Reset skill level when sport changes
        selectedSkillLevel = SkillLevel.levels(for: sport).first
    }

    // MARK: - Save
    func save() async -> User? {
        guard canSave else { return nil }

        isSaving = true
        errorMessage = nil
        successMessage = nil
        defer { isSaving = false }

        do {
            // 1. Upload image if selected
            if let image = selectedImage {
                isUploadingImage = true
                do {
                    uploadedImageURL = try await uploadUserImageUseCase.execute(image: image)
                } catch {
                    isUploadingImage = false
                    errorMessage = "Erreur lors de l'upload de l'image"
                    return nil
                }
                isUploadingImage = false
            }

            // 2. Update profile with all changes
            let updatedUser = try await updateProfileUseCase.execute(
                name: name != originalName ? name : nil,
                image: uploadedImageURL,
                phoneNumber: phoneNumber != originalPhoneNumber ? phoneNumber : nil,
                organizationId: selectedOrganization?.id != originalOrganizationId ? selectedOrganization?.id : nil,
                sport: selectedSport?.rawValue != originalSport ? selectedSport?.rawValue : nil,
                skillLevel: selectedSkillLevel?.value != originalSkillLevel ? selectedSkillLevel?.value : nil
            )

            // Update original values
            originalName = name
            originalPhoneNumber = phoneNumber
            originalOrganizationId = selectedOrganization?.id
            originalSport = selectedSport?.rawValue
            originalSkillLevel = selectedSkillLevel?.value
            selectedImage = nil
            uploadedImageURL = nil

            return updatedUser
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }
}
