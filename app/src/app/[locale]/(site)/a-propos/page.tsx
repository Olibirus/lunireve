import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FoxCloud } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Feather,
  HeartHandshake,
  Globe2,
  BookHeart,
  ArrowRight,
} from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { icon: BookHeart, key: "valueLiterary" },
    { icon: HeartHandshake, key: "valueFamily" },
    { icon: Feather, key: "valueCrafted" },
    { icon: Globe2, key: "valueBilingual" },
  ] as const;

  const trust = [
    { icon: ShieldCheck, key: "trustGdpr" },
    { icon: Sparkles, key: "trustAi" },
    { icon: Stethoscope, key: "trustPediatric" },
  ] as const;

  return (
    <>
      {/* Intro */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(183,223,204,0.45) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(133,143,193,0.18) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-24 pb-16">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
                {t("kicker")}
              </p>
              <h1
                className="mt-3 font-serif text-4xl md:text-6xl leading-[1.03] tracking-tight"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
              >
                {t.rich("title", {
                  accent: (chunks) => <span className="squiggle">{chunks}</span>,
                })}
              </h1>
              <p className="mt-6 text-lg text-[var(--color-ink-500)] leading-relaxed max-w-2xl">
                {t("lead")}
              </p>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -m-8 rounded-[48%] opacity-70 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(183,223,204,0.85) 0%, rgba(248,180,135,0.3) 55%, transparent 70%)",
                }}
              />
              <FoxCloud className="relative w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
        <div className="dot-rule mx-auto max-w-7xl" aria-hidden />
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-[160px_1fr] gap-8 md:gap-14">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
              {t("storyKicker")}
            </p>
          </div>
          <article className="prose-reading max-w-[62ch]">
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
            <p>{t("storyP3")}</p>
          </article>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--color-cream-100)] border-y border-[var(--color-ink-100)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)]">
              {t("valuesKicker")}
            </p>
            <h2
              className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("valuesTitle")}
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {values.map(({ icon: Icon, key }) => (
              <article
                key={key}
                className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 shadow-[var(--shadow-soft)]"
              >
                <span className="inline-flex rounded-2xl bg-[var(--color-mint-200)] p-3 text-[var(--color-ink-800)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3
                  className="mt-5 font-serif text-xl tracking-tight"
                  style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                >
                  {t(`${key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink-500)] leading-relaxed">
                  {t(`${key}Desc`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)]">
              {t("trustKicker")}
            </p>
            <h2
              className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("trustTitle")}
            </h2>
          </div>
          <p className="text-[var(--color-ink-500)] md:max-w-sm leading-relaxed">
            {t("trustSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-7">
          {trust.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-7"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-2 text-[var(--color-ink-700)]">
                  <Icon className="h-4 w-4" />
                </span>
                <Badge variant="mint">{t(`${key}Badge`)}</Badge>
              </div>
              <h3
                className="mt-5 font-serif text-xl tracking-tight"
                style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
              >
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-ink-500)] leading-relaxed">
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] band-ink text-[var(--color-cream-50)] px-6 md:px-14 py-14 md:py-20">
          <div
            aria-hidden
            className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(183,223,204,0.35) 0%, transparent 65%)",
            }}
          />
          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-mint-400)]">
              {t("ctaKicker")}
            </p>
            <h2
              className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 text-[var(--color-indigo-soft-200)] leading-relaxed">
              {t("ctaBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="mint" size="lg">
                <Link href="/histoires">
                  {t("ctaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
              >
                <a href="mailto:hello@lunireve.com">{t("ctaSecondary")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
