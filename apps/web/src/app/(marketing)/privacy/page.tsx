import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description:
    "Comment Ace Club collecte, utilise et protège vos données, y compris les données Google Agenda utilisées pour les rendez-vous de démonstration.",
};

export default function PrivacyPage() {
  return (
    <div className="mkt-light-section mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <h1 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
        Politique de Confidentialité
      </h1>
      <p className="mt-5 text-[15px] text-foreground/50">Dernière mise à jour : 20 octobre 2026</p>

      <div className="prose prose-lg mt-14 max-w-none space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Qui sommes-nous</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club est une application et un site web (
            <a href="https://ace-club.app" className="text-primary hover:underline">
              ace-club.app
            </a>
            ) qui aident les clubs de tennis et de padel à gérer les réservations de courts, la
            mise en relation des joueurs, les cours, les événements et la communication avec leurs
            adhérents. Le responsable du traitement est Stanislas Gillyboeuf, micro-entreprise,
            joignable à{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Données que nous collectons</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>
              <strong>Compte et usage de l&apos;app :</strong> nom, prénom, adresse email, photo de
              profil (facultative), niveau de jeu, club d&apos;appartenance, réservations, matchs
              et inscriptions aux événements.
            </li>
            <li>
              <strong>Demande de démonstration :</strong> nom, prénom, email, téléphone
              (facultatif), nom du club, fonction, message éventuel, créneau choisi, source de la
              demande (par exemple un flyer).
            </li>
            <li>
              <strong>Données techniques :</strong> adresse IP, type d&apos;appareil et journaux de
              connexion, pour la sécurité et le fonctionnement du service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Données Google</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club utilise l&apos;API Google Agenda, uniquement pour la prise de rendez-vous de
            démonstration par les clubs. Avec l&apos;autorisation explicite du propriétaire du
            compte Google connecté, nous :
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              lisons ses disponibilités (périodes libres ou occupées), sans lire le titre, la
              description ni les participants de ses événements ;
            </li>
            <li>
              créons des événements dans son agenda pour les rendez-vous réservés, avec un lien
              Google Meet.
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            Nous ne lisons, ne stockons ni ne partageons aucune autre donnée Google. Les jetons
            d&apos;accès sont stockés chiffrés et servent uniquement à ces deux fonctions. Nous
            n&apos;utilisons pas les données Google pour de la publicité, ni pour entraîner des
            modèles d&apos;intelligence artificielle ou d&apos;apprentissage automatique, et nous
            ne les vendons pas.
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80 italic">
              &laquo;&nbsp;L&apos;utilisation et le transfert par Ace Club des informations reçues
              des API Google respecteront la Google API Services User Data Policy, y compris les
              exigences d&apos;utilisation limitée.&nbsp;&raquo;
            </p>
          </div>
          <p className="text-foreground/80 leading-relaxed mt-4">
            Vous pouvez révoquer cet accès à tout moment sur{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Pourquoi nous utilisons ces données (finalités et bases légales)
          </h2>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Fournir l&apos;application et ses fonctionnalités :</strong> exécution du
              contrat.
            </li>
            <li>
              <strong>Organiser et confirmer les rendez-vous de démonstration, envoyer des
              rappels :</strong> intérêt légitime et mesures précontractuelles.
            </li>
            <li>
              <strong>Assurer la sécurité et prévenir les abus :</strong> intérêt légitime.
            </li>
            <li>Respecter nos obligations légales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Partage des données</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous ne vendons pas vos données. Nous les partageons uniquement avec des prestataires
            nécessaires au service : <strong>Railway</strong> (hébergement), <strong>Resend</strong>{" "}
            (envoi d&apos;emails), <strong>Google</strong> (agenda et visioconférence). Les données
            d&apos;un adhérent sont visibles par le club auquel il appartient, selon les
            fonctionnalités de l&apos;application. Nous pouvons aussi communiquer des données si la
            loi l&apos;exige.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Conservation</h2>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Compte :</strong> tant qu&apos;il est actif, puis 12 mois après sa suppression
              au plus.
            </li>
            <li>
              <strong>Demandes de démonstration :</strong> 24 mois après le dernier contact.
            </li>
            <li>
              <strong>Journaux techniques :</strong> 12 mois.
            </li>
            <li>
              <strong>Jetons Google :</strong> supprimés dès la déconnexion ou la révocation de
              l&apos;accès.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Sécurité</h2>
          <p className="text-foreground/80 leading-relaxed">
            Les échanges sont chiffrés (HTTPS), les jetons d&apos;accès sont chiffrés au repos, et
            l&apos;accès aux données est limité aux personnes qui en ont besoin.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Vos droits</h2>
          <p className="text-foreground/80 leading-relaxed">
            Vous pouvez demander l&apos;accès, la rectification, l&apos;effacement, la limitation
            ou la portabilité de vos données, et vous opposer à leur traitement, en écrivant à{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            . Vous pouvez aussi introduire une réclamation auprès de la{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CNIL
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Mineurs</h2>
          <p className="text-foreground/80 leading-relaxed">
            Le service ne s&apos;adresse pas aux enfants de moins de 15 ans.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Modifications</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous pouvons mettre à jour cette politique. La date de dernière mise à jour figure en
            haut de la page.
          </p>
        </section>

        <hr className="!my-16 border-foreground/15" />

        <section>
          <h2 className="text-3xl font-semibold mb-6">English version</h2>
          <p className="text-foreground/60 text-sm mb-8">Last updated: October 20, 2026</p>

          <h3 className="text-xl font-medium mt-6 mb-3">1. Who we are</h3>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club is an app and website (
            <a href="https://ace-club.app" className="text-primary hover:underline">
              ace-club.app
            </a>
            ) that help tennis and padel clubs manage court bookings, player matchmaking, lessons,
            events, and communication with their members. The data controller is Stanislas
            Gillyboeuf, a sole proprietorship (micro-entreprise), reachable at{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            .
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">2. Data we collect</h3>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>
              <strong>Account and app usage:</strong> first and last name, email address, profile
              photo (optional), skill level, club membership, bookings, matches, and event
              registrations.
            </li>
            <li>
              <strong>Demo request:</strong> first and last name, email, phone (optional), club
              name, role, optional message, chosen time slot, request source (e.g. a flyer).
            </li>
            <li>
              <strong>Technical data:</strong> IP address, device type, and connection logs, for
              security and service operation.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">3. Google data</h3>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club uses the Google Calendar API solely to let clubs book a demo appointment. With
            the explicit authorization of the connected Google account&apos;s owner, we:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              read their availability (free or busy periods), without reading the title,
              description, or attendees of their events;
            </li>
            <li>create events on their calendar for booked appointments, with a Google Meet link.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            We do not read, store, or share any other Google data. Access tokens are stored
            encrypted and used only for these two functions. We do not use Google data for
            advertising, nor to train AI or machine-learning models, and we do not sell it.
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80 italic">
              &ldquo;Ace Club&apos;s use and transfer to any other app of information received from
              Google APIs will adhere to the Google API Services User Data Policy, including the
              Limited Use requirements.&rdquo;
            </p>
          </div>
          <p className="text-foreground/80 leading-relaxed mt-4">
            You may revoke this access at any time at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">4. Why we use this data (purposes and legal basis)</h3>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Providing the app and its features:</strong> contract performance.
            </li>
            <li>
              <strong>Organizing and confirming demo appointments, sending reminders:</strong>{" "}
              legitimate interest and pre-contractual steps.
            </li>
            <li>
              <strong>Ensuring security and preventing abuse:</strong> legitimate interest.
            </li>
            <li>Complying with our legal obligations.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">5. Data sharing</h3>
          <p className="text-foreground/80 leading-relaxed">
            We do not sell your data. We share it only with providers necessary to run the
            service: <strong>Railway</strong> (hosting), <strong>Resend</strong> (sending emails),{" "}
            <strong>Google</strong> (calendar and video conferencing). A member&apos;s data is
            visible to the club they belong to, depending on the app&apos;s features. We may also
            disclose data where required by law.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">6. Retention</h3>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Account:</strong> for as long as it is active, then up to 12 months after
              deletion.
            </li>
            <li>
              <strong>Demo requests:</strong> 24 months after the last contact.
            </li>
            <li>
              <strong>Technical logs:</strong> 12 months.
            </li>
            <li>
              <strong>Google tokens:</strong> deleted as soon as access is disconnected or revoked.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">7. Security</h3>
          <p className="text-foreground/80 leading-relaxed">
            Data in transit is encrypted (HTTPS), access tokens are encrypted at rest, and data
            access is limited to those who need it.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">8. Your rights</h3>
          <p className="text-foreground/80 leading-relaxed">
            You may request access, rectification, erasure, restriction, or portability of your
            data, and object to its processing, by writing to{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            . You may also lodge a complaint with the{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CNIL
            </a>{" "}
            (France&apos;s data protection authority).
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">9. Children</h3>
          <p className="text-foreground/80 leading-relaxed">
            Our service is not intended for children under 15.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">10. Changes</h3>
          <p className="text-foreground/80 leading-relaxed">
            We may update this policy. The last-updated date is shown at the top of this page.
          </p>
        </section>
      </div>
    </div>
  );
}
