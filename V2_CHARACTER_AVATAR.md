# V2 — Illustrated character avatar (layered SVG)

**Status:** deferred to V2. Decided 2026-08-11 (Harry).

## What V1 ships

The character wizard (`/compte/personnages/nouveau`) shows a **written**
portrait only: name, type, age, gender, role, the composed description
("peau claire, cheveux bruns courts, lunettes rondes...") and the personality
chips. The placeholder image box that used to sit at the top of that panel was
removed, because an empty dashed rectangle reads as a bug, not as a promise.

## Why not one picture per combination

The wizard offers skin (3) x hair colour (7) x hair style (12) x eyes (8) x
glasses (7) x build (5) x hat (9) x clothing (10, multi) x extras (8, multi),
plus a whole separate animal branch. That is millions of permutations: there is
no world in which each gets its own file.

## The V2 approach: layered SVG (option "b")

Draw the avatar **once per option**, as flat SVG layers, then stack them in
z-order at render time. This is how Bitmoji / Notion-style builders work, and it
covers every combination for a fixed, one-time illustration cost.

Estimated ~60 layer files, roughly 2-3 days of illustration work:

| Layer (z-order, bottom first) | Files | Notes |
|---|---|---|
| 1. Body + skin base | 3 skin tones x 5 builds | Or 3 skins with a build-scaled body path |
| 2. Clothing | 10 | Must sit on the body silhouette |
| 3. Face (eyes) | 8 | Eye colour is a tint, so 1 shape + `fill` |
| 4. Hair back | 12 cuts | Colour is a tint (7 colours), not 84 files |
| 5. Hair front | 12 cuts | Same tint trick |
| 6. Hair specials | 3 | Bald / headscarf / hijab replace layers 4-5 |
| 7. Glasses | 7 | |
| 8. Hat | 9 | Drawn over hair front |
| 9. Extras | 8 | Scarf, backpack, wand... |
| 10. Mobility aids | 10 | Wheelchair etc. need a wider canvas |

**Key trick:** colour (hair, eyes, coat) is a `fill` on a single shape, never a
separate file. That is what collapses 12 cuts x 7 colours from 84 files to 12.

Animals need their own set (family/species/coat/size + 3 accessories), which is
a second, comparable batch. Consider shipping the human avatar first.

## Where it plugs in

- Option ids already exist in `app/src/lib/characterOptions.ts` (`SKIN_OPTIONS`,
  `HAIR_STYLES`, `HAIR_COLORS`, `EYE_OPTIONS`, ...). The layer filenames should
  match those ids exactly: `/public/avatar/hair-front-<id>.svg` etc.
- The saved shape is already there too: `CharacterAppearance` in
  `app/src/lib/characters.ts` holds every picked id, so the renderer just reads
  that object. Nothing about the data model needs to change.
- Render point: the preview panel in
  `app/src/app/[locale]/(app)/compte/personnages/nouveau/page.tsx` (search for
  the "V1 ships the written portrait only" comment), plus the character cards
  on `/compte/personnages`.

## Alternative considered

Generating one AI portrait per character on save and caching it (~1 image cost
per character, not per combination). Cheaper to build, and it matches the story
illustrations, but it re-generates on every edit and cannot preview live while
the parent is still picking. Kept as a fallback if the SVG work slips.
