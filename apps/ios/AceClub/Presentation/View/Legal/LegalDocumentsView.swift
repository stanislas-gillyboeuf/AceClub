import SwiftUI

// MARK: - Legal Document Type

enum LegalDocumentType: String, CaseIterable, Identifiable {
    case termsOfService = "cgu"
    case privacyPolicy = "privacy"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .termsOfService:
            return "Conditions Générales d'Utilisation"
        case .privacyPolicy:
            return "Politique de Confidentialité"
        }
    }

    var shortTitle: String {
        switch self {
        case .termsOfService:
            return "CGU"
        case .privacyPolicy:
            return "Confidentialité"
        }
    }
}

// MARK: - Terms of Service View

struct TermsOfServiceView: View {
    @Environment(\.dismiss) private var dismiss
    var showAcceptButton: Bool = false
    var onAccept: (() -> Void)?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    termsContent
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 16)
            }
            .navigationTitle("CGU")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                if showAcceptButton {
                    Button("J'accepte les conditions") {
                        onAccept?()
                        dismiss()
                    }
                    .buttonStyle(.appPrimary)
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.vertical, 16)
                    .background(.ultraThinMaterial)
                }
            }
        }
        .presentationBackground(.regularMaterial)
    }

    private var termsContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("CONDITIONS GÉNÉRALES D'UTILISATION")
                    .font(.headline)
                    .fontWeight(.bold)

                Text("Application AceClub")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Text("Dernière mise à jour : Février 2026")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))

            // Article 1
            articleSection(
                number: 1,
                title: "OBJET ET ACCEPTATION",
                content: """
                Le présent document établit les conditions générales d'utilisation (ci-après « CGU ») régissant l'accès et l'utilisation de l'application mobile AceClub. Ces dispositions définissent le cadre juridique applicable aux relations entre l'éditeur et toute personne utilisant l'application ou ses services (ci-après « l'Utilisateur »).

                AceClub est une application de mise en relation destinée aux joueurs de tennis et de padel, permettant de trouver des partenaires de jeu au sein de clubs sportifs selon un système de compatibilité de niveau et de disponibilités.

                L'éditeur se réserve la faculté de modifier ces CGU à tout moment. Les CGU applicables sont celles en vigueur à la date d'utilisation de l'application.

                L'utilisation de l'application ainsi que de ses fonctionnalités vaut acceptation pleine et entière des présentes CGU. L'Utilisateur qui n'adhère pas à l'ensemble de ces dispositions doit s'abstenir d'utiliser l'application.
                """
            )

            // Article 2
            articleSection(
                number: 2,
                title: "MENTIONS LÉGALES",
                content: """
                Éditeur de l'application

                L'application AceClub est éditée par Nicolas Becharat, entrepreneur individuel.

                Pour toute correspondance, l'éditeur peut être contacté par courrier électronique à l'adresse : contact@aceclub.app
                """
            )

            // Article 3
            articleSection(
                number: 3,
                title: "DESCRIPTION DES SERVICES",
                content: """
                L'application AceClub propose un service gratuit de mise en relation entre joueurs de tennis et de padel dans le but de faciliter l'organisation de matchs et la découverte de nouveaux partenaires de jeu.

                Les fonctionnalités principales incluent :

                • La création d'un profil personnel mentionnant le niveau de jeu, le sport pratiqué et les disponibilités

                • Un système de découverte de profils compatibles au sein de votre club

                • La création d'intentions de match pour proposer des créneaux de jeu

                • Une fonctionnalité de matching permettant la mise en relation lorsque deux joueurs expriment un intérêt réciproque

                • Un espace de messagerie destiné à faciliter les échanges entre joueurs

                • Un système de progression avec des défis hebdomadaires, des badges et un classement

                L'accès à l'application est réservé aux membres de clubs partenaires utilisant la plateforme AceClub.
                """
            )

            // Article 4
            articleSection(
                number: 4,
                title: "ACCÈS À L'APPLICATION ET INSCRIPTION",
                content: """
                L'application AceClub est accessible à tout utilisateur disposant d'un appareil iOS compatible et d'une connexion Internet. Les éventuels coûts liés à l'équipement ou à l'abonnement Internet demeurent intégralement à la charge de l'Utilisateur.

                L'accès aux fonctionnalités de l'application requiert la création d'un compte personnel via une authentification Google ou Apple. L'Utilisateur doit compléter son profil en fournissant des informations exactes et sincères relatives à son identité, son niveau de jeu et son club.

                L'Utilisateur s'engage à maintenir la confidentialité de ses identifiants de connexion et demeure seul responsable de toute activité effectuée depuis son compte.

                Tout Utilisateur dispose de la faculté de supprimer son compte à tout moment depuis les paramètres de son espace personnel. Cette suppression entraîne l'effacement définitif du profil et des données associées.

                L'éditeur ne saurait être tenu responsable des interruptions de service résultant d'opérations de maintenance ou de tout événement constitutif d'un cas de force majeure.
                """
            )

            // Article 5
            articleSection(
                number: 5,
                title: "ENGAGEMENTS ET COMPORTEMENT DE L'UTILISATEUR",
                content: """
                En utilisant l'application AceClub, l'Utilisateur s'engage à adopter un comportement respectueux envers les autres membres de la communauté. L'application ayant pour vocation exclusive la mise en relation de joueurs de tennis et padel, toute utilisation détournée est formellement prohibée.

                L'Utilisateur s'interdit notamment :

                • De publier des contenus à caractère diffamatoire, injurieux, discriminatoire ou contraire à l'ordre public

                • D'usurper l'identité d'un autre utilisateur ou de fournir des informations mensongères sur son profil

                • D'utiliser l'application à des fins autres que la recherche de partenaires de jeu

                • De solliciter les autres Utilisateurs à des fins commerciales, promotionnelles ou personnelles sans lien avec la pratique sportive

                • De collecter ou d'exploiter les données personnelles des autres membres

                L'éditeur se réserve le droit de suspendre ou de supprimer sans préavis tout compte contrevenant aux présentes dispositions.
                """
            )

            // Article 6
            articleSection(
                number: 6,
                title: "PROTECTION DES DONNÉES PERSONNELLES",
                content: """
                Dans le cadre de l'utilisation de l'application AceClub, l'éditeur est amené à collecter et traiter certaines données à caractère personnel. Ces opérations s'effectuent dans le strict respect du Règlement Général sur la Protection des Données (RGPD).

                Les données collectées comprennent :

                • Les informations d'identification (nom, prénom, adresse électronique, photo de profil)

                • Les informations sportives (sport pratiqué, niveau de jeu, club)

                • Les données d'utilisation (historique des matchs, messages échangés, progression)

                Ces données sont utilisées exclusivement pour le fonctionnement de l'application et ne sont en aucun cas cédées à des tiers.

                Conformément à la réglementation en vigueur, chaque Utilisateur bénéficie d'un droit d'accès, de rectification, de suppression, d'opposition et de portabilité sur les données le concernant. L'exercice de ces droits peut s'effectuer par courrier électronique à l'adresse contact@aceclub.app ou directement depuis les paramètres de l'application.
                """
            )

            // Article 7
            articleSection(
                number: 7,
                title: "PROPRIÉTÉ INTELLECTUELLE",
                content: """
                L'intégralité des éléments présents dans l'application AceClub, incluant notamment les textes, éléments graphiques, logos, icônes et fonctionnalités, bénéficie de la protection accordée par les dispositions du Code de la propriété intellectuelle.

                La dénomination « AceClub » ainsi que le logo associé constituent des marques appartenant à l'éditeur. Toute reproduction, représentation ou exploitation de ces éléments sans autorisation expresse est formellement interdite.

                Les contenus publiés par les Utilisateurs sur leur profil demeurent leur propriété. Toutefois, en les publiant sur l'application, l'Utilisateur concède à l'éditeur une licence non exclusive d'utilisation de ces contenus dans le cadre strict du fonctionnement du service.
                """
            )

            // Article 8
            articleSection(
                number: 8,
                title: "RESPONSABILITÉ",
                content: """
                L'application AceClub constitue un outil de mise en relation et n'intervient pas dans les échanges entre Utilisateurs ni dans le déroulement effectif des matchs. L'éditeur ne saurait être tenu responsable des différends pouvant survenir entre joueurs.

                L'éditeur s'efforce d'assurer l'exactitude des informations diffusées mais ne garantit pas l'exhaustivité ni l'actualité des contenus publiés par les Utilisateurs. Chaque Utilisateur demeure seul responsable des informations qu'il communique sur son profil.

                La responsabilité de l'éditeur ne peut être engagée en cas de dommages directs ou indirects résultant de l'utilisation de l'application, notamment en cas d'incompatibilité entre joueurs ou d'annulation de match.
                """
            )

            // Article 9
            articleSection(
                number: 9,
                title: "NOTIFICATIONS",
                content: """
                L'Utilisateur peut autoriser l'application à lui envoyer des notifications push pour l'informer des événements importants tels que :

                • Les nouvelles demandes de match

                • L'acceptation ou le refus d'une demande

                • Les rappels de matchs à venir

                • Les nouveaux défis hebdomadaires

                • Les messages reçus

                L'Utilisateur peut à tout moment désactiver ces notifications depuis les paramètres de son appareil ou de l'application.
                """
            )

            // Article 10
            articleSection(
                number: 10,
                title: "DROIT APPLICABLE ET JURIDICTION COMPÉTENTE",
                content: """
                Les présentes CGU sont régies par le droit français. Tout litige relatif à l'interprétation ou à l'exécution des présentes sera soumis à la compétence exclusive des tribunaux français, sous réserve des règles impératives de compétence territoriale applicables.
                """
            )
        }
    }

    private func articleSection(number: Int, title: String, content: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ARTICLE \(number) : \(title)")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(Theme.tintColor)

            Text(content)
                .font(.footnote)
                .foregroundStyle(.primary)
                .lineSpacing(4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }
}

// MARK: - Privacy Policy View

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    privacyContent
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 16)
            }
            .navigationTitle("Confidentialité")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }
            }
        }
        .presentationBackground(.regularMaterial)
    }

    private var privacyContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("POLITIQUE DE CONFIDENTIALITÉ")
                    .font(.headline)
                    .fontWeight(.bold)

                Text("Application AceClub")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Text("Dernière mise à jour : Février 2025")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))

            // Section 1
            privacySection(
                title: "1. RESPONSABLE DU TRAITEMENT",
                content: """
                Le responsable du traitement des données personnelles collectées via l'application AceClub est Nicolas Becharat.

                Contact : contact@aceclub.app
                """
            )

            // Section 2
            privacySection(
                title: "2. DONNÉES COLLECTÉES",
                content: """
                Dans le cadre de l'utilisation de l'application, nous collectons les données suivantes :

                Données d'identification :
                • Nom et prénom
                • Adresse email
                • Photo de profil (optionnelle)
                • Numéro de téléphone (optionnel)

                Données sportives :
                • Sport pratiqué (tennis/padel)
                • Niveau de jeu
                • Club d'appartenance

                Données d'utilisation :
                • Historique des matchs
                • Messages échangés
                • Progression et statistiques
                • Préférences de notification
                """
            )

            // Section 3
            privacySection(
                title: "3. FINALITÉS DU TRAITEMENT",
                content: """
                Vos données personnelles sont traitées pour les finalités suivantes :

                • Création et gestion de votre compte utilisateur
                • Mise en relation avec d'autres joueurs de votre club
                • Fonctionnement du système de matching
                • Envoi de notifications relatives à votre activité
                • Calcul de votre progression et statistiques
                • Amélioration de nos services
                """
            )

            // Section 4
            privacySection(
                title: "4. BASE JURIDIQUE",
                content: """
                Le traitement de vos données repose sur :

                • Votre consentement lors de la création de compte
                • L'exécution du contrat d'utilisation de l'application
                • Notre intérêt légitime à améliorer nos services
                """
            )

            // Section 5
            privacySection(
                title: "5. DESTINATAIRES DES DONNÉES",
                content: """
                Vos données personnelles sont accessibles :

                • Aux autres membres de votre club (informations de profil public)
                • À nos prestataires techniques (hébergement, authentification)

                Nous ne vendons ni ne louons vos données personnelles à des tiers.
                """
            )

            // Section 6
            privacySection(
                title: "6. DURÉE DE CONSERVATION",
                content: """
                Vos données sont conservées pendant toute la durée de votre utilisation de l'application.

                En cas de suppression de votre compte, vos données personnelles sont effacées dans un délai de 30 jours, à l'exception des données que nous sommes tenus de conserver pour des raisons légales.
                """
            )

            // Section 7
            privacySection(
                title: "7. VOS DROITS",
                content: """
                Conformément au RGPD, vous disposez des droits suivants :

                • Droit d'accès à vos données
                • Droit de rectification
                • Droit à l'effacement (« droit à l'oubli »)
                • Droit à la limitation du traitement
                • Droit à la portabilité des données
                • Droit d'opposition

                Pour exercer ces droits, contactez-nous à : contact@aceclub.app

                Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
                """
            )

            // Section 8
            privacySection(
                title: "8. SÉCURITÉ",
                content: """
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.

                • Chiffrement des données en transit (HTTPS)
                • Authentification sécurisée via Google/Apple
                • Accès restreint aux données
                """
            )

            // Section 9
            privacySection(
                title: "9. MODIFICATIONS",
                content: """
                Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, nous vous en informerons via l'application.

                La date de dernière mise à jour est indiquée en haut de ce document.
                """
            )
        }
    }

    private func privacySection(title: String, content: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(Theme.tintColor)

            Text(content)
                .font(.footnote)
                .foregroundStyle(.primary)
                .lineSpacing(4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }
}

// MARK: - Legal Links Section (for Settings)

struct LegalLinksSection: View {
    @State private var showTermsOfService = false
    @State private var showPrivacyPolicy = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Informations légales", icon: "doc.text.fill")

            VStack(spacing: 0) {
                Button {
                    showTermsOfService = true
                } label: {
                    legalLinkRow(title: "Conditions Générales d'Utilisation", icon: "doc.text")
                }
                .buttonStyle(.plain)

                Divider()
                    .padding(.leading, 52)

                Button {
                    showPrivacyPolicy = true
                } label: {
                    legalLinkRow(title: "Politique de Confidentialité", icon: "hand.raised")
                }
                .buttonStyle(.plain)
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
        .sheet(isPresented: $showTermsOfService) {
            TermsOfServiceView()
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView()
        }
    }

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }

    private func legalLinkRow(title: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(.secondary)
                .frame(width: 24)

            Text(title)
                .foregroundStyle(.primary)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(16)
        .contentShape(Rectangle())
    }
}

// MARK: - Preview

#Preview("Terms of Service") {
    TermsOfServiceView()
}

#Preview("Terms with Accept") {
    TermsOfServiceView(showAcceptButton: true) {
        print("Accepted!")
    }
}

#Preview("Privacy Policy") {
    PrivacyPolicyView()
}

#Preview("Legal Links Section") {
    ScrollView {
        LegalLinksSection()
            .padding()
    }
}
