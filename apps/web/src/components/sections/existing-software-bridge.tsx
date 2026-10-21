import { TodoNote } from "@/components/ui/todo-note";

export function ExistingSoftwareBridge() {
  return (
    <section className="border-t border-mkt-border py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
          Ace Club se branche sur ce que vous utilisez déjà
        </h2>
        <p className="mt-5 text-balance text-lg leading-relaxed text-mkt-fg-dim">
          Pas besoin de tout changer. Ace Club se synchronise avec ADOC et
          ajoute ce qui manque souvent : l&apos;animation de la vie du club.
          Vos adhérents gardent leurs habitudes, votre club gagne en vie.
        </p>
        <p className="mt-4">
          <TodoNote>préciser ce qui est réellement synchronisé et ce qui ne l&apos;est pas</TodoNote>
        </p>
      </div>
    </section>
  );
}
