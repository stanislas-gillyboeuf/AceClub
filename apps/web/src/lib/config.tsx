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
  name: "AceClub",
  description: "L'app qui connecte les joueurs de votre club",
  cta: "Contacter AceClub",
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
      {
        title: "Témoignages",
        href: "/#testimonials",
        description: "Ce que nos utilisateurs disent de nous.",
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
    discord: "",
    github: "",
    instagram: "https://instagram.com/aceclub_app",
  },
  features: [
    {
      name: "Trouvez des partenaires",
      description:
        "Connectez-vous avec les membres de votre club selon leur niveau et disponibilité.",
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      name: "Organisez vos matchs",
      description:
        "Planifiez vos parties en quelques taps et recevez des confirmations instantanées.",
      icon: <CalendarIcon className="h-6 w-6" />,
    },
    {
      name: "Messagerie intégrée",
      description:
        "Discutez directement avec vos partenaires sans quitter l'application.",
      icon: <MessageSquareIcon className="h-6 w-6" />,
    },
    {
      name: "Défis et récompenses",
      description:
        "Gagnez des Aces en relevant des défis et montez dans le classement de votre club.",
      icon: <TrophyIcon className="h-6 w-6" />,
    },
    {
      name: "Profil personnalisé",
      description:
        "Créez votre profil joueur avec votre niveau, vos disponibilités et vos préférences de jeu.",
      icon: <UserCircleIcon className="h-6 w-6" />,
    },
    {
      name: "Notifications intelligentes",
      description:
        "Soyez alertés des nouvelles disponibilités et des matchs qui correspondent à votre agenda.",
      icon: <BellIcon className="h-6 w-6" />,
    },
  ],
  featureHighlight: [
    {
      title: "Trouvez des partenaires facilement",
      description:
        "Fini les groupes WhatsApp surchargés. Trouvez instantanément des joueurs de votre niveau disponibles à vos horaires.",
      imageSrc: "/Device.png",
      direction: "rtl" as const,
    },
    {
      title: "Organisez vos matchs en un tap",
      description:
        "Proposez un créneau, invitez des joueurs, recevez les confirmations. Simple, rapide, efficace.",
      imageSrc: "/Device-3.png",
      direction: "ltr" as const,
    },
    {
      title: "Relevez des défis",
      description:
        "Participez aux challenges de votre club, gagnez des Aces et comparez-vous aux autres membres.",
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
      title: "Organisez vos matchs",
      content:
        "Créez un match, choisissez le terrain et l'horaire, invitez des joueurs et recevez les confirmations en temps réel.",
      imageSrc: "/Device-2.png",
      imageAlt: "Organisation de matchs",
      fullWidth: false,
    },
    {
      title: "Messagerie instantanée",
      content:
        "Discutez avec vos partenaires, coordonnez les détails du match, partagez des photos et restez connectés.",
      imageSrc: "/Device-3.png",
      imageAlt: "Messagerie",
      fullWidth: false,
    },
    {
      title: "Défis et classements",
      content:
        "Participez aux défis hebdomadaires, gagnez des Aces et grimpez dans le classement de votre club pour devenir le champion.",
      imageSrc: "/Device-4.png",
      imageAlt: "Défis et récompenses",
      fullWidth: true,
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
    {
      id: 4,
      text: "Renforcez l'esprit de communauté de votre club.",
      image: "/Device-3.png",
    },
  ],
  pricing: [
    {
      name: "Membres",
      href: "#",
      price: "Gratuit",
      period: "",
      yearlyPrice: "",
      features: [
        "Accès complet à l'application",
        "Recherche de partenaires illimitée",
        "Messagerie instantanée",
        "Participation aux défis",
        "Notifications en temps réel",
      ],
      description: "Pour tous les joueurs",
      buttonText: "Télécharger l'app",
      isPopular: true,
    },
    {
      name: "Clubs",
      href: "/contact",
      price: "Sur devis",
      period: "",
      yearlyPrice: "",
      features: [
        "Espace club personnalisé",
        "Gestion des membres",
        "Communication club-membres",
        "Statistiques d'utilisation",
        "Support prioritaire",
        "Mise en avant de votre club",
      ],
      description: "Pour les clubs et associations",
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
  testimonials: [
    {
      id: 1,
      text: "AceClub a révolutionné notre club. Les membres jouent 3 fois plus qu'avant et l'ambiance est au top !",
      name: "Marie Dupont",
      role: "Présidente, TC Boulogne",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 2,
      text: "Je trouve des partenaires de mon niveau en 5 minutes. Fini les messages dans tous les sens sur WhatsApp !",
      name: "Thomas Martin",
      role: "Membre, Padel Club Lyon",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 3,
      text: "Les défis hebdomadaires motivent vraiment nos membres. On a jamais eu autant de participation aux events.",
      name: "Pierre Durand",
      role: "Responsable sportif, TC Marseille",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 4,
      text: "Interface super intuitive. Même les membres les moins tech-savvy l'utilisent sans problème.",
      name: "Sophie Bernard",
      role: "Trésorière, TC Nantes",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 5,
      text: "Le support est réactif et à l'écoute. Ils ont implémenté plusieurs de nos suggestions en quelques semaines.",
      name: "Laurent Petit",
      role: "Directeur, Padel Arena Paris",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 6,
      text: "Depuis qu'on utilise AceClub, le taux de remplissage de nos terrains a augmenté de 40%. Impressionnant !",
      name: "Isabelle Moreau",
      role: "Gérante, Tennis Club Bordeaux",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 7,
      text: "Grâce à AceClub, j'ai rencontré plein de nouveaux joueurs de mon niveau. L'app est devenue indispensable.",
      name: "Julien Leroy",
      role: "Membre, TC Strasbourg",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 8,
      text: "La messagerie intégrée évite les mails perdus et les SMS oubliés. Tout est centralisé, c'est parfait.",
      name: "Camille Rousseau",
      role: "Secrétaire, Padel Club Toulouse",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 9,
      text: "Je joue maintenant 3 fois par semaine contre 1 fois avant AceClub. L'app m'a remotivé à fond !",
      name: "François Blanc",
      role: "Membre, TC Nice",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 10,
      text: "Les notifications de disponibilité sont géniales. Dès qu'un joueur de mon niveau est dispo, je suis prévenue.",
      name: "Anne Fabre",
      role: "Membre, TC Lille",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
