# Images attendues — site marketing

Ce fichier liste les photos à déposer dans `apps/web/public/images/` pour remplacer les
placeholders neutres actuellement affichés sur le site. Tant qu'un fichier n'existe pas, la
section correspondante affiche un emplacement neutre (bordure pointillée, icône, "Photo à
venir") à la bonne taille — aucune mise en page ne change quand la vraie image est ajoutée.

Aucune photo de joueur professionnel ni image sous droits ne doit être utilisée.

| Fichier | Ratio | Usage |
|---|---|---|
| `hero-tablet.png` | 16:11 | Capture du dashboard club, Hero (tablette, à l'arrière) |
| `hero-phone.png` | 9:19.5 | Capture du fil d'actus de l'app, Hero (téléphone, au premier plan) |
| `adherent-feed-phone.png` | 9:19.5 | Capture du fil d'actus de l'app, bas de la section "Côté adhérents" (accueil) |
| `club-dashboard-tablet.png` | 16:11 | Capture du dashboard club avec le taux d'occupation mis en avant, section "Le dashboard" (accueil) |
| `founder-photo.jpg` | 1:1 (rond) | Photo de Stanislas — "Qui est derrière Ace Club" (accueil) et `/a-propos` |
| `club-logo-1.png` … `club-logo-6.png` | transparent, largeur libre | Logos des clubs pilotes, section "Preuve" — n'apparaît que lorsque `SHOW_SOCIAL_PROOF` est passé à `true` dans `src/lib/config.tsx` |

## `/produit` — captures manquantes côté club

Les 4 lignes "Pour votre club" dans `feature-showcase.tsx` (`CLUB_FEATURES`) n'ont pas encore
de capture réelle et affichent un `ImageSlot` neutre. Noms suggérés, à déposer puis à passer
en prop `image` sur l'entrée correspondante :

| Fichier | Ratio | Feature (`id`) |
|---|---|---|
| `produit-adoc-tablet.png` | 16:11 | `adoc` — synchronisation ADOC |
| `produit-courts-tablet.png` | 16:11 | `courts-regles` — gestion des courts et règles |
| `produit-communication-phone.png` | 9:19.5 | `communication` — annonces et notifications |
| `produit-activite-tablet.png` | 16:11 | `activite` — vue d'activité du club |

Les 4 lignes "Pour vos adhérents" (`ADHERENT_FEATURES`) utilisent déjà de vraies captures
(`/screenshot-partner.png`, `/screenshot-booking.png`, `/screenshot-matchlog.png`,
`/screenshot-leaderboard.png`, déjà présentes dans `public/`).

Une fois un fichier déposé dans `public/images/`, mettre à jour le composant correspondant
(`hero.tsx`, `adherent-features.tsx`, `club-dashboard.tsx`, `founder-story.tsx`,
`feature-showcase.tsx`, `social-proof.tsx`) pour passer le chemin `/images/<fichier>` en prop
`src` / `phoneSrc` / `tabletSrc` / `image`.
