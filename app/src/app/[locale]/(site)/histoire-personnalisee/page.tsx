// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { seoAlternates } from "@/lib/seo";
import {
  Sparkles,
  User,
  MapPin,
  Palette,
  Wand2,
  Check,
  HeartHandshake,
  Star,
  BookHeart,
  ArrowRight,
  Repeat,
  ChevronDown,
} from "lucide-react";

/**
 * Marketing explainer for personalized stories (linked from the footer).
 * Explains the benefit and what you get, walks through the 4-step process,
 * gives reasons to create one, and ends on a big CTA into /creer.
 */
export default async function PersonalizedStoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("personalizedPage");

  const gets = ["get1", "get2", "get3", "get4"] as const;

  const steps = [
    { id: "step-1-hero", icon: User, title: "step1Title", desc: "step1Desc", cover: "cover-indigo" },
    { id: "step-2-world", icon: MapPin, title: "step2Title", desc: "step2Desc", cover: "cover-meadow" },
    { id: "step-3-style", icon: Palette, title: "step3Title", desc: "step3Desc", cover: "cover-peach" },
    { id: "step-4-magic", icon: Wand2, title: "step4Title", desc: "step4Desc", cover: "cover-sea" },
  ] as const;

  const whys = [
    { icon: HeartHandshake, title: "why1Title", desc: "why1Desc" },
    { icon: Star, title: "why2Title", desc: "why2Desc" },
    { icon: BookHeart, title: "why3Title", desc: "why3Desc" },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(183,223,204,0.45) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(133,143,193,0.18) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-5 md:px-8 pt-14 md:pt-20 pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h1
            className="mx-auto mt-3 max-w-3xl font-serif text-4xl md:text-6xl leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {t.rich("title", { accent: (c) => <span className="squiggle">{c}</span> })}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-ink-500)] leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="primary" size="xl">
              <Link href="/creer">
                <Wand2 className="h-4 w-4" />
                {t("ctaButton")}
              </Link>
            </Button>
          </div>

          {/* What you get */}
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 text-left shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-widest text-[var(--color-indigo-soft-600)]">
              {t("getTitle")}
            </p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {gets.map((g) => (
                <li key={g} className="flex items-start gap-2.5 text-sm text-[var(--color-ink-700)]">
                  <span className="mt-0.5 rounded-full bg-[var(--color-mint-100)] p-0.5 text-[var(--color-mint-700)]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {t(g)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process — vertical, alternating sides, joined by curved dashed arrows */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("processKicker")}
          </p>
          <h2
            className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("processTitle")}
          </h2>
        </div>

        <ol className="mt-14">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const pictureLeft = i % 2 === 0; // step 1 & 3: picture left, text right
            return (
              <li key={s.title}>
                <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                  {/* Picture: real illustration when present (/img/steps/<id>.webp),
                      gradient + icon as the fallback. */}
                  <div className={cn(pictureLeft ? "md:order-1" : "md:order-2")}>
                    <div
                      className={cn(
                        s.cover,
                        "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl shadow-[var(--shadow-card)]"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/img/steps/${s.id}.webp`}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span
                        className="absolute left-5 top-4 font-serif text-5xl leading-none text-white/85 drop-shadow"
                        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}
                      >
                        {i + 1}
                      </span>
                      <span className="relative rounded-full bg-white/25 p-5 backdrop-blur-sm">
                        <Icon className="h-9 w-9 text-white" />
                      </span>
                    </div>
                  </div>
                  {/* Text */}
                  <div className={cn(pictureLeft ? "md:order-2" : "md:order-1")}>
                    <span className="text-xs uppercase tracking-widest text-[var(--color-indigo-soft-600)]">
                      {t("stepLabel")} {i + 1}
                    </span>
                    <h3
                      className="mt-2 font-serif text-2xl tracking-tight leading-snug"
                      style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                    >
                      {t(s.title)}
                    </h3>
                    <p className="mt-3 text-[var(--color-ink-500)] leading-relaxed">
                      {t(s.desc)}
                    </p>
                  </div>
                </div>

                {/* Simple vertical connector between steps (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex flex-col items-center py-6" aria-hidden>
                    <span className="h-14 w-px border-l-2 border-dotted border-[var(--color-indigo-soft-300)]" />
                    <ChevronDown className="-mt-1 h-5 w-5 text-[var(--color-indigo-soft-400)]" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Bonus step 5 — same rhythm as the four steps above (numbered
            picture + text), but framed in dashed mint and badged so it reads
            as optional rather than required. */}
        <div className="hidden md:flex flex-col items-center py-6" aria-hidden>
          <span className="h-14 w-px border-l-2 border-dotted border-[var(--color-mint-500)]" />
          <ChevronDown className="-mt-1 h-5 w-5 text-[var(--color-mint-500)]" />
        </div>

        <div className="relative mt-6 rounded-[2rem] border-2 border-dashed border-[var(--color-mint-500)] bg-[var(--color-mint-50)] p-6 md:mt-0 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            {/* Picture */}
            <div>
              <div className="cover-mint relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/steps/step-5-sequel.webp"
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  className="absolute left-5 top-4 font-serif text-5xl leading-none text-white/85 drop-shadow"
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}
                >
                  5
                </span>
                <span className="relative rounded-full bg-white/25 p-5 backdrop-blur-sm">
                  <Repeat className="h-9 w-9 text-white" />
                </span>
              </div>
            </div>
            {/* Text */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-400)]/40 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[var(--color-ink-700)]">
                <Sparkles className="h-3 w-3" />
                {t("bonusBadge")}
              </span>
              <h3
                className="mt-3 font-serif text-2xl tracking-tight leading-snug"
                style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
              >
                {t("bonusTitle")}
              </h3>
              <p className="mt-3 text-[var(--color-ink-600)] leading-relaxed">
                {t("bonusDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-[var(--color-cream-100)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
              {t("whyKicker")}
            </p>
            <h2
              className="mx-auto mt-3 max-w-2xl font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("whyTitle")}
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
            {whys.map((w) => {
              const Icon = w.icon;
              return (
                <article
                  key={w.title}
                  className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-7"
                >
                  <span className="inline-flex rounded-2xl bg-[var(--color-mint-100)] p-2.5 text-[var(--color-mint-700)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3
                    className="mt-5 font-serif text-xl tracking-tight"
                    style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                  >
                    {t(w.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-500)]">
                    {t(w.desc)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-12 md:py-16">
        <div className="band-ink relative overflow-hidden rounded-[2rem] p-9 md:p-14 text-center text-[var(--color-cream-50)]">
          <Sparkles aria-hidden className="absolute right-8 top-8 h-10 w-10 text-[var(--color-mint-400)] opacity-50" />
          <h2
            className="mx-auto max-w-2xl font-serif text-3xl md:text-4xl tracking-tight leading-[1.1]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-indigo-soft-200)] leading-relaxed">
            {t("ctaBody")}
          </p>
          <Button asChild variant="mint" size="xl" className="mt-8">
            <Link href="/creer">
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "personalizedPage" });
  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
    alternates: seoAlternates(locale, "/histoire-personnalisee"),
  };
}
