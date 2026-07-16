import { getPathname } from "@/i18n/navigation";
import type { Metadata } from "next";

/**
 * SEO helpers: canonical + hreflang alternates for every indexable page, so
 * Google understands the FR page at `/histoires` and the EN page at
 * `/en/stories` are the same content in two languages (instead of duplicates),
 * and knows which one to rank for which market. FR is the x-default (primary
 * market + default locale).
 */

export const SITE_URL = "https://lunireve.com";

/** Typed href accepted by next-intl's getPathname (string or {pathname, params}). */
type Href = Parameters<typeof getPathname>[0]["href"];

export function seoAlternates(locale: string, href: Href): Metadata["alternates"] {
  const fr = SITE_URL + getPathname({ locale: "fr", href });
  const en = SITE_URL + getPathname({ locale: "en", href });
  return {
    canonical: locale === "en" ? en : fr,
    languages: { fr, en, "x-default": fr },
  };
}

/** Absolute URL of a page in the given locale (for JSON-LD). */
export function absoluteUrl(locale: string, href: Href): string {
  return SITE_URL + getPathname({ locale: locale === "en" ? "en" : "fr", href });
}

/** Shared Organization node, referenced by the other schemas. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Lunireve",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-s.png`,
  };
}

export function webSiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Lunireve",
    url: SITE_URL,
    inLanguage: locale === "en" ? "en" : "fr",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}${locale === "en" ? "/en/stories" : "/histoires"}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
