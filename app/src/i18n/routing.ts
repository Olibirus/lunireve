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
    "/histoire-personnalisee": {
      fr: "/histoire-personnalisee",
      en: "/personalised-story",
    },
    "/tarifs": {
      fr: "/tarifs",
      en: "/pricing",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/faq": "/faq",
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
    "/profils/[id]": {
      fr: "/profils/[id]",
      en: "/profiles/[id]",
    },
    "/compte/abonnement": {
      fr: "/compte/abonnement",
      en: "/account/subscription",
    },
    "/compte/newsletter": {
      fr: "/compte/newsletter",
      en: "/account/newsletter",
    },
    "/enfant": {
      fr: "/enfant",
      en: "/child",
    },
    "/histoire-perso/[id]": {
      fr: "/histoire-perso/[id]",
      en: "/my-story/[id]",
    },
    "/compte/favoris": {
      fr: "/compte/favoris",
      en: "/account/favorites",
    },
    "/compte/histoires": {
      fr: "/compte/histoires",
      en: "/account/stories",
    },
    "/compte/personnages": {
      fr: "/compte/personnages",
      en: "/account/characters",
    },
    "/compte/personnages/nouveau": {
      fr: "/compte/personnages/nouveau",
      en: "/account/characters/new",
    },
    "/compte/parametres": {
      fr: "/compte/parametres",
      en: "/account/settings",
    },
    "/compte/proposer": {
      fr: "/compte/proposer",
      en: "/account/submit",
    },
    "/admin": "/admin",
    "/admin/histoires": "/admin/histoires",
    "/admin/moderation": "/admin/moderation",
    "/admin/utilisateurs": "/admin/utilisateurs",
    "/admin/blog": "/admin/blog",
    "/admin/blog/[slug]": "/admin/blog/[slug]",
    "/admin/analytics": "/admin/analytics",
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
