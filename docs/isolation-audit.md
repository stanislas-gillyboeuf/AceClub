# Isolation entre clubs — tableau d'audit final (phase 1)

Audit initial : 270 routes (71 « joueurs » + 199 « club » ; `e2ee` = 4 routes non montées, hors périmètre). État après les 8 commits de la phase 1, tous locaux sur `dev`, non poussés au moment de l'écriture :

| # | Commit | Message |
|---|---|---|
| 1 | `84bbd4b` | feat(api): centralized club access helpers with cached membership and invalidation |
| 2 | `a35036f` | fix(api): close organization membership holes (add-member, invitations, pin, directories) |
| 3 | `230fe77` | fix(api): events are only visible to members of their club |
| 4 | `9accc78` | fix(api): courts, courses and tags are only reachable by members of the club |
| 5 | `9cb868f` | fix(api): partner discovery, matches, feeds and leaderboards are scoped to clubs and no longer expose personal data |
| 6 | — | Dashboard web : audité, déjà conforme (charge-puis-vérifie systématique) — aucun changement de code |
| 7 | `a5f0148` | feat(mobile): active club selection with scoped requests and caches |
| 8 | *(ce commit)* | test(api): cross-cutting club isolation e2e and final audit table |

Helpers centralisés introduits au commit 1, utilisés par tous les commits suivants : `services/api/lib/club-access.ts` — `getUserClubIds`, `isMemberOfOrg`, `assertCanViewOrg`, `resolveClubId`, `canSeeEvent`, `canViewMatch`, `forbidden(c)` (403), `notFound(c)` (404), `isSuperAdmin`.

## Groupe « club » (199 routes)

| Route | Protection après phase 1 | Commit |
|---|---|---|
| POST /organization/add-member | `assertOrgAdmin` du club ou super-admin ; rôle `owner` réservé au super-admin ; repli « moi + PIN » pour compat mobile | 2 |
| POST /organization/join *(nouveau)* | PIN vérifié côté serveur, `userId`=appelant | 2 |
| /api/auth/organization/add-member, /create (Better Auth direct) | désactivés (`disabledPaths`) | 2 |
| POST /organization/accept-invitation | destinataire + statut `pending` + non expirée vérifiés avant toute suppression de club | 2 |
| POST /organization/verify-pin | limite 5/10 min par utilisateur+club, comparaison temps constant | 2 |
| GET /organization/search-members | `assertCanViewOrg` | 2 |
| GET /organization/list-user-organizations | forcé à l'appelant (sauf super-admin) | 2 |
| GET /organization/get-organization-stats | `assertCanViewOrg` | 2 |
| GET /organization/list-invitations | owner/admin du club | 2 |
| POST /organization/create-invitation | doublon détecté sur l'invitation elle-même | 2 |
| GET /organization/get-full-organization | log PII retiré | 2 |
| GET /organization/list-members | 403 (au lieu de 500) si non-membre | 2 |
| GET /event/list | événements du club de l'appelant + événements sans club, quelle que soit `visibility` ; `organizationId` d'un club étranger → 403 | 3 |
| GET /event/get | `canSeeEvent`, refus → 404 | 3 |
| GET /event/list-participants | `canSeeEvent`, refus → 404 | 3 |
| POST /event/register | `canSeeEvent` avant toute logique d'inscription | 3 |
| POST /event/add-participant | `userId` doit être membre du club, sinon 400 | 3 |
| tournament/* (11 routes) | déjà conforme (admin du club) ; hérite de la correction event pour la visibilité de son événement | déjà conforme |
| GET /court/list, /settings, /my-weekly-quota, /booking-enabled, /board | `assertCanViewOrg` | 4 |
| GET /court/availability, POST /court/book | membre requis, y compris sur les courts `accessPolicy=open` | 4 |
| POST /court/join-booking | appelant membre ; `userId`=soi ou membre du club ; doublon/propriétaire refusé | 4 |
| GET /court/booking/:id | créateur, participants ou admin du club (ou super-admin) ; refus → 404 | 4 |
| GET /court/frequent-partners | filtré sur les membres du club | 4 |
| POST /course/cancel-occurrence, /mark-attendance, /notify-students | coach doit être encore `assertCoach` du club | 4 |
| POST /club-tag/set-member-tags, GET /list-member-tags | `isMemberOfOrg` sinon 404 | 4 |
| POST /cron/* | comparaison du secret en temps constant (`safe-equal.ts`) | 4 |
| club-dashboard, club-member, club-level, household, pricing, messaging, vacation-period (≈115 routes) | déjà conformes (charge-puis-vérifie systématique, confirmé fichier par fichier) | déjà conforme |
| admin/* (41 routes) | `isAdmin` posé au router avant toutes les routes | déjà conforme |

## Groupe « joueurs » (71 routes)

| Route | Protection après phase 1 | Commit |
|---|---|---|
| GET /match-intents/discover | filtre dur sur le club actif (`resolveClubId`), plus de dépendance au flag `restrict_discovery` (supprimé du seed) ; email retiré | 5 |
| GET /match-intents/requests | email du demandeur retiré | 5 |
| POST /match-intents | `teammateUserIds` validés (existent, même club) | 5 |
| POST /match-intents/:id/request | intent doit être visible du demandeur (404 sinon) ; club du demandeur déterministe (`user_preference`) | 5 |
| GET /user/search | partielle limitée au club actif ; hors club : correspondance exacte (email/téléphone E.164), ≤1 résultat minimal, 20/h (429 au-delà) | 5 |
| POST /user/ghost | ne renvoie plus l'email d'un ghost existant | 5 |
| POST /conversation/find-or-create | body validé par `zValidator`, cible bannie refusée | 5 |
| POST /account-deletion-request | limite de débit (IP puis email) | 5 |
| GET /match | club vérifié (`assertCanViewOrg`) ; `userId` = soi/co-participant/même club ; `participantOnly=false` sans org/userId refusé ; projection `{id,name,image}` des utilisateurs | 5 |
| GET /match/:id | `canViewMatch`, refus → 404 ; projection sans PII | 5 |
| POST /match/:id/like | `canViewMatch`, refus → 404 | 5 |
| POST /match | `createdBy` forcé à l'appelant, doit être participant ; `venueOrganizationId` déterministe | 5 |
| PUT /match/:id/venue | l'org doit être celle d'un participant | 5 |
| GET /leaderboard/organization/:orgId | `assertCanViewOrg` | 5 |
| GET /leaderboard/global, /weekly | `organizationId` fourni → classement du club (membre requis) ; absent → super-admin seulement ; ghosts/bannis exclus ; clé de cache incluant l'org | 5 |
| GET /level/user/:userId | soi/co-participant/même club/super-admin, sinon 404 | 5 |
| match (11 autres routes), match-intents (4 autres), user (3 autres), conversation (11 autres), notification (6), ws, challenge/streak/reward/level (10), upload (2) | déjà conformes (self/participant/conv.participant) | déjà conforme |
| e2ee (4 routes) | non montées (code mort), inchangé | signalé, non traité |

## Client mobile (commit 7)

- Store de club actif persistant (`lib/active-club.ts`, `hooks/use-active-club.ts`), sélecteur multi-club (`components/ui/club-switcher.tsx`), invite à rejoindre un club si aucun (`join-club-prompt.tsx`).
- Fil, découverte, événements, classement et profil envoient désormais le club actif ; clés React Query par club, vidées au changement.
- Classement « Global » retiré du sélecteur (`ranking.tsx`) — la route est réservée au super-admin ; « Semaine » devient un classement de club.
- Filtre géolocalisation/rayon retiré de l'écran « Trouver un partenaire » (devenu sans objet : la recherche est toujours limitée au club).
- Deux routes mobiles cassées corrigées au passage : `/level/${userId}` → `/level/user/:userId`, `/level/aces-history` → `/level/history`.
- `POST /organization/join` non branché : le mobile ne rejoignait déjà un club que via `PUT /user/profile` (PIN vérifié) — rien à migrer.

## Résidus connus, non corrigés dans la phase 1 (aucune fuite, juste imparfait)

1. Les routes admin de club (course/tournament/club-dashboard/pricing/household/messaging/vacation-period, ≈115 routes) n'ont pas de bypass super-admin centralisé — un super-admin plateforme doit passer par `/admin/*` pour agir dessus, pas par le dashboard club.
2. Ces mêmes routes renvoient 403 (et non 404) quand la ressource existe mais appartient à un autre club, révélant son existence. Corriger proprement demanderait un helper `assertClubAdminResource` unique migré domaine par domaine — proposé comme suite dédiée plutôt que dans ce commit.
3. `bulk-import`/`add-member` peuvent ajouter un compte réel existant à un club sans le consentement de son titulaire (signalé à l'audit initial, hors périmètre isolation).
4. Le limiteur de tentatives (PIN, recherche exacte, suppression de compte) est en mémoire par processus : il se remet à zéro au redémarrage et n'est pas partagé entre plusieurs instances de l'API.

## Changements visibles pour les utilisateurs (à communiquer aux clubs)

- Les courts en accès « ouvert » ne sont plus réservables (ni consultables) par des joueurs extérieurs au club — seuls les membres réservent, y compris sur ces courts.
- Un événement « public » n'apparaît plus que pour les membres du club qui l'a créé (sauf s'il n'est rattaché à aucun club).
- Le classement « Global » a disparu du mobile ; le classement « Semaine » est désormais celui du club, pas de toute la plateforme.
- Le filtre géolocalisation/rayon de « Trouver un partenaire » a disparu (la recherche est toujours limitée au club).
- La recherche de joueurs ne trouve plus que les membres du même club par nom ; un joueur d'un autre club ne se trouve que par email ou téléphone exact (1 résultat, 20 recherches/heure).
- Rejoindre un club exige désormais le bon code PIN côté serveur (avant : uniquement vérifié côté app).
- Les fiches de match n'affichent plus l'email, le téléphone, la date de naissance ni le statut de bannissement des autres joueurs.
- Les demandes de partenaire n'affichent plus l'adresse email du demandeur ou du propriétaire de l'annonce.

## Phase 2 (hors périmètre de ce travail, à faire séparément)

Statut de confirmation des matchs entre clubs (`pending_confirmation`), demandes de message entre joueurs sans relation commune, blocage et signalement, profil partageable par lien/QR — voir la section « PHASE 2 » du plan.
