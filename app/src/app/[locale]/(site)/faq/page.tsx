import { setRequestLocale, getTranslations } from "next-intl/server";
import { Accordion } from "@/components/ui/Accordion";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";
import { FAQ_FR, FAQ_EN } from "@/data/faq";
import type { Metadata } from "next";

/** Dedicated FAQ page (#28) — accordion per section, one answer open at a time. */
export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  const sections = locale === "fr" ? FAQ_FR : FAQ_EN;

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-3xl px-5 md:px-8 pt-12 md:pt-20 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h1
            className="mt-3 font-serif text-4xl md:text-6xl leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-ink-500)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 md:px-8 pb-16 space-y-10">
        {sections.map((section) => (
          <div key={section.id} id={section.id}>
            <h2
              className="mb-4 font-serif text-2xl tracking-tight"
              style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
            >
              {t(`sections.${section.titleKey}`)}
            </h2>
            <Accordion items={section.items.map((i) => ({ question: i.q, answer: i.a }))} />
          </div>
        ))}

        <p className="text-center text-sm text-[var(--color-ink-500)]">
          {t("contactPrompt")}{" "}
          <a href="mailto:hello@lunireve.com" className="font-medium underline underline-offset-2">
            hello@lunireve.com
          </a>
        </p>
      </section>

      <NewsletterBand />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title"), description: t("subtitle") };
}
