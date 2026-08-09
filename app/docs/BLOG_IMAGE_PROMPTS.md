# Blog cover images — generation guide

Everything needed to generate the 9 blog cover images (4 existing + 5 new) in
Nano Banana / any image model, then drop them into the project.

---

## How it works in the code

Each article needs **two files** (same picture, two crops):

| File | Used where | Aspect ratio | Target size |
|---|---|---|---|
| `<slug>.webp` | Article page hero | **21:9** (ultra-wide) | 1680 x 720 |
| `<slug>-card.webp` | Blog index + related cards | **16:9** | 800 x 450 |

**Where to save them:** `app/public/img/blog/`

**Then declare the slug** in `app/src/data/generated-images.json`, in the
`"blog"` array. Only slugs listed there are displayed (otherwise the page
falls back to a gradient). Example:

```json
"blog": [
  "histoires-du-soir-en-vacances",
  "peur-du-noir",
  "lire-a-voix-haute",
  "rituel-du-soir-sans-ecran",
  "combien-de-temps-dort-un-enfant",
  "vocabulaire-lecture-a-voix-haute",
  "coleres-enfant-histoires",
  "rentree-maternelle-preparer",
  "enfant-bilingue-deux-langues"
]
```

Generate at 21:9, then crop/resize a 16:9 version for the card. Convert both
to `.webp` (quality ~82).

---

## Shared style block (paste at the START of every prompt)

```
Soft children's-book editorial illustration, warm painterly gouache texture,
hand-illustrated feel, gentle bedtime palette: cream (#faf5eb), deep night
blue (#1f2d52), soft mint (#b7dfcc), warm peach accents. Diffused candle-like
light, cosy and reassuring atmosphere, soft rounded shapes, no harsh contrast.
Wide cinematic composition with generous empty space, subject off-centre.
Absolutely no text, no letters, no numbers, no words, no logos, no watermark,
no frames, no split panels. Aspect ratio 21:9.
```

Then append the per-article scene below.

---

## 1. histoires-du-soir-en-vacances
**Rename to:** `histoires-du-soir-en-vacances.webp` + `histoires-du-soir-en-vacances-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a family holiday evening. A small open tent or a summer bedroom with
a window open on a warm dusk sky, an open suitcase in a corner, a child
curled up on a blanket listening to a story on a phone lying face down beside
them, a parent's hand resting on their back. Sea or countryside horizon in
the distance, first stars appearing. Feeling: the bedtime ritual travelling
with the family.
```

## 2. peur-du-noir
**Rename to:** `peur-du-noir.webp` + `peur-du-noir-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a child's bedroom at night, mostly deep night blue. A small child sits
up in bed holding the duvet, looking towards a shadowy corner where a coat on
a hook looks vaguely like a creature. A warm little nightlight glows on the
bedside table, and a friendly fox soft toy sits beside the pillow. The shadows
are soft and rounded, never frightening. Feeling: a fear being tamed, not a
scary picture.
```

## 3. lire-a-voix-haute
**Rename to:** `lire-a-voix-haute.webp` + `lire-a-voix-haute-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a parent reading aloud to a child in an armchair, seen from the side in
warm lamplight. The open book glows faintly, and a few soft luminous shapes
(a boat, a bird, a small star) drift out of the pages into the air above them,
like the story taking shape in the room. Cosy living room, evening. Feeling:
the voice that gives life to the words.
```

## 4. rituel-du-soir-sans-ecran
**Rename to:** `rituel-du-soir-sans-ecran.webp` + `rituel-du-soir-sans-ecran-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a bedside table at night, seen close and slightly from above. A tablet
lies face down and switched off, pushed aside, while an open storybook and a
softly glowing lamp take the centre. A child's hand reaches for the book, not
the screen. Warm light on the book, cool blue shadow on the tablet. Feeling:
a gentle swap, not a ban.
```

## 5. combien-de-temps-dort-un-enfant  *(new)*
**Rename to:** `combien-de-temps-dort-un-enfant.webp` + `combien-de-temps-dort-un-enfant-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a peacefully sleeping child seen from above, curled under a big duvet
with one arm out, in a dim bedroom. Above the bed, the night sky flows across
the ceiling like a slow soft wave, with a crescent moon and small stars
drifting from one side of the frame to the other, suggesting the passing hours.
A round wall clock is visible but blurred and unreadable. Feeling: the quiet,
restorative work of a full night.
```

## 6. vocabulaire-lecture-a-voix-haute  *(new)*
**Rename to:** `vocabulaire-lecture-a-voix-haute.webp` + `vocabulaire-lecture-a-voix-haute-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a small child sitting cross-legged with a large open picture book on
their lap, looking up in wonder. From the book rise dozens of tiny glowing
shapes, each a small object rather than a word: a tiny sailboat, a lantern, a
feather, a key, a leaf, a whale, floating upward like fireflies and filling
the upper half of the frame. Warm cream background. Feeling: vocabulary as
treasure, entirely without written words.
```

## 7. coleres-enfant-histoires  *(new)*
**Rename to:** `coleres-enfant-histoires.webp` + `coleres-enfant-histoires-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a young child sitting on the floor with fists clenched and cheeks
flushed, a small stylised storm cloud with soft orange lightning hovering just
above their head, and a toppled tower of wooden blocks beside them. A parent
kneels calmly at a respectful distance, open-handed, not touching, waiting.
The storm is small, rounded and almost cute, never violent. Feeling: a big
emotion in a small body, met with calm.
```

## 8. rentree-maternelle-preparer  *(new)*
**Rename to:** `rentree-maternelle-preparer.webp` + `rentree-maternelle-preparer-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a school gate on a bright early morning, seen from behind a small child
wearing a backpack far too big for them, holding a parent's hand and looking
up at the open doorway. Warm morning light, a few blurred children and a
welcoming adult silhouette in the playground beyond. Autumn leaves on the
ground. Feeling: a big step, gently supported.
```

## 9. enfant-bilingue-deux-langues  *(new)*
**Rename to:** `enfant-bilingue-deux-langues.webp` + `enfant-bilingue-deux-langues-card.webp`
**Save in:** `app/public/img/blog/`

```
Scene: a child sitting between two open storybooks, one on each side, looking
happily from one to the other. From the left book rise soft mint-coloured
glowing shapes, from the right book warm peach-coloured ones, and they meet
and mingle in a gentle swirl above the child's head. Cosy reading corner,
evening light. Feeling: two worlds meeting in one head, playful and effortless.
```

---

## After generating

1. Save all files in `app/public/img/blog/` with the exact names above.
2. Add the 5 new slugs to the `"blog"` array in
   `app/src/data/generated-images.json`.
3. Rebuild: the hero and card images appear automatically.
