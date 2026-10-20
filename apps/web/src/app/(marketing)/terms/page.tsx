import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation",
  description: "Conditions Générales d'Utilisation de l'application et du site Ace Club",
};

export default function TermsPage() {
  return (
    <div className="mkt-light-section mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <h1 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="mt-5 text-[15px] text-foreground/50">Dernière mise à jour : 20 octobre 2026</p>

      <div className="prose prose-lg mt-14 max-w-none space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
          <p className="text-foreground/80 leading-relaxed">
            Les présentes conditions encadrent l&apos;utilisation de l&apos;application et du site
            Ace Club (
            <a href="https://ace-club.app" className="text-primary hover:underline">
              ace-club.app
            </a>
            ), édités par Stanislas Gillyboeuf, [forme juridique / SIREN], contact :{" "}
            <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
              {siteConfig.links.email}
            </a>
            . En utilisant Ace Club, vous acceptez ces conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Le service</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ace Club est un service qui permet aux clubs de tennis et de padel de gérer les
            réservations de courts, les cours, les événements, les cotisations et la communication
            avec leurs adhérents, et aux joueurs de réserver, de trouver des partenaires et de
            suivre leurs matchs. Il propose aussi une prise de rendez-vous pour demander une
            démonstration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Compte</h2>
          <p className="text-foreground/80 leading-relaxed">
            Vous devez fournir des informations exactes et protéger vos identifiants. Vous êtes
            responsable de l&apos;activité effectuée depuis votre compte. Vous pouvez supprimer
            votre compte à tout moment en nous écrivant.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Usage acceptable</h2>
          <p className="text-foreground/80 leading-relaxed">
            Il est interdit d&apos;utiliser le service pour porter atteinte aux droits
            d&apos;autrui, publier des contenus illicites, injurieux ou trompeurs, perturber le
            fonctionnement du service, tenter d&apos;accéder à des données auxquelles vous
            n&apos;avez pas droit, ou contourner les règles de réservation d&apos;un club.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contenus</h2>
          <p className="text-foreground/80 leading-relaxed">
            Vous restez propriétaire des contenus que vous publiez. Vous nous accordez le droit de
            les héberger et de les afficher aux membres autorisés de votre club pour faire
            fonctionner le service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Données personnelles et Google</h2>
          <p className="text-foreground/80 leading-relaxed">
            Le traitement des données personnelles est décrit dans notre{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
            . Le service utilise Google Agenda uniquement pour la prise de rendez-vous de
            démonstration, avec l&apos;autorisation du propriétaire du compte Google, qui peut la
            révoquer à tout moment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Tarifs</h2>
          <p className="text-foreground/80 leading-relaxed">
            [Les conditions tarifaires sont communiquées au club avant toute souscription. Les 3
            premiers mois sont gratuits, selon l&apos;offre en vigueur.]
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Disponibilité et responsabilité</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous faisons le maximum pour assurer un service continu, sans garantie d&apos;absence
            d&apos;interruption ou d&apos;erreur. Dans les limites autorisées par la loi, notre
            responsabilité est limitée aux dommages directs et prévisibles. Les clubs restent
            responsables de leurs règles de réservation et de leurs relations avec leurs
            adhérents.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Suspension et résiliation</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous pouvons suspendre un compte qui viole ces conditions. Vous pouvez cesser
            d&apos;utiliser le service et demander la suppression de vos données à tout moment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Droit applicable</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ces conditions sont soumises au droit français. En cas de litige, les tribunaux
            français sont compétents, sous réserve des droits des consommateurs.
          </p>
        </section>
      </div>
    </div>
  );
}
