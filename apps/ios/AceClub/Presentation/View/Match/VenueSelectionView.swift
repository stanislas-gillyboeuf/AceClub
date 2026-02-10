//
//  VenueSelectionView.swift
//  AceClub
//

import SwiftUI

struct VenueSelectionView: View {
    let match: MatchModel
    let onSelectVenue: (String) -> Void
    let onTapVenue: () -> Void

    var body: some View {
        if match.hasDifferentOrganizations {
            HStack(spacing: 0) {
                clubButton(
                    name: match.homeOrganizationName ?? "",
                    logo: match.homeOrganizationLogo,
                    isSelected: match.venueOrganizationId == match.homeOrganizationId,
                    organizationId: match.homeOrganizationId
                )

                Text("VS")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Theme.labelTertiary)
                    .padding(.horizontal, 4)

                clubButton(
                    name: match.awayOrganizationName ?? "",
                    logo: match.awayOrganizationLogo,
                    isSelected: match.venueOrganizationId == match.awayOrganizationId,
                    organizationId: match.awayOrganizationId
                )
            }
        } else if match.hasVenue {
            Button {
                onTapVenue()
            } label: {
                HStack(spacing: 12) {
                    if let logo = match.venueOrganizationLogo, let url = URL(string: logo) {
                        AsyncImage(url: url) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            Image(systemName: "building.2")
                                .foregroundStyle(Theme.tintColor)
                        }
                        .frame(width: 32, height: 32)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    } else {
                        Image(systemName: "building.2")
                            .font(.title3)
                            .foregroundStyle(Theme.tintColor)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(match.venueOrganizationName ?? "")
                            .font(.subheadline.weight(.medium))
                        if let address = match.venueOrganizationAddress {
                            Text(address)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                        }
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)
        }
    }

    private func clubButton(name: String, logo: String?, isSelected: Bool, organizationId: String?) -> some View {
        Button {
            if isSelected {
                onTapVenue()
            } else if let orgId = organizationId {
                onSelectVenue(orgId)
            }
        } label: {
            VStack(spacing: 8) {
                if let logo, let url = URL(string: logo) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        clubPlaceholder
                    }
                    .frame(width: 40, height: 40)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    clubPlaceholder
                }

                Text(name)
                    .font(.caption2.weight(.medium))
                    .lineLimit(1)
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .padding(.horizontal, 8)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .fill(isSelected ? Theme.tintColor.opacity(0.1) : Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(isSelected ? Theme.tintColor : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    private var clubPlaceholder: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(Theme.tintColor.opacity(0.15))
            .frame(width: 40, height: 40)
            .overlay {
                Image(systemName: "building.2")
                    .font(.subheadline)
                    .foregroundStyle(Theme.tintColor)
            }
    }
}
