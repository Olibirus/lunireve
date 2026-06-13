import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Footer — ink-800 band with mint accents. Four columns on desktop, collapses.
 * Newsletter capture is decorative for now; Phase 1 wires it to Brevo.
 */
export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand + newsletter — spans 2 cols on desktop */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <FoxMark className="h-10 w-10" />
              <span className="font-serif text-2xl tracking-tight text-[var(--color-cream-50)]">
                Lunireve
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-indigo-soft-200)]">
              {t("footer.tagline")}
            </p>

            <form className="mt-8 max-w-md" aria-label={t("footer.newsletterLabel")}>
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

          {/* Product links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-mint-400)] font-sans font-medium">
              {t("footer.colProduct")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/histoires" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.stories")}</Link></li>
              <li><Link href="/histoires/audio" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.audioStories")}</Link></li>
              <li><Link href="/creer" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.create")}</Link></li>
              <li><Link href="/tarifs" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.pricing")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-mint-400)] font-sans font-medium">
              {t("footer.colCompany")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/a-propos" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.about")}</Link></li>
              <li><a href="mailto:hello@lunireve.com" className="hover:text-[var(--color-cream-50)] transition-colors">{t("footer.contact")}</a></li>
              <li><Link href="/blog" className="hover:text-[var(--color-cream-50)] transition-colors">{t("nav.blog")}</Link></li>
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
