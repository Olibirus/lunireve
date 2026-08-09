# Image prompts — "Create a story" page (Nano Banana 2 Pro)

Every image still missing on `/creer` (Créer une histoire), ready to copy-paste.

## How to use

1. Generate each image with the prompt below, at the stated aspect ratio.
2. Save it with the EXACT filename given (all lowercase, `.webp`).
3. Drop it in `app/public/illustrations/` (create the folder, it does not exist yet).
4. Nothing else to do: the page already points at
   `/illustrations/style-<id>.webp` and shows the art the moment the file is
   there. If a file is missing the old placeholder icon just stays.

**Format:** WebP, 4:3, 1024x768 or larger (they render at ~260x195, so anything
above 800px wide is plenty). If your tool only exports PNG/JPG, convert with
`cwebp -q 82 in.png -o out.webp` (or Squoosh).

**Consistency rule:** these 7 images sit side by side in one grid, so they must
show **the exact same scene** in 7 different art styles. That is the entire
point: the parent compares styles, not subjects. Keep the same fox, same pose,
same composition, same palette family in all 7.

---

## The shared scene (used by all 7 prompts)

> A small friendly fox cub with a warm cream-and-ginger coat sits on a round
> hill at night, looking up at a big starry sky with a crescent moon. A few
> soft clouds. A single glowing firefly floats near the cub. Calm bedtime mood,
> night-blue and soft-indigo palette with mint-green accents.

---

## 1. Automatique (default style)

**Filename:** `style-automatique.webp`
**Aspect ratio:** 4:3

```
Warm children's picture-book illustration: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Soft painterly gouache texture, gentle bedtime palette of night blue and soft indigo with mint-green accents, cozy candle-like highlights, hand-illustrated feel, rounded friendly shapes. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

## 2. Vif (bold, for toddlers)

**Filename:** `style-vif.webp`
**Aspect ratio:** 4:3

```
Bold vibrant children's illustration for toddlers: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Saturated primary colors, thick playful shapes, high contrast, joyful energy, candy-bright palette, simple friendly forms, chunky outlines. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

## 3. Aquarelle (watercolor)

**Filename:** `style-aquarelle.webp`
**Aspect ratio:** 4:3

```
Delicate watercolor children's book illustration: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Wet-on-wet washes, soft pigment blooms, visible paper grain, airy negative space, light pencil underdrawing, night blue and soft indigo with mint-green accents. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

## 4. BD (European comic / ligne claire)

**Filename:** `style-bd.webp`
**Aspect ratio:** 4:3

```
European bande dessinee children's illustration in the ligne claire tradition: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Confident clean ink outlines of even weight, flat vivid colors, simple expressive face, no cross-hatching, night blue and soft indigo with mint-green accents. Single illustration, centered composition with comfortable margins. No text, no letters, no numbers, no speech bubbles, no logos, no frames, no borders, no comic panels, no gutters. 4:3 aspect ratio.
```

## 5. Animé 3D (3D animated film)

**Filename:** `style-anime3d.webp`
**Aspect ratio:** 4:3

```
High-quality 3D animated family-film still: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Soft global illumination, rounded appealing shapes, expressive big eyes, subsurface scattering on the fur, shallow depth of field, warm rim light against the night blue sky, mint-green accents. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

## 6. Crayons (colored pencil)

**Filename:** `style-crayons.webp`
**Aspect ratio:** 4:3

```
Colored-pencil children's illustration: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Visible layered pencil strokes, waxy texture, gentle hand-drawn wobble in the lines, paper tooth showing through, night blue and soft indigo with mint-green accents. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

## 7. Kawaii (chibi)

**Filename:** `style-kawaii.webp`
**Aspect ratio:** 4:3

```
Kawaii chibi children's illustration: a small friendly fox cub with a cream-and-ginger coat sits on a round hill at night, looking up at a big starry sky with a crescent moon, a few soft clouds, one glowing firefly nearby. Oversized sparkly eyes, tiny rounded body, big head, soft pastel palette over a gentle night-blue sky, blush cheeks, mint-green accents, simple clean background. Centered composition with comfortable margins. No text, no letters, no numbers, no logos, no frames, no borders, no split panels. 4:3 aspect ratio.
```

---

## Checklist

| # | Filename | Goes in |
|---|---|---|
| 1 | `style-automatique.webp` | `app/public/illustrations/` |
| 2 | `style-vif.webp` | `app/public/illustrations/` |
| 3 | `style-aquarelle.webp` | `app/public/illustrations/` |
| 4 | `style-bd.webp` | `app/public/illustrations/` |
| 5 | `style-anime3d.webp` | `app/public/illustrations/` |
| 6 | `style-crayons.webp` | `app/public/illustrations/` |
| 7 | `style-kawaii.webp` | `app/public/illustrations/` |

---

## Later: the character wizard (`/compte/personnages/nouveau`)

Same convention, same folder, filename = the slot id + `.webp`. These are small
square icons (1:1, 512x512 is plenty), NOT scenes. Not urgent: the wizard reads
fine with its placeholder boxes today.

Base prompt to reuse, replacing `<SUBJECT>`:

```
Simple friendly children's app icon illustration of <SUBJECT>, soft painterly gouache texture, warm cream background, night-blue and soft-indigo palette with mint-green accents, rounded shapes, centered, generous margins, flat and uncluttered. No text, no letters, no numbers, no logos, no frames, no borders. 1:1 square aspect ratio.
```

Slot ids in use (prefix `char-`): `type-*`, `gender-*`, `skin-*`, `hair-*`,
`glasses-*`, `build-*`, `mobility-*`, `hat-*`, `clothing-*`, `extra-*`,
`animal-*`, `animal-acc-*`, plus `char-preview`. To list the exact ids:

```bash
grep -rn "slotId=" app/src/app/\[locale\]/\(app\)/compte/personnages/nouveau/page.tsx
```
