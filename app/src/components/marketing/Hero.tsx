import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroSearchCard } from "@/components/marketing/HeroSearchCard";
import { ArrowRight, BookOpen } from "lucide-react";

/**
 * Hero — the emotional anchor. Editorial split:
 * - Left: large Fraunces display headline with handled squiggle accent,
 *   subhead, dual CTA, trust chip.
 * - Right: fox mascot on cloud, framed with a soft mint halo + sparkles.
 *
 * Mobile stacks vertically with mascot above headline.
 * Composition is intentionally asymmetric — headline starts higher than mascot.
 */
export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden">
      {/* Background decorative gradient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(183, 223, 204, 0.45) 0%, transparent 45%), radial-gradient(circle at 15% 90%, rgba(133, 143, 193, 0.18) 0%, transparent 40%)",
        }}
      />
      {/* Tiny decorative dots */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(#1f2d52 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Dark-mode only: slowly twinkling stars, a quiet touch of night magic */}
      <div aria-hidden className="star-field absolute inset-0 pointer-events-none">
        {[
          { top: "14%", left: "10%", dur: "6s", delay: "0s", big: true },
          { top: "22%", left: "82%", dur: "7s", delay: "1.2s" },
          { top: "10%", left: "54%", dur: "5.5s", delay: "2s" },
          { top: "40%", left: "26%", dur: "8s", delay: "0.6s" },
          { top: "58%", left: "88%", dur: "6.5s", delay: "1.8s", big: true },
          { top: "70%", left: "16%", dur: "7.5s", delay: "2.6s" },
          { top: "33%", left: "68%", dur: "6s", delay: "3.2s" },
          { top: "80%", left: "60%", dur: "7s", delay: "0.9s" },
          { top: "50%", left: "44%", dur: "9s", delay: "2.2s" },
          { top: "18%", left: "36%", dur: "6.8s", delay: "4s" },
        ].map((s, i) => (
          <span
            key={i}
            className={s.big ? "star big" : "star"}
            style={
              {
                top: s.top,
                left: s.left,
                "--dur": s.dur,
                "--delay": s.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/80 backdrop-blur px-3 py-1.5 text-xs tracking-wide text-[var(--color-ink-600)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-mint-600)]" />
              {t("heroKicker")}
            </div>

            <h1
              className="mt-6 text-[2.75rem] md:text-6xl lg:text-[4.5rem] leading-[0.98] tracking-[-0.02em] font-serif text-[var(--color-ink-800)]"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
            >
              {t.rich("heroTitle", {
                accent: (chunks) => <span className="squiggle">{chunks}</span>,
                em: (chunks) => <em className="italic text-[var(--color-indigo-soft-600)]">{chunks}</em>,
              })}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--color-ink-500)] max-w-xl leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
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

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 text-sm">
              {[
                { k: "heroStatStoriesLabel", v: "heroStatStoriesValue" },
                { k: "heroStatLanguagesLabel", v: "heroStatLanguagesValue" },
                { k: "heroStatPrivacyLabel", v: "heroStatPrivacyValue" },
              ].map(({ k, v }) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-400)]">{t(k)}</dt>
                  <dd
                    className="mt-1 font-serif text-2xl text-[var(--color-ink-800)]"
                    style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                  >
                    {t(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Search card (#20) — replaces the mascot for now */}
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
