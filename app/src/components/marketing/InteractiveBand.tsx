import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GitBranch, Sparkles, ArrowRight } from "lucide-react";

/**
 * Homepage section for INTERACTIVE stories (a Lunireve differentiator): a
 * short pitch plus a decorative "choice card" showing exactly what happens
 * mid-story, so parents get it in two seconds. CTA opens the library
 * pre-filtered on interactive stories.
 */
export function InteractiveBand() {
  const t = useTranslations("interactiveBand");
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-12">
      <div className="grid items-center gap-10 rounded-[2rem] border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-8 md:grid-cols-2 md:p-14">
        {/* Pitch */}
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-fox-700)]">
            <GitBranch className="h-3.5 w-3.5" />
            {t("kicker")}
          </p>
          <h2
            className="mt-2 max-w-xl font-serif text-3xl md:text-4xl tracking-tight leading-[1.1]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
            {t("body")}
          </p>
          <Button asChild variant="primary" size="lg" className="mt-7">
            <Link href={{ pathname: "/histoires", query: { interactive: "1" } }}>
              <Sparkles className="h-4 w-4 text-[var(--color-mint-400)]" />
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Decorative choice card: what an interactive story looks like */}
        <div aria-hidden className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 shadow-[var(--shadow-card)] rotate-[0.6deg]">
            <p className="font-serif text-lg leading-relaxed text-[var(--color-ink-700)] italic">
              {t("demoText")}
            </p>
            {/* Branch connector */}
            <div className="mx-auto mt-4 h-6 w-px border-l-2 border-dashed border-[var(--color-indigo-soft-300)]" />
            <div className="mt-1 grid grid-cols-2 gap-3">
              <span className="rounded-2xl border-2 border-[var(--color-mint-400)] bg-[var(--color-mint-50)] px-4 py-3 text-center text-sm font-medium text-[var(--color-ink-800)]">
                {t("choiceA")}
              </span>
              <span className="rounded-2xl border-2 border-[var(--color-indigo-soft-300)] bg-[var(--color-indigo-soft-50)] px-4 py-3 text-center text-sm font-medium text-[var(--color-ink-800)]">
                {t("choiceB")}
              </span>
            </div>
            <p className="mt-4 text-center text-xs text-[var(--color-ink-400)]">
              {t("demoHint")}
            </p>
          </div>
          {/* Soft glow behind the card */}
          <div
            className="absolute inset-0 -z-10 -m-6 rounded-[3rem] opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(183,223,204,0.7) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(133,143,193,0.35) 0%, transparent 55%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
