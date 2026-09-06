import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `CGU | ${siteConfig.name}`,
  description: "Conditions Générales d'Utilisation de l'application AceClub",
};

export default function CGUPage() {
  return (
    <div className="mkt-light-section mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <h1 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">Conditions Générales d'Utilisation</h1>
        <p className="mt-5 text-[15px] text-foreground/50">
          Dernière mise à jour : 4 février 2026
        </p>

        <div className="prose prose-lg mt-14 max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="text-foreground/80 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir
              les modalités et conditions d'utilisation de l'application mobile AceClub (ci-après
              "l'Application") ainsi que de définir les droits et obligations des parties dans ce cadre.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              L'Application est éditée par AceClub SAS, société par actions simplifiée au capital de
              [montant] euros, immatriculée au RCS de Paris sous le numéro [numéro], dont le siège social
              est situé [adresse].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Acceptation des CGU</h2>
            <p className="text-foreground/80 leading-relaxed">
              L'utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU.
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'Application.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              AceClub se réserve le droit de modifier à tout moment les présentes CGU. Les utilisateurs
              seront informés de toute modification par notification dans l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Description du Service</h2>
            <p className="text-foreground/80 leading-relaxed">
              AceClub est une application mobile permettant aux membres de clubs de tennis et de padel de :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li>Trouver des partenaires de jeu au sein de leur club</li>
              <li>Organiser des matchs et des sessions de jeu</li>
              <li>Communiquer avec les autres membres via une messagerie intégrée</li>
              <li>Participer à des défis et gagner des récompenses</li>
              <li>Appartenir à plusieurs clubs simultanément</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Inscription et Compte Utilisateur</h2>
            <p className="text-foreground/80 leading-relaxed">
              Pour utiliser l'Application, l'utilisateur doit créer un compte en fournissant des
              informations exactes et à jour. L'utilisateur est responsable de la confidentialité de
              ses identifiants de connexion.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              L'utilisateur s'engage à ne pas créer de compte au nom d'une autre personne et à ne
              pas partager ses identifiants avec des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Obligations de l'Utilisateur</h2>
            <p className="text-foreground/80 leading-relaxed">L'utilisateur s'engage à :</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
              <li>Utiliser l'Application conformément à sa destination</li>
              <li>Ne pas publier de contenu illicite, diffamatoire, injurieux ou contraire aux bonnes moeurs</li>
              <li>Respecter les autres utilisateurs et adopter un comportement courtois</li>
              <li>Ne pas utiliser l'Application à des fins commerciales non autorisées</li>
              <li>Ne pas tenter de contourner les mesures de sécurité de l'Application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriété Intellectuelle</h2>
            <p className="text-foreground/80 leading-relaxed">
              L'ensemble des éléments composant l'Application (textes, images, logos, base de données,
              logiciels, etc.) sont la propriété exclusive d'AceClub ou de ses partenaires et sont
              protégés par les droits de propriété intellectuelle.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Toute reproduction, représentation, modification ou exploitation non autorisée de ces
              éléments est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Responsabilité</h2>
            <p className="text-foreground/80 leading-relaxed">
              AceClub met tout en oeuvre pour assurer la disponibilité et le bon fonctionnement de
              l'Application, mais ne peut garantir une disponibilité continue et sans interruption.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              AceClub ne saurait être tenue responsable des dommages directs ou indirects résultant
              de l'utilisation ou de l'impossibilité d'utiliser l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Résiliation</h2>
            <p className="text-foreground/80 leading-relaxed">
              L'utilisateur peut à tout moment supprimer son compte depuis les paramètres de
              l'Application. AceClub se réserve le droit de suspendre ou de supprimer un compte
              en cas de violation des présentes CGU.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Vous pouvez également effectuer une{" "}
              <a href="/delete-account" className="text-primary hover:underline">
                demande de suppression de compte
              </a>{" "}
              directement depuis notre site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Droit Applicable et Juridiction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative
              de résolution amiable, les tribunaux de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-foreground/80 leading-relaxed">
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse
              suivante : <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">{siteConfig.links.email}</a>
            </p>
          </section>
        </div>
    </div>
  );
}
