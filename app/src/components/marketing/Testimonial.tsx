import { useTranslations } from "next-intl";

/**
 * Testimonial — single editorial pull-quote. One parent, one voice.
 *
 * Intentionally quiet. No carousel. No 3-up. Just one human saying one true
 * thing — because on a kids' platform, trust is everything and noise is
 * suspicious.
 */
export function Testimonial() {
  const t = useTranslations("home.testimonial");

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="relative rounded-[2rem] overflow-hidden border border-[var(--color-indigo-soft-200)] bg-[var(--color-cream-100)]">
          {/* Decorative giant quote */}
          <span
            aria-hidden
            className="absolute -top-20 -left-2 font-serif text-[22rem] leading-none text-[var(--color-indigo-soft-500)]/15 select-none"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
          >
            “
          </span>

          <div className="relative px-6 md:px-16 py-16 md:py-20 grid md:grid-cols-[auto_1fr] gap-10 items-center">
            {/* Portrait — placeholder gradient until photos arrive */}
            <div className="relative hidden md:block">
              <div className="size-32 rounded-full cover-meadow border-4 border-[var(--color-cream-50)] shadow-[var(--shadow-soft)]" />
              <div className="absolute -bottom-2 -right-2 rounded-full bg-[var(--color-ink-800)] text-[var(--color-cream-50)] text-[10px] uppercase tracking-widest px-3 py-1.5">
                {t("badge")}
              </div>
            </div>

            <div>
              <blockquote
                className="font-serif text-[1.65rem] md:text-3xl lg:text-[2.25rem] leading-[1.25] text-[var(--color-ink-800)] tracking-tight"
                style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 40, 'wght' 450" }}
              >
                <p>{t("quote")}</p>
              </blockquote>

              <div className="mt-8 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-3 md:hidden">
                  <div className="size-10 rounded-full cover-meadow" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-ink-800)]">{t("author")}</p>
                  <p className="text-[var(--color-ink-500)]">{t("authorRole")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
