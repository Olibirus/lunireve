# Lunireve

Plateforme d'histoires pour enfants bilingue (FR/EN). Trois paliers : bibliothèque
gratuite SEO → histoires personnalisées (texte) → histoires personnalisées (images) →
impression on-demand.

Société : Hong Kong. Marché cible principal : France. Conformité RGPD + COPPA stricte.

---

## Stack

| Couche             | Choix                                            |
| ------------------ | ------------------------------------------------ |
| Framework          | Next.js 16 (App Router) — voir `AGENTS.md`       |
| UI                 | React 19 + Tailwind 4 + shadcn/ui                |
| i18n               | next-intl 4 (FR default, EN, pathnames traduits) |
| DB                 | Supabase Postgres (Paris) + Drizzle ORM          |
| Auth / Storage     | Supabase                                         |
| Paiements          | Stripe (HK)                                      |
| Texte IA           | Anthropic Claude (OpenAI en fallback)            |
| Images IA          | OpenAI gpt-image-1 / Replicate Flux              |
| Audio IA           | OpenAI TTS (library) / ElevenLabs (perso)        |
| PDF                | @react-pdf/renderer                              |
| Impression         | Gelato (Phase 3)                                 |
| Newsletter         | Brevo                                            |
| Pipeline contenu   | n8n self-host (Hetzner)                          |
| Analytics          | Plausible (RGPD-friendly)                        |

**Principe clé** : aucun SDK IA n'est importé hors de `src/lib/ai/`. Changer de
provider = changer une variable d'env, pas une ligne de code.

---

## Prise en main

```bash
pnpm install
cp .env.example .env.local   # remplir les clés
pnpm dev
```

Ouvrir http://localhost:3000 — redirige vers `/fr`.

### Base de données

Le schéma Drizzle vit dans `src/db/schema.ts`. Pour appliquer à Supabase :

```bash
pnpm db:push       # push direct du schéma (dev)
pnpm db:generate   # génère une migration SQL
pnpm db:migrate    # applique les migrations (prod)
pnpm db:studio     # explorer DB local
```

`DATABASE_URL` = pooler (port 6543) pour le runtime.
`DIRECT_DATABASE_URL` = direct (port 5432) pour les migrations.

---

## Structure

```
src/
  app/[locale]/          # pages localisées FR/EN
  components/            # composants UI partagés
  db/                    # schéma Drizzle + client
  i18n/                  # config next-intl
  lib/
    ai/                  # couche providers (text/image/audio)
    supabase/            # clients server/browser/admin
    env.ts               # validation Zod des env vars
  proxy.ts               # ex-middleware.ts (renommé en Next 16)
messages/                # traductions JSON par locale
```

---

## Décisions architecturales notables

- **Photos enfants jamais stockées.** On génère une fiche personnage stylisée,
  puis on supprime l'original. Voir `characterReferences` dans le schéma.
- **Audio paresseux.** Généré à la première écoute, puis mis en cache dans
  Supabase Storage. Stocker en amont pour 10 000 histoires coûterait trop.
- **PDF non "print-ready".** Bonne qualité écran, mais l'export haute-def
  passe par le service d'impression — c'est un funnel commercial, pas un cadeau.
- **FR/EN dès J1.** Deux histoires liées par `baseId`, `hreflang` propre,
  zéro dilution SEO.
- **Dédup SEO.** Index unique `(language, primary_seo_keyword)` sur `stories`
  empêche la génération de doublons en batch.
- **Quotas par période de facturation.** `usageQuotas.resetsAt` — on ne
  remet pas à zéro à minuit mais à la date d'anniversaire de l'abonnement.

---

## Phases

- **Phase 0** (en cours) — fondations : stack, i18n, schéma, auth.
- **Phase 1** — bibliothèque SEO : n8n → 500 histoires gratuites indexées.
- **Phase 2** — personnalisation texte + images, paywall Stripe.
- **Phase 3** — impression on-demand via Gelato.

Voir `project_Lunireve.md` dans la mémoire pour la vision complète.
