import SwiftUI

struct CreateOrganizationSheet: View {
    @ObservedObject var viewModel: AdminViewModel
    @Binding var isPresented: Bool

    var body: some View {
        Text("Create Organization")
    }
}