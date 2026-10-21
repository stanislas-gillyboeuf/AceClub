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
| `adherent-feed-phone.png` | 9:19.5 | Capture du fil d'actus, section "L'application de vos adhérents" (accueil + `/produit`) |
| `club-dashboard-tablet.png` | 16:11 | Capture du dashboard club avec le taux d'occupation des courts sur 7 jours, section "Le tableau de bord du club" (accueil + `/produit`) |
| `founder-photo.jpg` | 1:1 (carré, pas de rond) | Photo de Stanislas, en grand — "Qui est derrière Ace Club" (accueil) et `/a-propos` |
| `club-logo-1.png` … `club-logo-6.png` | transparent, largeur libre | Logos des clubs fondateurs, bandeau "Programme clubs fondateurs" — n'apparaît que lorsque `SHOW_SOCIAL_PROOF` est passé à `true` dans `src/lib/config.tsx` |

## Captures déjà réelles, actuellement inutilisées

`/public/screenshot-partner.png`, `/public/screenshot-booking.png`,
`/public/screenshot-matchlog.png` et `/public/screenshot-leaderboard.png` sont de vraies
captures de l'app (pas des placeholders) mais ne sont référencées dans aucun composant depuis
la refonte v2 — `/produit` réutilise directement les sections `AdherentFeatures` /
`ClubDashboard` de l'accueil (un seul visuel générique chacune) plutôt que des lignes dédiées
par fonctionnalité. Elles pourraient remplacer un `ImageSlot` ci-dessus une fois l'alt text
vérifié pour correspondre au contenu réel de la capture.

Une fois un fichier déposé dans `public/images/`, mettre à jour le composant correspondant
(`hero.tsx`, `adherent-features.tsx`, `club-dashboard.tsx`, `founder-story.tsx`,
`founding-clubs-banner.tsx`) pour passer le chemin `/images/<fichier>` en prop
`src` / `phoneSrc` / `tabletSrc`.
