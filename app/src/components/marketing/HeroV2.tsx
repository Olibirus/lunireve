import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroSearchCard } from "@/components/marketing/HeroSearchCard";
import { SectionStars } from "@/components/marketing/SectionStars";
import { BookOpen, ArrowRight, Headphones, Wand2, Sparkles, BookHeart, Library } from "lucide-react";

/**
 * Homepage v2 hero. No stats. Primary CTA = read stories (the free library),
 * secondary = create a personalized story. A search/filter card sits on the
 * right (all stories are audio, so audio needs no separate toggle). A row of
 * feature pills states the value order: library, audio, personalized,
 * interactive, printed.
 */
export function HeroV2() {
  const t = useTranslations("home");
  const tv = useTranslations("homeV2");

  const features = [
    { icon: Library, key: "featLibrary" },
    { icon: Headphones, key: "featAudio" },
    { icon: Wand2, key: "featPersonalized" },
    { icon: Sparkles, key: "featInteractive" },
    { icon: BookHeart, key: "featPrinted" },
  ] as const;

  return (
    <section className="relative isolate overflow-hidden">
      <SectionStars />
      <div
        aria-hidden
        className="absolute inset-0 -z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(183, 223, 204, 0.45) 0%, transparent 45%), radial-gradient(circle at 15% 90%, rgba(133, 143, 193, 0.18) 0%, transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/80 backdrop-blur px-3 py-1.5 text-xs tracking-wide text-[var(--color-ink-600)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-mint-600)]" />
              {t("heroKicker")}
            </div>

            <h1
              className="mt-6 text-[2.75rem] md:text-6xl lg:text-[4.25rem] leading-[0.98] tracking-[-0.02em] font-serif text-[var(--color-ink-800)]"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
            >
              {t.rich("heroTitle", {
                accent: (chunks) => <span className="squiggle">{chunks}</span>,
                em: (chunks) => <em className="italic text-[var(--color-indigo-soft-600)]">{chunks}</em>,
              })}
            </h1>

            <p className="mt-5 text-lg md:text-xl text-[var(--color-ink-500)] max-w-xl leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="xl">
                <Link href="/histoires">
                  <BookOpen className="h-4 w-4" />
                  {t("ctaSecondary")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/creer">
                  {t("ctaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Value order: library, audio, personalized, interactive, printed */}
            <ul className="mt-8 flex flex-wrap gap-2">
              {features.map(({ icon: Icon, key }) => (
                <li
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/70 px-3 py-1.5 text-xs text-[var(--color-ink-700)]"
                >
                  <Icon className="h-3.5 w-3.5 text-[var(--color-indigo-soft-600)]" />
                  {tv(key)}
                </li>
              ))}
            </ul>
          </div>

          {/* Search / filter card — audio is implicit (every story has audio) */}
          <div className="order-1 lg:order-2 relative">
            <div
              className="absolute inset-0 -m-6 rounded-[48%] opacity-60 blur-2xl"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(183, 223, 204, 0.7) 0%, rgba(133, 143, 193, 0.25) 55%, transparent 70%)",
              }}
            />
            <div className="relative mx-auto max-w-md">
              <HeroSearchCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
