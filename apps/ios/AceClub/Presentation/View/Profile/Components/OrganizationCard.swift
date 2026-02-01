import SwiftUI

struct OrganizationCard: View {
    enum Style {
        case card
        case listRow
    }

    let organization: Organization
    let memberRole: MemberRole?
    let onTap: (() -> Void)?
    let style: Style
    let showsChevron: Bool

    init(
        organization: Organization,
        memberRole: MemberRole? = nil,
        style: Style = .card,
        showsChevron: Bool? = nil,
        onTap: (() -> Void)? = nil
    ) {
        self.organization = organization
        self.memberRole = memberRole
        self.style = style
        self.showsChevron = showsChevron ?? (style == .card)
        self.onTap = onTap
    }

    var body: some View {
        cardContent
    }

    @ViewBuilder
    private var cardContent: some View {
        if let onTap = onTap {
            Button(action: onTap) {
                content
            }
            .buttonStyle(PlainButtonStyle())
        } else {
            content
        }
    }

    private var content: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(organization.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)

                if let role = memberRole {
                    Text(role.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            if showsChevron {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, style == .card ? 8 : 4)
        .padding(.horizontal, style == .card ? Theme.paddingCard : 0)
        .background(style == .card ? Theme.cardBackground : Color.clear)
        .clipShape(style == .card ? AnyShape(RoundedRectangle(cornerRadius: 12, style: .continuous)) : AnyShape(Rectangle()))
        .padding(.horizontal, style == .card ? 20 : 0)
    }
}

private struct AnyShape: Shape {
    private let _path: (CGRect) -> Path
    init<S: Shape>(_ shape: S) { _path = { rect in shape.path(in: rect) } }
    func path(in rect: CGRect) -> Path { _path(rect) }
}
