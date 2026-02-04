module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/theme-provider.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/lib/config.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BLUR_FADE_DELAY",
    ()=>BLUR_FADE_DELAY,
    "siteConfig",
    ()=>siteConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as BellIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as CalendarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquareIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrophyIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as TrophyIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircleIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user.js [app-ssr] (ecmascript) <export default as UserCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UsersIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as UsersIcon>");
;
;
const BLUR_FADE_DELAY = 0.15;
const siteConfig = {
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
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UsersIcon$3e$__["UsersIcon"]
            },
            {
                title: "Organisez vos matchs",
                href: "/#features",
                description: "Planifiez vos parties en quelques taps.",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarIcon$3e$__["CalendarIcon"]
            },
            {
                title: "Messagerie intégrée",
                href: "/#features",
                description: "Discutez directement avec vos partenaires.",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareIcon$3e$__["MessageSquareIcon"]
            },
            {
                title: "Défis et récompenses",
                href: "/#features",
                description: "Gagnez des Aces en relevant des défis.",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrophyIcon$3e$__["TrophyIcon"]
            }
        ],
        resources: [
            {
                title: "Tarifs",
                href: "/#pricing",
                description: "Gratuit pour les membres, sur devis pour les clubs."
            },
            {
                title: "FAQ",
                href: "/#faq",
                description: "Réponses aux questions fréquentes."
            },
            {
                title: "Témoignages",
                href: "/#testimonials",
                description: "Ce que nos utilisateurs disent de nous."
            }
        ],
        menuItems: [
            {
                title: "Accueil",
                href: "/"
            },
            {
                title: "Fonctionnalités",
                href: "/#features"
            },
            {
                title: "Tarifs",
                href: "/#pricing"
            },
            {
                title: "FAQ",
                href: "/#faq"
            },
            {
                title: "Contact",
                href: "/contact"
            }
        ],
        legalItems: [
            {
                title: "CGU",
                href: "/cgu"
            },
            {
                title: "Confidentialité",
                href: "/privacy"
            }
        ]
    },
    keywords: [
        "Tennis",
        "Padel",
        "Club sportif",
        "Organisation matchs",
        "Trouver partenaires",
        "Application club"
    ],
    links: {
        email: "contact@aceclub.app",
        twitter: "https://twitter.com/aceclub_app",
        discord: "",
        github: "",
        instagram: "https://instagram.com/aceclub_app"
    },
    features: [
        {
            name: "Trouvez des partenaires",
            description: "Connectez-vous avec les membres de votre club selon leur niveau et disponibilité.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UsersIcon$3e$__["UsersIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 94,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            name: "Organisez vos matchs",
            description: "Planifiez vos parties en quelques taps et recevez des confirmations instantanées.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarIcon$3e$__["CalendarIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            name: "Messagerie intégrée",
            description: "Discutez directement avec vos partenaires sans quitter l'application.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareIcon$3e$__["MessageSquareIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 106,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            name: "Défis et récompenses",
            description: "Gagnez des Aces en relevant des défis et montez dans le classement de votre club.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrophyIcon$3e$__["TrophyIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 112,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            name: "Profil personnalisé",
            description: "Créez votre profil joueur avec votre niveau, vos disponibilités et vos préférences de jeu.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircleIcon$3e$__["UserCircleIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 118,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            name: "Notifications intelligentes",
            description: "Soyez alertés des nouvelles disponibilités et des matchs qui correspondent à votre agenda.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellIcon$3e$__["BellIcon"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 124,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        }
    ],
    featureHighlight: [
        {
            title: "Trouvez des partenaires facilement",
            description: "Fini les groupes WhatsApp surchargés. Trouvez instantanément des joueurs de votre niveau disponibles à vos horaires.",
            imageSrc: "/Device.png",
            direction: "rtl"
        },
        {
            title: "Organisez vos matchs en un tap",
            description: "Proposez un créneau, invitez des joueurs, recevez les confirmations. Simple, rapide, efficace.",
            imageSrc: "/Device-3.png",
            direction: "ltr"
        },
        {
            title: "Relevez des défis",
            description: "Participez aux challenges de votre club, gagnez des Aces et comparez-vous aux autres membres.",
            imageSrc: "/Device-1.png",
            direction: "rtl"
        }
    ],
    bento: [
        {
            title: "Trouvez des partenaires",
            content: "Parcourez les profils des membres de votre club, filtrez par niveau et disponibilité, et trouvez le partenaire idéal en quelques secondes.",
            imageSrc: "/Device.png",
            imageAlt: "Recherche de partenaires",
            fullWidth: true
        },
        {
            title: "Organisez vos matchs",
            content: "Créez un match, choisissez le terrain et l'horaire, invitez des joueurs et recevez les confirmations en temps réel.",
            imageSrc: "/Device-2.png",
            imageAlt: "Organisation de matchs",
            fullWidth: false
        },
        {
            title: "Messagerie instantanée",
            content: "Discutez avec vos partenaires, coordonnez les détails du match, partagez des photos et restez connectés.",
            imageSrc: "/Device-3.png",
            imageAlt: "Messagerie",
            fullWidth: false
        },
        {
            title: "Défis et classements",
            content: "Participez aux défis hebdomadaires, gagnez des Aces et grimpez dans le classement de votre club pour devenir le champion.",
            imageSrc: "/Device-4.png",
            imageAlt: "Défis et récompenses",
            fullWidth: true
        }
    ],
    benefits: [
        {
            id: 1,
            text: "Trouvez des partenaires en moins de 5 minutes.",
            image: "/Device.png"
        },
        {
            id: 2,
            text: "Fini les groupes WhatsApp interminables.",
            image: "/Device-2.png"
        },
        {
            id: 3,
            text: "Jouez plus souvent grâce aux notifications intelligentes.",
            image: "/Device-3.png"
        },
        {
            id: 4,
            text: "Renforcez l'esprit de communauté de votre club.",
            image: "/Device-3.png"
        }
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
                "Notifications en temps réel"
            ],
            description: "Pour tous les joueurs",
            buttonText: "Télécharger l'app",
            isPopular: true
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
                "Mise en avant de votre club"
            ],
            description: "Pour les clubs et associations",
            buttonText: "Nous contacter",
            isPopular: false
        }
    ],
    faqs: [
        {
            question: "L'application est-elle vraiment gratuite pour les membres ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Oui, l'application AceClub est 100% gratuite pour tous les membres des clubs partenaires. Téléchargez-la, créez votre compte, et commencez à trouver des partenaires immédiatement. Aucun paiement, aucune publicité."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 247,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            question: "Comment mon club peut-il rejoindre AceClub ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Contactez-nous via le formulaire de contact ou par email à contact@aceclub.app. Nous vous présenterons les fonctionnalités et établirons un devis personnalisé selon la taille de votre club."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 257,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            question: "Quels sports sont supportés ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "AceClub est conçu principalement pour le tennis et le padel. Nous travaillons à étendre notre offre à d'autres sports de raquette comme le squash et le badminton."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 267,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "AceClub respecte le RGPD et toutes les réglementations européennes sur la protection des données. Vos informations personnelles sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 277,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            question: "Comment créer mon profil joueur ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Après avoir téléchargé l'application, créez votre compte et renseignez votre niveau de jeu, vos disponibilités et vos préférences. Ces informations permettent de vous connecter avec des partenaires compatibles."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 288,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            question: "Comment fonctionne le système de défis ?",
            answer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Les défis sont des challenges sociaux proposés par votre club ou par AceClub. Jouez un certain nombre de matchs, invitez des nouveaux membres, ou participez à des événements pour gagner des Aces et monter dans le classement."
            }, void 0, false, {
                fileName: "[project]/src/lib/config.tsx",
                lineNumber: 299,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }
    ],
    footer: [
        {
            id: 1,
            menu: [
                {
                    href: "/",
                    text: "Accueil"
                },
                {
                    href: "#features",
                    text: "Fonctionnalités"
                },
                {
                    href: "#pricing",
                    text: "Tarifs"
                },
                {
                    href: "/contact",
                    text: "Contact"
                },
                {
                    href: "/cgu",
                    text: "CGU"
                },
                {
                    href: "/privacy",
                    text: "Confidentialité"
                }
            ]
        }
    ],
    testimonials: [
        {
            id: 1,
            text: "AceClub a révolutionné notre club. Les membres jouent 3 fois plus qu'avant et l'ambiance est au top !",
            name: "Marie Dupont",
            role: "Présidente, TC Boulogne",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 2,
            text: "Je trouve des partenaires de mon niveau en 5 minutes. Fini les messages dans tous les sens sur WhatsApp !",
            name: "Thomas Martin",
            role: "Membre, Padel Club Lyon",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 3,
            text: "Les défis hebdomadaires motivent vraiment nos membres. On a jamais eu autant de participation aux events.",
            name: "Pierre Durand",
            role: "Responsable sportif, TC Marseille",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 4,
            text: "Interface super intuitive. Même les membres les moins tech-savvy l'utilisent sans problème.",
            name: "Sophie Bernard",
            role: "Trésorière, TC Nantes",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 5,
            text: "Le support est réactif et à l'écoute. Ils ont implémenté plusieurs de nos suggestions en quelques semaines.",
            name: "Laurent Petit",
            role: "Directeur, Padel Arena Paris",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 6,
            text: "Depuis qu'on utilise AceClub, le taux de remplissage de nos terrains a augmenté de 40%. Impressionnant !",
            name: "Isabelle Moreau",
            role: "Gérante, Tennis Club Bordeaux",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 7,
            text: "Grâce à AceClub, j'ai rencontré plein de nouveaux joueurs de mon niveau. L'app est devenue indispensable.",
            name: "Julien Leroy",
            role: "Membre, TC Strasbourg",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 8,
            text: "La messagerie intégrée évite les mails perdus et les SMS oubliés. Tout est centralisé, c'est parfait.",
            name: "Camille Rousseau",
            role: "Secrétaire, Padel Club Toulouse",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 9,
            text: "Je joue maintenant 3 fois par semaine contre 1 fois avant AceClub. L'app m'a remotivé à fond !",
            name: "François Blanc",
            role: "Membre, TC Nice",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        },
        {
            id: 10,
            text: "Les notifications de disponibilité sont géniales. Dès qu'un joueur de mon niveau est dispo, je suis prévenue.",
            name: "Anne Fabre",
            role: "Membre, TC Lille",
            image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        }
    ]
};
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "absoluteUrl",
    ()=>absoluteUrl,
    "cn",
    ()=>cn,
    "constructMetadata",
    ()=>constructMetadata,
    "formatDate",
    ()=>formatDate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function absoluteUrl(path) {
    return `${process.env.NEXT_PUBLIC_APP_URL || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].url}${path}`;
}
function constructMetadata({ title = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].name, description = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].description, image = absoluteUrl("/og"), ...props }) {
    return {
        title: {
            template: "%s | " + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].name,
            default: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].name
        },
        description: description || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].description,
        keywords: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].keywords,
        openGraph: {
            title,
            description,
            url: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].url,
            siteName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].name,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ],
            type: "website",
            locale: "en_US"
        },
        icons: "/favicon.ico",
        metadataBase: new URL(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].url),
        authors: [
            {
                name: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].name,
                url: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteConfig"].url
            }
        ],
        ...props
    };
}
function formatDate(date) {
    let currentDate = new Date().getTime();
    if (!date.includes("T")) {
        date = `${date}T00:00:00`;
    }
    let targetDate = new Date(date).getTime();
    let timeDifference = Math.abs(currentDate - targetDate);
    let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    let fullDate = new Date(date).toLocaleString("en-us", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    if (daysAgo < 1) {
        return "Today";
    } else if (daysAgo < 7) {
        return `${fullDate} (${daysAgo}d ago)`;
    } else if (daysAgo < 30) {
        const weeksAgo = Math.floor(daysAgo / 7);
        return `${fullDate} (${weeksAgo}w ago)`;
    } else if (daysAgo < 365) {
        const monthsAgo = Math.floor(daysAgo / 30);
        return `${fullDate} (${monthsAgo}mo ago)`;
    } else {
        const yearsAgo = Math.floor(daysAgo / 365);
        return `${fullDate} (${yearsAgo}y ago)`;
    }
}
}),
"[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            orange: "border border-input  hover:bg-accent hover:text-accent-foreground"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 49,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Button.displayName = "Button";
;
}),
"[project]/src/components/theme-toggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ThemeToggle() {
    const { setTheme, theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    // Don't show in production
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
        variant: "ghost",
        size: "icon",
        className: "fixed bottom-1 left-1 z-50",
        onClick: ()=>setTheme(theme === "light" ? "dark" : "light"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                className: "h-[1.5rem] w-[1.3rem] dark:hidden"
            }, void 0, false, {
                fileName: "[project]/src/components/theme-toggle.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                className: "hidden h-5 w-5 dark:block"
            }, void 0, false, {
                fileName: "[project]/src/components/theme-toggle.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "Toggle theme"
            }, void 0, false, {
                fileName: "[project]/src/components/theme-toggle.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/theme-toggle.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ec701ff1._.js.map