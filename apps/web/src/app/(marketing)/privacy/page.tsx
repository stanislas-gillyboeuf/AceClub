import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Politique de Confidentialité | ${siteConfig.name}`,
  description: "Politique de confidentialité et protection des données personnelles - AceClub",
};

export default function PrivacyPage() {
  return (
    <div className="mkt-light-section mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <h1 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">Politique de Confidentialité</h1>
        <p className="mt-5 text-[15px] text-foreground/50">
          Dernière mise à jour : 20 octobre 2026
        </p>

        <div className="prose prose-lg mt-14 max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              AceClub SAS (ci-après "AceClub", "nous", "notre") s'engage à protéger la vie privée des
              utilisateurs de son application mobile (ci-après "l'Application"). Cette politique de
              confidentialité explique comment nous collectons, utilisons, partageons et protégeons
              vos données personnelles conformément au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Responsable du Traitement</h2>
            <p className="text-foreground/80 leading-relaxed">
              Le responsable du traitement de vos données personnelles est :
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-foreground/80">
                <strong>AceClub SAS</strong><br />
                [Adresse]<br />
                Email : <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">{siteConfig.links.email}</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Données Collectées</h2>
            <p className="text-foreground/80 leading-relaxed">
              Nous collectons les catégories de données suivantes :
            </p>
            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Données d'identification</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Photo de profil (optionnelle)</li>
              <li>Numéro de téléphone (optionnel)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Données relatives à l'utilisation</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Club(s) d'appartenance</li>
              <li>Niveau de jeu déclaré</li>
              <li>Disponibilités</li>
              <li>Historique des matchs organisés</li>
              <li>Messages échangés avec d'autres utilisateurs</li>
              <li>Participation aux défis</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Données techniques</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Identifiants de l'appareil</li>
              <li>Adresse IP</li>
              <li>Type et version du système d'exploitation</li>
              <li>Données de connexion et d'utilisation de l'Application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Finalités du Traitement</h2>
            <p className="text-foreground/80 leading-relaxed">
              Vos données personnelles sont traitées pour les finalités suivantes :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li><strong>Gestion de votre compte :</strong> création, authentification et gestion de votre profil utilisateur</li>
              <li><strong>Mise en relation :</strong> permettre la recherche de partenaires et l'organisation de matchs</li>
              <li><strong>Communication :</strong> faciliter les échanges entre utilisateurs via la messagerie</li>
              <li><strong>Gamification :</strong> gestion des défis, des récompenses et des classements</li>
              <li><strong>Amélioration du service :</strong> analyse de l'utilisation pour améliorer l'Application</li>
              <li><strong>Support client :</strong> répondre à vos questions et demandes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Base Légale du Traitement</h2>
            <p className="text-foreground/80 leading-relaxed">
              Le traitement de vos données repose sur :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li><strong>L'exécution du contrat :</strong> pour fournir les services de l'Application</li>
              <li><strong>Votre consentement :</strong> pour certaines fonctionnalités optionnelles</li>
              <li><strong>Notre intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
              <li><strong>Nos obligations légales :</strong> pour respecter la réglementation applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Destinataires des Données</h2>
            <p className="text-foreground/80 leading-relaxed">
              Vos données peuvent être partagées avec :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li>Les autres utilisateurs de l'Application (dans la limite des informations de votre profil public)</li>
              <li>Les administrateurs de votre club</li>
              <li>Nos sous-traitants techniques (hébergement, envoi d'emails, analytics)</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Durée de Conservation</h2>
            <p className="text-foreground/80 leading-relaxed">
              Vos données sont conservées pendant la durée de votre utilisation de l'Application,
              puis archivées pendant une durée de 3 ans après la suppression de votre compte,
              conformément aux délais de prescription légaux.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Vos Droits</h2>
            <p className="text-foreground/80 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et y accéder</li>
              <li><strong>Droit de rectification :</strong> demander la correction de données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> demander la limitation du traitement</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment, sans affecter la licéité du traitement antérieur</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">{siteConfig.links.email}</a>
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Pour exercer votre droit à l'effacement, vous pouvez également effectuer une{" "}
              <a href="/delete-account" className="text-primary hover:underline">
                demande de suppression de compte
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Sécurité des Données</h2>
            <p className="text-foreground/80 leading-relaxed">
              Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données contre tout accès non autorisé, perte, destruction ou altération :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données sensibles au repos</li>
              <li>Authentification sécurisée</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance et audits réguliers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Transferts Internationaux</h2>
            <p className="text-foreground/80 leading-relaxed">
              Vos données sont hébergées au sein de l'Union Européenne. Dans le cas où un transfert
              vers un pays tiers serait nécessaire, nous nous assurons que des garanties appropriées
              sont en place (clauses contractuelles types, décision d'adéquation).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Cookies et Technologies Similaires</h2>
            <p className="text-foreground/80 leading-relaxed">
              L'Application mobile n'utilise pas de cookies. Pour notre site web, veuillez consulter
              notre politique cookies accessible sur aceclub.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Prise de Rendez-vous de Démonstration et Google Calendar</h2>
            <p className="text-foreground/80 leading-relaxed">
              Cette section concerne spécifiquement la page publique de prise de rendez-vous
              (<a href="/demo" className="text-primary hover:underline">ace-club.app/demo</a>),
              utilisée par les responsables de club qui réservent une démonstration — et non les
              utilisateurs de l&apos;Application mobile.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.1 Données Google Agenda consultées</h3>
            <p className="text-foreground/80 leading-relaxed">
              Pour calculer les créneaux disponibles, notre serveur interroge l&apos;agenda Google
              du fondateur via l&apos;API Google Calendar, en lecture seule sur les
              disponibilités (autorisation <code>calendar.freebusy</code>) : nous ne consultons que
              les plages &laquo;&nbsp;occupé / libre&nbsp;&raquo; de cet agenda, jamais le titre,
              les participants ou le contenu des autres événements qui s&apos;y trouvent.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.2 Données créées dans Google Agenda</h3>
            <p className="text-foreground/80 leading-relaxed">
              Lorsqu&apos;une démonstration est réservée, un événement est créé (autorisation{" "}
              <code>calendar.events</code>) dans ce même agenda, avec les horaires choisis, votre
              nom et votre email en tant qu&apos;invité, le nom de votre club, votre rôle, votre
              téléphone et votre note si vous les avez renseignés, ainsi qu&apos;un lien Google Meet
              généré automatiquement. En cas d&apos;annulation, cet événement est supprimé de
              l&apos;agenda Google ; en cas de report, ses horaires sont mis à jour.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.3 Chiffrement et accès</h3>
            <p className="text-foreground/80 leading-relaxed">
              Le jeton d&apos;accès (refresh token) à cet agenda est chiffré au repos (AES-256-GCM)
              avant d&apos;être stocké en base de données ; il n&apos;est jamais renvoyé dans une
              réponse de notre API ni affiché dans le tableau de bord. Seul le fondateur,
              propriétaire unique de l&apos;agenda connecté, autorise cet accès ; les appels à
              l&apos;API Google sont effectués automatiquement par notre serveur pour calculer les
              disponibilités et gérer les événements, sans intervention manuelle ni accès par un
              tiers.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.4 Durée de conservation</h3>
            <p className="text-foreground/80 leading-relaxed">
              Les informations liées à une demande de démonstration (identité, email, téléphone,
              club, rôle, note) sont conservées en base de données tant que nécessaire à la gestion
              commerciale de ces demandes ; aucune purge automatique n&apos;est en place à ce jour.
              Le jeton chiffré est conservé jusqu&apos;à la déconnexion de l&apos;agenda par le
              fondateur.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.5 Déconnexion et suppression</h3>
            <p className="text-foreground/80 leading-relaxed">
              Le fondateur peut déconnecter l&apos;agenda Google à tout moment depuis le tableau de
              bord : cela supprime immédiatement le jeton chiffré de notre base de données. Cette
              déconnexion ne révoque pas automatiquement l&apos;autorisation côté Google — pour un
              retrait complet des droits accordés à AceClub, rendez-vous sur{" "}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                myaccount.google.com/permissions
              </a>. Pour demander l&apos;accès, la rectification ou la suppression des données
              liées à votre propre demande de démonstration, contactez-nous à{" "}
              <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">{siteConfig.links.email}</a>.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.6 Utilisation Limitée (Google API Services User Data Policy)</h3>
            <p className="text-foreground/80 leading-relaxed">
              L&apos;utilisation et le transfert, par AceClub, des informations reçues des API
              Google vers toute autre application respectent la{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Politique relative aux données utilisateur des services API de Google
              </a>, y compris les exigences d&apos;utilisation limitée (Limited Use requirements).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Modifications de la Politique</h2>
            <p className="text-foreground/80 leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout moment. Toute modification
              substantielle vous sera notifiée via l'Application. La date de dernière mise à jour est
              indiquée en haut de ce document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Réclamation</h2>
            <p className="text-foreground/80 leading-relaxed">
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation,
              vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de
              l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
            <p className="text-foreground/80 leading-relaxed">
              Pour toute question relative à cette politique de confidentialité ou à vos données
              personnelles, contactez-nous :
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-foreground/80">
                Email : <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">{siteConfig.links.email}</a>
              </p>
            </div>
          </section>
        </div>
    </div>
  );
}
