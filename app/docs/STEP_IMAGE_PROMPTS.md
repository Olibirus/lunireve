# "How it works" step images — generation guide

The 5 illustrations on the personalized-story page
(`/histoire-personnalisee`, `/en/personalised-story`).

---

## Where they go

**Save in:** `app/public/img/steps/`
**Format:** `.webp` (quality ~82)
**Aspect ratio:** **4:3** — recommended size **1200 x 900**

| # | File name |
|---|---|
| 1 | `step-1-hero.webp` |
| 2 | `step-2-world.webp` |
| 3 | `step-3-style.webp` |
| 4 | `step-4-magic.webp` |
| 5 (bonus) | `step-5-sequel.webp` |

They appear automatically once the files exist (a gradient shows until then).
Each image keeps a large number and a small icon overlaid on top, so **leave
the top-left corner and the centre visually calm** (no important detail there).

---

## Shared style block (paste at the START of every prompt)

Matches the Lunireve logo: soft, rounded, storybook, friendly fox mascot.

```
Children's storybook illustration in the exact style of a soft modern brand
mascot logo: clean rounded shapes, smooth flat-ish shading with a subtle
painterly texture, friendly and cosy, gentle thin outlines, no harsh detail.
Palette strictly: cream (#faf5eb), deep night blue (#1f2d52), soft mint
(#b7dfcc), warm peach (#f8b487), muted indigo (#858fc1). A small friendly
orange fox with a cream chest and a white-tipped tail is the recurring
mascot. Soft diffused light, warm and reassuring bedtime mood, simple
uncluttered background with generous empty space in the centre and in the
top-left corner. Absolutely no text, no letters, no numbers, no words, no
logos, no watermark, no frames, no split panels. Aspect ratio 4:3.
```

Then append one scene below.

---

## 1. step-1-hero — "Choose the hero"

```
Scene: the little fox mascot sitting beside a child-shaped paper cut-out it is
happily decorating, choosing hair and a coloured outfit from a small floating
palette of character options. A couple of soft character silhouettes hover
gently in the air around them like choices waiting to be picked. Feeling:
inventing the hero of the story.
```

## 2. step-2-world — "Choose the world"

```
Scene: the little fox standing on a small floating island holding a rolled
map, with three miniature worlds drifting around it like soft bubbles: a
mint forest, a peach desert with a tent, a deep blue starry sea. Feeling:
picking where the adventure takes place.
```

## 3. step-3-style — "Choose the style"

```
Scene: the little fox as a painter, holding an oversized brush and standing
in front of three floating round canvases, each painted in a different
storybook style (soft watercolour wash, clean comic outline, cosy pencil
texture). A palette with mint, peach and indigo paint sits at its feet.
Feeling: choosing how the story will look.
```

## 4. step-4-magic — "The story is written"

```
Scene: the little fox curled beside a large open book lying flat, from which
soft glowing shapes rise and swirl upward: tiny stars, a small moon, a
sailboat, a bird, all in mint and peach light. The pages glow warmly from
within. Night-blue background with a few stars. Feeling: the story coming to
life in a few minutes.
```

## 5. step-5-sequel — "The next episode" (bonus step)

```
Scene: the little fox happily carrying a small stack of matching storybooks,
walking toward a soft glowing doorway shaped like an open book, with a gentle
circular arrow of mint light looping around it to suggest "again". The same
hero silhouette from the first book waves from the top of the stack. Feeling:
the adventure continuing, episode after episode.
```

---

## After generating

1. Save the 5 files in `app/public/img/steps/` with the exact names above.
2. Nothing else to configure: rebuild and they replace the gradients.
