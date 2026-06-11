import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FoxMark } from "@/components/brand/FoxCloud";
import { ArrowRight, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <Header />
      <main className="flex-1">
    <section className="relative mx-auto max-w-3xl px-5 md:px-8 py-24 md:py-36 text-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-2 text-xs tracking-widest uppercase text-[var(--color-ink-500)]">
        <FoxMark className="h-6 w-6" />
        {t("kicker")}
      </div>
      <h1
        className="mt-8 font-serif text-[5rem] md:text-[9rem] leading-none tracking-tight text-[var(--color-ink-800)]"
        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1, 'wght' 500" }}
      >
        404
      </h1>
      <h2
        className="mt-2 font-serif text-2xl md:text-3xl tracking-tight"
        style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
      >
        {t("title")}
      </h2>
      <p className="mt-4 text-[var(--color-ink-500)] leading-relaxed max-w-md mx-auto">
        {t("body")}
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary" size="lg">
          <Link href="/">
            <BookOpen className="h-4 w-4" />
            {t("ctaHome")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/histoires">
            {t("ctaLibrary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
      </main>
      <Footer />
    </>
  );
}
