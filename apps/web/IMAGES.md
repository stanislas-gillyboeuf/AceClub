# Images attendues — site marketing

Ce fichier liste les photos à déposer dans `apps/web/public/images/` pour remplacer les
placeholders neutres actuellement affichés sur le site. Tant qu'un fichier n'existe pas, la
section correspondante affiche un emplacement neutre (bordure pointillée, icône, "Photo à
venir") à la bonne taille — aucune mise en page ne change quand la vraie image est ajoutée.

Aucune photo de joueur professionnel ni image sous droits ne doit être utilisée.

| Fichier | Ratio | Usage |
|---|---|---|
| `hero-tablet.png` | 16:11 | Capture du dashboard club, Hero (tablette, à l'arrière) |
| `hero-phone.png` | 9:19.5 | Capture de l'app mobile, Hero (téléphone, au premier plan) |
| `audience-phone.png` | 9:19.5 | Capture de l'app mobile, carte "Côté adhérents : l'appli" |
| `audience-tablet.png` | 16:11 | Capture du dashboard club, carte "Côté club : le dashboard" |
| `founder-photo.jpg` | 1:1 (rond) | Photo de Stanislas, section "Mot du fondateur" |
| `club-logo-1.png` … `club-logo-6.png` | transparent, largeur libre | Logos des clubs pilotes, section "Preuve" — n'apparaît que lorsque `SHOW_SOCIAL_PROOF` est passé à `true` dans `src/lib/config.tsx` |

Une fois un fichier déposé, mettre à jour le composant correspondant (`hero.tsx`,
`audience-split.tsx`, `founder-story.tsx`, `social-proof.tsx`) pour passer le chemin
`/images/<fichier>` en prop `src`/`phoneSrc`/`tabletSrc`.
