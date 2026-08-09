# Newsletter — parked until V2

The weekly "Lettre du renard" newsletter: footer capture form, the
`NewsletterBand` marketing section (homepage, blog, FAQ, personalized-story
page), the `/compte/newsletter` preferences page and its sidebar entry.

Removed from the live app on 2026-08-09 (Harry's call: ship in V2 with the
real Brevo integration). Nothing was deleted, everything needed to switch it
back on is in this folder. This folder is OUTSIDE `src/`, so Next.js never
routes or bundles it.

## Files here

| File | Goes back to |
|---|---|
| `NewsletterBand.tsx` | `src/components/marketing/NewsletterBand.tsx` |
| `compte-newsletter-page.tsx` | `src/app/[locale]/(app)/compte/newsletter/page.tsx` |
| `footer-form-snippet.tsx` | the capture form inside `src/components/layout/Footer.tsx`, col 1, right after the tagline paragraph |

## To restore

1. Move `NewsletterBand.tsx` back to `src/components/marketing/`, then re-add
   `<NewsletterBand />` at the end of:
   - `src/app/[locale]/(site)/page.tsx`
   - `src/app/[locale]/(site)/blog/page.tsx`
   - `src/app/[locale]/(site)/blog/[slug]/page.tsx`
   - `src/app/[locale]/(site)/faq/page.tsx`
   - `src/app/[locale]/(site)/histoire-personnalisee/page.tsx`
2. Move `compte-newsletter-page.tsx` back to
   `src/app/[locale]/(app)/compte/newsletter/page.tsx`.
3. Re-add the `/compte/newsletter` entry in `src/i18n/routing.ts` (pathnames:
   fr `/compte/newsletter`, en `/account/newsletter`).
4. Re-add the sidebar link in `src/components/account/AccountSidebar.tsx`:
   `{ href: "/compte/newsletter", label: t("newsletter"), icon: Mail },`
5. Paste `footer-form-snippet.tsx` back into `Footer.tsx` (col 1) and restore
   the `Input`/`Button` imports if they are no longer used elsewhere there.
6. Re-add the "Newsletter" row in
   `src/app/[locale]/(app)/compte/parametres/page.tsx`.

## Kept in place on purpose

- All `newsletter*` / `newsletter_prefs` keys in `messages/fr.json` +
  `messages/en.json` (untouched, so nothing to re-translate).
- The `newsletter_subscribers` table in `src/db/schema.ts`.
- The newsletter counters in the admin dashboard/analytics (real data, zeros
  until the feature ships).
