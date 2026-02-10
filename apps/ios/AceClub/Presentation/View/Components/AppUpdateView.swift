import SwiftUI

struct AppUpdateView: View {
    var appInfo: AppUpdateInfo
    @Binding var forcedUpdate: Bool
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(spacing: 15) {
            Image("AppUpdateImage")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .overlay {
                    GeometryReader { geometry in
                        let size = geometry.size
                        let actualImageSize = CGSize(width: 399, height: 727)
                        let ratio = min(
                            size.width / actualImageSize.width,
                            size.height / actualImageSize.height
                        )

                        let logoSize = CGSize(width: 100 * ratio, height: 100 * ratio)
                        let logoPlacement = CGSize(width: 173 * ratio, height: 365 * ratio)

                        Image("AceClubLogo")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: logoSize.width, height: logoSize.height)
                            .clipShape(RoundedRectangle(cornerRadius: 30 * ratio))
                            .offset(logoPlacement)
                    }
                }

            VStack(spacing: 8) {
                Text("Mise à jour disponible")
                    .font(.title.bold())

                Text("Une mise à jour est disponible de la version **\(appInfo.currentVersion)** à la version **\(appInfo.availableVersion)** !")
                    .font(.callout)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 15)
            .padding(.bottom, 5)

            VStack(spacing: 8) {
                if let appURL = URL(string: appInfo.appURL) {
                    Button {
                        openURL(appURL)
                        if !forcedUpdate {
                            dismiss()
                        }
                    } label: {
                        Text("Mettre à jour")
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 4)
                    }
                    .buttonStyle(.borderedProminent)
                    .buttonBorderShape(.capsule)
                }

                if !forcedUpdate {
                    Button {
                        dismiss()
                    } label: {
                        Text("Plus tard")
                            .fontWeight(.medium)
                            .padding(.vertical, 5)
                            .contentShape(.rect)
                    }
                }
            }
        }
        .fontDesign(.rounded)
        .padding([.horizontal, .top], Theme.paddingHorizontal)
        .padding(.bottom, isiOS26 ? 30 : 10)
        .presentationDetents([.height(450)])
        .presentationCornerRadius(isiOS26 ? nil : 30)
        .interactiveDismissDisabled(forcedUpdate)
        .presentationBackground(.background)
        .ignoresSafeArea(.all, edges: isiOS26 ? .all : [])
    }

    private var isiOS26: Bool {
        if #available(iOS 26, *) {
            return true
        }
        return false
    }
}
