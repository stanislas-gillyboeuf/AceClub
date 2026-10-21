import { SHOW_SOCIAL_PROOF } from "@/lib/config";

// No real pilot-club logos or usage numbers exist yet. Flip SHOW_SOCIAL_PROOF once they do —
// never fill this with placeholder logos or made-up figures.
export function SocialProof() {
  if (!SHOW_SOCIAL_PROOF) return null;

  return (
    <section className="border-t border-mkt-border py-16">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-fg-dim">
          Ils nous font confiance
        </p>
        {/* Club logos (public/images/club-logo-1.png …) and real usage figures go here — see IMAGES.md */}
      </div>
    </section>
  );
}
