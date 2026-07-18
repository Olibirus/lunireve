# Lunireve — Session handoff (resume here)

> Purpose: let a brand-new Claude Code conversation pick up with zero context
> loss. Everything below is derivable from the repo + git history; this file
> just saves the new session from re-discovering it. Read `SESSION_GUIDE.md`
> and `BRIEF_FINAL.md` first — this file is the "what state are we in" layer.

## Nothing is lost
- All code is committed and pushed to `github.com/Olibirus/lunireve` (branch
  `main`). The working tree was clean at handoff (commit `c6249e8`).
- Client-created data (child profiles, saved characters, favorites, reading
  history) lives in the browser's localStorage, per-account scoped — it is
  NOT in the repo and is per-device. DB-backed personalized stories live in
  Supabase (Paris). None of that is affected by starting a new chat.

## How to work (the non-negotiables)
- Project root for code: `06_personal-projects/lunireve/app`.
- After EVERY feedback batch: `pnpm build` (must be green) → commit → push →
  `cd app && npx vercel deploy --prod --yes`. Harry is on Vercel PRO; the
  git→Vercel auto-deploy sometimes lags, so the manual `vercel deploy` is the
  reliable path. Confirm it aliases to `https://lunireve.com`.
- Keep replies SHORT after feedback batches (a terse checklist). Harry pays
  per token and reviews many rounds.
- Hard rules: NO em dashes in user-visible text; `messages/fr.json` +
  `messages/en.json` must stay key-synced (there is a check snippet used every
  round — see below); admin shows REAL data only (zeros, never fake).
- This is a customized Next.js (App Router) — see `app/AGENTS.md`.
- Temp auth still active: `user/123456` (parent), `admin/123456`.
  Paid-tier test accounts: `user2` (Plus), `user3` (Max), password `123456`.

## Session ownership (Harry runs A/B/C/D in parallel)
This work stream = **Session B (User area)**. Owns `(app)/*`,
`lib/profiles.ts`, `lib/customStories.ts`, `lib/characters.ts`. When a task
needs a file outside that (it often does — `lib/ai/*`, `db/*`, `app/actions/*`,
`components/story/*`, admin, messages), just edit it and add ONE line to the
`## Cross-session changes log` at the top of `SESSION_GUIDE.md`.

## The key-sync check (run every round after editing messages)
```
node -e "const fr=require('./messages/fr.json'),en=require('./messages/en.json');function k(o,p=''){return Object.entries(o).flatMap(([a,v])=>v&&typeof v==='object'&&!Array.isArray(v)?k(v,p+a+'.'):[p+a])}const A=new Set(k(fr)),B=new Set(k(en));console.log('only fr:',[...A].filter(x=>!B.has(x)));console.log('only en:',[...B].filter(x=>!A.has(x)))"
```

## What's built (Session B focus: personalized story creation)
The story-creation flow (`(app)/creer/page.tsx`) is mature after ~15 rounds:
- **Quick mode (default)** + Advanced mode (4 steps: hero / companions /
  adventure / final settings). Toggle at top; state carries both ways.
- Hero from 3 sources: child profile, saved character, or manual entry.
  Saved character carries full description + skin tone (fields hide, no
  re-asking).
- Presets: OCCASION_PRESETS + SITUATION_PRESETS (fears, quarrels, grief...),
  merged into one group in quick mode. Picking a preset seeds theme+mood+a
  plot note; tweaking mood/theme keeps the preset (only re-tapping clears it).
- Options: companions (name mandatory, saveable to a reusable library),
  reading-age override, sub-themes, place (gendered label), up to 3 free-text
  details, moral (STORY_MORALS + free text), illustration style cards (incl.
  "vif"), skin tone. Language auto-follows the site locale.
- Moderation: 4 layers (blocklist `lib/moderation.ts` → semantic gate
  `lib/ai/safetyGate.ts` → prompt SAFETY_RULES `lib/ai/types.ts` → output
  gate). ALL offending fields returned at once and shown red; selections kept.
- Generation: text (Claude, length enforced by age) + cover image IN PARALLEL;
  glossary produced with the story; smoothed near-linear loading bar with
  animated "working" words + real logo.
- Result page (`(app)/histoire-perso/[id]`): same toolbar as library stories
  (round audio, PDF download, favorite/share/report, text settings), dialogue
  styling, glossary, print CTA, thumbs feedback (reasons on thumbs-DOWN only,
  recorded server-side per voter — deduped, visible in Admin › Modération),
  "next episode" (auto / customized, reuses previous cover for consistency).
- Character wizard (`(app)/compte/personnages/nouveau`): 4 visual steps,
  defaults to role "main".
- Avatars: 9 fox portraits in `/public/children/<color>.png` via
  `components/brand/ChildAvatar.tsx` (padded round card so the face isn't
  cropped). "Orange" is first; colors: orange, blue, mint, pink, golden, grey,
  kaki, lavender, sand.

## Known gotchas / open threads
- Illustration STYLE cards and character-wizard options render placeholder
  `data-image-slot` boxes; Harry uploads the real art later
  (`/public/illustrations/style-<id>.png`, `char-<...>.png`). Same swap
  pattern as `FoxImagePlaceholder`.
- Feedback dedupe is per-voter going forward; OLD stacked duplicates collapse
  only next time each user votes.
- Env vars that must be set in Vercel for full function: `ANTHROPIC_API_KEY`
  (text), image-provider key + Supabase storage (cover images), `OPENAI_API_KEY`
  (semantic safety gate — fails OPEN if missing, i.e. relies on layers 1+3).
- ePub download was removed everywhere (no generator yet).
- Backend still largely localStorage; DB swap for shareable cross-device data
  is Session D territory and partially done for personalized stories.

## To start the new conversation, paste this
> You are working on Lunireve at
> `C:\Users\Harry\olibrius-project\06_personal-projects\lunireve\app`.
> Read `../SESSION_GUIDE.md`, `../BRIEF_FINAL.md`, and `../HANDOFF.md` first.
> You are Session B (User area). Follow the hard rules (no em dashes, real
> admin data, fr/en key-synced). After each feedback batch: build, commit,
> push, then `npx vercel deploy --prod --yes`. Keep answers short. Today: [PASTE TASK]
