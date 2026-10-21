# TODO — contenu à compléter sur le site marketing

Liste de tout ce qui est marqué `[À COMPLÉTER]` sur le site (visible en dev via le composant
`TodoNote`), par ordre d'apparition. Rien de ceci n'a été inventé — chaque entrée est un vrai
trou de contenu, pas une donnée fictive.

1. **`/a-propos` — Mon parcours** : anecdote personnelle (le texte reste tel quel sans elle).
2. **Accueil + CTA finale** (`cta.tsx`) : numéro de téléphone du fondateur — seul l'email
   existe dans `siteConfig.links` aujourd'hui.
3. **Bandeau "Programme clubs fondateurs"** (`founding-clubs-banner.tsx`) : emplacement de
   logos masqué tant que `SHOW_SOCIAL_PROOF` est à `false` dans `src/lib/config.tsx` — pas de
   logos ni de chiffres réels pour l'instant. Voir `IMAGES.md`.
4. **Footer — badge Google Play** : le brief demande les badges App Store ET Google Play,
   mais la fiche Google Play n'est pas encore publique (`appLinks.android` reste commenté
   dans `src/lib/config.tsx`). Seul le badge App Store est affiché ; à ajouter dès que la
   fiche est publique.

## Mentions "20 minutes" corrigées en "30 minutes"

Toutes les mentions d'une démo de 20 minutes ont été recherchées dans le repo et corrigées :

- `components/sections/hero.tsx` — bouton "Réserver une démo de 20 min" → le bouton ne mentionne
  plus la durée, elle apparaît dans la ligne juste en dessous ("Démo de 30 min").
- `app/(marketing)/tarifs/page.tsx` — même bouton, même correction.
- `components/sections/onboarding-steps.tsx` ("On se parle 20 minutes") et
  `components/sections/product-summary.tsx` ("démonstration de 20 minutes") : ces deux
  sections ne font plus partie du site (supprimées lors de la refonte v2, elles n'étaient de
  toute façon plus utilisées nulle part côté pages).
- La page `/demo` et l'embed Cal.com (`demo-booking-embed.tsx`) affichaient déjà "30 minutes"
  et pointent déjà vers l'URL Cal.com `.../30min` — la durée réelle du créneau était donc déjà
  correcte, seule la copy marketing autour avait un reliquat de "20 min".

## Autres photos manquantes (pas de TodoNote visible, juste des placeholders neutres)

Voir `IMAGES.md` pour la liste complète des images attendues (Hero, section adhérents,
dashboard club, photo du fondateur).
