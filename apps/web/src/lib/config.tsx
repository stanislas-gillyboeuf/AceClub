import {
  BellIcon,
  CalendarIcon,
  MessageSquareIcon,
  TrophyIcon,
  UserCircleIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Ace Club",
  description: "L'app qui fait bourger votre club",
  cta: "Contacter Ace Club",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://aceclub.app",
  navigation: {
    features: [
      {
        title: "Trouvez des partenaires",
        href: "/#features",
        description: "Connectez-vous avec les membres de votre club selon leur niveau.",
        icon: UsersIcon,
      },
      {
        title: "Organisez vos matchs",
        href: "/#features",
        description: "Planifiez vos parties en quelques taps.",
        icon: CalendarIcon,
      },
      {
        title: "Messagerie intégrée",
        href: "/#features",
        description: "Discutez directement avec vos partenaires.",
        icon: MessageSquareIcon,
      },
      {
        title: "Défis et récompenses",
        href: "/#features",
        description: "Gagnez des Aces en relevant des défis.",
        icon: TrophyIcon,
      },
    ] as Array<{ title: string; href: string; description: string; icon: LucideIcon }>,
    resources: [
      {
        title: "Tarifs",
        href: "/#pricing",
        description: "Gratuit pour les membres, sur devis pour les clubs.",
      },
      {
        title: "FAQ",
        href: "/#faq",
        description: "Réponses aux questions fréquentes.",
      },
    ],
    menuItems: [
      { title: "Accueil", href: "/" },
      { title: "Fonctionnalités", href: "/#features" },
      { title: "Tarifs", href: "/#pricing" },
      { title: "FAQ", href: "/#faq" },
      { title: "Contact", href: "/contact" },
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
    "Organisation matchs",
    "Trouver partenaires",
    "Application club",
  ],
  links: {
    email: "contact@aceclub.app",
    twitter: "https://twitter.com/aceclub_app",
    instagram: "https://instagram.com/aceclub_app",
  },
  features: [
    {
      name: "Activation du club",
      description:
        "Nous créons un espace dédié à votre club : nom et informations du club, accès administrateur pour l'équipe dirigeante et paramétrage initial (sports, niveaux, règles simples).",
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      name: "Invitation des adhérents",
      description:
        "Les adhérents rejoignent le club très simplement : QR code à afficher au club, lien d'invitation à partager par email ou WhatsApp, inscription en moins d'une minute.",
      icon: <UserCircleIcon className="h-6 w-6" />,
    },
    {
      name: "Démarrage de la vie du club",
      description:
        "Dès l'inscription, les adhérents ont accès à toutes les fonctionnalités. L'usage démarre sans formation.",
      icon: <CalendarIcon className="h-6 w-6" />,
    },
    {
      name: "Rôle du club pendant le test",
      description:
        "Le club garde un rôle simple et léger : publier ses événements ou annonces importantes, observer l'activité et l'engagement des adhérents, recueillir les retours.",
      icon: <BellIcon className="h-6 w-6" />,
    },
    {
      name: "Suivi et bilan",
      description:
        "À l'issue de la période de test : analyse de l'usage (participation, matchs, engagement), retours qualitatifs des adhérents, échange avec le club pour décider de la suite. Sans engagement.",
      icon: <TrophyIcon className="h-6 w-6" />,
    },
  ],
  featureHighlight: [
    {
      title: "Trouvez des partenaires facilement",
      description:
        "Fini les groupes WhatsApp surchargés où tout le monde se perd. Ace Club devient l’app de rencontre de votre club",
      imageSrc: "/Device.png",
      direction: "rtl" as const,
    },
    {
      title: "Gardez une trace de tout ce que vous accomplissez",
      description:
        "Un carnet de bord simple pour suivre ses matchs, partenaires et ressentis, et garder une trace de sa vie au club.",
      imageSrc: "/Device-3.png",
      direction: "ltr" as const,
    },
    {
      title: "Relevez des défis",
      description:
        "Progressez au fil des matchs grâce à des niveaux, défis et badges qui valorisent votre engagement au club..",
      imageSrc: "/Device-1.png",
      direction: "rtl" as const,
    },
  ],
  bento: [
    {
      title: "Trouvez des partenaires",
      content:
        "Parcourez les profils des membres de votre club, filtrez par niveau et disponibilité, et trouvez le partenaire idéal en quelques secondes.",
      imageSrc: "/Device.png",
      imageAlt: "Recherche de partenaires",
      fullWidth: true,
    },
    {
      title: "Classement du club",
      content:
        "Chez Ace Club, la régularité compte plus que le niveau. Le classement valorise ceux qui jouent, pas seulement les meilleurs.",
      imageSrc: "/Device-2.png",
      imageAlt: "Organisation de matchs",
      fullWidth: false,
    },
    {
      title: "Messagerie instantanée",
      content:
        "Discutez avec vos partenaires, coordonnez les détails du match, partagez des photos et restez connectés.",
      imageSrc: "/Device-9.png",
      imageAlt: "Messagerie",
      fullWidth: false,
    },
  ],
  benefits: [
    {
      id: 1,
      text: "Trouvez des partenaires en moins de 5 minutes.",
      image: "/Device.png",
    },
    {
      id: 2,
      text: "Fini les groupes WhatsApp interminables.",
      image: "/Device-2.png",
    },
    {
      id: 3,
      text: "Jouez plus souvent grâce aux notifications intelligentes.",
      image: "/Device-3.png",
    },
  ],
  pricing: [
    {
      name: "Petit Club",
      href: "/contact",
      price: "49€",
      period: "mois",
      yearlyPrice: "490€/an",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Notifications intelligentes",
        "Support dédié",
      ],
      description: "Jusqu'à 200 adhérents",
      buttonText: "Nous contacter",
      isPopular: false,
    },
    {
      name: "Club Moyen",
      href: "/contact",
      price: "79€",
      period: "mois",
      yearlyPrice: "790€/an",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Notifications intelligentes",
        "Support dédié",
      ],
      description: "De 200 à 600 adhérents",
      buttonText: "Nous contacter",
      isPopular: true,
    },
    {
      name: "Grand Club",
      href: "/contact",
      price: "129€",
      period: "mois",
      yearlyPrice: "1 290€/an",
      features: [
        "Toutes les fonctionnalités incluses",
        "Espace club personnalisé",
        "Gestion des membres",
        "Messagerie instantanée",
        "Défis et classement",
        "Notifications intelligentes",
        "Support dédié",
      ],
      description: "Plus de 600 adhérents",
      buttonText: "Nous contacter",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "L'application est-elle vraiment gratuite pour les membres ?",
      answer: (
        <span>
          Oui, l'application AceClub est 100% gratuite pour tous les membres des
          clubs partenaires. Téléchargez-la, créez votre compte, et commencez à
          trouver des partenaires immédiatement. Aucun paiement, aucune publicité.
        </span>
      ),
    },
    {
      question: "Comment mon club peut-il rejoindre AceClub ?",
      answer: (
        <span>
          Contactez-nous via le formulaire de contact ou par email à
          contact@aceclub.app. Nous vous présenterons les fonctionnalités et
          établirons un devis personnalisé selon la taille de votre club.
        </span>
      ),
    },
    {
      question: "Quels sports sont supportés ?",
      answer: (
        <span>
          AceClub est conçu principalement pour le tennis et le padel. Nous
          travaillons à étendre notre offre à d'autres sports de raquette comme
          le squash et le badminton.
        </span>
      ),
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: (
        <span>
          AceClub respecte le RGPD et toutes les réglementations européennes
          sur la protection des données. Vos informations personnelles sont
          chiffrées et ne sont jamais partagées avec des tiers sans votre
          consentement explicite.
        </span>
      ),
    },
    {
      question: "Comment créer mon profil joueur ?",
      answer: (
        <span>
          Après avoir téléchargé l'application, créez votre compte et
          renseignez votre niveau de jeu, vos disponibilités et vos
          préférences. Ces informations permettent de vous connecter avec
          des partenaires compatibles.
        </span>
      ),
    },
    {
      question: "Comment fonctionne le système de défis ?",
      answer: (
        <span>
          Les défis sont des challenges sociaux proposés par votre club ou par
          AceClub. Jouez un certain nombre de matchs, invitez des nouveaux
          membres, ou participez à des événements pour gagner des Aces et monter
          dans le classement.
        </span>
      ),
    },
  ],
  footer: [
    {
      id: 1,
      menu: [
        { href: "/", text: "Accueil" },
        { href: "/#features", text: "Fonctionnalités" },
        { href: "/#pricing", text: "Tarifs" },
        { href: "/contact", text: "Contact" },
        { href: "/cgu", text: "CGU" },
        { href: "/privacy", text: "Confidentialité" },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
