import Foundation

class OrganizationMapper {
    static func map(organizationDTO: OrganizationDTO) -> Organization {
        return Organization(
            id: organizationDTO.id,
            name: organizationDTO.name,
            slug: organizationDTO.slug,
            logo: organizationDTO.logo,
            createdAt: organizationDTO.createdAt ?? "",
            metadata: organizationDTO.metadata
        )
    }

    static func map(listOrganizationsDTO: ListOrganizationsResponseDTO) -> [Organization] {
        guard let organizations = listOrganizationsDTO.organizations else {
            return []
        }
        return organizations.map { map(organizationDTO: $0) }
    }

    static func map(organizationDTOs: [OrganizationDTO]) -> [Organization] {
        return organizationDTOs.map { map(organizationDTO: $0) }
    }
}
