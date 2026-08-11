# Library expansion to V1: target 60 stories

Status: **list only**, nothing written yet. Approve or edit, then generation is the next step.

Current library: **12 stories**. Target: **60** (48 new).

---

## 1. Why 60

Every facet in the app is a page or a filter chip. A facet with 0 matches renders the
"Aucune histoire ne correspond" card, which for Google is a thin/empty page, and for a
parent is a dead end. Today 10 of 18 themes, 2 of 9 genres and 15 of 25 characters return zero.

The floor is set by the widest facet, not by a round number:

| Facet | Pages/chips | Want per facet | Implied total |
|---|---|---|---|
| Genre (`/histoires/genre/*`) | 9 | 6 (fills 2 grid rows + promo card) | **54** |
| Theme (filter chips) | 18 | 3 | **54** |
| Age (`/histoires/age/*`) | 6 | 8 | 48 |
| Character (filter chips) | 25 | 2 | 50 |
| Duration (`/histoires/duree/*`) | 3 | 10 | 30 |

So ~54 is the real floor. **60** rounds it to exactly 10 per age range, which is the
cleanest thing to hold in your head and the easiest to keep balanced later.

Below 40 the genre pages stay visibly empty. Above 80 you are paying for content that
adds no new facet coverage; at that point growth should be driven by search demand
(Search Console queries), not by filling the grid.

---

## 2. Target coverage at 60

**Age: 10 each** (1-2, 3-4, 5-6, 7-8, 9-10, 11-12)

**Genre** (now to target): conte 2>8 · aventure 2>8 · educative 2>7 · fantastique 2>7 ·
rigolote 1>7 · fete **0>6** · mystere 1>6 · science-fiction 2>6 · metier **0>5**

**Theme**, all 18 reach 3 or more. Ten themes go from zero: animaux, ecole, noel,
anniversaire, famille, voyage, espace, mer, saisons, sport.

**Character**: all 25 chips reach 2 or more (15 are at zero today).

**Duration**: 27 short / 22 medium / 11 long. Lengths follow the age rule already in
`MockStory` (1-2: 2-3 min · 3-4: 3-5 · 5-6: 5-7 · 7-8: 7-9 · 9-10: 9-12 · 11-12: 10-15).

**Interactive**: 2 today, target 8. Marked `[I]` below.

---

## 3. The 48 new stories

Columns match `MockStory` in `data/mock-stories.ts`. Each needs FR + EN body
(existing stories are `language: "fr"` with locale-aware content).

### 1-2 ans (9 new, 2-3 min, all short)
Repetitive, sensory, no real conflict. Genres limited to conte / educative / rigolote / fete.

| # | Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|---|
| 1 | Bonne nuit, petit lapin | conte | emotions | lapin | 2 |
| 2 | Le doudou de Nino | educative | famille | enfant-garcon | 3 |
| 3 | Coucou, petit chat ! | rigolote | humour | chat | 2 |
| 4 | Le hibou qui compte les étoiles | conte | nature | hibou | 3 |
| 5 | Un câlin pour Papa Ours | educative | famille | ours | 2 |
| 6 | Le premier flocon du renardeau | conte | saisons | renard | 3 |
| 7 | Le gâteau d'anniversaire de Mimi | fete | anniversaire | gateau | 3 |
| 8 | Le petit lion qui bâille | rigolote | animaux | lion | 2 |
| 9 | Les bottes rouges du chat | educative | saisons | chat | 3 |

### 3-4 ans (7 new, 3-5 min, all short)

| # | Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|---|
| 10 | La licorne qui avait perdu ses couleurs | fantastique | fantastique | licorne | 4 |
| 11 | Le loup qui voulait juste un ami | conte | amitie | loup | 4 |
| 12 | Nino part à l'école des petits | educative | ecole | enfant-garcon | 4 |
| 13 | Le goûter surprise de Pilou | fete | anniversaire | lapin | 3 |
| 14 | Le sapin qui n'aimait pas les boules | fete | noel | fee | 4 |
| 15 | Le dinosaure qui avait peur du tonnerre | educative | emotions | dinosaure | 4 |
| 16 | Mamie Rose et le chat du grenier | conte | famille | grand-mere | 5 |

### 5-6 ans (8 new, 5-7 min)

| # | Titre | Genre | Thème | Personnage | Min | Durée |
|---|---|---|---|---|---|---|
| 17 | La sirène et le coquillage qui chante | fantastique | mer | sirene | 6 | medium |
| 18 | Le pirate qui avait le mal de mer | rigolote | mer | pirate | 6 | medium |
| 19 | La licorne des lanternes de Noël | fete | noel | licorne | 5 | short |
| 20 | Le petit chevalier et le pont de brume `[I]` | aventure | courage | chevalier | 6 | medium |
| 21 | Qui a mangé les fraises du jardin ? `[I]` | mystere | animaux | dinosaure | 5 | short |
| 22 | Le robot qui apprenait à dire bonjour | science-fiction | amitie | robot | 6 | medium |
| 23 | Une journée avec la boulangère | metier | decouverte | grand-mere | 5 | short |
| 24 | Le dragon pompier | metier | courage | dragon | 7 | medium |

### 7-8 ans (7 new, 7-9 min, all medium)

| # | Titre | Genre | Thème | Personnage | Min |
|---|---|---|---|---|---|
| 25 | La princesse qui refusait la tour | aventure | aventure | princesse | 8 |
| 26 | Le match de la dernière minute | fete | sport | lion | 7 |
| 27 | Le trésor sous le préau `[I]` | mystere | ecole | enfant-fille | 8 |
| 28 | La fée qui avait égaré sa baguette | fantastique | humour | fee | 7 |
| 29 | Trois jours dans la peau d'un vétérinaire | metier | animaux | enfant-fille | 8 |
| 30 | Le loup blanc de la montagne | aventure | nature | loup | 9 |
| 31 | Le hibou et le cerf-volant | conte | voyage | hibou | 7 |

### 9-10 ans (9 new, 9-12 min)

| # | Titre | Genre | Thème | Personnage | Min | Durée |
|---|---|---|---|---|---|---|
| 32 | La station spatiale silencieuse `[I]` | mystere | espace | astronaute | 10 | medium |
| 33 | Le jardin en apesanteur | science-fiction | espace | astronaute | 11 | long |
| 34 | Le carnet de la sorcière bienveillante | fantastique | fantastique | sorciere | 10 | medium |
| 35 | Disparition au phare du Nord `[I]` | mystere | mer | sirene | 11 | long |
| 36 | La traversée des montagnes bleues | aventure | voyage | enfant-fille | 12 | long |
| 37 | Le tournoi des quatre bannières | aventure | sport | chevalier | 10 | medium |
| 38 | Le laboratoire de grand-père | metier | decouverte | grand-mere | 10 | medium |
| 39 | Le calendrier oublié du marchand | fantastique | saisons | marchand | 11 | long |
| 40 | Le concours de blagues du royaume | rigolote | humour | reine | 9 | medium |

### 11-12 ans (8 new, 10-15 min)

| # | Titre | Genre | Thème | Personnage | Min | Durée |
|---|---|---|---|---|---|---|
| 41 | Le dernier train pour Aubeterre `[I]` | mystere | voyage | enfant-garcon | 13 | long |
| 42 | La cartographe des îles perdues | aventure | nature | pirate | 14 | long |
| 43 | Colonie Meridian, an 2140 `[I]` | science-fiction | espace | robot | 13 | long |
| 44 | Le stage sur Mars de Théo | science-fiction | ecole | astronaute | 12 | long |
| 45 | Le concert de Noël de la sorcière | fete | noel | sorciere | 10 | medium |
| 46 | Un été chez les gardiens de phare | metier | emotions | phare | 11 | long |
| 47 | Les quinze ans de Zélie, presque | rigolote | anniversaire | princesse | 10 | medium |
| 48 | Le tournoi de foot des voisins | rigolote | sport | enfant-garcon | 11 | long |

---

## 4. Verification of the final 60

**Genre** (existing + new = total): conte 2+6=8 · aventure 2+6=8 · educative 2+5=7 ·
fantastique 2+5=7 · rigolote 1+6=7 · fete 0+6=6 · mystere 1+5=6 · science-fiction 2+4=6 ·
metier 0+5=5. **Sum 60, no genre page under 5.**

**Theme** (all 18, final): emotions 5 · nature 5 · aventure 4 · humour 4 · amitie 3 ·
courage 3 · decouverte 3 · fantastique 3 · animaux 3 · ecole 3 · noel 3 · anniversaire 3 ·
famille 3 · voyage 3 · espace 3 · mer 3 · saisons 3 · sport 3. **Sum 60, none under 3.**

**Character** (all 25, final): enfant-fille 6 · enfant-garcon 6 · grand-mere 4 ·
astronaute 3 · reine 3 · renard 2 · dragon 2 · ours 2 · marchand 2 · gateau 2 · phare 2 ·
lapin 2 · chat 2 · hibou 2 · lion 2 · licorne 2 · loup 2 · dinosaure 2 · sirene 2 ·
pirate 2 · chevalier 2 · robot 2 · princesse 2 · fee 2 · sorciere 2. **None under 2.**

**Duration**: short 27 · medium 22 · long 11.

**Interactive**: 2 existing + 6 new = 8.

---

## 5. Notes before generating

- Titles above are working titles: change freely, the taxonomy columns are what matter.
- `rating`, `ratingCount`, `favoritesCount` stay **0** (real data only rule).
- `hasAudio: true`, `audioUrl: null` (generated at first listen, like the current 12).
- `publishedAt` should be spread over the last 6 months, not all the same day, or the
  "newest" sort and the homepage LatestStories carousel collapse into one block.
- Covers: reuse the 8 `cover-*` gradients now, real art later per
  `docs/BLOG_IMAGE_PROMPTS.md` conventions.
- `subTheme` is free text and is what feeds the long-tail SEO, so make each one specific
  (`peur-du-noir`, `premier-jour-decole`) rather than a repeat of `theme`.
- 60 stories x FR + EN bodies is the real cost. Suggest generating in 6 batches of 10
  (one age range per batch) so each batch can be reviewed before the next.
