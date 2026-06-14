/**
 * "DÉMO" badge — flags illustrative figures while the back-office runs on demo
 * data (revenue, per-user spend, engagement). Removed once Supabase + Stripe
 * feed real numbers. Keeps the owner's "no fake data passed off as real" rule
 * honest: every demo figure is visibly labelled.
 */
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Données de démonstration"
      className={
        "inline-flex items-center rounded-full border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-fox-700)] " +
        className
      }
    >
      Démo
    </span>
  );
}
