//
//  MatchVenueCard.swift
//  AceClub
//
//  Match venue card - venue display, selection, and mini map
//

import SwiftUI
import MapKit

struct MatchVenueCard: View {
    let match: MatchModel
    let isParticipant: Bool
    let isUpdatingVenue: Bool
    var onTapVenue: () -> Void
    var onSelectVenue: (String) -> Void

    private var venueCoordinate: CLLocationCoordinate2D? {
        guard let lat = match.venueOrganizationLatitude,
              let lon = match.venueOrganizationLongitude else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }

    private var canInteract: Bool {
        !match.isFinished
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Section header
            Text("LIEU")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)
                .padding(.horizontal, Theme.paddingCard)

            // Club selection (scheduled + different orgs)
            if match.isScheduled && match.hasDifferentOrganizations {
                venueSelector
                    .padding(.horizontal, Theme.paddingCard)
            }

            // Venue details (when venue exists)
            if match.hasVenue {
                // Venue row (when NOT in selection mode)
                if !(match.isScheduled && match.hasDifferentOrganizations) {
                    venueRow
                        .padding(.horizontal, Theme.paddingCard)
                }

                // Mini map (if coordinates available)
                if let coordinate = venueCoordinate {
                    miniMapSection(coordinate: coordinate)
                        .padding(.horizontal, Theme.paddingCard)
                }
            } else if !(match.isScheduled && match.hasDifferentOrganizations) {
                HStack(spacing: 8) {
                    Image(systemName: "mappin.slash")
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)
                    Text("Lieu non d\u{00e9}fini")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelTertiary)
                }
                .padding(.horizontal, Theme.paddingCard)
            }
        }
        .padding(.vertical, Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }

    // MARK: - Venue Selector (compact chips)

    private var venueSelector: some View {
        HStack(spacing: 8) {
            clubChip(
                name: match.homeOrganizationName ?? "",
                logo: match.homeOrganizationLogo,
                isSelected: match.venueOrganizationId == match.homeOrganizationId,
                organizationId: match.homeOrganizationId
            )

            clubChip(
                name: match.awayOrganizationName ?? "",
                logo: match.awayOrganizationLogo,
                isSelected: match.venueOrganizationId == match.awayOrganizationId,
                organizationId: match.awayOrganizationId
            )
        }
    }

    private func clubChip(name: String, logo: String?, isSelected: Bool, organizationId: String?) -> some View {
        Button {
            if isSelected {
                onTapVenue()
            } else if let orgId = organizationId {
                onSelectVenue(orgId)
            }
        } label: {
            HStack(spacing: 8) {
                if let logo, let url = URL(string: logo) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        clubLogoPlaceholder
                    }
                    .frame(width: 28, height: 28)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                } else {
                    clubLogoPlaceholder
                }

                Text(name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                    .lineLimit(1)

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Theme.tintColor)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .fill(isSelected ? Theme.tintColor.opacity(0.08) : Theme.inputBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    .strokeBorder(
                        isSelected ? Theme.tintColor : Color.clear,
                        lineWidth: isSelected ? 1.5 : 0
                    )
            )
        }
        .buttonStyle(.plain)
        .disabled(isUpdatingVenue || !isParticipant)
    }

    private var clubLogoPlaceholder: some View {
        RoundedRectangle(cornerRadius: 6)
            .fill(Theme.tintColor.opacity(0.1))
            .frame(width: 28, height: 28)
            .overlay {
                Image(systemName: "building.2")
                    .font(.caption2)
                    .foregroundStyle(Theme.tintColor)
            }
    }

    // MARK: - Venue Row

    @ViewBuilder
    private var venueRow: some View {
        if canInteract {
            Button {
                onTapVenue()
            } label: {
                venueRowContent
            }
            .buttonStyle(.plain)
        } else {
            venueRowContent
        }
    }

    private var venueRowContent: some View {
        HStack(spacing: 8) {
            Image(systemName: "mappin.circle.fill")
                .font(.caption)
                .foregroundStyle(Theme.tintColor)
                .frame(width: 16)

            VStack(alignment: .leading, spacing: 1) {
                Text(match.venueOrganizationName ?? "Lieu du match")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.labelPrimary)

                if let address = match.venueOrganizationAddress {
                    Text(address)
                        .font(.caption2)
                        .foregroundStyle(Theme.labelTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if canInteract {
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(Theme.labelTertiary)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Mini Map

    private func miniMapSection(coordinate: CLLocationCoordinate2D) -> some View {
        Group {
            if canInteract {
                Button {
                    onTapVenue()
                } label: {
                    mapContent(coordinate: coordinate)
                }
                .buttonStyle(.plain)
            } else {
                mapContent(coordinate: coordinate)
            }
        }
    }

    private func mapContent(coordinate: CLLocationCoordinate2D) -> some View {
        Map {
            Marker(match.venueOrganizationName ?? "Lieu", coordinate: coordinate)
        }
        .frame(height: 140)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
        .allowsHitTesting(false)
    }
}
