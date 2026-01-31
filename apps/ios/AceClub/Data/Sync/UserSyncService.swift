//
//  UserSyncService.swift
//  AceClub
//
//  Sync service for User - orchestrates API calls and SwiftData updates
//

import SwiftData
import Foundation

@MainActor
final class UserSyncService {
    private let dataSource = UserAPIDataSource()
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Date Parsing

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private func parseDate(_ dateString: String?) -> Date? {
        guard let dateString else { return nil }

        if let date = Self.isoDateFormatter.date(from: dateString) {
            return date
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }

    // MARK: - Sync from API to SwiftData

    /// Sync the current user from API to SwiftData
    func syncCurrentUser() async throws -> UserModel {
        let dto = try await dataSource.getMe()
        let model = upsertUser(from: dto, isCurrentUser: true)
        try modelContext.save()
        return model
    }

    /// Sync user preferences
    func syncPreferences() async throws -> UserPreferencesModel? {
        let dto = try await dataSource.getPreferences()
        let model = upsertPreferences(from: dto)
        try modelContext.save()
        return model
    }

    // MARK: - Mutations (API + SwiftData)

    /// Complete onboarding
    func completeOnboarding(
        organizationId: String,
        sport: String,
        skillLevel: String,
        phoneNumber: String
    ) async throws -> UserModel {
        let dto = try await dataSource.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber
        )

        let model = upsertUser(from: dto, isCurrentUser: true)
        try modelContext.save()
        return model
    }

    /// Update profile
    func updateProfile(
        name: String?,
        phoneNumber: String?,
        organizationId: String?,
        sport: String?,
        skillLevel: String?,
        image: String?
    ) async throws -> UserModel {
        let dto = try await dataSource.updateProfile(
            name: name,
            image: image,
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )

        let model = upsertUser(from: dto, isCurrentUser: true)
        try modelContext.save()
        return model
    }

    /// Clear current user (on logout)
    func clearCurrentUser() throws {
        let predicate = #Predicate<UserModel> { $0.isCurrentUser == true }
        let descriptor = FetchDescriptor(predicate: predicate)

        if let users = try? modelContext.fetch(descriptor) {
            for user in users {
                modelContext.delete(user)
            }
        }

        try modelContext.save()
    }

    // MARK: - Private Helpers - Fetch

    private func fetchUser(id: String) -> UserModel? {
        let predicate = #Predicate<UserModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchCurrentUser() -> UserModel? {
        let predicate = #Predicate<UserModel> { $0.isCurrentUser == true }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchPreferences(id: String) -> UserPreferencesModel? {
        let predicate = #Predicate<UserPreferencesModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    // MARK: - Private Helpers - Upsert

    @discardableResult
    private func upsertUser(from dto: UserDTO, isCurrentUser: Bool = false) -> UserModel {
        if let existing = fetchUser(id: dto.id) {
            existing.name = dto.name
            existing.email = dto.email
            existing.emailVerified = dto.emailVerified ?? false
            existing.image = dto.image
            existing.phoneNumber = dto.phoneNumber
            existing.role = dto.role
            existing.banned = dto.banned ?? false
            existing.banReason = dto.banReason
            existing.banExpires = parseDate(dto.banExpires)
            existing.onboardingCompleted = dto.onboardingCompleted ?? false
            existing.createdAt = parseDate(dto.createdAt)
            existing.updatedAt = parseDate(dto.updatedAt)
            existing.lastSyncedAt = Date()

            if isCurrentUser {
                // Clear previous current user flag
                if let previousCurrent = fetchCurrentUser(), previousCurrent.id != dto.id {
                    previousCurrent.isCurrentUser = false
                }
                existing.isCurrentUser = true
            }

            return existing
        } else {
            let model = UserModel(
                id: dto.id,
                name: dto.name,
                email: dto.email,
                emailVerified: dto.emailVerified ?? false,
                image: dto.image,
                phoneNumber: dto.phoneNumber,
                role: dto.role,
                banned: dto.banned ?? false,
                banReason: dto.banReason,
                banExpires: parseDate(dto.banExpires),
                onboardingCompleted: dto.onboardingCompleted ?? false,
                createdAt: parseDate(dto.createdAt),
                updatedAt: parseDate(dto.updatedAt),
                isCurrentUser: isCurrentUser
            )
            modelContext.insert(model)
            return model
        }
    }

    @discardableResult
    private func upsertPreferences(from dto: UserPreferencesResponseDTO) -> UserPreferencesModel {
        if let existing = fetchPreferences(id: dto.id) {
            existing.userId = dto.userId
            existing.organizationId = dto.organizationId
            existing.sport = dto.sport
            existing.skillLevel = dto.skillLevel
            existing.updatedAt = parseDate(dto.updatedAt) ?? Date()
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = UserPreferencesModel(
                id: dto.id,
                userId: dto.userId,
                organizationId: dto.organizationId,
                sport: dto.sport,
                skillLevel: dto.skillLevel,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                updatedAt: parseDate(dto.updatedAt) ?? Date()
            )
            modelContext.insert(model)
            return model
        }
    }
}
