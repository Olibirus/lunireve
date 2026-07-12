import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowRight } from "lucide-react";

/** Homepage CTA band pushing the personalized-story flow. */
export function PersonalizeBand() {
  const t = useTranslations("personalizedPage");
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-12">
      <div className="band-ink relative overflow-hidden rounded-[2rem] p-8 md:p-14 text-center text-[var(--color-cream-50)]">
        <Wand2 aria-hidden className="absolute -right-6 -top-6 h-40 w-40 text-[var(--color-mint-400)] opacity-10" />
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-mint-400)]">{t("kicker")}</p>
        <h2
          className="mx-auto mt-2 max-w-2xl font-serif text-3xl md:text-4xl tracking-tight leading-[1.1]"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-indigo-soft-200)] leading-relaxed">
          {t("ctaBody")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="mint" size="xl">
            <Link href="/creer">
              <Wand2 className="h-4 w-4" />
              {t("ctaButton")}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="xl"
            className="bg-white/10 text-[var(--color-cream-50)] ring-1 ring-inset ring-white/20 hover:bg-white/20"
          >
            <Link href="/histoire-personnalisee">{t("processKicker")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
