import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENRES, AGE_RANGES, ageLabel } from "@/data/mock-stories";
import { Sparkles, Wand2 } from "lucide-react";

/**
 * Footer — ink-800 band with mint accents. Four full-width columns: brand +
 * newsletter, Par âge, Par genre (interactive button first), Notre univers
 * (create button first). Newsletter capture is decorative for now; Phase 1
 * wires Brevo.
 */
export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const linkClass =
    "hover:text-[var(--color-cream-50)] transition-colors";
  const headingClass =
    "text-xs uppercase tracking-widest text-[var(--color-mint-400)] font-sans font-medium";

  return (
    <footer className="relative mt-24 band-ink text-[var(--color-cream-100)]">
      {/* Wavy top edge — an SVG in the footer's OWN color that rises into the
          page above, so the very top of the footer reads as a wave (not a
          straight line). Sits flush at the top, no separator line. */}
      <svg
        aria-hidden="true"
        className="absolute bottom-full left-0 w-full"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", height: "38px", fill: "var(--band-fill)" }}
      >
        <path d="M0,40 C120,10 240,30 360,22 C480,14 600,34 720,26 C840,18 960,36 1080,28 C1200,20 1320,34 1440,24 L1440,40 Z" />
      </svg>

      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 pb-10">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_0.8fr_1fr_1.2fr] lg:gap-12">
          {/* Col 1 — brand + description + newsletter */}
          <div>
            <div className="flex items-center gap-2.5">
              <FoxMark className="h-10 w-10" />
              <span className="font-serif text-2xl tracking-tight text-[var(--color-cream-50)]">
                Lunireve
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-indigo-soft-200)]">
              {t("footer.tagline")}
            </p>

            <form className="mt-6 max-w-sm" aria-label={t("footer.newsletterLabel")}>
              <label htmlFor="newsletter-email" className="text-xs uppercase tracking-widest text-[var(--color-mint-400)]">
                {t("footer.newsletterHeading")}
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="bg-[var(--color-ink-700)] border-[var(--color-ink-600)] text-[var(--color-cream-50)] placeholder:text-[var(--color-indigo-soft-300)] focus:border-[var(--color-mint-400)]"
                />
                <Button variant="mint" size="md" type="submit">
                  {t("footer.newsletterSubmit")}
                </Button>
              </div>
              <p className="mt-3 text-xs text-[var(--color-indigo-soft-300)]">
                {t("footer.newsletterNote")}
              </p>
            </form>
          </div>

          {/* Col 2 — Par âge */}
          <div>
            <h4 className={headingClass}>{t("footer.colByAge")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {AGE_RANGES.map((r) => (
                <li key={r}>
                  <Link
                    href={{ pathname: "/histoires/age/[range]", params: { range: r } }}
                    className={linkClass}
                  >
                    {ageLabel(r)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Par genre (interactive button first) */}
          <div>
            <h4 className={headingClass}>{t("footer.colByGenre")}</h4>
            <Link
              href={{ pathname: "/histoires", query: { interactive: "1" } }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-400)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-ink-800)] hover:bg-[var(--color-mint-300)] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("nav.interactiveStories")}
            </Link>
            <ul className="mt-4 space-y-2.5 text-sm">
              {GENRES.map((g) => (
                <li key={g}>
                  <Link
                    href={{ pathname: "/histoires/genre/[genre]", params: { genre: g } }}
                    className={linkClass}
                  >
                    {t(`genres.${g}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Notre univers (create button first) */}
          <div>
            <h4 className={headingClass}>{t("footer.colUniverse")}</h4>
            <Link
              href="/creer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cream-50)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-ink-800)] hover:bg-[var(--color-cream-200)] transition-colors"
            >
              <Wand2 className="h-3.5 w-3.5 text-[var(--color-indigo-soft-600)]" />
              {t("nav.create")}
            </Link>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/histoires" className={linkClass}>{t("nav.stories")}</Link></li>
              <li><Link href="/a-propos" className={linkClass}>{t("nav.about")}</Link></li>
              <li><Link href="/tarifs" className={linkClass}>{t("nav.pricing")}</Link></li>
              <li><Link href="/faq" className={linkClass}>{t("footer.faq")}</Link></li>
              <li><Link href="/blog" className={linkClass}>{t("footer.blog")}</Link></li>
              <li><Link href="/compte/proposer" className={linkClass}>{t("footer.writeWithUs")}</Link></li>
              <li><Link href="/compte" className={linkClass}>{t("nav.account")}</Link></li>
              <li><a href="mailto:hello@lunireve.com" className={linkClass}>{t("footer.contactUs")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-8 border-t border-[var(--color-ink-700)] flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[var(--color-indigo-soft-300)]">
          <p>© {year} Lunireve. {t("footer.rights")}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><a href="#" className="hover:text-[var(--color-cream-50)]">{t("footer.legal.terms")}</a></li>
            <li><a href="#" className="hover:text-[var(--color-cream-50)]">{t("footer.legal.privacy")}</a></li>
            <li><a href="#" className="hover:text-[var(--color-cream-50)]">{t("footer.legal.cookies")}</a></li>
            <li><a href="#" className="hover:text-[var(--color-cream-50)]">{t("footer.legal.gdpr")}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
