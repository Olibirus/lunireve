// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/Accordion";
import { SectionStars } from "@/components/marketing/SectionStars";
import { GlowCard } from "@/components/marketing/GlowCard";
import { seoAlternates } from "@/lib/seo";
import { FAQ_FR, FAQ_EN } from "@/data/faq";
import { Library, Sparkles, Wand2, BookHeart, ArrowRight } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tFaq = await getTranslations("faq");

  // A focused FAQ on the About page: 2 from "how it works" + 1 each from
  // pricing and privacy. Full list lives on /faq.
  const allFaq = locale === "fr" ? FAQ_FR : FAQ_EN;
  const aboutFaq = [
    ...allFaq[0].items.slice(0, 2),
    allFaq[1].items[0],
    allFaq[4].items[0],
  ];

  // The four core services, used for the strengths strip and the detail section.
  const services = [
    { icon: Library, key: "svcLibrary" },
    { icon: Sparkles, key: "svcInteractive" },
    { icon: Wand2, key: "svcPersonalized" },
    { icon: BookHeart, key: "svcPrinted" },
  ] as const;

  return (
    <>
      {/* Intro */}
      <section className="relative isolate overflow-hidden">
        <SectionStars />
        <div
          aria-hidden
          className="absolute inset-0 -z-[5] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(183,223,204,0.45) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(133,143,193,0.18) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-24 pb-12">
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
              {/* Extra twinkles hugging the logo (on top of the section field) */}
              <div aria-hidden className="star-field absolute inset-0 pointer-events-none">
                {[
                  { top: "12%", left: "18%", dur: "2.6s", delay: "0.2s", big: true },
                  { top: "8%", left: "72%", dur: "3.4s", delay: "1.4s" },
                  { top: "70%", left: "10%", dur: "3s", delay: "0.8s" },
                  { top: "78%", left: "80%", dur: "2.8s", delay: "2s", big: true },
                ].map((s, i) => (
                  <span
                    key={i}
                    className={s.big ? "star big" : "star"}
                    style={{ top: s.top, left: s.left, "--dur": s.dur, "--delay": s.delay } as React.CSSProperties}
                  />
                ))}
              </div>
              {/* Brand illustration, drifting softly like a cloud: bare image,
                  no frame, no border, no shadow */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/website/about-us.webp"
                alt="Lunireve"
                className="float-soft relative mx-auto w-full max-w-md"
              />
            </div>
          </div>

          {/* Strengths (stat style) directly under the hero */}
          <div className="relative mt-12">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)]">
              {t("strengthsKicker")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {services.map(({ icon: Icon, key }) => (
                <GlowCard
                  key={key}
                  className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]"
                >
                  <Icon className="h-5 w-5 text-[var(--color-indigo-soft-600)]" />
                  <p
                    className="mt-3 font-serif text-lg leading-tight tracking-tight"
                    style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 30, 'wght' 500" }}
                  >
                    {t(`${key}Short`)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-500)]">{t(`${key}Tag`)}</p>
                </GlowCard>
              ))}
            </div>
          </div>
        </div>
        <div className="dot-rule mx-auto max-w-7xl" aria-hidden />
      </section>

      {/* Why Lunireve / story — illustration left, text right */}
      <section className="relative isolate overflow-hidden mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24">
        <SectionStars offset={7} />
        <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1fr] md:gap-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/website/why-lunireve.webp"
            alt=""
            aria-hidden
            className="w-full rounded-[2rem] shadow-[var(--shadow-card)]"
          />
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
              {t("storyKicker")}
            </p>
            <article className="prose-reading mt-4 max-w-[58ch]">
              <p>{t("storyP1")}</p>
              <p>{t("storyP2")}</p>
              <p>{t("storyP3")}</p>
            </article>
          </div>
        </div>
      </section>

      {/* Services — one block per core offering */}
      <section className="relative isolate overflow-hidden bg-[var(--color-cream-100)] border-y border-[var(--color-ink-100)]">
        <SectionStars offset={3} />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)]">
              {t("servicesKicker")}
            </p>
            <h2
              className="mt-3 font-serif text-3xl md:text-5xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("servicesTitle")}
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {services.map(({ icon: Icon, key }) => (
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

      {/* FAQ */}
      <section className="relative isolate overflow-hidden mx-auto max-w-3xl px-5 md:px-8 py-16">
        <SectionStars offset={10} />
        <h2
          className="mb-6 text-center font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {tFaq("title")}
        </h2>
        <Accordion items={aboutFaq.map((i) => ({ question: i.q, answer: i.a }))} />
        <p className="mt-6 text-center text-sm text-[var(--color-ink-500)]">
          <Link href="/faq" className="font-medium underline underline-offset-2">
            {tFaq("seeAll")}
          </Link>
        </p>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden mx-auto max-w-7xl px-5 md:px-8 pb-20 md:pb-28">
        <SectionStars offset={2} />
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
              {/* Visible resting background so it reads as a button (not a link) */}
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="bg-white/10 text-[var(--color-cream-50)] ring-1 ring-inset ring-white/20 hover:bg-white/20"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("kicker"), description: t("lead"), alternates: seoAlternates(locale, "/a-propos") };
}
