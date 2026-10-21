export const BLUR_FADE_DELAY = 0.15;

/** No real pilot-club logos or usage numbers exist yet — the social-proof section stays
 * hidden until this is flipped, rather than showing placeholder/fake data. */
export const SHOW_SOCIAL_PROOF = false;

export const siteConfig = {
  name: "Ace Club",
  description: "Un club vivant, c'est des joueurs qui jouent.",
  cta: "Réserver une démo",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ace-club.app",
  navigation: {
    menuItems: [
      { title: "Accueil", href: "/" },
      { title: "Produit", href: "/produit" },
      { title: "Tarifs", href: "/tarifs" },
      { title: "FAQ", href: "/faq" },
    ],
    legalItems: [
      { title: "Conditions d'utilisation", href: "/terms" },
      { title: "Confidentialité", href: "/privacy" },
    ],
  },
  keywords: [
    "Tennis",
    "Padel",
    "Club sportif",
    "Vie de club",
    "Trouver partenaires",
    "Application club",
  ],
  links: {
    email: "contact.stanislas@ace-club.app",
  },
  appLinks: {
    ios: "https://apps.apple.com/fr/app/ace-club/id6758263483",
    // android: "[TODO: lien Play Store une fois publié publiquement]",
  },
  /** The 5-step process a club goes through when adopting Ace Club. */
  onboardingSteps: [
    {
      name: "Activation du club",
      description:
        "Un espace dédié à votre club : accès administrateur pour l'équipe dirigeante, sports et niveaux paramétrés.",
    },
    {
      name: "Invitation des adhérents",
      description:
        "QR code à afficher au club ou lien à partager par email — inscription en moins d'une minute.",
    },
    {
      name: "Démarrage immédiat",
      description: "Toutes les fonctionnalités sont accessibles dès l'inscription, sans formation.",
    },
    {
      name: "Un rôle simple pour le club",
      description: "Publier des annonces, suivre l'activité et l'engagement des adhérents, en un coup d'œil.",
    },
    {
      name: "Suivi et bilan",
      description: "Analyse de l'usage réel, retours des adhérents, échange avec notre équipe. Sans engagement.",
    },
  ],
  pricing: [
    {
      name: "Petit Club",
      href: "/demo",
      price: "49€",
      period: "mois",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Support dédié",
      ],
      description: "Moins de 200 adhérents",
      buttonText: "Réserver une démo",
      isPopular: false,
    },
    {
      name: "Club Moyen",
      href: "/demo",
      price: "79€",
      period: "mois",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Support dédié",
      ],
      description: "De 200 à 600 adhérents",
      buttonText: "Réserver une démo",
      isPopular: true,
    },
    {
      name: "Grand Club",
      href: "/demo",
      price: "129€",
      period: "mois",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Support dédié",
      ],
      description: "Plus de 600 adhérents",
      buttonText: "Réserver une démo",
      isPopular: false,
    },
  ],
  faqs: [
    // Mise en place
    {
      category: "Mise en place",
      showOnHome: true,
      question: "Faut-il changer de logiciel de gestion ?",
      answer:
        "Non : Ace Club se synchronise avec ADOC en environ 5 minutes et récupère vos adhérents et la structure de votre club, sans ressaisie.",
    },
    {
      category: "Mise en place",
      showOnHome: true,
      question: "Combien de temps pour être opérationnel ?",
      answer:
        "Votre espace club est prêt en quelques heures. Vos adhérents rejoignent ensuite via un QR code ou un lien, opérationnels en moins d'une minute — aucune formation nécessaire.",
    },
    {
      category: "Mise en place",
      question: "Comment se passe la migration depuis notre ancien outil ?",
      answer:
        "On s'occupe de la reprise de vos données (adhérents, structure du club) avec vous pendant la démo, pour un démarrage sans ressaisie manuelle.",
    },
    // Prix
    {
      category: "Prix",
      showOnHome: true,
      question: "Combien ça coûte après les 3 mois offerts ?",
      answer:
        "Entre 49€ et 129€ par mois selon la taille de votre club — gratuit pour tous vos adhérents. Détail sur la page Tarifs.",
    },
    {
      category: "Prix",
      showOnHome: true,
      question: "Y a-t-il un engagement ?",
      answer:
        "Non, aucun engagement de durée. Vous pouvez arrêter à tout moment, sans frais de sortie.",
    },
    // Données
    {
      category: "Données",
      showOnHome: true,
      question: "À qui appartiennent les données de mes adhérents ?",
      answer:
        "À vous. Vos données vous appartiennent, ne sont jamais vendues, et vous pouvez en demander l'export ou la suppression à tout moment — voir notre politique de confidentialité.",
    },
    {
      category: "Données",
      question: "Nos données et celles de nos adhérents sont-elles en sécurité ?",
      answer:
        "Ace Club respecte le RGPD. Les données de vos adhérents sont chiffrées et ne sont jamais partagées avec des tiers sans consentement explicite.",
    },
    // Utilisation
    {
      category: "Utilisation",
      question: "L'application est-elle vraiment gratuite pour les membres ?",
      answer:
        "Oui, 100% gratuite pour tous les membres des clubs partenaires. Seul le club est facturé, selon sa taille.",
    },
    {
      category: "Utilisation",
      question: "Est-ce que ça remplace notre système de réservation actuel ?",
      answer:
        "Oui. Ace Club gère les disponibilités de vos terrains en temps réel, les réservations (seul, entre membres, ou en équipe pour le padel) et les règles de votre club, directement dans l'app.",
    },
    {
      category: "Utilisation",
      question: "Quels sports sont supportés ?",
      answer:
        "Le tennis et le padel, y compris les clubs qui proposent les deux. On travaille à étendre l'offre à d'autres sports de raquette.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
