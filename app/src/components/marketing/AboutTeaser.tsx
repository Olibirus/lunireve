import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionStars } from "@/components/marketing/SectionStars";
import { ArrowRight } from "lucide-react";

/** Short "about us" teaser on the homepage, linking to the full page. */
export function AboutTeaser() {
  const t = useTranslations("homeV2");
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-24">
      <SectionStars offset={6} />
      <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
          {t("aboutKicker")}
        </p>
        <h2
          className="mx-auto mt-3 max-w-2xl font-serif text-3xl md:text-4xl tracking-tight leading-[1.08]"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("aboutTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
          {t("aboutBody")}
        </p>
        <Button asChild variant="secondary" size="lg" className="mt-7">
          <Link href="/a-propos">
            {t("aboutCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
