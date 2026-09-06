/**
 * "Ils nous font confiance" — logo strip.
 *
 * DO NOT render this on any published page until at least 3 real clubs have
 * explicitly confirmed being named/logo'd publicly. Populate CLUBS below with
 * real { name, logo } entries when that happens, then import + render this
 * component where needed (e.g. on Home, after <Traction />).
 */
const CLUBS: { name: string; logo: string }[] = [
  // { name: "[TODO: nom du club]", logo: "/clients/[TODO].png" },
];

export function ClientLogos() {
  if (CLUBS.length === 0) return null;

  return (
    <section className="border-t border-mkt-border py-20">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.15em] text-mkt-fg-dim">
          Ils nous font confiance
        </p>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {CLUBS.map((club) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={club.name} src={club.logo} alt={club.name} className="h-8 w-auto opacity-70 grayscale" />
          ))}
        </div>
      </div>
    </section>
  );
}
