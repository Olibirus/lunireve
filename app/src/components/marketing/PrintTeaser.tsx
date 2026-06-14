import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookHeart, ArrowRight } from "lucide-react";

/**
 * Print teaser — the premium end of the journey. Reinforces the business model
 * without confusing the free offer: free reading every night, the printed
 * keepsake book for special occasions (coming soon).
 */
export function PrintTeaser() {
  const t = useTranslations("home.printTeaser");

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-12">
      <div className="band-ink relative overflow-hidden rounded-[2rem] p-8 md:p-14 text-[var(--color-cream-50)]">
        <BookHeart
          aria-hidden
          className="absolute -right-6 -top-6 h-40 w-40 text-[var(--color-mint-400)] opacity-10"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mint-400)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#17224a]">
            {t("soon")}
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-mint-400)]">
            {t("kicker")}
          </p>
          <h2
            className="mt-2 font-serif text-3xl md:text-4xl tracking-tight leading-[1.08]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-[var(--color-indigo-soft-200)] leading-relaxed">
            {t("body")}
          </p>
          <Button asChild variant="mint" size="lg" className="mt-7">
            <Link href="/creer">
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
