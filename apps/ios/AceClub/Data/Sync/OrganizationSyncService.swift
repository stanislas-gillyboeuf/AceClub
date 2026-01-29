//
//  OrganizationSyncService.swift
//  AceClub
//
//  Sync service for Organization - orchestrates API calls and SwiftData updates
//

import SwiftData
import Foundation

@MainActor
final class OrganizationSyncService {
    private let dataSource = OrganizationAPIDataSource()
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

    /// Sync user's organizations
    func syncUserOrganizations() async throws {
        let dtos = try await dataSource.listOrganizationsUser()

        for dto in dtos {
            upsertOrganization(from: dto)
        }
        try modelContext.save()
    }

    /// Sync full organization with members
    func syncFullOrganization(slug: String) async throws -> OrganizationModel? {
        let dto = try await dataSource.getFullOrganization(slug: slug)
        let model = upsertFullOrganization(from: dto)
        try modelContext.save()
        return model
    }

    /// Sync members for an organization
    func syncMembers(organizationId: String? = nil) async throws {
        let response = try await dataSource.listMembers(organizationId: organizationId)

        if let members = response.members {
            for memberDTO in members {
                upsertMember(from: memberDTO)
            }
        }
        try modelContext.save()
    }

    // MARK: - Mutations (API + SwiftData)

    /// Set active organization
    func setActiveOrganization(slug: String) async throws {
        try await dataSource.setActiveOrganization(slug: slug)

        // Update flags in SwiftData
        let descriptor = FetchDescriptor<OrganizationModel>()
        if let orgs = try? modelContext.fetch(descriptor) {
            for org in orgs {
                org.isActive = (org.slug == slug)
            }
        }
        try modelContext.save()
    }

    /// Create organization
    func createOrganization(
        name: String,
        slug: String,
        logo: String? = nil,
        metadata: String? = nil
    ) async throws -> OrganizationModel {
        let dto = try await dataSource.createOrganization(
            name: name,
            slug: slug,
            logo: logo,
            metadata: metadata
        )

        let model = upsertOrganization(from: dto)
        try modelContext.save()
        return model
    }

    /// Add member to organization
    func addMember(
        userId: String,
        role: String,
        organizationId: String? = nil
    ) async throws -> MemberModel {
        let dto = try await dataSource.addMember(
            userId: userId,
            role: role,
            organizationId: organizationId
        )

        let model = upsertMember(from: dto)
        try modelContext.save()
        return model
    }

    /// Remove member from organization
    func removeMember(
        memberIdOrEmail: String,
        organizationId: String? = nil
    ) async throws {
        try await dataSource.removeMember(
            memberIdOrEmail: memberIdOrEmail,
            organizationId: organizationId
        )

        // Find and delete member from SwiftData
        // Since memberIdOrEmail could be either, we try both
        let idPredicate = #Predicate<MemberModel> { $0.id == memberIdOrEmail }
        let idDescriptor = FetchDescriptor(predicate: idPredicate)
        if let member = try? modelContext.fetch(idDescriptor).first {
            modelContext.delete(member)
        }

        try modelContext.save()
    }

    /// Update member role
    func updateMemberRole(
        memberId: String,
        role: String,
        organizationId: String? = nil
    ) async throws -> MemberModel {
        let dto = try await dataSource.updateMemberRole(
            memberId: memberId,
            role: role,
            organizationId: organizationId
        )

        let model = upsertMember(from: dto)
        try modelContext.save()
        return model
    }

    /// Leave organization
    func leaveOrganization(organizationId: String) async throws {
        try await dataSource.leaveOrganization(organizationId: organizationId)

        // Remove organization from SwiftData
        let predicate = #Predicate<OrganizationModel> { $0.id == organizationId }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let org = try? modelContext.fetch(descriptor).first {
            modelContext.delete(org)
        }

        try modelContext.save()
    }

    // MARK: - Private Helpers - Fetch

    private func fetchOrganization(id: String) -> OrganizationModel? {
        let predicate = #Predicate<OrganizationModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchOrganizationBySlug(slug: String) -> OrganizationModel? {
        let predicate = #Predicate<OrganizationModel> { $0.slug == slug }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchMember(id: String) -> MemberModel? {
        let predicate = #Predicate<MemberModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    // MARK: - Private Helpers - Upsert

    @discardableResult
    private func upsertOrganization(from dto: OrganizationDTO) -> OrganizationModel {
        if let existing = fetchOrganization(id: dto.id) {
            existing.name = dto.name
            existing.slug = dto.slug
            existing.logo = dto.logo
            existing.metadata = dto.metadata
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = OrganizationModel(
                id: dto.id,
                name: dto.name,
                slug: dto.slug,
                logo: dto.logo,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                metadata: dto.metadata
            )
            modelContext.insert(model)
            return model
        }
    }

    @discardableResult
    private func upsertFullOrganization(from dto: FullOrganizationDTO) -> OrganizationModel {
        let model: OrganizationModel

        if let existing = fetchOrganization(id: dto.id) {
            existing.name = dto.name
            existing.slug = dto.slug
            existing.logo = dto.logo
            existing.metadata = dto.metadata
            existing.lastSyncedAt = Date()
            model = existing
        } else {
            model = OrganizationModel(
                id: dto.id,
                name: dto.name,
                slug: dto.slug,
                logo: dto.logo,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                metadata: dto.metadata
            )
            modelContext.insert(model)
        }

        // Upsert members
        for memberDTO in dto.members {
            let member = upsertMember(from: memberDTO)
            member.organization = model
        }

        return model
    }

    @discardableResult
    private func upsertMember(from dto: MemberDTO) -> MemberModel {
        if let existing = fetchMember(id: dto.id) {
            existing.role = dto.role
            existing.userName = dto.user?.name
            existing.userEmail = dto.user?.email
            existing.userImage = dto.user?.image
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = MemberModel(
                id: dto.id,
                organizationId: dto.organizationId,
                userId: dto.userId,
                role: dto.role,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                userName: dto.user?.name,
                userEmail: dto.user?.email,
                userImage: dto.user?.image
            )
            modelContext.insert(model)
            return model
        }
    }
}
