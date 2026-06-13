# Lunireve — Session Guide (for splitting Claude Code work)

Read this + `BRIEF_FINAL.md` at the start of every session. Commit before
switching sessions. One repo always: `github.com/Olibirus/lunireve`,
code in `app/`. Run `pnpm build` after each batch (must stay green).

## Hard rules (every session)
- NO em dashes anywhere user-visible (use commas/colons).
- Admin shows REAL data only (zeros, never fake numbers).
- Age taxonomy: 1-2 / 3-4 / 5-6 / 7-8 / 9-10 / 11-12 (`ageLabel`, `ageToRange` in `data/mock-stories.ts`).
- Client state lives in localStorage stores that MIRROR the DB schema:
  `lib/profiles.ts`, `lib/customStories.ts`, `lib/characters.ts`,
  `lib/notifications.ts`, `lib/adminBlog.ts`. Keep shapes aligned with `db/schema.ts`.
- `messages/fr.json` + `messages/en.json` must stay key-synced. **Only ONE
  session may edit messages at a time** (parallel edits = merge conflicts).
- Temp auth still active: `user/123456`, `admin/123456` (+ real Supabase signup).

## Route groups (`app/[locale]/`)
- `(site)` — public, has Header/Footer
- `(app)` — auth-gated family area (profiles, child bubble, /compte/*, /creer, /histoire-perso)
- `(admin)` — ink-sidebar back-office

## How to split into parallel sessions WITHOUT conflicts
Each session owns a folder set. They don't overlap, except messages (serialize that).

| Session | Owns (edit only here) | Don't touch |
|---|---|---|
| **A — Public site** | `(site)/*`, `components/marketing/*`, `components/story/*`, `components/layout/*` | admin, (app) |
| **B — User area** | `(app)/*`, `lib/profiles.ts`, `lib/customStories.ts`, `lib/characters.ts` | admin, (site) |
| **C — Admin** | `(admin)/*`, `components/admin/*`, `data/mock-admin.ts`, `lib/adminBlog.ts` | (site), (app) |
| **D — Backend/infra** | `lib/ai/*`, `lib/supabase/*`, `db/*`, `app/actions/*`, `n8n/*` | UI folders |

If two sessions must run at the same time, use `git worktree` (one branch each).
Whoever needs to edit `messages/*.json` does it alone, commits, others pull.

### Copy-paste starter for each session
> You are working on the Lunireve project at
> `C:\Users\Harry\olibrius-project\06_personal-projects\lunireve\app`.
> First read `../SESSION_GUIDE.md` and `../BRIEF_FINAL.md`.
> This session is **Session [A/B/C/D]** — only edit the folders that session
> owns (see the table). Follow the hard rules (no em dashes, real admin data,
> age taxonomy, keep fr/en message keys in sync). Run `pnpm build` after each
> change and commit to `main` when green. Today's task: [PASTE TASK].

## Remaining work (items 2-10 from the latest feedback, unassigned)
- **#2** FAQ: 2-column on desktop, add more SEO-friendly Q&A → Session A (`data/faq.ts`, `(site)/faq`, About).
- **#3** Navbar Age dropdown too wide → Session A (`components/layout/Header.tsx`).
- **#4** Histoire dropdown: open right-to-left → Session A (Header NavDropdown align).
- **#5** Footer: full-width columns (Company / By Age / By Genre + interactive button / La Maison) → Session A (`components/layout/Footer.tsx`).
- **#6** Admin analytics: all columns per story (age/genre/gender...) + sortable header + Excel-style filter → Session C (`(admin)/admin/analytics`, `data/mock-admin.ts`).
- **#7** Admin blog editor: image upload (Supabase Storage), nice format → Session C + D (`(admin)/admin/blog/[slug]`, storage helper).
- **#8** Blog article text column a bit wider → Session A (`(site)/blog/[slug]`).
- **#9** Library: sort by best rating + most liked → Session A (`(site)/histoires`, `lib/stories/filter.ts`).
- **#10** In-profile pricing: comparison table under the 3 tiers, premium very attractive → Session B (`components/marketing/PricingPlans.tsx` or new `PricingTable`).

## Backend status (Session D territory)
- Supabase: schema deployed (Paris), real signup/login works. **Data layer
  still localStorage** — swapping to DB queries is the big unblock (makes
  personalized-story links shareable cross-device).
- n8n: workflow "Lunireve - Story Generation" exists (id `EgBcdBhzTZkhCPop`,
  INACTIVE, real keys). Needs: activate + webhook + call from `app/actions/generateStory.ts`.
- Image + audio generation: see `BRIEF_FINAL.md` + the README files. Decisions
  pending (see chat: recommend GPT Image 1 / Flux for images, OpenAI TTS now).
- Brevo, Stripe: V2.
