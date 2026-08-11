# Lunireve — Session A handoff (public website / frontend)

> For a brand-new Claude Code conversation taking over **Session A**.
> Read `SESSION_GUIDE.md` first (ownership map + cross-session log), then this.
> `HANDOFF.md` is Session B's (user area) equivalent — don't confuse them.

## State at handoff
- Everything committed and pushed to `github.com/Olibirus/lunireve` (`main`).
- Last Session A commit: `75deda9` (story lists prerendering fix).
  `ad24ea3` on top is Session B's character-wizard work.
- Live on https://lunireve.com (Vercel, PRO plan).

## Non-negotiables (every single round)
1. `pnpm build` from `app/` must be green.
2. `git add -A && git commit && git push` — never ask permission, never mention
   it unless the push fails.
3. **Deploy**: `cd app && npx vercel deploy --prod --yes`. Confirm
   `readyState: READY`.
4. **Short answers.** Harry reviews many rounds and pays per token: reply with
   a terse checklist of what changed, no essays. Flag genuine problems in one
   or two lines.
5. NO em dashes in user-visible text (use commas/colons).
6. `messages/fr.json` + `messages/en.json` must stay key-synced. Check:
```
node -e "const fr=require('./messages/fr.json'),en=require('./messages/en.json');function k(o,p=''){return Object.entries(o).flatMap(([a,v])=>v&&typeof v==='object'&&!Array.isArray(v)?k(v,p+a+'.'):[p+a])}const A=new Set(k(fr)),B=new Set(k(en));const d=[...A].filter(x=>!B.has(x)).concat([...B].filter(x=>!A.has(x)));console.log(d.length?'DIFF: '+d.join(', '):'synced ('+A.size+')')"
```
7. Age taxonomy is fixed: 1-2 / 3-4 / 5-6 / 7-8 / 9-10 / 11-12, via
   `ageLabel(range, locale)` from `data/mock-stories.ts`.
8. This is a customised Next.js App Router build — read `app/AGENTS.md`.
9. Temp auth: `user/123456` (parent), `admin/123456`. Paid tiers: `user2`
   (Plus), `user3` (Max), same password.

## Session A territory
`(site)/*`, `components/marketing/*`, `components/story/*`,
`components/layout/*`, `lib/seo.ts`, `data/mock-blog.ts`, `data/mock-stories.ts`.
Cross into other folders when the task needs it, then add ONE line at the top
of the `## Cross-session changes log` in `SESSION_GUIDE.md`.

## Verification workflow that works here
The embedded preview pane is unreliable (hidden tab: screenshots time out,
rAF/scroll events are throttled). What works:
- Build, then `PORT=<free port> nohup pnpm start -p <port> &` and `curl` the
  HTML (best for SSR/SEO checks, metadata, prerendered content).
- `mcp__Claude_Browser__preview_start {url}` + `javascript_tool` for DOM and
  computed-style assertions (colors, classes, positions, animation names).
- Kill the test server afterwards (`netstat -ano | grep :PORT` → `taskkill`).
- Port 3000 is often taken by another session's dev server; use 3040+.

## Landmines already hit (do not re-introduce)
- **`loading.tsx` on statically prerendered routes**: Next bakes the skeleton
  into the static HTML and the real content never renders server-side. This
  silently emptied the library, all funnels AND every story page (invisible to
  Google). Removed; archived in `app/_archive/loading-skeletons/` with a README.
- **`useSearchParams()` on a `force-static` page**: disables prerendering for
  the whole Suspense boundary. Use `lib/useUrlQuery.ts` instead
  (`useSyncExternalStore` on `location.search` + patched pushState/replaceState:
  stays prerendered, still reactive to filter clicks and the back button).
- **`NextIntlClientProvider` needs an explicit `locale` prop**, and every route
  segment layout needs `setRequestLocale(locale)`, or English pages emit French
  hrefs.
- **Language switcher must set the `NEXT_LOCALE` cookie before navigating**,
  otherwise the middleware bounces un-prefixed FR paths back to `/en`.
- Global CSS paints all `h1/h2/h3` with `--color-ink-800`: any heading on a
  dark/photo background needs an explicit colour or it turns invisible in one
  of the two themes.
- Bash heredocs here mangle `\` and `${}`. For codemods, write the script with
  the Write tool to the scratchpad and run it with `node`, or use Edit.

## Recent Session A work (context for follow-ups)
- SEO layer: `lib/seo.ts` (canonical + hreflang fr/en/x-default), JSON-LD
  (Organization, WebSite+SearchAction, ShortStory, BreadcrumbList, FAQPage,
  Article), keyword-tuned titles/descriptions.
- Homepage: ThemeCarousel (life themes → filtered library), LatestStories
  (auto latest 1-6yo), InteractiveBand (with drifting card + alternating choice
  pulse), age/genre artwork in webp, mobile hero order (text before search).
- Story lists: grouped two-level filters, directional sort, removable #tag chip,
  "create a personalized story" card on EVERY list (last if ≤6 stories, else
  5th) with cursor-following glow border + shine CTA.
- Story pages: auto-hiding navbar, progress bar tracking it, fullscreen image
  lightbox, sequel CTA (`/creer?fromLib=<slug>`), audio outro tracks.
- Blog: 9 articles (4 original + 5 researched: sleep by age, vocabulary,
  tantrums, first day of school, bilingual).
- Newsletter parked in `app/_archive/newsletter/` (restore README inside).
- `/connexion` shares `AuthPanel` with the header modal, defaults to signup.

## Open items / next steps
1. **Art still missing** (slots exist, gradients show meanwhile):
   - `app/public/img/steps/` is EMPTY → 5 images needed. Prompts:
     `app/docs/STEP_IMAGE_PROMPTS.md` (logo-matching style, 4:3).
   - 5 of 9 blog covers missing (`combien-de-temps-dort-un-enfant`,
     `vocabulaire-lecture-a-voix-haute`, `coleres-enfant-histoires`,
     `rentree-maternelle-preparer`, `enfant-bilingue-deux-langues`).
     Prompts: `app/docs/BLOG_IMAGE_PROMPTS.md`. After adding the files, add the
     slugs to the `"blog"` array in `src/data/generated-images.json`.
2. **Harry must do personally**: Google Search Console + Bing Webmaster Tools
   verification and sitemap submission (nothing ranks until Google crawls);
   enable Google + Facebook providers in the Supabase dashboard (the OAuth code
   is done and waiting).
3. SEO backlog (agreed, not built): og:image per story, a
   `/histoires-pour-dormir` editorial landing page, ~100-word keyword intros on
   funnel pages.
4. Product backlog Harry approved for V2 only: weekly series ritual, bedtime
   mode, print wishlist, parent dashboard stats, referral, audio wind-down.
   V2 also includes: full visual stories (8-15 illustrated pages → print on
   demand), voice cloning, lullaby autoplay. Do NOT start these.
