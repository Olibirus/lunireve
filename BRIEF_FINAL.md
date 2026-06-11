# LUNIREVE — Master Brief (validated June 2026)

> Bilingual children's story platform. FR first, built multilingual-ready (EN/ES next).
> Domain: **lunireve.com** (primary) + lunireve.fr. Company: HK-based.
> This document supersedes Brief.md / Questions.md / Ideas.md — those remain as raw notes.

---

## 1. Vision & positioning

**One-liner:** The bedtime routine tool families can't live without — a large library of *quality* stories (not AI-slop), personalized stories where the child is the hero, premium printed books, audio that lulls children to sleep.

**Differentiation vs meshistoiresdusoir.fr:**
1. Editorial quality (warm-literary, human-reviewed feel — not obviously AI)
2. Full visual personalized storybooks → print (the flagship product)
3. Habit engine: audio + sleep sounds + streaks + series → daily ritual
4. Recurring printed series (new episode shipped monthly) = recurring revenue

**Primary persona:** Parents (28–45), bedtime use, mobile in a dark room.
**6-month goal:** User feedback + brand building (social media). Scale later.
**Cost philosophy:** As cheap as possible. Generate-on-demand, cache everything, free tiers of tools.

**Brand:** Name Lunireve (final). Fox mascot on cloud (final). Colors: night blue #1f2d52, soft indigo #858fc1, mint #b7dfcc (final). Tone: warm-literary ("Storybook Editorial" design system already built).

---

## 2. Phases

### V1 — Launch (build now)
- Public story bank (5 stories, one age category to start — scale after validation)
- Funnel/SEO pages (genre → age → theme → character drilldown)
- Story page (full structure, §5)
- Personalized TEXT story (1–2 illustrations, audio, quiz, glossary)
- Accounts + child profiles (Netflix-style, 1 free profile)
- Audio on-demand (generated at first listen, cached)
- Quiz + glossary auto-generated per story
- PDF download (watermarked)
- Resume reading (everyone), favorites, history, streak
- Dark mode (color swap only)
- Blog (AI-assisted + human review)
- Admin: stories CRUD, moderation, users, blog
- FULL analytics from day 1: users (total/active/new), paid vs free split (ready for V2), time on site, per-story metrics (opens, % read, completion rate, audio plays, favorites count + which stories, ratings, shares, reports), personalization metrics (created, most-used themes/characters), account conversion %, frequency of visits, child profiles count, newsletter signups — date ranges 7/15/30/60/90/180/360/All/custom, Excel + PDF export
- Audio player V1 = SIMPLE (free): play/pause, prev/next chapter, restart, suggests next story at end; modal cannot be minimized; closing stops audio + scrolls text to audio position
- Newsletter capture (Brevo) — capture only, no sequences
- Report story/image
- User story submission (moderation queue)
- n8n content pipeline on new isolated Hetzner instance

### V1.1
- Personalized VISUAL story (8–15 images, choose illustration style)
- Interactive stories (branching choices, count varies by age)
- Ads for free users (slots designed in V1 layout, activated when traffic justifies)
- Print-on-demand pipeline (digital preview → human review → print via Gelato/Peecho)
- EN language activation

### V2
- Stripe payments: 3 tiers + annual from day 1 (Family tier optional, decide later)
- Free: 3 personalized text/mo · Plus ~4.99€ · Max ~9.99€ (validate before build)
- Newsletter sequences (3 types: stories / promos / news, separate opt-ins)
- Gift cards + gift subscriptions (12-month validity, dedicated landing page)
- Recurring printed series (auto-print monthly episode, validate-before-print email)
- Advanced audio player (paid): minimizable (mini-player stays visible, limited controls), speed 0.8×/1×/1.2×, sleep timer, autoplay queue (up to 10, decrementing), ambient sleep sounds with fade, black-screen listening mode
- Offline access, MP3 download (quota), epub

### V3+
- Rallye lecture (teacher accounts, groups, progress tracking — full spec in Brief.md §34)
- Voice cloning (parent/grandparent reads via cloned voice)
- App (iOS/Android), read-along word-by-word, video mode
- Author community pages, credits system
- Spotify audio distribution

---

## 3. Tech stack (validated)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind 4 + shadcn/ui pattern |
| i18n | next-intl, translated pathnames, FR live / EN-ES ready |
| DB / Storage / Auth | Supabase (Paris). Drizzle ORM (typed schema + migrations) |
| Auth V1 | Temp cookie auth (admin/123456, user/123456) → Supabase Auth before public launch |
| Hosting | Vercel (lunireve.com) |
| Automation | n8n — NEW isolated instance on Hetzner (own container, own Postgres, basic-auth, localhost-bound, own subdomain) |
| Story text | Claude API |
| Images | Cheap tier for bank/text stories (Flux Schnell or GPT Image mini); premium tier V1.1 for visual books |
| Audio (TTS) | VibeVoice (self-hosted, free) → fallback OpenAI TTS → ElevenLabs if quality demands |
| Email | Brevo |
| Analytics | Umami self-hosted on Hetzner (GDPR-clean, no cookie banner, free). GA4 only if/when running Google Ads |
| Repo | github.com/Olibirus/lunireve — ONE monorepo (public + member + admin are route groups) |

**Key cost rules:** audio generated only on first listen then cached · images cheapest tier acceptable · PDF via print CSS (no paid service) · quotas on everything generative.

---

## 4. Information architecture

**Header nav:** Stories by age (dropdown) · Stories by genre (dropdown) · Personalized story (dropdown: text / visual-soon) · Search (dynamic results: image+title+summary as you type) · Account

**Funnel pages (each = SEO landing page, SSG):**
- /genre/[genre] → age filter → theme → character → results
- /age/[range] → genre → theme → character → results
- /audio → genre → theme → results
- /duration/[bucket] → results
- Breadcrumb keeps selections; age filter present on every level
- Every page shows matching stories below the filter hero

**Footer:** Age · Theme · Duration · Interactive · Personalized · About · Blog · Pricing · Write with us · Gifts (V2) · Account · Newsletter · Legal

---

## 5. Story page structure (order)

Hero (image + filters overlay) → breadcrumbs → selected filter chips (non-clickable) → title → summary → download buttons (PDF/epub) → picture → audio player → text settings (font size, dyslexia — paid-only later, free in V1) → chapters + text → upgrade CTA → favorite/share → rating → quiz (step-by-step, restartable, answers recap at end) → glossary (collapsed) → personalize CTA → theme links → download buttons repeat → "Read next" carousel (same theme+age) → newsletter CTA

**Quiz:** one question at a time, Next button, final recap with correct/incorrect + explanations, restartable.
**Resume reading:** everyone (localStorage anonymous, DB for accounts). Banner if >10% progress.
**Recommendations:** same age + theme on every story page.

---

## 6. Personalized story (V1 = text)

- Created from user/child area only (public CTAs redirect to login)
- 4 steps: Hero → Other characters → Plot → (Illustration step = V1.1)
- Pre-filled from child profile, all editable per-story
- Free limits: hero = boy/girl only, secondary = family/pet free, max 3 extra plot details, max 3 saved recurring characters
- Loading screen: 4-stage progress (queue → writing → illustration → finalizing), fast start/slow end, skeleton visual; user can navigate away, in-app notification when done
- Result is private + shareable link (email/social), not public on site
- "Publish to library" opt-in (author column in DB — stored now, displayed in future versions)
- Audio on-demand. Quiz + glossary included. Series/"next episode" = V2

---

## 7. Accounts & child profiles

Per validated child-profiles brief (Netflix-style selector "Qui lit ce soir ?", child bubble with simplified UI, parent = full site + family layer, optional PIN, 6 fox avatar colors, per-child streak with milestones 3/7/14/30 days).

**Free tier (V1):** 1 child profile · 3 personalized text stories/month · 30 favorites · 5 watermarked PDF/month · unlimited bank reading + audio · quiz, history, resume, streak included.

Language switch inside dashboard: instant, no re-auth (next-intl locale switch preserves session).

---

## 8. Security & anti-abuse (V1)

- Email verification required for generative actions
- Cloudflare Turnstile (free, invisible) on signup + generation + contact
- Rate limits: per-IP and per-account on all generation endpoints
- Generation quotas enforced server-side (not just UI)
- Ratings: only verified accounts that read ≥50% of story; 1 rating/account/story; outlier detection later
- Promo codes (V2): per-code attempt limits + lockout
- Subscribe-discount-cancel loophole (V2): print discounts apply only after N days of active subscription
- All admin routes behind auth + audit log table

**Compliance:** HK company × FR market → GDPR applies fully (EU users): EU data hosting (Supabase Paris ✓), privacy policy, DPA list, data export/delete. 14-day withdrawal: digital goods exemption with explicit waiver checkbox at purchase (V2 — confirm with lawyer before payments launch). Child data minimal: first name + age only, no photos in V1.

---

## 9. Content pipeline (n8n)

1. Admin triggers batch (theme × age) → Claude generates story + quiz + glossary + image prompt
2. Auto-publish for bank stories (per decision #37) — admin can unpublish/edit
3. Image generated at publish (1 cover + optional 1 inline)
4. Audio NOT generated — created at first user listen, stored in Supabase Storage
5. Personalized stories: generated on user request, PDF auto, human review only before PRINT (V1.1)
6. Analytics events logged per story (reads, completion, audio plays, shares, likes, reports) — admin dashboard with date ranges + Excel/PDF export (advanced version V2)

**Launch content:** 5 stories, one age category (recommend 6–8 ans — best readers + searchers). Validate quality → scale to all categories.

---

## 10. Open items (not blocking build)

- Pricing tier final validation (before V2 payments)
- Family tier yes/no (decide with usage data)
- French elision in name personalization ("de Tony" → "d'Alex") — solve with AI-side generation rules, not string replacement
- Lawyer review: withdrawal policy HK↔FR (before payments)
- VibeVoice French quality test (before committing audio stack)
- Site imagery: EMPTY placeholders only for now (FoxImagePlaceholder component with slot ID + prompt brief + aspect ratio) — Harry generates all fox-themed images later and they swap in one pass

---

## 11. Build order (V1)

1. **Migrate** revistoire/app → lunireve repo, rename branding, push to GitHub ✅ once done
2. Dark mode + FoxImagePlaceholder + expanded mock data (characters, sub-themes, durations, tags)
3. Funnel/SEO pages + dynamic search
4. Story page full structure (audio player UI, quiz, glossary, ratings, report)
5. Temp auth + profile selector + child bubble + parent area
6. Personalized story flow (form → fake generation → result page)
7. Admin (stories, moderation, users, blog, analytics)
8. Blog public pages
9. n8n pipeline + real generation wiring
10. Supabase Auth swap + beta testing
11. Deploy lunireve.com
