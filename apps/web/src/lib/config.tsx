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
      { title: "À propos", href: "/a-propos" },
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
  faqs: [
    {
      question: "Faut-il changer de logiciel de gestion ?",
      answer:
        "Non. Ace Club se synchronise avec ADOC en 5 minutes. Vous pouvez aussi l'utiliser comme outil principal pour la vie du club, c'est même recommandé.",
    },
    {
      question: "La mise en place interrompt-elle mon club ?",
      answer:
        "Non, votre club continue de fonctionner normalement pendant la mise en place.",
    },
    {
      question: "Gérez-vous les paiements et les cotisations ?",
      answer:
        "Non, pas aujourd'hui. Vous gardez votre solution actuelle pour l'encaissement.",
    },
    {
      question: "Combien ça coûte ?",
      answer:
        "3 mois offerts pour démarrer, puis un tarif adapté à la taille de votre club. On le détermine ensemble pendant la démo.",
    },
    {
      question: "Y a-t-il un engagement ?",
      answer: "Non, aucun engagement.",
    },
    {
      question: "À qui appartiennent les données de mes adhérents ?",
      answer: "À votre club.",
    },
    {
      question: "Comment se passe la démo ?",
      answer:
        "30 minutes en visio avec moi, sans engagement. On regarde votre club et ce que ça donnerait chez vous.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
