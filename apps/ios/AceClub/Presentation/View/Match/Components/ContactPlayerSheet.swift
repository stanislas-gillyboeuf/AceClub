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
            ScrollView {
                VStack(spacing: 0) {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(Theme.tintColor)

                        Text("Match confirme")
                            .font(.title2.weight(.bold))
                            .foregroundStyle(Theme.labelPrimary)
                    }
                    .padding(.top, 32)
                    .padding(.bottom, 24)

                    VStack(spacing: 0) {
                        VStack(spacing: 12) {
                            avatarView
                                .frame(width: 72, height: 72)

                            VStack(spacing: 4) {
                                Text(player.name)
                                    .font(.title3.weight(.semibold))
                                    .foregroundStyle(Theme.labelPrimary)

                                if let phone = formattedPhoneNumber {
                                    Text(phone)
                                        .font(.subheadline)
                                        .foregroundStyle(Theme.labelSecondary)
                                }
                            }
                        }
                        .padding(.vertical, 20)
                        .frame(maxWidth: .infinity)

                        if formattedPhoneNumber != nil {
                            Divider()

                            VStack(spacing: 16) {
                                Text("Contacte-le pour organiser le match")
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.labelSecondary)

                                HStack(spacing: 12) {
                                    if let url = whatsappURL {
                                        contactButton(
                                            url: url,
                                            icon: "message.fill",
                                            label: "WhatsApp",
                                            style: .primary
                                        )
                                    }

                                    if let url = smsURL {
                                        contactButton(
                                            url: url,
                                            icon: "bubble.left.fill",
                                            label: "SMS",
                                            style: .primary
                                        )
                                    }

                                    if let url = phoneURL {
                                        contactButton(
                                            url: url,
                                            icon: "phone.fill",
                                            label: "Appeler",
                                            style: .secondary
                                        )
                                    }
                                }
                            }
                            .padding(.vertical, 20)
                            .padding(.horizontal, Theme.paddingCard)
                        }
                    }
                    .cardStyle(cornerRadius: Theme.cornerRadiusLarge, withBorder: true)
                    .padding(.horizontal, Theme.paddingHorizontal)

                    if formattedPhoneNumber == nil {
                        VStack(spacing: 8) {
                            Image(systemName: "phone.slash")
                                .font(.title2)
                                .foregroundStyle(Theme.labelTertiary)

                            Text("Numero de telephone non disponible")
                                .font(.subheadline)
                                .foregroundStyle(Theme.labelSecondary)
                        }
                        .padding(.top, 24)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.labelTertiary)
                    }
                }
            }
        }
        .presentationBackground(.regularMaterial)
    }

    // MARK: - Avatar

    private var avatarView: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            if let imageURL = player.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        initialsText
                    }
                }
            } else {
                initialsText
            }
        }
        .clipShape(Circle())
        .overlay {
            Circle()
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private var initialsText: some View {
        Text(player.initials)
            .font(.system(size: 24, weight: .semibold, design: .rounded))
            .foregroundStyle(Theme.labelSecondary)
    }

    // MARK: - Contact Button

    private enum ButtonStyle {
        case primary
        case secondary
    }

    @ViewBuilder
    private func contactButton(url: URL, icon: String, label: String, style: ButtonStyle) -> some View {
        Link(destination: url) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.title3)
                Text(label)
                    .font(.caption.weight(.medium))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .foregroundStyle(style == .primary ? .white : Theme.tintColor)
            .background(style == .primary ? Theme.tintColor : Theme.tintColor.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
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
