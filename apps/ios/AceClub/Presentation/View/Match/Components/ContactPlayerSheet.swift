//
//  ContactPlayerSheet.swift
//  AceClub
//

import SwiftUI

struct ContactPlayerSheet: View {
    @Environment(\.dismiss) private var dismiss
    let player: UserContact

    private var formattedPhoneNumber: String? {
        guard let phone = player.phoneNumber, !phone.isEmpty else { return nil }
        return phone
    }

    private var whatsappURL: URL? {
        guard let phone = formattedPhoneNumber else { return nil }
        let cleanPhone = phone.replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "-", with: "")
            .replacingOccurrences(of: "(", with: "")
            .replacingOccurrences(of: ")", with: "")
        return URL(string: "https://wa.me/\(cleanPhone)")
    }

    private var smsURL: URL? {
        guard let phone = formattedPhoneNumber else { return nil }
        return URL(string: "sms:\(phone)")
    }

    private var phoneURL: URL? {
        guard let phone = formattedPhoneNumber else { return nil }
        return URL(string: "tel:\(phone)")
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header avec checkmark
                VStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color.green.opacity(0.15))
                            .frame(width: 80, height: 80)

                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(.green)
                    }

                    Text("Match accepte !")
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .padding(.top, 8)

                // Player info card
                VStack(spacing: 16) {
                    // Avatar
                    Group {
                        if let imageURL = player.imageURL {
                            AsyncImage(url: imageURL) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                default:
                                    initialsView
                                }
                            }
                        } else {
                            initialsView
                        }
                    }
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())

                    // Name
                    Text(player.name)
                        .font(.title3)
                        .fontWeight(.semibold)

                    // Phone number
                    if let phone = formattedPhoneNumber {
                        Text(phone)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 20)
                .padding(.horizontal, 24)
                .frame(maxWidth: .infinity)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))

                // Contact buttons
                if formattedPhoneNumber != nil {
                    VStack(spacing: 12) {
                        Text("Contacte-le pour organiser le match")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)

                        HStack(spacing: 16) {
                            // WhatsApp button
                            if let url = whatsappURL {
                                Link(destination: url) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "message.fill")
                                        Text("WhatsApp")
                                    }
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, Theme.paddingButtonVertical)
                                    .background(Color.green)
                                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                                }
                            }

                            // SMS button
                            if let url = smsURL {
                                Link(destination: url) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "bubble.left.fill")
                                        Text("SMS")
                                    }
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, Theme.paddingButtonVertical)
                                    .background(Theme.tintColor)
                                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                                }
                            }
                        }

                        // Call button (secondary)
                        if let url = phoneURL {
                            Link(destination: url) {
                                HStack(spacing: 8) {
                                    Image(systemName: "phone.fill")
                                    Text("Appeler")
                                }
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundStyle(Theme.tintColor)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Theme.paddingButtonVertical)
                                .background(Theme.tintColor.opacity(0.12))
                                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                            }
                        }
                    }
                } else {
                    // No phone number
                    VStack(spacing: 8) {
                        Image(systemName: "phone.slash")
                            .font(.title)
                            .foregroundStyle(.secondary)

                        Text("Numero de telephone non disponible")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 20)
                }

                Spacer()
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .background(Theme.primaryBackground)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }

    private var initialsView: some View {
        ZStack {
            Circle()
                .fill(Theme.tintColor.opacity(0.15))

            Text(player.initials)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundStyle(Theme.tintColor)
        }
    }
}

#Preview {
    ContactPlayerSheet(
        player: UserContact(
            id: "1",
            name: "Jean Dupont",
            image: nil,
            phoneNumber: "+33612345678"
        )
    )
}
