export const BLUR_FADE_DELAY = 0.15;

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
      { title: "CGU", href: "/cgu" },
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
    email: "contact@ace-club.app",
  },
  appLinks: {
    ios: "https://apps.apple.com/fr/app/ace-club/id6758263483",
    // android: "[TODO: lien Play Store une fois publié publiquement]",
  },
  /** Real numbers only — never invented. Fill these in before removing the placeholder flag. */
  traction: [
    { value: null, placeholder: "[TODO: nb clubs]", label: "clubs actifs" },
    { value: null, placeholder: "[TODO: nb villes]", label: "villes desservies" },
    { value: null, placeholder: "[TODO: nb matchs]", label: "matchs organisés" },
  ],
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
      href: "/tarifs#demo",
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
      description: "Jusqu'à 200 adhérents",
      buttonText: "Réserver une démo",
      isPopular: false,
    },
    {
      name: "Club Moyen",
      href: "/tarifs#demo",
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
      href: "/tarifs#demo",
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
    {
      question: "Comment mon club peut-il rejoindre Ace Club ?",
      answer:
        "Réservez une démo. On échange sur les besoins de votre club et on établit un devis adapté à sa taille — sans engagement de durée.",
    },
    {
      question: "Combien de temps pour déployer Ace Club dans mon club ?",
      answer:
        "Votre espace club est prêt en quelques jours. Vos adhérents rejoignent ensuite via un QR code ou un lien, opérationnels en moins d'une minute — aucune formation nécessaire.",
    },
    {
      question: "Est-ce que ça remplace notre système de réservation actuel ?",
      answer:
        "Oui. Ace Club gère les disponibilités de vos terrains en temps réel, les réservations (seul, entre membres, ou en équipe pour le padel) et les règles de votre club, directement dans l'app.",
    },
    {
      question: "L'application est-elle vraiment gratuite pour les membres ?",
      answer:
        "Oui, 100% gratuite pour tous les membres des clubs partenaires. Seul le club est facturé, selon sa taille.",
    },
    {
      question: "Nos données et celles de nos adhérents sont-elles en sécurité ?",
      answer:
        "Ace Club respecte le RGPD. Les données de vos adhérents sont chiffrées et ne sont jamais partagées avec des tiers sans consentement explicite.",
    },
    {
      question: "Quels sports sont supportés ?",
      answer:
        "Le tennis et le padel, y compris les clubs qui proposent les deux. On travaille à étendre l'offre à d'autres sports de raquette.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
