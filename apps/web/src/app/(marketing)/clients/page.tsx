import type { Metadata } from "next";

// Not linked from any navigation. Do not link this page or announce it publicly
// until at least 3 real clubs have explicitly confirmed being named here.
export const metadata: Metadata = {
  title: "Nos clubs partenaires | Ace Club",
  robots: { index: false, follow: false },
};

const CLUBS: { name: string; city: string; quote?: string }[] = [
  // { name: "[TODO: nom du club]", city: "[TODO: ville]", quote: "[TODO: citation du président/gérant]" },
];

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-[var(--max-container-width)] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          Ils nous font confiance
        </span>
        <h1 className="mt-3 text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Des clubs qui jouent plus
        </h1>
      </div>

      {CLUBS.length === 0 ? (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-dashed border-mkt-fg/25 p-8 text-center">
          <p className="font-mono text-[13px] text-mkt-fg/40">
            [TODO: cette page attend au moins 3 clubs ayant confirmé
            explicitement vouloir être cités nommément avant publication]
          </p>
        </div>
      ) : (
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
          {CLUBS.map((club) => (
            <div key={club.name} className="rounded-2xl border border-mkt-border p-6">
              <h2 className="font-semibold">{club.name}</h2>
              <p className="text-[14px] text-mkt-fg-dim">{club.city}</p>
              {club.quote && <p className="mt-3 text-[14px] italic text-mkt-fg/80">&ldquo;{club.quote}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
