# "Écrire avec nous" / Write with us — parked until V2

Feature: logged-in users submit their own story, it lands in an admin
moderation queue, and approving it publishes it to the library.

Removed from the live app on 2026-07-18 (Harry's call: ship in V2). Nothing
was deleted, everything needed to switch it back on is in this folder. This
folder is OUTSIDE `src/`, so Next.js never routes or bundles it.

## Files here

| File | Goes back to |
|---|---|
| `proposer-page.tsx` | `src/app/[locale]/(app)/compte/proposer/page.tsx` |
| `db-submissions.ts` | `src/db/submissions.ts` |
| `actions-submissions.ts` | `src/app/actions/submissions.ts` |
| `admin-moderation-with-submissions.tsx` | `src/app/[locale]/(admin)/admin/moderation/page.tsx` (full page as it was, submissions queue included) |

## To restore

1. Move the four files back to the paths above (drop the `db-` / `actions-`
   prefixes, rename `proposer-page.tsx` to `page.tsx`).
2. Re-add the route in `src/i18n/routing.ts` (look for the "parked until V2"
   comment):
   ```ts
   "/compte/proposer": { fr: "/compte/proposer", en: "/account/submit" },
   ```
3. Re-add the two entry points (both marked with a "parked until V2" comment):
   - `src/components/account/AccountSidebar.tsx`:
     `{ href: "/compte/proposer", label: t("submit"), icon: PenLine },`
     (re-import `PenLine` from lucide-react)
   - `src/components/layout/Footer.tsx`:
     `<li><Link href="/compte/proposer" className={linkClass}>{t("footer.writeWithUs")}</Link></li>`
4. Nothing to do for translations: every key is still in `messages/fr.json`
   and `messages/en.json` (`submit.*`, `account.menu.submit`,
   `footer.writeWithUs`), key-synced and unused in the meantime.

## Notes worth keeping

- No DB migration is needed. Submissions are rows in the existing `stories`
  table, marked `genre = "soumission"`:
  `draft` = pending review (never public), `published` = approved (live in the
  library), `archived` = rejected.
- The legal consent is the important part. The submit button stays disabled
  until the author ticks the box, and the server records a snapshot
  (`consent: { version, acceptedAt, locale }`) on the row, shown to the admin
  in the moderation dialog as proof of what was accepted and when.
- `SUBMISSION_TERMS_VERSION` in `actions-submissions.ts` must be bumped
  whenever the wording of the `submit.terms1..7` messages changes, otherwise
  old consents look like they covered the new terms.
- The terms cover: no automatic publication, possible edits/rewrites/
  illustration/translation/print, author keeps authorship, originality
  warranty, worldwide free perpetual transferable licence, no royalties or
  payment of any kind, indemnity, and Lunireve's right to withdraw.
- A `"use server"` file may only export async functions: keep
  `SUBMISSION_TERMS_VERSION` a private const in that file (it was an exported
  const once and broke the build).
