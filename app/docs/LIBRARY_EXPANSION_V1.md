# Library expansion to V1: target 60 stories

Target **60** stories. Taxonomy trimmed and approved 2026-08-11.

| | Now | Target |
|---|---|---|
| Stories | **28** | 60 |
| Ages | 6 | 6 (unchanged) |
| Genres | 9 | 9 (unchanged) |
| Lengths | 3 | 3 (unchanged) |
| Themes | **12** (was 18) | 12, five stories each |
| Characters | **23** (was 25) | 23, two or more each |

**Batches 1 (1-2 ans) and 2 (3-4 ans) are shipped.** Batches 3 to 6 are listed
below and not written yet.

---

## 1. Approved taxonomy

**Ages (6, unchanged):** 1-2 · 3-4 · 5-6 · 7-8 · 9-10 · 11-12

**Genres (9, unchanged):** conte · aventure · fete · mystere · science-fiction ·
educative · fantastique · rigolote · metier

**Lengths (3, unchanged):** short (≤5 min) · medium (6-10) · long (>10)

**Themes: 18 to 12.** Rule applied: genre says what kind of story it is, theme says
what it is about in the child's life, and no word may sit on both axes.
Dropped `aventure`, `fantastique`, `humour`, `decouverte` (they repeated a genre),
plus `voyage` and `sport` (no real demand). Their i18n labels are kept so either can
come back without touching messages.

> emotions · amitie · famille · courage · ecole · animaux · nature · mer · espace ·
> noel · anniversaire · saisons

**Characters: 25 to 23.** Dropped `gateau`, `phare`, `marchand` (props from a single
story, not browsable categories), `reine` (merged into `princesse`) and `grand-mere`
(a family relationship the `famille` theme covers). Added `groupe-enfants`, `chien`,
`souris`.

> **Enfants:** enfant-fille · enfant-garcon · groupe-enfants
> **Animaux:** renard · loup · ours · lapin · chat · chien · souris · hibou · lion · dinosaure
> **Créatures:** dragon · licorne · fee · sirene · sorciere
> **Héros:** princesse · chevalier · pirate · astronaute · robot

The 12 original stories were recast onto this taxonomy, so no story points at a filter
value that no longer exists.

**V2, not V1:** the competitor's genre → subgenre → character cascade needs thousands
of stories to avoid empty leaves. The `subTheme` field already on every story is
exactly where that middle level lives, so V2 is a UI layer, not a re-architecture.

---

## 2. Writing conventions (enforced by the batch validator)

| Rule | Value |
|---|---|
| Word count | `WORD_RANGE_BY_AGE`: 1-2 **200-320** · 3-4 250-500 · 5-6 500-800 · 7-8 800-1200 · 9-10 1200-1700 · 11-12 1500-2100 |
| Reading minutes | 1-2 2 · 3-4 3-5 · 5-6 5-7 · 7-8 7-9 · 9-10 9-12 · 11-12 10-15 |
| Paragraphs | multiples of 4 (the story page draws a chapter rule every 4th paragraph). 1-2 uses 12 |
| Quiz questions | `quizLength(words)` in `data/mock-stories.ts`: **2** under 200 words, **3** under 500, **4** under 900, **5** under 1400, **6** beyond. `storyQuiz()` slices to it, so a story that grows or shrinks self-corrects |
| Quiz shape | 3 choices + an explanation per question |
| Glossary | 3 entries, each word appearing **literally** in the body or no tooltip renders |
| Dialogue | `« … »` in FR, `“ … ”` in EN: both render italic in `--color-indigo-soft-700` |
| Moral | required for 1-2 / 3-4 / 5-6 / 7-8 (`endsWithMoral`), woven into the last paragraph, never bolted on. 9-12 trust the reader |
| Aggregates | `rating`, `ratingCount`, `favoritesCount` all **0** |
| Audio | `hasAudio: true`, `audioUrl: null` (generated at first listen) |
| Titles | FR `title`/`excerpt` plus EN `titleEn`/`excerptEn` |

---

## 3. Batch 1: 1-2 ans — SHIPPED

Nine stories, 8 paragraphs each, 3 quiz questions, 3 glossary words, FR + EN.

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| Bonne nuit, petit lapin | conte | emotions | lapin | 2 |
| Le doudou de Nino | educative | famille | enfant-garcon | 3 |
| Coucou, petit chat ! | rigolote | animaux | chat | 2 |
| Le hibou qui compte les étoiles | conte | nature | hibou | 3 |
| Un câlin pour Papa Ours | educative | famille | ours | 2 |
| Le premier flocon du renardeau | conte | saisons | renard | 3 |
| Le gâteau d'anniversaire de Mimi | fete | anniversaire | souris | 3 |
| Le petit lion qui bâille | rigolote | animaux | lion | 2 |
| Les bottes rouges de Lila | educative | saisons | enfant-fille | 3 |

---

## 3b. Batch 2: 3-4 ans — SHIPPED

Seven stories, 8 paragraphs each, 259-337 words, 3 quiz questions, 3 glossary
words, FR + EN. `readingMinutes` across the whole 3-4 range was re-derived from
word count (under 280 words = 3 min, up to 340 = 4, beyond = 5), which also
corrected four older entries that had drifted.

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| La licorne qui avait perdu ses couleurs | fantastique | amitie | licorne | 4 |
| Le loup qui voulait juste un ami | conte | amitie | loup | 4 |
| Nino part à l'école des petits | educative | ecole | enfant-garcon | 4 |
| Le goûter surprise de Pilou | fete | anniversaire | lapin | 4 |
| Le sapin qui n'aimait pas les boules | fete | noel | fee | 4 |
| Le dinosaure qui avait peur du tonnerre | educative | emotions | dinosaure | 3 |
| Le chien qui gardait les chaussons | rigolote | famille | chien | 4 |

---

## 4. Remaining 32 stories

Titles are working titles. The taxonomy columns are what drive the pages and chips.
`[I]` marks an interactive branching story (2 today, 8 at the end).

### Batch 3: 5-6 ans (8 new, 5-7 min)

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| La sirène et le coquillage qui chante | fantastique | mer | sirene | 6 |
| Le pirate qui avait le mal de mer | rigolote | mer | pirate | 6 |
| La licorne des lanternes de Noël | fete | noel | licorne | 5 |
| Le petit chevalier et le pont de brume `[I]` | aventure | courage | chevalier | 6 |
| Qui a mangé les fraises du jardin ? `[I]` | mystere | animaux | dinosaure | 5 |
| Le robot qui apprenait à dire bonjour | science-fiction | ecole | robot | 6 |
| Une journée avec la boulangère | metier | famille | enfant-fille | 5 |
| Le dragon pompier | metier | courage | dragon | 7 |

### Batch 4: 7-8 ans (7 new, 7-9 min, medium)

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| La princesse qui refusait la tour | aventure | courage | princesse | 8 |
| Le match de la dernière minute | fete | ecole | lion | 7 |
| Le trésor sous le préau `[I]` | mystere | ecole | groupe-enfants | 8 |
| La fée qui avait égaré sa baguette | fantastique | amitie | fee | 7 |
| Trois jours chez le vétérinaire | metier | animaux | enfant-fille | 8 |
| Le loup blanc de la montagne | aventure | nature | loup | 9 |
| Le hibou et le cerf-volant | conte | saisons | hibou | 7 |

### Batch 5: 9-10 ans (9 new, 9-12 min)

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| La station spatiale silencieuse `[I]` | mystere | espace | astronaute | 10 |
| Le jardin en apesanteur | science-fiction | espace | astronaute | 11 |
| Le carnet de la sorcière bienveillante | fantastique | amitie | sorciere | 10 |
| Disparition au phare du Nord `[I]` | mystere | mer | sirene | 11 |
| La traversée des montagnes bleues | aventure | saisons | enfant-fille | 12 |
| Le tournoi des quatre bannières | aventure | anniversaire | chevalier | 10 |
| Le laboratoire du grand-père de Zoé | metier | famille | enfant-fille | 10 |
| Le calendrier oublié | fantastique | saisons | sorciere | 11 |
| Le concours de blagues du royaume | rigolote | animaux | chat | 9 |

### Batch 6: 11-12 ans (8 new, 10-15 min)

| Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|
| Le dernier train pour Aubeterre `[I]` | mystere | noel | enfant-garcon | 13 |
| La cartographe des îles perdues | aventure | mer | pirate | 14 |
| Colonie Meridian, an 2140 `[I]` | science-fiction | espace | robot | 13 |
| Le stage sur Mars de Théo | science-fiction | ecole | astronaute | 12 |
| Le concert de Noël du village | fete | noel | groupe-enfants | 10 |
| Un hiver chez les gardiens de nuit | metier | nature | chien | 11 |
| Les quinze ans de Zélie, presque | rigolote | anniversaire | princesse | 10 |
| La nuit la plus longue de l'année | conte | noel | enfant-garcon | 12 |

---

## 5. Coverage of the final 60

**Genre:** conte 8 · aventure 8 · educative 7 · fantastique 7 · rigolote 7 · fete 6 ·
mystere 6 · science-fiction 6 · metier 5. No genre page under 5.

**Theme:** all 12 land on exactly 5.

**Character:** enfant-fille 9 · enfant-garcon 7 · astronaute 3 · princesse 3 · every
other chip 2. None under 2.

**Duration:** short 26 · medium 22 · long 12.

**Interactive:** 8.

---

## 6. Notes

- Covers reuse the 8 `cover-*` gradients until real art exists.
- `subTheme` is free text and carries the long-tail SEO, so keep each one specific
  (`rituel-du-coucher`, `premiere-neige`) rather than a repeat of `theme`.
- `publishedAt` is spread across the year: the library "plus récentes" sort now reads
  this field (it used to return array order, which showed the OLDEST story first).
- Each batch is validated before insertion by
  `scratchpad/insert-batch1.js`: paragraph count, word count, quiz shape, glossary
  words present in the body, styled dialogue present, no em dashes.
