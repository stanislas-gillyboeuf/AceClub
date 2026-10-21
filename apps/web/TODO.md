# TODO — contenu à compléter sur le site marketing

Liste de tout ce qui est marqué `[À COMPLÉTER]` sur le site (visible en dev via le composant
`TodoNote`), par ordre d'apparition. Rien de ceci n'a été inventé — chaque entrée est un vrai
trou de contenu, pas une donnée fictive.

1. **Accueil — "Comment ça marche", étape 3** (`onboarding-steps.tsx`) : confirmer le délai
   réel avant qu'un club soit opérationnel ("Votre club s'anime dès la première semaine").
2. **Accueil — "Vous avez déjà un logiciel de gestion ?"** (`existing-software-bridge.tsx`) :
   préciser ce qui est réellement synchronisé avec ADOC et ce qui ne l'est pas.
3. **Accueil — CTA final** (`cta.tsx`) : numéro de téléphone du fondateur (actuellement,
   seul l'email est affiché).
4. **Accueil — section "Preuve"** (`social-proof.tsx`) : masquée tant que `SHOW_SOCIAL_PROOF`
   est à `false` dans `src/lib/config.tsx` — pas de logos clients ni de chiffres réels pour
   l'instant. Voir `IMAGES.md` pour les fichiers de logos attendus.
5. **`/a-propos` — Mon parcours** : anecdote personnelle et photo du fondateur.
6. **`/a-propos` — Ce que je promets aux clubs pilotes** : engagements précis (délais,
   niveau de support) — le texte actuel reste volontairement général.
7. **`/tarifs` — Ce qui est inclus** : le détail des fonctionnalités est identique sur les 3
   formules ("Toutes les fonctionnalités incluses" répété) — à préciser s'il existe de
   vraies différences entre formules.
8. **`/produit`** : 4 captures d'écran manquantes côté club (ADOC, courts/règles,
   communication, vue d'activité) — voir `IMAGES.md` pour les noms de fichiers attendus.

## Autres photos manquantes (pas de TodoNote visible, juste des placeholders neutres)

Voir `IMAGES.md` pour la liste complète des images attendues côté Hero, section
"Côté adhérents", section "Le dashboard" et `/a-propos`.
