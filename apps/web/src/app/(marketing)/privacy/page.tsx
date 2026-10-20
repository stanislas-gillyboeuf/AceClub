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
          <h2 className="text-2xl font-semibold mb-4">1. Qui est responsable de vos données</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club (ci-après &laquo;&nbsp;Ace Club&nbsp;&raquo;, &laquo;&nbsp;nous&nbsp;&raquo;)
            est édité par Stanislas Gillyboeuf, responsable du traitement des données décrites dans
            cette politique, pour l&apos;application mobile Ace Club et le site{" "}
            <a href="https://ace-club.app" className="text-primary hover:underline">
              ace-club.app
            </a>
            , y compris sa page de prise de rendez-vous de démonstration.
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80">
              <strong>Ace Club</strong> — Stanislas Gillyboeuf
              <br />
              Email :{" "}
              <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
                {siteConfig.links.email}
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Les données que nous collectons</h2>

          <h3 className="text-xl font-medium mt-6 mb-3">2.1 Compte dans l&apos;application</h3>
          <p className="text-foreground/80 leading-relaxed">
            Lors de la création d&apos;un compte, nous collectons votre nom, votre adresse email et
            le ou les clubs auxquels vous appartenez. Vous pouvez aussi renseigner un numéro de
            téléphone et une photo de profil, facultatifs. L&apos;usage de l&apos;application
            génère en plus : niveau de jeu déclaré, disponibilités, historique des matchs
            organisés, messages échangés avec d&apos;autres utilisateurs, participation aux défis.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.2 Formulaire de demande de démonstration (site web)
          </h3>
          <p className="text-foreground/80 leading-relaxed">
            Sur{" "}
            <a href="/demo" className="text-primary hover:underline">
              ace-club.app/demo
            </a>
            , pour réserver un rendez-vous de démonstration, nous collectons : votre nom et prénom,
            votre adresse email, votre numéro de téléphone (facultatif), le nom de votre club,
            votre rôle (président, gérant/directeur, enseignant, autre) et, si vous le souhaitez,
            une note libre.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">2.3 Données Google Agenda</h3>
          <p className="text-foreground/80 leading-relaxed">
            Pour proposer des créneaux de rendez-vous et créer vos réservations de démonstration,
            notre serveur se connecte à un seul agenda Google (celui du fondateur) et utilise
            uniquement :
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Les disponibilités de cet agenda, en lecture seule</strong> (autorisation{" "}
              <code>calendar.freebusy</code>) : nous consultons seulement les plages
              &laquo;&nbsp;occupé / libre&nbsp;&raquo;, jamais le titre, les participants ou le
              contenu des autres événements de cet agenda.
            </li>
            <li>
              <strong>La création d&apos;événements et de liens Google Meet</strong> (autorisation{" "}
              <code>calendar.events</code>) : lorsqu&apos;une démonstration est réservée, un
              événement est créé dans cet agenda avec les horaires choisis, vous-même comme invité
              (nom et email), le nom de votre club, votre rôle, votre téléphone et votre note si
              vous les avez renseignés, et un lien Google Meet généré automatiquement. Une
              annulation supprime cet événement ; un report met à jour ses horaires.
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            Nous n&apos;utilisons aucune autre donnée de votre compte Google : ni vos contacts, ni
            vos autres agendas, ni vos emails, ni aucun autre service Google.
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80 italic">
              &laquo;&nbsp;L&apos;utilisation et le transfert par Ace Club des informations reçues
              des API Google respecteront la Google API Services User Data Policy, y compris les
              exigences d&apos;utilisation limitée.&nbsp;&raquo;
            </p>
          </div>

          <h3 className="text-xl font-medium mt-6 mb-3">2.4 Données techniques d&apos;usage</h3>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Identifiants de l&apos;appareil</li>
            <li>Adresse IP</li>
            <li>Type et version du système d&apos;exploitation</li>
            <li>Données de connexion et d&apos;utilisation de l&apos;application et du site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Pourquoi nous utilisons ces données (finalités)
          </h2>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Compte et profil :</strong> créer, authentifier et gérer votre compte
            </li>
            <li>
              <strong>Mise en relation :</strong> recherche de partenaires et organisation de matchs
            </li>
            <li>
              <strong>Communication :</strong> messagerie entre utilisateurs, emails liés à votre
              compte ou à votre club
            </li>
            <li>
              <strong>Gamification :</strong> défis, récompenses, classements
            </li>
            <li>
              <strong>Démonstration commerciale :</strong> organiser un rendez-vous, calculer les
              créneaux disponibles, créer l&apos;événement et le lien Google Meet correspondants,
              envoyer les emails de confirmation et de rappel
            </li>
            <li>
              <strong>Sécurité et amélioration du service</strong>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Base légale (RGPD)</h2>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>
              <strong>Exécution du contrat :</strong> fournir les services de l&apos;application ou
              répondre à votre demande de démonstration
            </li>
            <li>
              <strong>Consentement :</strong> pour certaines fonctionnalités optionnelles
              (téléphone, photo, note libre)
            </li>
            <li>
              <strong>Intérêt légitime :</strong> sécurité, prévention de la fraude, amélioration du
              service
            </li>
            <li>
              <strong>Obligation légale :</strong> lorsque la réglementation l&apos;impose
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Durée de conservation</h2>
          <p className="text-foreground/80 leading-relaxed">
            Les données de votre compte sont conservées pendant la durée de votre utilisation de
            l&apos;application, puis archivées 3 ans après la suppression du compte, conformément
            aux délais de prescription légaux. Les informations liées à une demande de
            démonstration (nom, email, téléphone, club, rôle, note) sont conservées tant que
            nécessaire à la gestion commerciale de ces demandes ; aucune purge automatique
            n&apos;est en place à ce jour, mais vous pouvez en demander la suppression à tout
            moment (voir section 8). Le jeton d&apos;accès à l&apos;agenda Google est conservé
            chiffré jusqu&apos;à sa déconnexion par le fondateur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Avec qui nous partageons vos données
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Vos données peuvent être partagées avec :
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>Les autres utilisateurs de l&apos;application (profil public, messagerie)</li>
            <li>Les administrateurs de votre club</li>
            <li>
              <strong>Railway</strong>, qui héberge notre base de données et nos serveurs
            </li>
            <li>
              <strong>Resend</strong>, pour l&apos;envoi de nos emails
            </li>
            <li>
              <strong>Google</strong>, pour Google Agenda et Google Meet lors d&apos;un rendez-vous
              de démonstration
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            <strong>Nous ne vendons jamais vos données à des tiers.</strong> Nous n&apos;utilisons
            jamais les données reçues des API Google à des fins publicitaires ni pour entraîner un
            modèle d&apos;intelligence artificielle, conformément à la Google API Services User
            Data Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Vos droits et comment les exercer</h2>
          <p className="text-foreground/80 leading-relaxed">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de limitation, de portabilité et d&apos;opposition sur vos données,
            ainsi que du droit de retirer votre consentement à tout moment. Pour les exercer,
            contactez-nous à{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            . Si vous avez un compte dans l&apos;application, vous pouvez aussi effectuer une{" "}
            <a href="/delete-account" className="text-primary hover:underline">
              demande de suppression de compte
            </a>{" "}
            directement depuis notre site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            8. Révoquer l&apos;accès à votre Google Agenda
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Le fondateur peut déconnecter l&apos;agenda Google depuis le tableau de bord
            administrateur à tout moment : cela supprime immédiatement le jeton chiffré de notre
            base de données. Cette déconnexion ne révoque pas automatiquement l&apos;autorisation
            côté Google — pour un retrait complet des droits accordés à Ace Club, rendez-vous sur{" "}
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
          <h2 className="text-2xl font-semibold mb-4">9. Sécurité des données</h2>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
            <li>Chiffrement des données en transit (HTTPS/TLS)</li>
            <li>
              Le jeton d&apos;accès à Google Agenda est chiffré au repos (AES-256-GCM) et
              n&apos;est jamais renvoyé dans une réponse de notre API ni affiché dans un tableau de
              bord
            </li>
            <li>Authentification sécurisée et accès restreint aux données personnelles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Transferts internationaux</h2>
          <p className="text-foreground/80 leading-relaxed">
            Vos données sont hébergées au sein de l&apos;Union Européenne. Si un transfert vers un
            pays tiers devenait nécessaire, nous nous assurerions que des garanties appropriées
            soient en place (clauses contractuelles types, décision d&apos;adéquation).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Réclamation</h2>
          <p className="text-foreground/80 leading-relaxed">
            Si vous estimez que le traitement de vos données ne respecte pas la réglementation,
            vous pouvez introduire une réclamation auprès de la CNIL :{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.cnil.fr
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Modifications de cette politique</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous pouvons modifier cette politique à tout moment. La date de dernière mise à jour
            est indiquée en haut de ce document.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80">
              Email :{" "}
              <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
                {siteConfig.links.email}
              </a>
            </p>
          </div>
        </section>

        <hr className="!my-16 border-foreground/15" />

        <section>
          <h2 className="text-3xl font-semibold mb-6">English version</h2>
          <p className="text-foreground/60 text-sm mb-8">Last updated: October 20, 2026</p>

          <h3 className="text-xl font-medium mt-6 mb-3">1. Who is responsible for your data</h3>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club is published by Stanislas Gillyboeuf, the data controller for the Ace Club
            mobile app and the{" "}
            <a href="https://ace-club.app" className="text-primary hover:underline">
              ace-club.app
            </a>{" "}
            website, including its demo-booking page. Contact:{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            .
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">2. Data we collect</h3>
          <p className="text-foreground/80 leading-relaxed">
            <strong>App account:</strong> name, email, club(s) you belong to; optionally a phone
            number and profile photo; plus usage data (declared skill level, availability, match
            history, messages, challenge participation).
          </p>
          <p className="text-foreground/80 leading-relaxed mt-4">
            <strong>Demo request form (ace-club.app/demo):</strong> your first and last name,
            email, phone number (optional), club name, role (president, manager/director, coach,
            other), and an optional free-text note.
          </p>
          <p className="text-foreground/80 leading-relaxed mt-4">
            <strong>Google Calendar data:</strong> to offer booking slots and create your demo
            appointment, our server connects to a single Google Calendar (the founder&apos;s) and
            uses only: (1) read-only availability (<code>calendar.freebusy</code>) — we only read
            busy/free time blocks, never the title, attendees, or content of other events on that
            calendar; and (2) event and Google Meet link creation (<code>calendar.events</code>) —
            booking a demo creates an event with the chosen time, yourself as an attendee (name and
            email), your club name, role, phone and note if provided, and an auto-generated Google
            Meet link. Cancelling removes the event; rescheduling updates its time. We do not use
            any other data from your Google account (no contacts, no other calendars, no emails, no
            other Google service).
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-foreground/80 italic">
              &ldquo;Ace Club&apos;s use and transfer to any other app of information received from
              Google APIs will adhere to the Google API Services User Data Policy, including the
              Limited Use requirements.&rdquo;
            </p>
          </div>
          <p className="text-foreground/80 leading-relaxed mt-4">
            <strong>Technical usage data:</strong> device identifiers, IP address, OS type and
            version, connection and usage logs.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">3. Why we use this data</h3>
          <p className="text-foreground/80 leading-relaxed">
            To create and manage your account; to help members find partners and organize matches;
            for in-app messaging and account/club-related emails; for challenges, rewards and
            leaderboards; to schedule a demo call, compute available slots, create the
            corresponding calendar event and Meet link, and send confirmation/reminder emails; and
            for security and service improvement.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">4. Legal basis (GDPR)</h3>
          <p className="text-foreground/80 leading-relaxed">
            Contract performance (providing the app or responding to your demo request), consent
            (optional fields such as phone, photo, or note), legitimate interest (security, fraud
            prevention, service improvement), and legal obligation where applicable.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">5. Retention</h3>
          <p className="text-foreground/80 leading-relaxed">
            Account data is kept for as long as you use the app, then archived for 3 years after
            account deletion. Demo request data is kept as long as needed for business follow-up;
            no automatic purge is currently in place, but you may request deletion at any time. The
            encrypted Google Calendar access token is kept until the founder disconnects the
            calendar.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">6. Who we share data with</h3>
          <p className="text-foreground/80 leading-relaxed">
            Other app users (public profile, messaging), your club&apos;s administrators,{" "}
            <strong>Railway</strong> (hosting our database and servers), <strong>Resend</strong>{" "}
            (sending our emails), and <strong>Google</strong> (Google Calendar and Google Meet for
            demo appointments). We never sell your data to third parties, and we never use data
            received from Google APIs for advertising or to train AI models, in line with the
            Google API Services User Data Policy.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">7. Your rights</h3>
          <p className="text-foreground/80 leading-relaxed">
            Under the GDPR you have rights of access, rectification, erasure, restriction,
            portability and objection, and may withdraw consent at any time. Contact{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>{" "}
            to exercise them, or use our{" "}
            <a href="/delete-account" className="text-primary hover:underline">
              account deletion request
            </a>{" "}
            page if you have an app account.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">8. Revoking Google access</h3>
          <p className="text-foreground/80 leading-relaxed">
            The founder can disconnect the Google Calendar at any time from the admin dashboard,
            which immediately deletes the encrypted token from our database. This does not
            automatically revoke the authorization on Google&apos;s side — to fully remove Ace
            Club&apos;s access, visit{" "}
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

          <h3 className="text-xl font-medium mt-6 mb-3">9. Complaints</h3>
          <p className="text-foreground/80 leading-relaxed">
            If you believe our processing does not comply with applicable law, you may lodge a
            complaint with the CNIL (France&apos;s data protection authority):{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.cnil.fr
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
