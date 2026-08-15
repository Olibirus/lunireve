# Parked: "Créer le livre" print prompt

Removed from the public story page on **2026-08-12** because the print
partner is not set up, so the CTA led nowhere. Everything needed to put it
back is here. Nothing else was deleted: the message keys are still live in
`messages/fr.json` and `messages/en.json` under `story.*`, and they are still
key-synced, so restoring is a copy-paste with no i18n work.

## Where it was

`src/app/[locale]/(site)/histoires/[slug]/page.tsx`, immediately after the
glossary panel and before the closing `</section>` of the post-story blocks.

## Exact markup to restore

```tsx
{/* Print prompt */}
<div className="rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-6">
  <h3 className="font-serif text-lg tracking-tight">{t("printPromptTitle")}</h3>
  <p className="text-sm text-[var(--color-ink-600)] mt-2 leading-relaxed">
    {t("printPromptBody")}
  </p>
  <Button variant="mint" size="sm" className="mt-4">
    {t("printCta")}
  </Button>
</div>
```

## Message keys (already present, do not re-add)

| Key | FR | EN |
|---|---|---|
| `story.printPromptTitle` | Votre enfant adore cette histoire ? | Does your child love this story? |
| `story.printPromptBody` | Transformez-la en vrai livre illustré, avec lui en héros. Reliure cousue, papier crème, illustrations originales. | Turn it into a real illustrated book, with them as the hero. Sewn binding, cream paper, original illustrations. |
| `story.printCta` | Créer le livre | Make the book |

## Before restoring

The button had **no `onClick` and no `href`**: it was always a placeholder.
Wire it to the real print flow first, otherwise it is the same dead end that
got it pulled. The same block also exists on the personalized story page
(`(app)/histoire-perso/[id]/page.tsx`) and was left in place there, since that
surface is behind login and not indexed. Decide whether both should ship
together when the partner is live.
