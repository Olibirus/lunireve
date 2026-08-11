# Lunireve — Session Guide (for splitting Claude Code work)

Read this + `BRIEF_FINAL.md` at the start of every session. One repo
always: `github.com/Olibirus/lunireve`, code in `app/`. Run `pnpm build`
after each batch (must stay green).

## Cross-session changes log
2026-08-11 [Session A]: touched app/[locale]/layout.tsx + globals.css — reading prefs (text size / dyslexia font) now live as data-reading-size / data-reading-dyslexia on <html>, written by the existing pre-paint inline script, so a saved choice applies on the first frame instead of flashing after hydration. ReadingSettings writes the attributes (was classes on #story-body); old .reading-size-* classes kept as the no-JS default. Decided AGAINST meshistoiresdusoir's ?TextSize= URL variants (duplicate URLs, zero SEO gain, full reload).
2026-08-10 [Session A]: FIXED story lists rendering empty in the static HTML. Cause: loading.tsx on /histoires (and /histoires/[slug]) baked its skeleton into the prerender, so deep-link filters never applied and crawlers saw zero stories. Both loading.tsx moved to app/_archive/loading-skeletons (README explains why not to restore). Also replaced useSearchParams with new lib/useUrlQuery.ts (useSyncExternalStore on location.search + patched pushState) in LibraryBrowser/StoryFunnel: keeps pages prerendered while filters stay reactive. EN age wording de-duplicated (funnel.ageTitle/seoAgeTitle).
2026-08-10 [Session B]: touched lib/supabase/storage.ts + actions/{generateStory,customStories}.ts (D) — generated covers are re-encoded to WebP before upload (new toWebp(), path is now hero.webp; falls back to PNG if sharp fails), and sharp moved from devDependencies to dependencies since it now runs at request time. Favoris page rebuilt to match the personalized-stories cards.
2026-08-10 [Session A]: promo card on ALL story lists (StoryFunnel now uses StoryGrid; position = last if <=6 stories else 5th), no hover pop + GlowCard border + shine-cta sweep in globals.css; ageLabel(range, locale) threaded through footer/header/cards/filters (EN shows "years"); hero text before search card on mobile; perso page: dotted connectors replace curved arrows, bonus step 5 matches the other steps, /img/steps/<id>.webp slots + docs/STEP_IMAGE_PROMPTS.md
2026-08-09 [Session A]: newsletter parked to app/_archive/newsletter (band removed from 5 pages, footer form, /compte/newsletter route + sidebar + settings row; messages + DB table kept); 5 new researched blog articles in data/mock-blog; docs/BLOG_IMAGE_PROMPTS.md; interactive-demo card drift + alternating choice pulse in globals.css; stronger light-mode glow-card; removed therapist claim from library subtitle
2026-08-09 [Session B]: touched components/layout/Header.tsx + globals.css (A) for the dark-mode Create-pill wand (new --color-create-icon, falls back to currentColor in dark). Story AUTHOR bug fixed in (app)/creer: a parent's story was silently filed under the first child (profileId is now the author, heroProfileId only drives the hero prefill) + author picker in advanced step 4. Local-only stories (created while Supabase was paused, random-UUID ids instead of PS-) now self-promote to the DB on open, which unlocks image/audio/sharing. New root doc IMAGE_PROMPTS_create-a-story.md; style cards now render /illustrations/style-&lt;id&gt;.webp when present.
2026-07-18 [Session B]: touched components/layout/Footer.tsx (A), (admin)/admin/moderation (C), i18n/routing.ts + tsconfig — "Écrire avec nous" (story submission) pulled from the live app until V2. Whole feature preserved in app/_archive/write-with-us/ (page, db, actions, old moderation page, restore README); messages kept and key-synced.
2026-07-18 [Session B]: new db/submissions.ts + app/actions/submissions.ts (D) and (admin)/admin/moderation (C) — user story submissions are now REAL DB rows (stories table, genre "soumission", draft until approved; approve = publish to library), moderation lists them plus real generated personalized stories; mockSubmissions no longer used. Consent snapshot (terms version + timestamp) stored per submission.
2026-08-08 [Session A]: homepage age + genre artwork: 15 PNGs converted to webp (17MB -> 860KB) into public/img/ages/<range>.webp and public/img/genres/<genre>.webp; AgeGrid + GenreCarousel now point at .webp
2026-07-19 [Session A]: FIXED language toggle (was dead switching to FR): LanguageSwitcher now sets NEXT_LOCALE cookie + hard-navigates, so next-intl middleware no longer bounces unprefixed FR paths back to /en. Added switcher to /profils selector + kid-mode /creer header (were missing it).
2026-07-18 [Session B]: touched lib/ai/stylePrompts.ts + app/actions/generateStory.ts + db/customStories.ts + app/actions/customStories.ts (D) — new imageCast() puts secondary characters in the cover, family of an animal hero is the same species, reinforced no-text-in-image rule. Also dropped emojis from creer occasion/situation preset chips (text-only, on-brand).
2026-07-18 [Session A]: homepage: new ThemeCarousel (main life-themes -> /creer?occasion=<presetId>, placeholder art /img/themes/<id>.png) + LatestStories (latest 1-6yo stories carousel, auto from mockStories); creer reads ?occasion= to apply a preset; homeV2 byTheme*/latest* keys
2026-07-18 [Session B]: touched lib/userScope.ts + lib/auth/session.ts (D) — storage now namespaced by Supabase user id (new lunireve_uid cookie) instead of email, so a deleted-then-reregistered email starts fresh and OAuth linking keeps one bucket; legacy per-email localStorage auto-migrated once.
2026-07-17 [Session A]: proxy.ts (first-visit browser-language detection: non-fr -> /en + NEXT_LOCALE cookie), real OAuth (OAuthButtons signInWithOAuth PKCE, new (site)/auth/callback page, loginWithOAuthToken bridge action in actions/auth.ts, /auth/callback pathname), signup perk wording; Google/Facebook still need enabling in the Supabase dashboard
2026-07-16 [Session B]: round-15. Touched lib/ai/safetyGate.ts (batched GateBatchResult), lib/moderation.ts (batched ParamsModeration), app/actions/generateStory.ts (fields[] in moderation result), db/customStories.ts + app/actions/customStories.ts (feedback upsert per voter). Creer: merged quick presets, sticky presets, real logo on loading; perso toolbar = library card; wizard default role main.
2026-07-15 [Session B]: round-14. Touched db/customStories.ts + app/actions/customStories.ts (story feedback recording, admin list) and (admin)/admin/moderation + new components/admin/StoryFeedbackPanel.tsx (feedback section). Creer: quick/advanced modes, SITUATION_PRESETS in lib/storyOptions.ts.
2026-07-14 [Session B]: round-13. Touched lib/ai/stylePrompts.ts (new "vif" style) + app/actions/generateStory.ts (moral line + moral semantic gate). ChildAvatar fixed (absolute inset, %-padding bug), CustomStoryParams + moral/vif, in-profile upgrade links now /compte/abonnement.
2026-07-16 [Session A]: i18n fix (NextIntlClientProvider locale prop + setRequestLocale in (site)/layout: EN pages were emitting FR hrefs) + SEO layer: lib/seo.ts (hreflang/canonical helpers), components/seo/JsonLd, Organization/WebSite/ShortStory/Breadcrumb/FAQPage/Article schemas, keyword-tuned titles (meta/library/funnel/personalizedPage seo* keys), root layout metadata now locale-aware
2026-07-15 [Session A]: footer label (Comment créer une histoire), glow-card light-theme indigo/mint variant in globals.css, removable #tag chip in LibraryBrowser, signup free-perk banner in AuthPanel, HeroImageZoom true fullscreen + click-anywhere close
2026-07-13 [Session B]: round-12. Touched app/actions/generateStory.ts (parallel cover generation + dialogue line), app/actions/customStories.ts + db/customStories.ts (deleteMyCustomStory, sequel image reference, heroDescription in character sheet), components/story/{HeroImageZoom (z-60 + html scroll lock), DownloadButtons (ePub removed)}. Dashboard favorites/persos grouped per reader; ChildAvatar padded round card.
2026-07-13 [Session A]: perso navbar sticky fix (contents wrapper), progress bar tracks navbar via --lunireve-header-offset, dark chip contrast (LibraryBrowser + StoryFunnel), GlowCard silver edge glow on about cards + globals.css, AuthPanel extracted (AuthModal + /connexion page now share it, page defaults to signup + real logo), audio outro tracks (public/audio/outro-fr|en.mp3 + AudioPlayer chaining + language prop)
2026-07-13 [Session A]: lib/pdf (bigger footer + transparent cover logo), StoryFunnel grouped rails, ReadingProgress rAF loop, new AutoHideHeader + site Header on histoire-perso, HeroImageZoom below navbar, library sequel CTA + fromLib prefill in creer, footer real logo, contrast fixes (parallax h2, promo card h3, interactive choiceB)
2026-07-12 [Session B]: round-11 batch. New components/brand/ChildAvatar.tsx (9 fox portraits /public/children); FOX_COLORS extended (golden/grey/kaki/red). Touched lib/ai/types.ts (SAFETY_RULES: transpose adult topics), app/actions/generateStory.ts (capitalizeName, heroDescription), lib/storyOptions.ts (capitalizeName, THEME_GENRES/UNIVERSES), lib/moderation.ts (heroDescription cap).
<!-- Add ONE line per cross-territory edit, newest on top:
     `YYYY-MM-DD [Session X]: touched <folder> for <reason>` -->
2026-07-12 [Session A]: grouped library filters (CHARACTER_GROUPS/THEME_GROUPS in lib/stories/filter + ccat/tcat params), directional sort (sort+dir), extended 6 story bodies + honest readingMinutes in data/mock-stories, InteractiveBand on homepage, bonus step on histoire-personnalisee, about-us.png hero, Accordion animation, getUsername in lib/clientAuth (header name fix)
2026-07-08 [Session A]: added lib/dailyPick.ts + "histoire de ce soir" section in (app)/enfant; OCCASION_PRESETS in lib/storyOptions + occasion chips in (app)/creer step 2
2026-07-07 [Session A]: touched (app)/creer (rejected screen + red field), actions/generateStory (field in result), lib/ai (craft rules, richer style prompts, character identity in image path), db/customStories, data/faq
2026-07-07 [Session A]: added lib/ai/safetyGate.ts (semantic moderation, inputs + output), wired into actions/generateStory; blocklist ES/IT/DE/PT/PL/AR additions + subTheme in lib/moderation + creer validateStep
2026-06-28 [Session A]: touched (app)/creer + histoire-perso + personnages, lib/storyOptions + customStories, actions/generateStory for meshistoiresdusoir-inspired round (subthemes, done screen, FAQ, quota bar, thumbs, hero deep-link, sequel recap-first)
2026-06-28 [Session A]: touched (app)/histoire-perso (glossary hover, progress top-0, wider grid), data/mock-stories (more tags), lib/stories/filter (tag filter)
2026-06-28 [Session A]: touched data/mock-blog.ts (EN fallback), i18n/routing (removed /v2); homepage v2 promoted to /, old V1 marketing components deleted
2026-06-17 [Session A]: added i18n/routing /v2 route for homepage-v2 test page (round 9)
2026-07-06 [Session B]: round-10 batch. New components/account/AccountShell.tsx (full-width portal chrome, shared by /compte + /creer). Touched lib/pdf/storyPdf.ts (logo ratio + www.lunireve.com footer), lib/ai (glossary in output schema, length-retry in anthropic provider), db/customStories.ts (glossary in metadata), app/actions/generateStory.ts (glossary, sequelOf, stronger place/extraInfo prompt lines). Perso story page: parity with library stories + next-episode CTA.
2026-07-06 [Session B]: story flow v2 + moderation. New lib/moderation.ts + lib/storyOptions.ts; touched app/actions/generateStory.ts (moderation gate, tier clamps, companions/extraInfo prompt) and lib/ai/types.ts + providers (SAFETY_RULES in system prompts). CustomStoryParams extended (heroType, companions, readingAge, extraInfo, skinTone).
2026-07-05 [Session B]: touched i18n/routing.ts (added /compte/personnages/nouveau pathnames) for the character-creation wizard; new lib/characterOptions.ts catalogue + extended lib/characters.ts (age, appearance).
2026-06-18 [Session B]: reading history per reader + quiz results. New lib/readingHistory.ts; touched components/story/{ReadingProgress,StoryQuiz}, (site)/histoires/[slug] (pass slug to quiz), lib/userScope (currentProfile reads scoped active-profile key). Parent navbar logo + recently-read carousel.
2026-06-17 [Session A]: touched data/mock-stories.ts (EN content, locale-aware), lib/userScope+favorites (per-profile), lib/pdf, (app)/creer for round-8 fixes
2026-06-17 [Session A]: touched data/mock-stories.ts (chars/themes, interactive length), lib/stories/filter.ts, lib/pdf, (app)/creer (filter prefill), data/faq.ts for round-7 fixes
2026-06-13 [Session A]: touched data/mock-stories.ts (quiz length), scripts/generate-images.ts, app/sitemap.ts, i18n/routing.ts for perso page + image fix
2026-06-13 [Session A]: added app/sitemap.ts + app/robots.ts, public/llms.txt + favicons (moved to public root), root layout icons/manifest for SEO
2026-06-14 [Session B]: per-account data isolation + tier benefits. New lib/tier.ts (central limits), lib/userScope.ts (scopedKey), lib/favorites.ts. Scoped all client stores per account (lunireve_user cookie). Touched components/story/{FavoriteHeart,StoryActions}, components/layout/Header, components/marketing/PricingPlans+new PricingComparison, (site)/tarifs, lib/notifications, lib/auth/session.ts.
2026-06-14 [Session B]: touched lib/auth/session.ts + app/actions/auth.ts to add user2/user3 test accounts + tier cookie for paid-tier testing
2026-06-13 [Session A]: added lib/promo.ts, scripts/generate-images.ts, lib/storyImage.ts, data/generated-images.json, public/img for summer promo + AI cover images
2026-06-13 [Session A]: touched data/mock-stories.ts, db/schema.ts, data/mock-admin.ts, lib/stories, lib/pdf for favoritesCount field + interactive quiz/PDF

## Auto-commit + push (mandatory, no asking)
At the end of EVERY task: `pnpm build` (must be green) →
`git add -A && git commit -m "..."` → `git push`. No permission asked,
no "do you want me to commit?" question. Stay silent about it unless
the push actually fails.

## Working across territories (Harry's rule, July 2026)
Harry runs sessions A/B/C/D for context efficiency, NOT to enforce
strict isolation. **Prefer your owned folders, but if a task needs an
edit elsewhere, just do it.** Don't ask Harry to coordinate between
sessions — he doesn't have time. Cross-edits get logged above (one
line, newest first). The next session sees the log and won't re-touch
what you already changed.

Harry never runs two sessions at the same time, so live merge
conflicts aren't a risk — only stale-context overwrites are. The log
prevents that.

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

## Sessions A / B / C / D — preferred territories
Used for context efficiency. **Soft ownership, not hard isolation.**
Prefer your folders; cross the line when the task needs it (and log it
above).

| Session | Preferred home |
|---|---|
| **A — Public site** | `(site)/*`, `components/marketing/*`, `components/story/*`, `components/layout/*` |
| **B — User area** | `(app)/*`, `lib/profiles.ts`, `lib/customStories.ts`, `lib/characters.ts` |
| **C — Admin** | `(admin)/*`, `components/admin/*`, `data/mock-admin.ts`, `lib/adminBlog.ts` |
| **D — Backend/infra** | `lib/ai/*`, `lib/supabase/*`, `db/*`, `app/actions/*`, `n8n/*` |

Shared files (`messages/*.json`, `data/mock-stories.ts`, `db/schema.ts`,
`globals.css`): editable by anyone. Harry runs one session at a time,
so just commit when done.

### Copy-paste starter for each session
> You are working on the Lunireve project at
> `C:\Users\Harry\olibrius-project\06_personal-projects\lunireve`.
> First read `app/CLAUDE.md`, `SESSION_GUIDE.md` and `BRIEF_FINAL.md`.
> This session is **Session [A/B/C/D]**. Prefer your home folders, but
> edit elsewhere when the task needs it — log cross-edits at the top of
> SESSION_GUIDE.md. Today's task: [PASTE TASK].

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
