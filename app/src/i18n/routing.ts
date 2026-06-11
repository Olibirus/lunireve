import { defineRouting } from "next-intl/routing";

/**
 * i18n routing configuration.
 *
 * Launch plan: French content first, English architecture ready from day 1.
 * Adding EN content is just populating translations and story pairs — no refactor.
 *
 * URL structure:
 *   /fr/histoires/...   (French — default, served at /)
 *   /en/stories/...     (English)
 *
 * `localePrefix: "as-needed"` means FR (default) URLs have no prefix,
 * EN URLs are prefixed with /en. This keeps FR URLs clean for SEO.
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // Translated pathnames — critical for SEO.
  // We'll expand this as we add pages.
  pathnames: {
    "/": "/",
    "/histoires": {
      fr: "/histoires",
      en: "/stories",
    },
    "/histoires/[slug]": {
      fr: "/histoires/[slug]",
      en: "/stories/[slug]",
    },
    "/histoires/genre/[genre]": {
      fr: "/histoires/genre/[genre]",
      en: "/stories/genre/[genre]",
    },
    "/histoires/age/[range]": {
      fr: "/histoires/age/[range]",
      en: "/stories/age/[range]",
    },
    "/histoires/audio": {
      fr: "/histoires/audio",
      en: "/stories/audio",
    },
    "/histoires/duree/[bucket]": {
      fr: "/histoires/duree/[bucket]",
      en: "/stories/duration/[bucket]",
    },
    "/creer": {
      fr: "/creer",
      en: "/create",
    },
    "/tarifs": {
      fr: "/tarifs",
      en: "/pricing",
    },
    "/blog": "/blog",
    "/a-propos": {
      fr: "/a-propos",
      en: "/about",
    },
    "/compte": {
      fr: "/compte",
      en: "/account",
    },
    "/profils": {
      fr: "/profils",
      en: "/profiles",
    },
    "/profils/nouveau": {
      fr: "/profils/nouveau",
      en: "/profiles/new",
    },
    "/enfant": {
      fr: "/enfant",
      en: "/child",
    },
    "/admin": "/admin",
    "/connexion": {
      fr: "/connexion",
      en: "/login",
    },
    "/inscription": {
      fr: "/inscription",
      en: "/signup",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
