import type { MetadataRoute } from "next";

/**
 * /robots.txt — allow the public marketing + content site, block the
 * authenticated app and back office (both the FR default paths and their
 * /en translated equivalents). Points crawlers at the sitemap.
 */
const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://lunireve.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // FR (default locale, served at root)
        "/admin",
        "/compte",
        "/enfant",
        "/profils",
        "/creer",
        "/histoire-perso",
        "/connexion",
        "/inscription",
        // EN equivalents (under /en, see i18n/routing.ts)
        "/en/admin",
        "/en/account",
        "/en/child",
        "/en/profiles",
        "/en/create",
        "/en/my-story",
        "/en/login",
        "/en/signup",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
