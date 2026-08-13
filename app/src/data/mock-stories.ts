/**
 * Mock story data for Phase 1. Real data lives in `stories` table (schema.ts)
 * and will be wired in once n8n starts populating the library.
 *
 * The shape here intentionally mirrors a subset of the DB `stories` row so
 * swapping from mock → Drizzle query is a one-line replacement.
 */

export const GENRES = [
  "conte",
  "aventure",
  "fete",
  "mystere",
  "science-fiction",
  "educative",
  "fantastique",
  "rigolote",
  "metier",
] as const;
export type Genre = (typeof GENRES)[number];

/** Age taxonomy aligned on 2-year buckets (navbar dropdown + filters). */
export const AGE_RANGES = ["1-2", "3-4", "5-6", "7-8", "9-10", "11-12"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

/** "1-2" → "1–2 ans" (display). */
export function ageLabel(range: AgeRange | string, locale?: string): string {
  const span = String(range).replace("-", "–");
  return locale === "en" ? `${span} years` : `${span} ans`;
}

/** Child profile age (1–16) → closest content bucket. */
export function ageToRange(age: number): AgeRange {
  if (age <= 2) return "1-2";
  if (age <= 4) return "3-4";
  if (age <= 6) return "5-6";
  if (age <= 8) return "7-8";
  if (age <= 10) return "9-10";
  return "11-12";
}

export const DURATION_BUCKETS = ["short", "medium", "long"] as const;
export type DurationBucket = (typeof DURATION_BUCKETS)[number];

/** ≤5 min = short · 6–10 = medium · >10 = long */
export function durationBucket(minutes: number): DurationBucket {
  if (minutes <= 5) return "short";
  if (minutes <= 10) return "medium";
  return "long";
}

export type MockStory = {
  slug: string;
  title: string;
  /**
   * English title/excerpt. Optional: the original 12 stories only ever had a
   * French one, and `storyTitle`/`storyExcerpt` fall back to it, so an EN page
   * without a translation behaves exactly as before.
   */
  titleEn?: string;
  excerptEn?: string;
  language: "fr" | "en";
  ageRange: AgeRange;
  /**
   * Curated, age-appropriate length. The generation pipeline computes this
   * from word count at a child-paced 140 wpm and clamps it to the age
   * bracket (1-2: 2-3 min · 3-4: 3-5 · 5-6: 5-7 · 7-8: 7-9 · 9-10: 9-12 ·
   * 11-12: 10-15) so displayed minutes always match the real text.
   */
  readingMinutes: number;
  genre: Genre;
  theme: string; // slug key for i18n (themes.aventure, themes.amitie, …)
  subTheme: string; // free slug, finer than theme (e.g. "peur-du-noir")
  character: string; // main character slug — powers the character filter
  tags: string[];
  excerpt: string;
  cover:
    | "cover-dusk"
    | "cover-meadow"
    | "cover-peach"
    | "cover-indigo"
    | "cover-mint"
    | "cover-night"
    | "cover-sand"
    | "cover-sea";
  /** Real aggregates only. 0 until actual users rate (no fake numbers). */
  rating: number;
  ratingCount: number;
  /** Real favorites aggregate (mirrors stories.favorites_count). 0 until real. */
  favoritesCount: number;
  hasAudio: boolean;
  /** null = audio generated at first listen (cost-saving), then cached here */
  audioUrl: string | null;
  interactive: boolean;
  /** Publication date (YYYY-MM-DD). Mirrors stories.published_at. */
  publishedAt: string;
};

export const mockStories: MockStory[] = [
  {
    slug: "le-renard-qui-ne-voulait-pas-dormir",
    publishedAt: "2026-01-08",
    title: "Le renard qui ne voulait pas dormir",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 3,
    genre: "educative",
    theme: "emotions",
    subTheme: "sommeil",
    character: "renard",
    tags: ["renard", "coucher", "lune", "nuit", "sommeil", "rituel du soir", "douceur"],
    excerpt:
      "Filo le petit renard trouve toujours une raison pour ne pas aller au lit. Jusqu'à la nuit où la lune lui confie un secret.",
    cover: "cover-night",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "lea-et-la-baleine-bleue",
    publishedAt: "2026-01-22",
    title: "Léa et la baleine bleue",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 7,
    genre: "aventure",
    theme: "mer",
    subTheme: "voyages-sous-la-mer",
    character: "enfant-fille",
    tags: ["mer", "baleine", "voilier", "ocean", "amitie", "voyage", "aventure"],
    excerpt:
      "Le jour où Léa tombe de son voilier, elle rencontre une baleine qui l'emmène bien plus loin qu'elle ne l'imaginait.",
    cover: "cover-sea",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-potager-magique-de-mamie-rose",
    publishedAt: "2026-02-05",
    title: "Le potager magique de Mamie Rose",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 3,
    genre: "conte",
    theme: "nature",
    subTheme: "jardin",
    character: "enfant-fille",
    tags: ["potager", "jardin", "graines", "nature", "famille", "grand-mere", "patience", "magie"],
    excerpt:
      "Chez Mamie Rose, les tomates chantent et les carottes dansent. Aujourd'hui, une graine mystérieuse vient d'arriver.",
    cover: "cover-meadow",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "timothee-et-le-dragon-timide",
    publishedAt: "2026-02-19",
    title: "Timothée et le dragon timide",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 7,
    genre: "fantastique",
    theme: "amitie",
    subTheme: "confiance-en-soi",
    character: "dragon",
    tags: ["dragon", "foret", "timidite", "courage", "amitie", "confiance", "fantastique"],
    excerpt:
      "Dans la forêt d'Argoat vit un dragon qui n'ose pas faire peur à personne. Timothée va lui apprendre le courage.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-course-des-etoiles-filantes",
    publishedAt: "2026-03-05",
    title: "La course des étoiles filantes",
    language: "fr",
    ageRange: "9-10",
    readingMinutes: 5,
    genre: "science-fiction",
    theme: "espace",
    subTheme: "voyages-spatiaux",
    character: "enfant-fille",
    tags: ["etoiles", "course", "espace", "nuit", "ciel", "aventure", "reve"],
    excerpt:
      "Chaque siècle, les étoiles organisent une course folle. Cette année, une enfant a été invitée à y participer.",
    cover: "cover-indigo",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: true,
  },
  {
    slug: "petit-ours-apprend-a-attendre",
    publishedAt: "2026-03-19",
    title: "Petit ours apprend à attendre",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "educative",
    theme: "emotions",
    subTheme: "patience",
    character: "ours",
    tags: ["ours", "patience", "printemps", "maman", "emotions", "saisons", "nature"],
    excerpt:
      "Petit ours voudrait que le printemps arrive plus vite. Heureusement, sa maman connaît un truc magique.",
    cover: "cover-mint",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-marchand-de-reves-du-souk",
    publishedAt: "2026-04-02",
    title: "Le marchand de rêves du souk",
    language: "fr",
    ageRange: "11-12",
    readingMinutes: 11,
    genre: "conte",
    theme: "emotions",
    subTheme: "mille-et-une-nuits",
    character: "enfant-garcon",
    tags: ["marrakech", "reves", "souk", "marche", "voyage", "sagesse", "nuit", "partage"],
    excerpt:
      "Au cœur du vieux Marrakech, un homme vend des rêves en bocal. Mais que se passe-t-il quand un bocal se brise ?",
    cover: "cover-sand",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "les-jumeaux-et-la-comete",
    publishedAt: "2026-04-16",
    title: "Les jumeaux et la comète",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 7,
    genre: "science-fiction",
    theme: "espace",
    subTheme: "extraterrestres",
    character: "enfant-garcon",
    tags: ["comete", "jumeaux", "nuit", "etoiles", "espace", "aventure", "ciel"],
    excerpt:
      "Émile et Zoé voient chaque soir la même étoile filante. Et si cette étoile cherchait quelque chose ?",
    cover: "cover-dusk",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-bibliotheque-qui-marche-la-nuit",
    publishedAt: "2026-04-30",
    title: "La bibliothèque qui marche la nuit",
    language: "fr",
    ageRange: "11-12",
    readingMinutes: 5,
    genre: "mystere",
    theme: "courage",
    subTheme: "petits-enqueteurs",
    character: "enfant-fille",
    tags: ["bibliotheque", "mystere", "nuit", "livres", "aventure", "magie", "interactif"],
    excerpt:
      "On raconte que certaines nuits, la bibliothèque municipale change de trottoir. Camille a décidé d'en avoir le cœur net.",
    cover: "cover-night",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: true,
  },
  {
    slug: "le-gateau-qui-ne-voulait-pas-cuire",
    publishedAt: "2026-05-14",
    title: "Le gâteau qui ne voulait pas cuire",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 3,
    genre: "rigolote",
    theme: "anniversaire",
    subTheme: "inventions-farfelues",
    character: "souris",
    tags: ["cuisine", "gateau", "chocolat", "rire", "humour", "famille", "patience"],
    excerpt:
      "Ce matin, le gâteau au chocolat refuse d'entrer dans le four. Il a des choses à dire, lui aussi.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-petit-phare-et-la-tempete",
    publishedAt: "2026-05-28",
    title: "Le petit phare et la tempête",
    language: "fr",
    ageRange: "5-6",
    readingMinutes: 5,
    genre: "aventure",
    theme: "courage",
    subTheme: "mer",
    character: "enfant-garcon",
    tags: ["bretagne", "phare", "tempete", "courage", "mer", "nuit", "amitie"],
    excerpt:
      "Au bout de la Bretagne, un tout petit phare va devoir sauver un bateau malgré sa lumière vacillante.",
    cover: "cover-sea",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-reine-des-champignons",
    publishedAt: "2026-06-10",
    title: "La reine des champignons",
    language: "fr",
    ageRange: "5-6",
    readingMinutes: 5,
    genre: "fantastique",
    theme: "nature",
    subTheme: "royaume-miniature",
    character: "princesse",
    tags: ["foret", "champignons", "royaume", "nature", "fantastique", "aventure", "reine"],
    excerpt:
      "Sous la mousse du vieil hêtre règne une reine minuscule. Cette semaine, son royaume a été volé.",
    cover: "cover-meadow",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "bonne-nuit-petit-lapin",
    publishedAt: "2026-06-24",
    title: "Bonne nuit, petit lapin",
    titleEn: "Good night, little rabbit",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "conte",
    theme: "emotions",
    subTheme: "rituel-du-coucher",
    character: "lapin",
    tags: ["lapin", "coucher", "douceur", "terrier"],
    excerpt: "Pilou ne veut pas fermer les yeux avant d'avoir dit bonne nuit à tout le monde. Absolument tout le monde.",
    excerptEn: "Pilou will not close his eyes until he has said good night to everyone. Absolutely everyone.",
    cover: "cover-night",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-doudou-de-nino",
    publishedAt: "2026-07-01",
    title: "Le doudou de Nino",
    titleEn: "Nino's cuddly toy",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "educative",
    theme: "famille",
    subTheme: "objet-perdu",
    character: "enfant-garcon",
    tags: ["doudou", "famille", "coucher", "chercher"],
    excerpt: "Impossible de dormir : le doudou de Nino a disparu. Toute la maison part à sa recherche.",
    excerptEn: "Nobody can sleep: Nino's cuddly toy has vanished. The whole house goes looking for it.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "coucou-petit-chat",
    publishedAt: "2026-07-08",
    title: "Coucou, petit chat !",
    titleEn: "Peekaboo, little cat!",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "rigolote",
    theme: "animaux",
    subTheme: "cache-cache",
    character: "chat",
    tags: ["chat", "cache-cache", "rire", "jeu"],
    excerpt: "Moustache est le champion du monde de cache-cache. Sauf que sa queue, elle, ne se cache jamais.",
    excerptEn: "Moustache is the world champion of hide-and-seek. Except his tail never hides at all.",
    cover: "cover-mint",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-hibou-qui-compte-les-etoiles",
    publishedAt: "2026-07-15",
    title: "Le hibou qui compte les étoiles",
    titleEn: "The owl who counts the stars",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "conte",
    theme: "nature",
    subTheme: "ciel-de-nuit",
    character: "hibou",
    tags: ["hibou", "étoiles", "nuit", "compter"],
    excerpt: "Chaque soir, Hulotte compte les étoiles. Chaque soir, elle s'endort avant d'avoir fini.",
    excerptEn: "Every evening, Hulotte counts the stars. Every evening, she falls asleep before she finishes.",
    cover: "cover-indigo",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "un-calin-pour-papa-ours",
    publishedAt: "2026-07-22",
    title: "Un câlin pour Papa Ours",
    titleEn: "A hug for Daddy Bear",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "educative",
    theme: "famille",
    subTheme: "consoler-quelquun",
    character: "ours",
    tags: ["ours", "câlin", "famille", "réconfort"],
    excerpt: "Papa Ours a l'air tout gris ce soir. Petit Ours connaît un remède qui marche à tous les coups.",
    excerptEn: "Daddy Bear looks all grey this evening. Little Bear knows a cure that works every time.",
    cover: "cover-sand",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-premier-flocon-du-renardeau",
    publishedAt: "2026-07-29",
    title: "Le premier flocon du renardeau",
    titleEn: "The fox cub's first snowflake",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "conte",
    theme: "saisons",
    subTheme: "premiere-neige",
    character: "renard",
    tags: ["renard", "neige", "hiver", "première fois"],
    excerpt: "Petit Roux n'a jamais vu la neige. Ce matin, quelque chose de blanc et de froid se pose sur son museau.",
    excerptEn: "Little Rusty has never seen snow. This morning, something white and cold lands on his nose.",
    cover: "cover-dusk",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-gateau-danniversaire-de-mimi",
    publishedAt: "2026-08-03",
    title: "Le gâteau d'anniversaire de Mimi",
    titleEn: "Mimi's birthday cake",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "fete",
    theme: "anniversaire",
    subTheme: "premier-gateau",
    character: "souris",
    tags: ["souris", "anniversaire", "gâteau", "fête"],
    excerpt: "Mimi la souris veut faire un gâteau pour son anniversaire. Un gâteau de souris, c'est tout petit, mais c'est parfait.",
    excerptEn: "Mimi the mouse wants to bake a birthday cake. A mouse cake is very small, but it is perfect.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-petit-lion-qui-baille",
    publishedAt: "2026-08-06",
    title: "Le petit lion qui bâille",
    titleEn: "The little lion who yawns",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "rigolote",
    theme: "animaux",
    subTheme: "baillement-contagieux",
    character: "lion",
    tags: ["lion", "savane", "bâillement", "rire"],
    excerpt: "Le bâillement de Nala fait le tour de la savane. Personne ne peut lui résister, même pas l'éléphant.",
    excerptEn: "Nala's yawn travels all around the savannah. Nobody can resist it, not even the elephant.",
    cover: "cover-sand",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "les-bottes-rouges-de-lila",
    publishedAt: "2026-08-10",
    title: "Les bottes rouges de Lila",
    titleEn: "Lila's red boots",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 2,
    genre: "educative",
    theme: "saisons",
    subTheme: "pluie-dautomne",
    character: "enfant-fille",
    tags: ["pluie", "automne", "bottes", "flaque"],
    excerpt: "Il pleut, et Lila a de nouvelles bottes rouges. Dehors, chaque flaque est une invitation.",
    excerptEn: "It is raining, and Lila has new red boots. Outside, every puddle is an invitation.",
    cover: "cover-meadow",
    rating: 0,
    ratingCount: 0,
    favoritesCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
];

/** Distinct character slugs present in the library — powers the character filter. */
/**
 * Characters offered as filters and personalization options. Starts with the
 * characters that have stories, then a broader cast (like the big bedtime-story
 * sites) so families have plenty to browse and to build personalized stories
 * from. Picking one with no library match leads to the "create a story" CTA.
 */
const STORY_CHARACTERS = [...new Set(mockStories.map((s) => s.character))];
const EXTRA_CHARACTERS = [
  "groupe-enfants",
  "chien",
  "souris",
  "licorne",
  "sirene",
  "pirate",
  "chevalier",
  "fee",
  "sorciere",
  "robot",
  "lion",
  "lapin",
  "chat",
  "hibou",
  "loup",
  "princesse",
  "astronaute",
  "dinosaure",
];
export const CHARACTERS = [...new Set([...STORY_CHARACTERS, ...EXTRA_CHARACTERS])];

export function findStory(slug: string): MockStory | undefined {
  return mockStories.find((s) => s.slug === slug);
}

/** Title in the reader's language, falling back to French when untranslated. */
export function storyTitle(s: MockStory, locale?: string): string {
  return locale === "en" && s.titleEn ? s.titleEn : s.title;
}

/** Excerpt in the reader's language, same fallback rule as `storyTitle`. */
export function storyExcerpt(s: MockStory, locale?: string): string {
  return locale === "en" && s.excerptEn ? s.excerptEn : s.excerpt;
}

/**
 * Bilingual search terms (#18): every story gets FR + EN keywords so a
 * French word ("chat", "renard") finds the same story as its English
 * equivalent ("cat", "fox"), whatever language the UI is in. Keyed by the
 * slug values already on each story (character / theme / genre).
 * Phase 2 replaces this with a Postgres full-text index that stores both
 * language columns per story.
 */
const BILINGUAL_TERMS: Record<string, string[]> = {
  // characters
  renard: ["renard", "fox"],
  "enfant-fille": ["fille", "petite fille", "girl", "child", "enfant"],
  "enfant-garcon": ["garçon", "garcon", "boy", "child", "enfant"],
  "grand-mere": ["grand-mère", "grand mere", "mamie", "grandmother", "grandma", "granny"],
  dragon: ["dragon"],
  ours: ["ours", "bear", "ourson"],
  marchand: ["marchand", "merchant", "vendeur", "seller"],
  gateau: ["gâteau", "gateau", "cake"],
  phare: ["phare", "lighthouse"],
  reine: ["reine", "queen"],
  // themes
  emotions: ["émotions", "emotions", "feelings", "sommeil", "sleep"],
  aventure: ["aventure", "adventure"],
  nature: ["nature", "jardin", "garden", "forêt", "forest"],
  amitie: ["amitié", "amitie", "friendship", "ami", "friend"],
  fantastique: ["fantastique", "fantasy", "magie", "magic"],
  humour: ["humour", "humor", "drôle", "funny", "rire", "laugh"],
  courage: ["courage", "brave", "bravery"],
  decouverte: ["découverte", "decouverte", "discovery"],
  // genres
  conte: ["conte", "fairy tale", "tale"],
  "science-fiction": ["science-fiction", "sci-fi", "espace", "space", "étoiles", "stars"],
  educative: ["éducative", "educative", "educational"],
  mystere: ["mystère", "mystery", "enquête", "detective"],
  rigolote: ["rigolote", "funny", "drôle"],
  mer: ["mer", "sea", "océan", "ocean", "baleine", "whale", "bateau", "boat"],
};

function searchCorpus(s: MockStory): string {
  const base = [s.title, s.excerpt, s.character, s.subTheme, s.theme, s.genre, ...s.tags];
  const synonyms = [s.character, s.theme, s.genre, s.subTheme]
    .flatMap((key) => BILINGUAL_TERMS[key] ?? []);
  return [...base, ...synonyms].join(" ").toLowerCase();
}

export function searchStories(query: string): MockStory[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  // Expand the query to its bilingual synonyms too, so a single FR word
  // matches an EN corpus entry and vice versa.
  const expanded = new Set<string>([q]);
  for (const terms of Object.values(BILINGUAL_TERMS)) {
    if (terms.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()))) {
      terms.forEach((t) => expanded.add(t.toLowerCase()));
    }
  }
  return mockStories.filter((s) => {
    const corpus = searchCorpus(s);
    return [...expanded].some((term) => corpus.includes(term));
  });
}

export type QuizQuestion = {
  question: string;
  choices: string[];
  /** index into choices */
  answer: number;
  explanation: string;
};

/**
 * Per-story content: body, quiz and glossary are UNIQUE per story and
 * age-scaled (feedback #1/#4). The n8n pipeline generates this trio
 * together for every new story; the shapes below are its output contract.
 */
type StoryContent = {
  body: string[];
  quiz: QuizQuestion[];
  glossary: GlossaryEntry[];
};

const STORY_CONTENT: Record<string, StoryContent> = {
  "le-renard-qui-ne-voulait-pas-dormir": {
    body: [
      "Filo le petit renard ne voulait pas dormir. Jamais. « Encore cinq minutes ! » disait-il chaque soir. Puis cinq minutes encore. Et encore cinq.",
      "Ce soir-là, sa maman souffla la bougie et l'embrassa entre les deux oreilles. Mais dès qu'elle eut quitté le terrier, Filo rouvrit grand les yeux. Dormir, vraiment ? Alors que dehors la nuit faisait des choses mystérieuses sans lui ?",
      "Il sortit son museau du terrier. Le ciel était immense et piqué d'étoiles. Et là, tout en haut, la lune le regardait. « Tu ne dors pas, petit renard ? » demanda-t-elle d'une voix douce comme un édredon.",
      "« Je ne veux pas dormir, répondit Filo. Si je dors, je vais tout rater ! » La lune sourit. « Tout rater ? Viens, je vais te montrer un secret. »",
      "Elle éclaira la forêt endormie. Filo vit les fleurs refermées qui préparaient leurs couleurs pour demain. Il vit les oiseaux blottis qui réparaient leurs chansons. Il vit même le vent, couché dans les branches, qui reprenait des forces pour souffler les nuages du matin.",
      "« Tu vois, murmura la lune. La nuit, personne ne rate rien. Tout le monde se prépare pour demain. Les plus belles choses du jour se fabriquent en dormant. »",
      "Filo bâilla un grand bâillement de renard. Si même le vent faisait dodo, alors peut-être... Il retourna se blottir dans le terrier, la queue enroulée autour du nez.",
      "Et cette nuit-là, Filo dormit profondément, pour préparer, lui aussi, une très grande journée. Bonne nuit, petit renard.",
    ],
    quiz: [
      {
        question: "Que dit Filo chaque soir pour ne pas dormir ?",
        choices: ["« Encore cinq minutes ! »", "« J'ai trop faim ! »", "« Il y a un monstre ! »"],
        answer: 0,
        explanation: "Filo réclame toujours encore cinq minutes, puis cinq de plus !",
      },
      {
        question: "Qui parle à Filo quand il sort du terrier ?",
        choices: ["Une chouette", "La lune", "Sa maman"],
        answer: 1,
        explanation: "C'est la lune, avec sa voix douce comme un édredon.",
      },
      {
        question: "Que font les fleurs pendant la nuit ?",
        choices: ["Elles dansent", "Elles préparent leurs couleurs pour demain", "Elles changent de place"],
        answer: 1,
        explanation: "La nuit, les fleurs refermées préparent leurs couleurs pour le lendemain.",
      },
    ],
    glossary: [
      { word: "terrier", definition: "La maison creusée sous la terre où vivent les renards et les lapins." },
      { word: "édredon", definition: "Une grosse couverture toute douce et gonflée, remplie de plumes." },
      { word: "blottir", definition: "Se rouler en boule bien serré, au chaud, contre quelque chose de doux." },
    ],
  },
  "lea-et-la-baleine-bleue": {
    body: [
      "Léa connaissait la mer par cœur. Du moins, c'est ce qu'elle croyait. Depuis huit étés, elle naviguait avec son père sur le Cormoran, leur petit voilier blanc, et elle savait lire les vagues comme d'autres lisent les livres.",
      "Son père disait souvent qu'elle avait de l'eau salée dans les veines. À trois ans, elle faisait des nœuds de chaise. À cinq, elle savait siffler le vent, enfin presque. Le matin, avant l'école, elle courait sur la digue pour vérifier la couleur de l'horizon, et elle pouvait dire, rien qu'à l'odeur, si la journée serait à la brume ou au grand bleu.",
      "Mais ce matin-là, la mer décida de lui apprendre quelque chose de nouveau. Une rafale claqua dans la voile, le bateau pencha, et Léa, qui rangeait un cordage, bascula par-dessus bord.",
      "« Papa ! » Le vent avala son cri comme une miette. Léa fit ce qu'on lui avait appris : ne pas paniquer, garder la tête hors de l'eau, économiser ses forces. Mais ses bottes se remplissaient, lourdes comme des ancres, et la houle la cachait du bateau à chaque creux. Pour la première fois de sa vie, la mer qu'elle aimait tant lui parut immense et étrangère.",
      "L'eau était froide et profonde. Léa savait nager, son père le lui avait appris avant même de marcher, mais le Cormoran s'éloignait déjà, poussé par le vent. Elle cria. La voile ne se retourna pas.",
      "C'est alors qu'elle sentit la mer bouger sous elle. Pas une vague : quelque chose d'immense, de doux et de vivant. Un dos bleu, large comme une île, remonta lentement et la souleva hors de l'eau.",
      "« N'aie pas peur, petite humaine. » La voix était grave et profonde, elle faisait vibrer l'eau tout autour. « Je m'appelle Vaïa. Je suis une baleine bleue, et tu es sur mon dos. »",
      "Léa, trempée et stupéfaite, s'accrocha. « Mon bateau... mon père... » « Je sais où va ton bateau, répondit Vaïa. Mais le chemin le plus court n'est pas toujours le plus droit. Tiens-toi bien. »",
      "Le dos de Vaïa était tiède et rugueux, couvert de petits coquillages accrochés là comme des passagers clandestins. « Accroche-toi à la grande cicatrice, dit la baleine. C'est un souvenir de filet. Elle ne me fait plus mal, et c'est la meilleure poignée de tout l'océan. »",
      "Et Vaïa plongea dans un monde que Léa n'avait jamais vu. Elles traversèrent un banc de poissons d'argent qui s'ouvrit comme un rideau. Elles longèrent une forêt d'algues géantes où dormaient des tortues. Elles passèrent au-dessus d'une vallée si profonde que le bleu y devenait presque noir.",
      "Plus bas encore, Vaïa lui montra un cimetière de bateaux. Des coques vertes de mousse dormaient dans le sable, doucement, sans tristesse. Des poissons-clowns jouaient dans les hublots. « La mer garde tout, expliqua Vaïa, mais elle transforme tout. Ce qui coule ne disparaît pas : ça devient une maison. »",
      "Elles croisèrent un vieux cachalot qui salua Vaïa d'un chant si grave que Léa le sentit dans ses côtes, comme un tambour lointain. Vaïa répondit, et les deux chants se croisèrent longtemps dans l'eau bleue. « Qu'est-ce que vous vous êtes dit ? » demanda Léa. « Le chemin des courants, la saison du krill. Et que tu étais mon invitée. »",
      "« Pourquoi tu m'aides ? » demanda enfin Léa. La baleine mit du temps à répondre. « Quand j'étais baleineau, un humain a coupé le filet où j'étais prise. Il aurait pu passer son chemin. Depuis, quand la mer me confie un humain, je le ramène. C'est ma façon de finir de dire merci. »",
      "« C'est chez moi, expliqua Vaïa. Les humains naviguent SUR la mer. Mais la mer, la vraie, est en dessous. Maintenant tu sais. »",
      "La remontée fut comme un lever de soleil à l'envers : le noir devint bleu, le bleu devint clair, et soudain le ciel creva la surface dans une explosion d'écume et de lumière. Léa aspira une grande goulée d'air qui avait un goût de sel et de fête.",
      "Quand elles refirent surface, le Cormoran était là, voiles affalées. Le père de Léa, fou d'inquiétude, n'en crut pas ses yeux : sa fille arrivait assise sur le dos d'une baleine bleue, comme une reine des mers.",
      "Son père la serra si fort qu'elle entendit son cœur cogner. Il voulut parler, gronda quelque chose à propos des gilets et des cordages, puis renonça et la serra encore. Certaines peurs de papa ne savent pas faire de phrases.",
      "« Merci Vaïa », chuchota Léa en glissant dans les bras de son père. La baleine souffla un grand jet d'écume en guise d'au revoir et s'enfonça dans le bleu.",
      "À l'école, bien sûr, personne ne la crut. Sauf la maîtresse, qui regarda longtemps le dessin de Léa, la grande cicatrice sur le dos bleu, et qui dit doucement : « Les histoires vraies sont celles qu'on raconte sans avoir besoin qu'on nous croie. »",
      "Depuis ce jour, quand Léa navigue, elle regarde la mer autrement. Elle sait que sous chaque vague, il y a un monde entier. Et parfois, très loin, un jet d'écume monte à l'horizon, rien que pour elle.",
    ],
    quiz: [
      {
        question: "Comment s'appelle le voilier du père de Léa ?",
        choices: ["L'Albatros", "Le Cormoran", "L'Écume"],
        answer: 1,
        explanation: "Le petit voilier blanc s'appelle le Cormoran.",
      },
      {
        question: "Comment Vaïa décrit-elle la vraie mer ?",
        choices: [
          "Elle est sur les vagues",
          "Elle est en dessous de la surface",
          "Elle est dans les nuages",
        ],
        answer: 1,
        explanation: "« Les humains naviguent SUR la mer. Mais la mer, la vraie, est en dessous. »",
      },
      {
        question: "Que fait Vaïa pour dire au revoir ?",
        choices: ["Elle chante une chanson", "Elle souffle un grand jet d'écume", "Elle tape la mer avec sa queue"],
        answer: 1,
        explanation: "Elle souffle un grand jet d'écume avant de s'enfoncer dans le bleu.",
      },
          {
        question: "Pourquoi Vaïa aide-t-elle les humains ?",
        choices: ["Un humain l'a libérée d'un filet quand elle était baleineau", "Elle s'ennuie toute seule dans l'océan", "Elle espère qu'on lui donne à manger"],
        answer: 0,
        explanation: "Quand elle était baleineau, un humain a coupé le filet où elle était prise. Depuis, elle ramène chaque humain que la mer lui confie.",
      },
    ],
    glossary: [
      { word: "rafale", definition: "Un coup de vent soudain et très fort." },
      { word: "cordage", definition: "Les grosses cordes qui servent à manœuvrer un bateau." },
      { word: "affalées", definition: "Des voiles affalées sont des voiles descendues, qui ne prennent plus le vent." },
      { word: "écume", definition: "La mousse blanche qui se forme sur les vagues." },
    ],
  },
  "le-potager-magique-de-mamie-rose": {
    body: [
      "Chez Mamie Rose, le potager n'est pas un potager comme les autres. Les tomates chantent quand le soleil se lève. Les carottes dansent sous la terre. Et les salades racontent des blagues, mais seulement le dimanche.",
      "Ce matin, le facteur a apporté un petit paquet. Dedans, une graine. Une seule. Toute dorée, avec une étiquette : « Graine mystère. Planter avec un sourire. »",
      "« Hum, dit Mamie Rose. On va voir ça. » Elle creuse un petit trou, pose la graine, la recouvre de terre, et lui fait son plus beau sourire. Lina, sa petite-fille, sourit aussi, pour aider.",
      "Le lendemain, une pousse minuscule pointe son nez vert. Le surlendemain, elle a déjà trois feuilles. Et le troisième jour... la pousse a poussé jusqu'au toit de la maison !",
      "« Mamie ! Qu'est-ce que c'est ? » crie Lina. Au sommet de la tige, une énorme fleur s'ouvre lentement. Et dans la fleur, il y a... des bonbons ? Non. Des pièces d'or ? Non plus.",
      "Dans la fleur, il y a des graines. Des centaines de petites graines dorées, exactement comme la première. La fleur se penche doucement et les verse dans le tablier de Mamie Rose, comme un merci.",
      "« Je comprends, sourit Mamie Rose. Cette plante ne fabrique pas des trésors. Elle fabrique des débuts de trésors. À nous de les planter. »",
      "Alors Lina et Mamie Rose passent l'été à offrir des graines dorées. Une pour la boulangère. Une pour le facteur. Une pour l'école. Et partout dans le village, des fleurs géantes se mettent à pousser, pleines de nouvelles graines à offrir.",
      "Si un jour tu reçois une petite graine dorée avec une étiquette, tu sauras quoi faire : plante-la avec un sourire. C'est le seul mode d'emploi.",
    ],
    quiz: [
      {
        question: "Que font les salades du potager le dimanche ?",
        choices: ["Elles dorment", "Elles racontent des blagues", "Elles chantent"],
        answer: 1,
        explanation: "Les salades racontent des blagues, mais seulement le dimanche !",
      },
      {
        question: "Que faut-il faire pour planter la graine mystère ?",
        choices: ["L'arroser trois fois", "La planter avec un sourire", "La planter la nuit"],
        answer: 1,
        explanation: "L'étiquette dit : « Planter avec un sourire. »",
      },
      {
        question: "Qu'y a-t-il dans la fleur géante ?",
        choices: ["Des bonbons", "Des pièces d'or", "Des centaines de graines dorées"],
        answer: 2,
        explanation: "La fleur fabrique des graines dorées, des « débuts de trésors » à offrir.",
      },
    ],
    glossary: [
      { word: "potager", definition: "Un jardin où l'on fait pousser des légumes pour les manger." },
      { word: "pousse", definition: "Une toute petite plante qui vient juste de sortir de terre." },
      { word: "tablier", definition: "Un vêtement qu'on attache devant soi pour ne pas se salir en jardinant ou en cuisinant." },
    ],
  },
  "timothee-et-le-dragon-timide": {
    body: [
      "Dans la forêt d'Argoat, tout le monde le savait : il y avait un dragon. On entendait parfois craquer les branches sous ses pattes énormes. On voyait de la fumée monter au-dessus des chênes. Les enfants du village n'osaient plus aller cueillir des mûres.",
      "Au village, chacun avait sa théorie. Le boulanger jurait que le dragon mesurait vingt mètres. La mercière disait qu'il crachait du feu bleu. Le garde champêtre, qui n'était jamais entré dans la forêt, racontait qu'il avait des yeux rouges « comme des braises de forge ». Plus personne n'écoutait les oiseaux : on n'entendait plus que la peur, qui grossissait à chaque veillée.",
      "Timothée, lui, n'y croyait pas trop. « Un dragon qui n'a jamais mangé personne ? Un dragon qu'on n'a jamais vu ? Drôle de dragon. » Un mercredi, il prit son sac, trois biscuits, et partit voir.",
      "Il faut dire que Timothée avait un défaut, ou une qualité, selon les jours : il posait des questions. Tout le temps. « Qui l'a vu ? » Personne. « Qui a été attaqué ? » Personne. « Alors comment on sait qu'il est méchant ? » Silence. Les grandes personnes n'aiment pas beaucoup les questions qui font ce silence-là.",
      "La forêt d'Argoat était plus belle que dans ses souvenirs. Des fougères hautes comme lui. Des rayons de soleil posés en travers du chemin comme des planches d'or. Timothée marchait sans bruit, le cœur tambourinant, et chaque craquement de brindille le faisait sursauter. Il avait peur, bien sûr. Mais il avait décidé que sa curiosité marcherait devant sa peur, et la peur suivait en traînant les pieds.",
      "Il marcha longtemps, suivit la fumée, et arriva dans une clairière. Là, assis contre un rocher, il y avait bel et bien un dragon. Immense. Couvert d'écailles vertes. Avec des griffes comme des faux. Et ce dragon... pleurait.",
      "De près, le dragon était encore plus grand que dans les histoires. Sa tête aurait rempli la cuisine de Timothée. Chaque écaille avait la taille d'une assiette. Mais ses larmes, énormes, roulaient sur son museau et faisaient de petites mares fumantes dans l'herbe, et personne, nulle part, n'a jamais eu peur de quelqu'un qui pleure.",
      "« Bonjour ? » dit Timothée. Le dragon sursauta si fort qu'il se cogna la tête contre le rocher. « Aaah ! Un humain ! » Et il se cacha derrière le rocher. Enfin, il essaya : le rocher était beaucoup trop petit pour cacher un dragon.",
      "« Tu... tu as peur de moi ? » demanda Timothée, stupéfait. « Évidemment, renifla le dragon. Vous êtes terrifiants, les humains. Vous criez. Vous courez dans tous les sens. Et vous racontez des histoires affreuses sur les dragons. »",
      "Timothée s'assit dans l'herbe et sortit ses biscuits. « Moi c'est Timothée. Tu en veux un ? » Le dragon hésita, se pencha, et prit le biscuit du bout des griffes, délicatement, comme on cueille une fleur. « Gaspard, dit-il. Merci. »",
      "Ils parlèrent tout l'après-midi. Gaspard avoua qu'il faisait de la fumée en essayant de se faire cuire des châtaignes. Que les branches craquaient parce qu'il était maladroit. Et qu'il rêvait d'une seule chose : être tranquille, et peut-être, un jour, avoir un ami.",
      "« Depuis combien de temps tu vis ici tout seul ? » demanda Timothée. Gaspard compta sur ses griffes. « Quarante-sept printemps. Avant, j'habitais la montagne, mais des chevaliers venaient toutes les semaines pour me combattre. C'était épuisant. Je ne me suis jamais battu : je partais. Un dragon qui part, ça ne fait pas de chanson, alors les chansons racontent autre chose. »",
      "« Et le feu ? Tu craches vraiment du feu ? » Gaspard eut l'air vexé. « Évidemment. Comment veux-tu griller une châtaigne sans feu ? » Il souffla une toute petite flamme bleue, ronde et bien élevée, qui fit éclater trois châtaignes d'un coup. Timothée applaudit. C'était le plus beau feu de camp du monde, et il tenait dans une narine de dragon.",
      "En redescendant, Timothée hésita. Raconter ? Ne pas raconter ? Si le village apprenait où vivait Gaspard, viendrait-on le déranger avec des fourches et des théories ? Il décida de garder le secret, comme on garde un trésor : pas pour le cacher, pour le protéger.",
      "« Le courage, dit Timothée en rentrant ce soir-là, ce n'est pas de ne pas avoir peur. C'est d'aller voir quand même. » Gaspard hocha sa grosse tête : c'était exactement ce qu'il venait de faire, lui aussi.",
      "Alors, mercredi après mercredi, la peur du village fondit sans qu'on sache pourquoi. La fumée sentait la châtaigne grillée, et une odeur pareille, ça ne va pas avec les monstres. Les enfants retournèrent aux mûres. Le garde champêtre changea de théorie : « Un feu de bergers, sûrement. » Timothée souriait dans sa manche.",
      "Gaspard apprit à Timothée à reconnaître les champignons, à lire l'âge des arbres, à imiter le cri du geai. Timothée apprit à Gaspard les rébus, les tables de multiplication, et l'art de faire des ricochets, ce qui, quand on a des griffes comme des faux, demande beaucoup d'entraînement et fait des vagues énormes.",
      "Depuis, chaque mercredi, Timothée monte à la clairière avec des biscuits. Et si vous voyez de la fumée au-dessus de la forêt d'Argoat, pas d'inquiétude : ce sont juste deux amis qui font griller des châtaignes.",
    ],
    quiz: [
      {
        question: "Pourquoi y a-t-il de la fumée au-dessus de la forêt ?",
        choices: [
          "Le dragon brûle des arbres",
          "Gaspard essaie de cuire des châtaignes",
          "Il y a un feu de camp de chasseurs",
        ],
        answer: 1,
        explanation: "Gaspard fait de la fumée en essayant de se faire cuire des châtaignes.",
      },
      {
        question: "Que fait Gaspard quand il voit Timothée ?",
        choices: ["Il crache du feu", "Il essaie de se cacher derrière un rocher", "Il s'envole"],
        answer: 1,
        explanation: "Il a tellement peur qu'il essaie de se cacher derrière un rocher trop petit !",
      },
      {
        question: "Pour Timothée, c'est quoi le courage ?",
        choices: [
          "Ne jamais avoir peur",
          "Aller voir quand même, même quand on a peur",
          "Être le plus fort",
        ],
        answer: 1,
        explanation: "« Le courage, ce n'est pas de ne pas avoir peur. C'est d'aller voir quand même. »",
      },
          {
        question: "Comment s'appelle le dragon de la clairière ?",
        choices: ["Gaspard", "Argoat", "Timothée"],
        answer: 0,
        explanation: "Le dragon s'appelle Gaspard, et il vit seul dans sa clairière depuis quarante-sept printemps.",
      },
    ],
    glossary: [
      { word: "clairière", definition: "Un endroit sans arbres au milieu d'une forêt, comme une pièce à ciel ouvert." },
      { word: "écailles", definition: "Les petites plaques dures qui couvrent la peau des dragons, des serpents et des poissons." },
      { word: "stupéfait", definition: "Tellement étonné qu'on ne sait plus quoi dire." },
    ],
  },
  "petit-ours-apprend-a-attendre": {
    body: [
      "Petit Ours regarde par la fenêtre. Dehors, tout est blanc. « Maman, c'est quand le printemps ? » « Bientôt, mon ourson. Quand la neige aura fondu. » Petit Ours souffle sur la vitre. « Mais c'est long, bientôt ! »",
      "Il s'assoit devant la fenêtre et attend. Une minute. Deux minutes. La neige ne fond pas du tout.",
      "Maman Ours sourit. « Viens, je connais un truc magique pour faire passer l'attente. » Elle prend un pot, de la terre, et une petite graine de tournesol toute rayée.",
      "« Plante-la. Arrose-la chaque matin. Quand la fleur sera aussi haute que toi, le printemps sera là. »",
      "Alors Petit Ours arrose. Chaque matin, une petite tasse d'eau. Un jour, deux jours, beaucoup de jours. Au début, il ne se passe rien du tout. La terre reste de la terre. « Ça ne marche pas », dit Petit Ours.",
      "« Ça pousse en dessous », répond Maman Ours. « Les choses importantes commencent toujours là où on ne voit pas. »",
      "Et un matin : une pousse verte ! Toute petite, toute droite, avec deux feuilles minuscules. La pousse grandit, grandit. Petit Ours attend toujours, mais maintenant, attendre c'est moins long : il a quelque chose à regarder pousser.",
      "Et un matin, la fleur touche son museau, toute jaune, et dehors la neige a disparu. Le truc magique, ce n'était pas la graine : c'était d'attendre en prenant soin de quelque chose.",
    ],
    quiz: [
      {
        question: "Qu'est-ce que Petit Ours attend ?",
        choices: ["Son anniversaire", "Le printemps", "Noël"],
        answer: 1,
        explanation: "Petit Ours trouve que le printemps met trop de temps à arriver.",
      },
      {
        question: "Que plante Petit Ours ?",
        choices: ["Une graine de tournesol", "Une carotte", "Un sapin"],
        answer: 0,
        explanation: "Maman Ours lui donne une petite graine de tournesol à planter.",
      },
      {
        question: "C'était quoi, le vrai truc magique ?",
        choices: [
          "La graine était enchantée",
          "Attendre en prenant soin de quelque chose",
          "L'eau du robinet",
        ],
        answer: 1,
        explanation: "Attendre est moins long quand on prend soin de quelque chose qui grandit.",
      },
    ],
    glossary: [
      { word: "ourson", definition: "Un bébé ours." },
      { word: "pousse", definition: "Une toute petite plante qui sort de la terre." },
      { word: "museau", definition: "Le nez et la bouche des animaux, comme les ours ou les chiens." },
    ],
  },
  "le-marchand-de-reves-du-souk": {
    body: [
      "Au fond du souk de Marrakech, après l'allée des tapis et celle des épices, il y a une échoppe sans enseigne. Les touristes passent devant sans la voir. Les enfants de la médina, eux, savent : c'est la boutique de Monsieur Slimane, le marchand de rêves.",
      "Pour la trouver, il faut connaître la règle : tourner à gauche après le marchand de lanternes, passer sous l'arche où sèche la menthe, et surtout, ne pas chercher. La boutique de Monsieur Slimane ne se montre qu'aux gens qui ont besoin d'elle, ce qui n'est pas toujours ceux qui la cherchent. Les adultes pressés glissent dessus comme la pluie sur une toile cirée. Les enfants, eux, la voient tout de suite.",
      "Sur ses étagères s'alignent des centaines de bocaux. Dans chacun, une lueur tourne doucement, comme un poisson de lumière. Bleu nuit pour les rêves de voyage. Doré pour les rêves de gloire. Vert d'eau pour les rêves doux, ceux qu'on fait blotti contre quelqu'un.",
      "Monsieur Slimane fabrique ses rêves la nuit, à l'heure où le souk ne fait plus de bruit. Personne ne sait exactement comment. On raconte qu'il récolte la buée des fenêtres où dorment les gens heureux, qu'il la fait bouillir avec du safran et du silence, et qu'il verse le tout dans ses bocaux avec un entonnoir en corne de gazelle. On raconte beaucoup de choses. Le vieux marchand laisse dire, et sourit.",
      "Yasmine, douze ans, livre le pain de son père dans la médina. Chaque soir, elle s'arrête devant la vitrine. Pas pour acheter, les rêves de Monsieur Slimane coûtent cher : un souvenir heureux pièce. Juste pour regarder.",
      "Le père de Yasmine est boulanger près de la fontaine aux mosaïques. Depuis que sa mère est partie travailler de l'autre côté de la mer, c'est Yasmine qui livre le pain du soir : douze maisons, trois riads, et l'école du bout de la ruelle. Elle connaît chaque pavé, chaque chat, chaque raccourci. Ses économies tiennent dans une boîte de thé : quatre pièces, un bouton doré, et la moitié d'un billet de cinéma.",
      "Au collège, la maîtresse d'arabe dit que Yasmine écrit « comme quelqu'un qui regarde ». Ses cahiers sont pleins du souk : le geste du vendeur d'oranges qui fait pleuvoir les pelures en spirale, la sieste des chats sur les tapis invendus, la poussière dorée qui danse à cinq heures dans les rayons du soleil. Elle voudrait en faire des histoires, un jour. Mais le pain n'attend pas, et les histoires, si. Du moins c'est ce qu'elle croit.",
      "Ce qu'elle regarde, surtout, c'est le bocal vert d'eau posé sur le troisième rayon. Dedans, la lueur ne tourne pas comme les autres : elle se balance, doucement, comme une barque au mouillage. Monsieur Slimane dit que c'est un rêve de mer calme, le plus reposant de la boutique. Yasmine ne le dit à personne, mais depuis que sa mère est partie, elle dort mal, et un rêve de mer calme, ça doit être exactement ce qu'il faut.",
      "Un soir de grand vent, alors que le souk replie ses toiles, un chat bondit sur l'étagère. Un bocal vacille, roule, et se brise au sol dans un tintement de cristal. La lueur qu'il contenait, une lueur argentée, hésite, puis file dans la ruelle comme une hirondelle.",
      "« Rattrape-le ! » crie Monsieur Slimane à Yasmine. « Un rêve échappé, c'est un rêve qui cherche une tête où entrer ! Et celui-là n'est pas fini, il est dangereux comme une histoire sans fin ! »",
      "Yasmine court. Le rêve argenté zigzague entre les étals, frôle un vendeur d'oranges, traverse la place aux mille lanternes. Partout où il passe, les gens s'arrêtent, les yeux soudain pleins d'étoiles, oubliant ce qu'ils faisaient.",
      "Un rêve libre ne court pas : il coule, il ricoche, il fait des boucles. Celui-là remonta l'allée des teinturiers en frôlant les écheveaux suspendus, et partout où il passait, les couleurs se mettaient à briller un peu plus fort, comme réveillées. Un apprenti lâcha sa pelote de laine rouge et resta planté, les bras ballants, à sourire aux étoiles qu'il était seul à voir.",
      "La place aux mille lanternes était pleine malgré l'heure : conteurs, dresseurs de colombes, vendeurs de thé aux amandes. Le rêve plongea dans la foule. Un instant, Yasmine le perdit. Puis elle vit la trace qu'il laissait : de proche en proche, les visages se levaient vers le ciel, les conversations s'arrêtaient au milieu des phrases, et le grand cercle des écouteurs du conteur se défit comme un collier coupé, tous partis rêver debout.",
      "« Ne le regarde pas trop longtemps ! cria Monsieur Slimane, loin derrière. Regarde ses REFLETS ! » Yasmine comprit : elle suivit la lueur dans les plateaux de cuivre, dans les miroirs du barbier, dans les flaques de thé sur les tables basses. C'est plus lent, un reflet. Ça lui laissait toujours un temps d'avance.",
      "Elle le coince enfin dans une impasse, sous un panier renversé. Mais à travers l'osier, le rêve lui parle. « Laisse-moi entrer, souffle-t-il. Je suis un rêve de grandeur. Avec moi, tu seras reine, célèbre, immense. Tu n'auras plus jamais à livrer du pain. »",
      "Et la voix connaissait son nom. Elle connaissait pire : la boîte de thé aux quatre pièces, le lit trop grand de la chambre, le bateau qui avait emmené sa mère. « Je peux la faire revenir, souffla le rêve. Dans le rêve, elle revient tous les soirs. Tu n'auras qu'à ne plus te réveiller. » C'est là que Yasmine comprit qu'il mentait : les vraies promesses ont des limites, celles-là n'en avaient aucune.",
      "Yasmine hésite. La voix est belle. Mais elle se souvient de ce que dit toujours Monsieur Slimane : un rêve inachevé promet tout, parce qu'il ne sait pas finir les phrases. Elle serre le panier et rapporte le rêve à la boutique.",
      "Le panier pesait presque rien et pourtant Yasmine marcha lentement, les deux mains dessus, comme on porte une casserole trop pleine. Le rêve continuait de parler à travers l'osier, plus doucement maintenant, presque tendre. Elle se mit à fredonner pour ne pas l'écouter, une chanson que chantait sa mère en pétrissant, et le rêve, curieusement, se tut : même les rêves inachevés écoutent les chansons de mère.",
      "Le vieux marchand l'enferme dans un bocal neuf, qu'il scelle de cire rouge. Puis il regarde Yasmine longuement. « Tu l'as entendu, n'est-ce pas ? Et tu as su lui dire non. C'est rare. » Il décroche un bocal vert d'eau, le plus doux de la boutique. « Pour toi. Tu l'as gagné. »",
      "Pendant que la cire rouge refroidissait, Yasmine regarda enfin la boutique de l'intérieur. C'était plus grand que dehors. Des rêves par centaines ronronnaient sur les étagères, et leurs lueurs mêlées faisaient au plafond une aurore boréale minuscule. Sur le comptoir, un registre relié de cuir listait des noms et des dates ; certains remontaient à cent ans. « Tu tiens la boutique depuis tout ce temps ? » Le vieil homme caressa sa barbe. « La boutique me tient, ça revient au même. »",
      "Il lui raconta, parce que les soirs de vent du désert sont faits pour raconter : le premier rêve qu'il avait vendu, à un sultan qui ne dormait plus ; l'année terrible où une épidémie de cauchemars avait vidé ses rayons ; et son propre maître, une vieille dame aveugle qui reconnaissait les rêves au son, rien qu'en collant l'oreille au verre. « Elle disait : un bon rêve fait le bruit d'une orange qu'on épluche. Je n'ai jamais trouvé mieux comme définition. »",
      "« Mais je n'ai pas de souvenir heureux à te donner », proteste Yasmine. Monsieur Slimane sourit dans sa barbe blanche. « Si. Celui de ce soir. Tu m'en donneras la moitié, et tu verras qu'un souvenir partagé, ça fait deux souvenirs. »",
      "Ils s'assirent sur le seuil de la boutique, le bocal vert d'eau entre eux, et Yasmine raconta son souvenir de ce soir pendant que Monsieur Slimane l'écoutait les yeux fermés, en hochant la tête aux bons endroits, comme on écoute de la musique. Quand elle eut fini, la lueur du bocal s'était mise à balancer un peu plus fort, comme une barque qui rit.",
      "Avant de rentrer, Yasmine posa la question qui la démangeait. « Et le rêve argenté ? Qu'est-ce que tu vas en faire ? » Monsieur Slimane rangea le bocal scellé tout en haut, derrière un rideau. « Le finir. Ça prend des années, finir le rêve d'un autre. Mais un rêve fini ne ment plus : il propose. Un jour, quelqu'un entrera ici, et ce rêve-là sera exactement le sien. Peut-être toi, qui sait. Les rêves de grandeur font de très bons rêves, quand on leur apprend la patience. »",
      "« Reviens quand tu veux, dit encore le marchand sur le pas de la porte. Pas pour acheter : pour apprendre. Une boutique comme celle-ci a toujours besoin de quelqu'un qui sait courir après les reflets et dire non aux belles voix. Et moi, je ne rajeunis pas, malgré tout ce qu'on raconte. » Yasmine rentra chez elle en marchant à trois centimètres du sol.",
      "Cette nuit-là, Yasmine rêva d'une mer calme et d'un pain chaud partagé sur une terrasse, et c'était mille fois mieux qu'un trône. Quelque part dans le souk, un vieux marchand fit exactement le même rêve.",
    ],
    quiz: [
      {
        question: "Combien coûte un rêve chez Monsieur Slimane ?",
        choices: ["Une pièce d'or", "Un souvenir heureux", "Trois dirhams"],
        answer: 1,
        explanation: "Les rêves se paient en souvenirs heureux, c'est pour cela qu'ils coûtent cher.",
      },
      {
        question: "Pourquoi le rêve échappé est-il dangereux ?",
        choices: [
          "Il est inachevé et promet n'importe quoi",
          "Il donne des cauchemars",
          "Il vole les souvenirs",
        ],
        answer: 0,
        explanation: "Un rêve inachevé promet tout « parce qu'il ne sait pas finir les phrases ».",
      },
      {
        question: "Que comprend Yasmine à la fin ?",
        choices: [
          "Il ne faut jamais rêver",
          "Un souvenir partagé fait deux souvenirs",
          "Les rêves dorés sont les meilleurs",
        ],
        answer: 1,
        explanation: "En partageant son souvenir avec Monsieur Slimane, chacun reçoit le même beau rêve.",
      },
      {
        question: "Que signifie la couleur des lueurs dans les bocaux ?",
        choices: [
          "Le prix du rêve",
          "Le type de rêve (voyage, gloire, douceur)",
          "L'âge du rêveur",
        ],
        answer: 1,
        explanation: "Bleu nuit pour les voyages, doré pour la gloire, vert d'eau pour les rêves doux.",
      },
      {
        question: "Pourquoi Yasmine refuse-t-elle le rêve de grandeur ?",
        choices: [
          "Elle a peur des chats",
          "Elle préfère rester livreuse de pain",
          "Elle se méfie d'un rêve inachevé qui promet tout",
        ],
        answer: 2,
        explanation: "Elle se souvient qu'un rêve inachevé promet n'importe quoi pour entrer dans une tête.",
      },
          {
        question: "Comment Yasmine arrive-t-elle à suivre le rêve dans la foule ?",
        choices: ["En regardant ses reflets", "En le fixant sans cligner des yeux", "En fermant les yeux pour l'écouter"],
        answer: 0,
        explanation: "Monsieur Slimane lui crie de ne pas le fixer mais de regarder ses REFLETS : elle le suit dans les plats de cuivre et les vitres.",
      },
    ],
    glossary: [
      { word: "souk", definition: "Un grand marché couvert, dans les pays du Maghreb et du Moyen-Orient." },
      { word: "échoppe", definition: "Une toute petite boutique." },
      { word: "médina", definition: "La vieille ville, avec ses ruelles étroites, dans les villes du Maghreb." },
      { word: "scelle", definition: "Fermer quelque chose hermétiquement, ici avec de la cire fondue." },
    ],
  },
  "les-jumeaux-et-la-comete": {
    body: [
      "Émile et Zoé sont jumeaux, mais ils ne sont d'accord sur rien. Sauf sur une chose : chaque soir à neuf heures dix exactement, une étoile filante traverse le ciel au-dessus de leur jardin. La même. Toujours au même endroit.",
      "Émile aime les tournevis, le désordre et les insectes qui brillent. Zoé aime les listes, les livres et les choses qui se démontrent. Quand Émile dit blanc, Zoé sort une encyclopédie pour prouver noir. Leurs parents ont renoncé à les mettre d'accord et se contentent de compter les points au dîner.",
      "La lumière de neuf heures dix, c'est Émile qui l'a vue le premier, un soir de panne de télévision. Depuis, c'est leur rendez-vous secret : à neuf heures huit, ils se retrouvent au fond du jardin, près du cerisier, sans se parler. On peut se disputer toute la journée et partager une étoile le soir. C'est même, peut-être, la définition des jumeaux.",
      "« Les étoiles filantes ne repassent pas deux fois, dit Zoé qui lit beaucoup. Donc ce n'est pas une étoile filante. » « Alors c'est quoi ? » demande Émile. « C'est ce qu'on va découvrir. »",
      "Le samedi, ils installent leur campement : une tente, deux paires de jumelles, un carnet, et le vieux télescope du grenier. À neuf heures neuf, ils retiennent leur souffle. À neuf heures dix, la lumière apparaît.",
      "Dans la tente, Zoé note tout dans le carnet : heure d'apparition, direction, durée, couleur. Sept soirs de suite. Les colonnes sont impeccables. « Régularité par-fai-te », dit-elle en soulignant deux fois. Émile, lui, a remarqué autre chose, que les colonnes ne montrent pas : la lumière est chaque soir un tout petit peu plus pâle. « Comme une lampe de poche qui fatigue », dit-il. Pour une fois, Zoé ne trouve rien à répondre.",
      "Dans le télescope, ce n'est pas une étoile. C'est une petite comète, avec une queue scintillante, et elle ne file pas droit : elle tourne en rond, comme quelqu'un qui cherche ses clés.",
      "« Elle est perdue », souffle Émile. Zoé fronce les sourcils, vérifie dans son livre d'astronomie, et déclare : « Les comètes suivent un chemin précis dans le ciel. Si elle tourne en rond, c'est qu'elle a perdu le sien. »",
      "« Une comète perdue, ça existe ? » demande Émile. Zoé tourne les pages. Orbites, périodes, ellipses. « Ce qui existe, c'est des comètes déviées. Si elle a frôlé quelque chose de gros, sa route a pu se tordre. Elle refait la même boucle en attendant de retrouver la bonne sortie. » « Comme papa au rond-point de Rennes », dit Émile. « Exactement comme papa au rond-point de Rennes. »",
      "Alors les jumeaux font ce qu'ils savent faire de mieux quand ils sont d'accord : un plan. Émile, le bricoleur, démonte tous les lampions de la fête des voisins. Zoé, la calculatrice, trace sur le sol la forme exacte du chemin que la comète devrait suivre, une grande courbe qui passe au-dessus du cerisier.",
      "Le plan prend trois jours. Il faut convaincre les voisins de prêter les lampions (« pour un exposé d'astronomie », dit Zoé, ce qui n'est pas tout à fait un mensonge). Il faut des piles, du fil, et l'échelle du garage pour l'angle du cerisier. Zoé calcule l'orientation avec la boussole et son rapporteur, en tirant la langue. Émile répare les quatorze lampions cassés. Ils ne se disputent que deux fois, un record absolu.",
      "Le soir venu, un problème : des nuages arrivent par l'ouest. « Si elle ne voit pas les lampions... » commence Émile. Zoé regarde le ciel, la mâchoire serrée. À neuf heures cinq, le vent pousse le dernier nuage juste assez loin. Le ciel s'ouvre au-dessus du jardin comme un rideau de théâtre. « Allume, souffle Zoé. Allume tout. »",
      "À neuf heures dix, le jardin s'allume : cinquante lampions dessinent une flèche courbe dans l'herbe, une piste d'atterrissage à l'envers, une piste de décollage vers le bon coin du ciel.",
      "La comète ralentit. Tourne une dernière fois. Puis, comme si elle lisait la carte, elle suit la courbe de lumière, prend de la vitesse, et file droit vers l'horizon d'est, là où l'attendait son chemin.",
      "Juste avant de disparaître, elle laisse tomber une pluie de poussière dorée sur le jardin. Le lendemain, à l'endroit exact de la flèche, les fleurs ont poussé en spirale.",
      "Ils restèrent longtemps immobiles dans le jardin illuminé, le nez en l'air, à regarder l'endroit du ciel où elle avait disparu. « Tu crois qu'elle va revenir ? » demanda Émile. « Les comètes reviennent toujours, dit Zoé. Dans un an, ou dans cent. C'est écrit dans le livre. » « Alors on garde les lampions », dit Émile. Et pour la troisième fois de la semaine, ils furent d'accord.",
      "Au matin, leurs parents trouvèrent le jardin constellé de lampions éteints et les jumeaux endormis dans la tente, le carnet ouvert entre eux deux. À la dernière page, deux écritures différentes avaient noté la même phrase : « Mission accomplie. » Personne ne posa de questions. Avec ces deux-là, mieux vaut parfois ne pas savoir.",
      "Émile et Zoé ne sont toujours d'accord sur rien. Sauf sur deux choses, maintenant : l'étoile de neuf heures dix, et le fait que personne, jamais, ne les croira.",
    ],
    quiz: [
      {
        question: "À quelle heure passe la lumière chaque soir ?",
        choices: ["À minuit", "À neuf heures dix", "À huit heures"],
        answer: 1,
        explanation: "Chaque soir à neuf heures dix exactement, au-dessus du jardin.",
      },
      {
        question: "Pourquoi la comète tourne-t-elle en rond ?",
        choices: ["Elle danse", "Elle a perdu son chemin", "Elle a peur du noir"],
        answer: 1,
        explanation: "Les comètes suivent un chemin précis ; celle-ci a perdu le sien.",
      },
      {
        question: "Comment les jumeaux aident-ils la comète ?",
        choices: [
          "Ils lui crient la direction",
          "Ils dessinent son chemin avec des lampions",
          "Ils l'attrapent avec un filet",
        ],
        answer: 1,
        explanation: "Cinquante lampions dessinent dans l'herbe la courbe que la comète doit suivre.",
      },
          {
        question: "Avec quoi les jumeaux dessinent-ils la piste dans le jardin ?",
        choices: ["Cinquante lampions de la fête du village", "Des bougies d'anniversaire", "Des lampes de poche"],
        answer: 0,
        explanation: "Émile démonte les lampions de la fête du village pour dessiner une grande courbe de lumière dans l'herbe.",
      },
    ],
    glossary: [
      { word: "comète", definition: "Un astre fait de glace et de poussière qui voyage dans l'espace en laissant une traînée lumineuse." },
      { word: "télescope", definition: "Un instrument qui grossit ce qui est très loin, pour observer le ciel." },
      { word: "lampions", definition: "Des petites lanternes en papier qu'on allume pour les fêtes." },
    ],
  },
  "le-gateau-qui-ne-voulait-pas-cuire": {
    body: [
      "Ce matin, dans la cuisine, papa prépare un gâteau au chocolat. Farine, œufs, beurre, chocolat fondu. Il verse la pâte dans le moule et ouvre le four.",
      "« NON ! » La pâte vient de parler. Papa cligne des yeux. « Pardon ? »",
      "« Je ne veux pas cuire ! dit le gâteau. Il fait beaucoup trop chaud là-dedans ! »",
      "Papa réfléchit. C'est la première fois qu'un gâteau lui répond. « Mais... si tu ne cuis pas, tu resteras de la pâte toute ta vie. »",
      "« Et alors ? La pâte, c'est délicieux ! » Papa est d'accord, la pâte crue, c'est très bon. Mais il a promis un gâteau pour le goûter.",
      "Alors papa a une idée. Il approche le moule de la fenêtre. « Regarde. Tu vois les enfants qui rentrent de l'école ? À quatre heures, ils vont chercher quelque chose de moelleux, de chaud, qui sent bon le chocolat. Quelque chose qui rend tout le monde heureux. Ça, seul un gâteau cuit peut le faire. »",
      "Le gâteau réfléchit avec toutes ses pépites. Être mangé en cachette à la cuillère, ou être le héros du goûter ? « Bon, d'accord, soupire-t-il. Mais à une condition : tu mets une bougie dessus. Même si ce n'est l'anniversaire de personne. Je veux faire mon entrée comme une star. »",
      "Et c'est ainsi que ce mercredi-là, au goûter, on chanta « joyeux anniversaire » à personne, devant le gâteau le plus fier et le plus moelleux du monde.",
    ],
    quiz: [
      {
        question: "Pourquoi le gâteau ne veut-il pas cuire ?",
        choices: ["Il fait trop chaud dans le four", "Il n'aime pas le chocolat", "Il veut aller à l'école"],
        answer: 0,
        explanation: "« Il fait beaucoup trop chaud là-dedans ! » dit le gâteau.",
      },
      {
        question: "Que promet papa au gâteau pour le convaincre ?",
        choices: ["Un nouveau moule", "Une bougie, comme une star", "Plus de chocolat"],
        answer: 1,
        explanation: "Le gâteau accepte de cuire si on met une bougie dessus pour son entrée de star.",
      },
      {
        question: "Que chante-t-on au goûter ?",
        choices: ["Une berceuse", "« Joyeux anniversaire » à personne", "La chanson du chocolat"],
        answer: 1,
        explanation: "On chante joyeux anniversaire même si ce n'est l'anniversaire de personne !",
      },
    ],
    glossary: [
      { word: "moule", definition: "Le récipient dans lequel on verse la pâte pour donner sa forme au gâteau." },
      { word: "moelleux", definition: "Tout doux et tendre sous la dent, comme un coussin qu'on peut manger." },
      { word: "pépites", definition: "Des petits morceaux de chocolat cachés dans la pâte." },
    ],
  },
  "le-petit-phare-et-la-tempete": {
    body: [
      "Tout au bout de la Bretagne, sur un rocher battu par les vagues, vit un petit phare. Il s'appelle Loïk. À côté des grands phares de la côte, hauts comme des immeubles, Loïk a l'air d'une bougie d'anniversaire.",
      "Les grands phares balaient la mer de leurs faisceaux puissants. Loïk, lui, n'éclaire pas plus loin que la plage. « À quoi tu sers, petit ? » se moquent les goélands. Loïk ne répond pas, mais sa lumière vacille un peu, certains soirs.",
      "Pourtant, Loïk fait de son mieux. Chaque soir, quand le soleil tombe dans la mer, il allume sa petite lampe et il éclaire ce qu'il peut : le bout de la jetée, les casiers du vieux pêcheur, la balançoire du jardin d'à côté. Les crabes viennent se chauffer sous sa lumière, et les enfants du village lui font coucou avant d'aller dormir. C'est peu, mais c'est son travail, et il le fait avec tout son cœur.",
      "Son ami le vent lui raconte la vie des grands phares. « Celui de la pointe éclaire à trente kilomètres ! Les capitaines des cargos le saluent en passant ! » Loïk soupire. Trente kilomètres... Lui, sa lumière s'arrête au premier rocher. Alors il écoute, il apprend, et il range dans sa tête tout ce que le vent raconte : les signaux, les codes, les habitudes des marins.",
      "Une nuit de novembre, la tempête arrive. Une vraie tempête de Bretagne, avec des vagues hautes comme des maisons et un vent qui arrache les volets. Et là, catastrophe : la foudre frappe le grand phare de la pointe. Sa lumière s'éteint d'un coup.",
      "Le vent hurle si fort que les volets du village claquent comme des castagnettes. La pluie tombe de travers, en rideaux serrés. Les goélands eux-mêmes, pourtant coriaces, se sont réfugiés sous la cale du port, les plumes en bataille. Loïk serre sa lampe contre lui et regarde la mer devenir une montagne noire qui monte, descend, et cogne son rocher à chaque respiration.",
      "Au large, un petit bateau de pêche cherche le port. Sans le grand phare, le pêcheur ne voit plus rien. Les rochers sont partout, invisibles dans le noir.",
      "« À moi de jouer », souffle Loïk. Il rassemble toute son électricité, jusqu'à la dernière étincelle, et il fait quelque chose qu'aucun phare ne fait jamais : au lieu de tourner, il cligne. Trois coups courts. Trois coups longs. Trois coups courts.",
      "Sur le bateau, le pêcheur écarquille les yeux. Ça, il connaît : c'est le signal des marins ! Il barre droit vers la petite lumière qui clignote, longe le chenal qu'elle éclaire, et entre au port juste avant la plus grosse vague.",
      "Le petit bateau amarré, le pêcheur reste un long moment sous la pluie, la main sur son cœur, à regarder la petite lumière qui clignote encore. Loïk, épuisé, sent sa lampe faiblir. Mais il tient bon jusqu'au matin, au cas où quelqu'un d'autre chercherait le port. C'est ça, être un phare : on éclaire tant qu'il reste une étincelle.",
      "Le lendemain, tout le village est au pied de Loïk. Le pêcheur pose sa main sur la vieille porte du petit phare. « Les grands phares montrent la mer, dit-il. Mais cette nuit, le petit a montré le chemin. »",
      "Depuis, les goélands ne se moquent plus. Et si vous passez un soir tout au bout de la Bretagne, regardez bien : la plus petite lumière de la côte est aussi la plus fière.",
    ],
    quiz: [
      {
        question: "Pourquoi le grand phare s'éteint-il ?",
        choices: ["Il est en panne d'ampoule", "La foudre le frappe", "Le gardien dort"],
        answer: 1,
        explanation: "La foudre frappe le grand phare de la pointe pendant la tempête.",
      },
      {
        question: "Quelle idée géniale a Loïk ?",
        choices: [
          "Il crie très fort",
          "Il cligne en faisant le signal des marins",
          "Il devient plus grand",
        ],
        answer: 1,
        explanation: "Au lieu de tourner, il cligne : trois coups courts, trois longs, trois courts.",
      },
      {
        question: "Que dit le pêcheur le lendemain ?",
        choices: [
          "« Les grands phares montrent la mer, le petit a montré le chemin. »",
          "« Il faut un phare plus grand. »",
          "« J'ai eu de la chance. »",
        ],
        answer: 0,
        explanation: "C'est la phrase qui rend Loïk si fier depuis cette nuit-là.",
      },
          {
        question: "Quel signal Loïk envoie-t-il au pêcheur ?",
        choices: ["Trois coups courts, trois longs, trois courts", "Il tourne deux fois plus vite", "Il éteint sa lampe"],
        answer: 0,
        explanation: "Au lieu de tourner, Loïk clignote : trois coups courts, trois longs, trois courts, le signal que tous les marins connaissent.",
      },
    ],
    glossary: [
      { word: "faisceaux", definition: "Les grands rayons de lumière que les phares envoient sur la mer." },
      { word: "chenal", definition: "Le passage sûr, sans rochers, que les bateaux suivent pour entrer au port." },
      { word: "goélands", definition: "De grands oiseaux de mer blancs et gris, cousins des mouettes." },
    ],
  },
  "la-reine-des-champignons": {
    body: [
      "Sous la mousse du vieil hêtre, là où la forêt sent la pluie et le secret, il existe un royaume minuscule. Des maisons en chapeaux de glands. Des lanternes en gouttes de rosée. Et sur un trône de velours de mousse, la reine Amanite, souveraine des champignons.",
      "Dans ce royaume vivent les Chapeaux-Pointus, le petit peuple des champignons. Le matin, ils polissent leurs chapeaux avec de la brume. À midi, ils déjeunent d'une miette de châtaigne. Et le soir, ils allument leurs lanternes de rosée et racontent des histoires de racines et de vers luisants. La reine Amanite veille sur eux depuis toujours, coiffée de sa couronne rouge à pois blancs.",
      "Chaque matin, la reine compte son trésor : les spores d'or, ces poussières magiques qui font pousser les champignons de toute la forêt. Sans elles, plus de girolles, plus de cèpes, plus de petites maisons rouges à pois blancs.",
      "Mais ce matin-là, le coffre de noisette est vide. « On m'a volée ! » s'écrie la reine. Le royaume entier retient son souffle. Sans spores, dans une semaine, le royaume commencera à faner.",
      "La reine fait d'abord chercher partout. Sous les feuilles mortes. Dans les galeries des taupes, qu'il faut réveiller poliment. Jusque dans la mare, où les têtards jurent, la patte sur le cœur, qu'ils n'ont rien vu passer. Rien. Le coffre de noisette s'est envolé comme un parfum.",
      "La reine convoque Nour, une jeune fourmi détective connue pour retrouver n'importe quoi, même les choses pas perdues. Nour examine le coffre avec sa loupe en aile de moucheron. « Hmm. Pas de traces de pas. Pas de porte forcée. Mais... des miettes de noisette PARTOUT. »",
      "Nour pose trois questions, toujours les mêmes : qui, quand, pourquoi. Puis elle fait trois fois le tour du trône, les antennes frémissantes. C'est sa méthode. « Un mystère, dit-elle, c'est comme un fil de toile d'araignée : il suffit de trouver le premier bout. »",
      "Nour suit les miettes. Elles montent le long du tronc, passent la deuxième branche, et mènent tout droit... au nid de Casse-Noix, l'écureuil le plus étourdi de la forêt.",
      "Casse-Noix dort, roulé dans sa queue, le coffre de noisette serré contre lui. « Réveille-toi ! » crie Nour. L'écureuil ouvre un œil. « Hein ? Quoi ? J'ai trouvé cette super noisette hier, je l'ai rangée pour l'hiver ! »",
      "« Ce n'est pas une noisette, c'est le coffre royal ! » Casse-Noix devient tout rouge sous son poil roux. Il n'avait pas volé : il avait rangé. C'est plus fort que lui, il range tout ce qui ressemble à une noisette.",
      "La reine, prévenue, grimpe elle-même jusqu'au nid, ce qui ne s'était jamais vu de mémoire de champignon. Elle regarde l'écureuil confus, son coffre serré entre les pattes, et quelque chose d'étonnant se produit : elle éclate de rire. Un rire si clair que trois glands en tombent de l'arbre. « Rangé ! Mon trésor ! Comme une vulgaire noisette ! »",
      "Pour se faire pardonner, Casse-Noix devient le transporteur officiel du royaume : toute la saison, il sème les spores d'or aux quatre coins de la forêt, plus vite qu'aucune fourmi n'aurait pu le faire. Jamais la forêt n'avait vu autant de champignons.",
      "Et la reine Amanite fit graver une nouvelle loi sur le tronc du vieil hêtre : « Dans ce royaume, même les bêtises peuvent devenir des cadeaux, si on les répare en grand. »",
    ],
    quiz: [
      {
        question: "Qu'y a-t-il dans le coffre royal ?",
        choices: ["Des pièces d'or", "Les spores d'or qui font pousser les champignons", "Des noisettes"],
        answer: 1,
        explanation: "Les spores d'or font pousser tous les champignons de la forêt.",
      },
      {
        question: "Pourquoi Casse-Noix a-t-il pris le coffre ?",
        choices: [
          "Pour le voler",
          "Il l'a confondu avec une noisette et l'a rangé",
          "Pour embêter la reine",
        ],
        answer: 1,
        explanation: "Il range tout ce qui ressemble à une noisette, c'est plus fort que lui !",
      },
      {
        question: "Comment Casse-Noix répare-t-il sa bêtise ?",
        choices: [
          "Il rend le coffre et s'excuse",
          "Il devient le transporteur officiel des spores",
          "Il quitte la forêt",
        ],
        answer: 1,
        explanation: "Il sème les spores d'or dans toute la forêt, plus vite que personne.",
      },
          {
        question: "Qui avait pris le coffre de noisette ?",
        choices: ["Casse-Noix l'écureuil", "Nour la fourmi détective", "Une taupe des galeries"],
        answer: 0,
        explanation: "Casse-Noix n'avait rien volé : il avait rangé le coffre pour l'hiver, en le prenant pour une grosse noisette.",
      },
    ],
    glossary: [
      { word: "spores", definition: "Les minuscules graines invisibles grâce auxquelles les champignons se multiplient." },
      { word: "souveraine", definition: "Une autre façon de dire « reine » : celle qui règne sur un royaume." },
      { word: "faner", definition: "Se flétrir et perdre ses couleurs, comme une fleur qui manque d'eau." },
    ],
  },
  "bonne-nuit-petit-lapin": {
    body: [
      "Le soir tombe sur le terrier. Maman Lapin borde Pilou avec la couverture de laine, celle qui gratte un peu mais qui sent bon. « Il est l'heure de dormir, mon tout petit. » Pilou ouvre grand les yeux. « Attends ! Je n'ai pas dit bonne nuit. »",
      "« À qui, mon Pilou ? » demande Maman Lapin. « À tout le monde », répond Pilou, très sérieux.",
      "Il s'assoit dans son lit, parce que c'est un travail important et qu'on ne fait pas ça couché. Alors Pilou commence par ce qu'il voit. « Bonne nuit, la porte. Bonne nuit, le tapis. Bonne nuit, mes bottes, toutes les deux. »",
      "Il chuchote, parce que la nuit, on parle tout doucement. « Bonne nuit, la lampe. Bonne nuit, la cuillère du dîner. »",
      "« Bonne nuit, la carotte », dit Pilou. Maman Lapin rit derrière sa patte. « La carotte est déjà dans ton ventre. » « Alors bonne nuit, mon ventre. » Ensuite, il dit bonne nuit à ce qu'il ne voit pas. « Bonne nuit, le jardin. Bonne nuit, la pluie de tout à l'heure. »",
      "« Bonne nuit, les copains du terrier d'à côté. Bonne nuit, le vent dans les herbes hautes. »",
      "Maman Lapin s'assoit au bord du lit et ne dit plus rien. Dehors, la nuit est douce et ronde comme un galet. Les moustaches de Pilou bougent de moins en moins vite. « Bonne nuit, les étoiles... bonne nuit, la lune... et bonne nuit, maman... »",
      "Maman Lapin souffle la lampe. Dire bonne nuit à tout ce qu'on aime, c'est déjà commencer à faire de beaux rêves.",
    ],
    quiz: [
      {
        question: "Pourquoi Pilou ne veut pas dormir tout de suite ?",
        choices: ["Il a faim", "Il n'a pas encore dit bonne nuit", "Il a perdu ses bottes"],
        answer: 1,
        explanation: "Pilou veut dire bonne nuit à tout le monde avant de fermer les yeux.",
      },
      {
        question: "Comment Pilou dit-il bonne nuit ?",
        choices: ["Il crie très fort", "Il chuchote tout doucement", "Il chante"],
        answer: 1,
        explanation: "La nuit, on parle tout doucement : Pilou chuchote.",
      },
      {
        question: "À qui Pilou dit-il bonne nuit en dernier ?",
        choices: ["À la lune et à sa maman", "À la porte", "À ses bottes"],
        answer: 0,
        explanation: "Les derniers bonne nuit sont pour la lune, puis pour maman.",
      },
    ],
    glossary: [
      { word: "terrier", definition: "La maison creusée sous la terre où vivent les lapins et les renards." },
      { word: "chuchote", definition: "Parler tout bas, avec une toute petite voix, pour ne pas réveiller les autres." },
      { word: "moustaches", definition: "Les longs poils fins sur le museau du lapin. Elles bougent quand il renifle." },
    ],
  },
  "le-doudou-de-nino": {
    body: [
      "C'est l'heure du lit. Nino a mis son pyjama, bu son verre d'eau et écouté son histoire. Il ne manque qu'une chose. « Mon doudou ! Où est mon doudou ? »",
      "Le doudou de Nino est un petit lapin gris, avec une oreille plus longue que l'autre. Sans lui, la nuit est beaucoup trop grande.",
      "Papa regarde sous le lit. Il trouve une chaussette et deux petites voitures. Mais pas de doudou. Maman ouvre le tiroir. Elle trouve un pyjama propre, un bonnet et trois crayons. Mais pas de doudou.",
      "Grande sœur regarde derrière le rideau. Elle trouve le chat, qui dormait très bien et qui n'est pas content du tout. Mais pas de doudou.",
      "Nino a les yeux qui piquent un peu. « Il est perdu pour toujours ? » « On cherche encore », dit Papa. Alors toute la famille cherche, dans toute la maison.",
      "La cuisine : sous la table, dans le placard des casseroles. Rien du tout.",
      "Le salon : sous les coussins du canapé, derrière la grande plante. Rien du tout. Et puis Nino grimpe sur son lit, tout doucement, et soulève son oreiller. Et là... le doudou ! Il dormait déjà, tout seul, l'oreille en travers.",
      "Nino le serre très fort contre lui. Ce n'est pas lui qui avait perdu son doudou : c'est son doudou qui l'attendait au bon endroit depuis le début. Bonne nuit, tous les deux.",
    ],
    quiz: [
      {
        question: "Que trouve Papa sous le lit ?",
        choices: ["Une chaussette et deux voitures", "Le doudou", "Le chat"],
        answer: 0,
        explanation: "Sous le lit, Papa trouve une chaussette et deux petites voitures.",
      },
      {
        question: "Qui dormait derrière le rideau ?",
        choices: ["Grande sœur", "Le chat", "Nino"],
        answer: 1,
        explanation: "C'est le chat, qui dormait très bien derrière le rideau.",
      },
      {
        question: "Où était le doudou ?",
        choices: ["Dans le tiroir", "Sous l'oreiller de Nino", "Dans la cuisine"],
        answer: 1,
        explanation: "Le doudou attendait sagement sous l'oreiller, sur le lit de Nino.",
      },
    ],
    glossary: [
      { word: "doudou", definition: "La peluche ou le petit tissu tout doux qu'on garde pour dormir." },
      { word: "tiroir", definition: "La boîte qui glisse dans un meuble et où on range les habits." },
      { word: "oreiller", definition: "Le coussin moelleux sur lequel on pose sa tête pour dormir." },
    ],
  },
  "coucou-petit-chat": {
    body: [
      "Moustache le chat adore jouer à cache-cache. C'est son jeu préféré, avant même la sieste. « Compte jusqu'à trois ! » dit-il à Lila. Un... deux... trois.",
      "Moustache a disparu ! Enfin, presque.",
      "Derrière le rideau, il y a une petite queue rayée qui dépasse. Elle bouge un peu, à droite, à gauche. Coucou, petit chat ! Moustache change de cachette. Il se glisse dans le panier à linge, sous une serviette. Très malin.",
      "Mais la queue rayée dépasse encore. Elle bouge, elle bouge. Coucou, petit chat !",
      "Moustache essaie sous la table, entre les chaises. La queue dépasse. Il essaie derrière la grande plante verte. La queue dépasse.",
      "Il essaie dans le carton du déménagement, tout au fond. La queue dépasse encore, et en plus, elle remue de contentement.",
      "À chaque fois, la queue dit bonjour avant lui. Moustache ne comprend pas du tout pourquoi on le trouve si vite. « Tu es le champion des cachettes », dit Lila en le chatouillant sous le menton. Moustache est très fier.",
      "Alors il se roule en boule sur les genoux de Lila et se met à ronronner. Se cacher, c'est amusant, mais être trouvé par quelqu'un qu'on aime, c'est encore mieux.",
    ],
    quiz: [
      {
        question: "À quoi joue Moustache ?",
        choices: ["À la balle", "À cache-cache", "À saute-mouton"],
        answer: 1,
        explanation: "Moustache adore jouer à cache-cache.",
      },
      {
        question: "Qu'est-ce qui dépasse toujours de sa cachette ?",
        choices: ["Sa queue rayée", "Ses oreilles", "Ses moustaches"],
        answer: 0,
        explanation: "C'est sa petite queue rayée qui dépasse à chaque fois.",
      },
      {
        question: "Que fait Moustache à la fin ?",
        choices: ["Il se cache dans le carton", "Il ronronne sur les genoux de Lila", "Il compte jusqu'à trois"],
        answer: 1,
        explanation: "Il se roule en boule sur les genoux de Lila et ronronne.",
      },
    ],
    glossary: [
      { word: "cachette", definition: "L'endroit secret où on se cache pour qu'on ne nous trouve pas." },
      { word: "panier", definition: "Une corbeille avec des poignées, pour ranger le linge ou porter des choses." },
      { word: "ronronner", definition: "Le petit bruit tout doux que fait un chat quand il est très heureux." },
    ],
  },
  "le-hibou-qui-compte-les-etoiles": {
    body: [
      "Hulotte le hibou a un travail très important, le plus important de toute la forêt. Chaque soir, elle compte les étoiles. Elle se pose sur sa branche préférée, celle qui craque un peu quand elle bouge, et elle regarde le grand ciel noir.",
      "« Une, deux, trois... » Les étoiles sortent doucement, une par une, comme des petites lampes qu'on allume dans les maisons.",
      "« Dix, onze, douze... » En bas, la forêt s'endort. Le ruisseau parle tout seul et les feuilles ne bougent presque plus. « Vingt, vingt et une, vingt-deux... » Le vent passe entre les arbres. Hulotte remonte ses plumes bien serrées autour de son cou.",
      "« Trente-cinq, trente-six... » Une chauve-souris la salue en passant, la tête à l'envers. Hulotte ne répond pas : quand on compte, on ne parle pas.",
      "« Quarante-huit, quarante-neuf, cinquante... » Ses paupières deviennent lourdes comme deux gros cailloux de rivière. « Cinquante-huit... cinquante-neuf... soixante... » Sa voix devient toute petite.",
      "Elle bâille un grand bâillement de hibou, si grand qu'on voit tout au fond de son bec.",
      "« Soixante et un... soixante... euh... soixante quelque chose... » Elle a déjà oublié où elle en était. Et hop, Hulotte s'endort sur sa branche, la tête rentrée dans les plumes, une patte repliée sous elle.",
      "Demain soir, elle recommencera à une. Certaines choses sont trop grandes pour être finies, et c'est très bien : elles nous font de beaux rêves toutes les nuits.",
    ],
    quiz: [
      {
        question: "Quel est le travail de Hulotte ?",
        choices: ["Compter les étoiles", "Réveiller la forêt", "Ranger les nuages"],
        answer: 0,
        explanation: "Chaque soir, Hulotte compte les étoiles depuis sa branche.",
      },
      {
        question: "Que se passe-t-il quand elle arrive à soixante ?",
        choices: ["Elle chante", "Elle s'endort", "Elle s'envole"],
        answer: 1,
        explanation: "Ses paupières deviennent lourdes et Hulotte s'endort sur sa branche.",
      },
      {
        question: "Que fera Hulotte demain soir ?",
        choices: ["Elle recommencera à compter à une", "Elle comptera les nuages", "Elle dormira toute la nuit"],
        answer: 0,
        explanation: "Demain soir, Hulotte recommencera son comptage à une.",
      },
    ],
    glossary: [
      { word: "hibou", definition: "Un oiseau de nuit avec de grands yeux ronds, qui dort le jour." },
      { word: "branche", definition: "Le grand bras de bois d'un arbre, sur lequel les oiseaux se posent." },
      { word: "bâille", definition: "Ouvrir grand la bouche sans faire exprès, quand on a très sommeil." },
    ],
  },
  "un-calin-pour-papa-ours": {
    body: [
      "Ce soir, Papa Ours est assis dans le noir, tout au bout du fauteuil. Il ne dit rien du tout et il ne bouge presque pas. D'habitude, il raconte des histoires. D'habitude, il fait des voix rigolotes et il se trompe exprès. Pas ce soir.",
      "Petit Ours s'approche sans faire de bruit, sur la pointe des pattes. « Papa, tu es grognon ? »",
      "« Non, mon ourson. Je suis juste fatigué. » Papa Ours pousse un très gros soupir, long comme un soir d'hiver. Petit Ours s'assoit par terre, contre le fauteuil, et réfléchit très fort. Il connaît bien ce genre de soir.",
      "Quand lui est triste, maman fait quelque chose de magique. Elle ne parle pas. Elle ne pose pas de questions. Elle ne dit même pas que ça va passer.",
      "Alors Petit Ours grimpe sur le fauteuil, une patte après l'autre, tout doucement pour ne pas déranger. Il pose sa tête contre l'épaule de Papa Ours, juste là où la fourrure est la plus douce et la plus chaude.",
      "Et il fait un câlin. Un long, long câlin d'ourson, avec les deux bras, en serrant aussi fort qu'il peut.",
      "Papa Ours ne dit toujours rien. Mais ses épaules redescendent, tout doucement, comme la neige qui glisse d'une branche. Et puis il sourit un peu, dans le noir, et pose sa grosse patte sur le dos de Petit Ours. « Merci, mon ourson. »",
      "Petit Ours est content. On n'a pas besoin d'être grand, ni de trouver les bons mots, pour consoler quelqu'un.",
    ],
    quiz: [
      {
        question: "Comment se sent Papa Ours ce soir ?",
        choices: ["Il est fatigué", "Il a faim", "Il est en colère"],
        answer: 0,
        explanation: "Papa Ours n'est pas grognon : il est juste très fatigué.",
      },
      {
        question: "Que fait Petit Ours pour l'aider ?",
        choices: ["Il chante une chanson", "Il fait un long câlin", "Il allume la lumière"],
        answer: 1,
        explanation: "Petit Ours grimpe sur le fauteuil et fait un long câlin avec les deux bras.",
      },
      {
        question: "Qu'est-ce qui change chez Papa Ours à la fin ?",
        choices: ["Il s'endort", "Il sourit un peu", "Il sort dehors"],
        answer: 1,
        explanation: "Ses épaules redescendent et il sourit un peu.",
      },
    ],
    glossary: [
      { word: "grognon", definition: "De mauvaise humeur, qui répond avec une petite voix fâchée." },
      { word: "soupir", definition: "Un grand souffle qui sort tout seul quand on est fatigué ou triste." },
      { word: "épaule", definition: "Le haut du bras, juste à côté du cou : un endroit parfait pour poser sa tête." },
    ],
  },
  "le-premier-flocon-du-renardeau": {
    body: [
      "Petit Roux le renardeau sort du terrier en se frottant les yeux. Et il s'arrête net. Le monde est tout blanc. La souche est blanche. Les fougères sont blanches. Même le rocher est blanc.",
      "« Maman ! Quelqu'un a repeint la forêt ! »",
      "Maman Renard sort à son tour et rit. « C'est la neige, mon petit. Elle vient chaque hiver. » « Chaque hiver ? Et moi je ne l'ai jamais vue ? » « C'est ton premier », dit Maman Renard.",
      "Petit Roux avance une patte, très prudemment. Crounch. La neige fait de la musique sous ses pas.",
      "Il en fait une deuxième. Crounch. Puis il court en rond, juste pour le bruit. Crounch, crounch, crounch ! Puis il lève la tête. Un flocon descend, tourne, hésite... et se pose sur son museau.",
      "C'est froid ! Petit Roux éternue, et le flocon disparaît. « Oh ! Il est parti ! »",
      "Il attend, le nez en l'air, mais rien ne revient. Sa queue retombe un peu. « Regarde », dit Maman Renard. Et le ciel entier se met à en envoyer des milliers, doucement, sans se presser.",
      "Petit Roux tourne sur lui-même, la langue dehors. Les plus jolies choses ne durent qu'un instant, mais l'hiver, lui, en offre toute une forêt.",
    ],
    quiz: [
      {
        question: "Que croit Petit Roux en sortant du terrier ?",
        choices: ["Que quelqu'un a repeint la forêt", "Qu'il fait nuit", "Que maman est partie"],
        answer: 0,
        explanation: "Tout est blanc, alors Petit Roux croit qu'on a repeint la forêt.",
      },
      {
        question: "Où se pose le premier flocon ?",
        choices: ["Sur sa queue", "Sur son museau", "Sur sa patte"],
        answer: 1,
        explanation: "Le flocon descend, hésite, puis se pose sur son museau.",
      },
      {
        question: "Pourquoi le flocon disparaît-il ?",
        choices: ["Petit Roux éternue", "Maman Renard le souffle", "Le vent l'emporte"],
        answer: 0,
        explanation: "Le flocon est froid, Petit Roux éternue, et hop, il n'est plus là.",
      },
    ],
    glossary: [
      { word: "renardeau", definition: "Un bébé renard, encore tout petit et très curieux." },
      { word: "flocon", definition: "Un tout petit morceau de neige qui tombe du ciel en tournant." },
      { word: "museau", definition: "Le bout du nez des animaux comme le renard ou le chien." },
    ],
  },
  "le-gateau-danniversaire-de-mimi": {
    body: [
      "Aujourd'hui, Mimi la souris a un an. C'est écrit sur le mur de son trou, en tout petits traits gris. « Je veux un gâteau ! » dit-elle en sautant du lit. « Un vrai gâteau, avec une bougie dessus. »",
      "Alors Mimi sort son plus petit bol, son plus petit fouet, et son plus petit tablier. Et elle se met au travail.",
      "Elle prend une cuillère de farine, pas plus. Une souris, ça ne mange pas beaucoup, même le jour de sa fête. Elle ajoute une goutte de lait, une miette de sucre et un tout petit bout de beurre gros comme un pois.",
      "Elle mélange, mélange, mélange, jusqu'à ce que ses deux bras soient fatigués et que la pâte soit toute lisse.",
      "Le gâteau cuit dans un dé à coudre posé près de la bougie. Ça sent tout bon dans le trou, et même dans le couloir d'à côté. Mimi plante une bougie dessus. Enfin, une allumette, parce qu'une vraie bougie serait plus haute que la maison.",
      "Tous ses amis arrivent : deux souris du grenier, un escargot très en retard, et une coccinelle un peu timide qui reste près de la porte.",
      "« Joyeux anniversaire, Mimi ! » Ils chantent tous ensemble, un peu faux, et l'escargot chante encore quand les autres ont fini. Puis ils soufflent tous ensemble. Pouf ! La lumière s'éteint d'un coup et tout le monde rit dans le noir.",
      "Le gâteau fait exactement une bouchée pour chacun. Un gâteau minuscule partagé avec ses amis, ça remplit un très grand cœur.",
    ],
    quiz: [
      {
        question: "Quel âge a Mimi aujourd'hui ?",
        choices: ["Un an", "Trois ans", "Dix ans"],
        answer: 0,
        explanation: "Aujourd'hui, Mimi la souris a un an.",
      },
      {
        question: "Dans quoi cuit le gâteau ?",
        choices: ["Dans un dé à coudre", "Dans une casserole", "Dans une tasse"],
        answer: 0,
        explanation: "Le gâteau est si petit qu'il cuit dans un dé à coudre.",
      },
      {
        question: "Qui vient à la fête ?",
        choices: ["Deux souris, un escargot et une coccinelle", "Un chat et un chien", "Personne"],
        answer: 0,
        explanation: "Deux souris, un escargot et une coccinelle un peu timide viennent fêter Mimi.",
      },
    ],
    glossary: [
      { word: "farine", definition: "La poudre blanche faite avec du blé, qu'on utilise pour faire les gâteaux." },
      { word: "miette", definition: "Un tout petit morceau, si petit qu'on le voit à peine." },
      { word: "bougie", definition: "Le petit bâton de cire qu'on allume et qu'on souffle pour son anniversaire." },
    ],
  },
  "le-petit-lion-qui-baille": {
    body: [
      "Le soleil se couche sur la savane. Tout devient orange, puis rose, puis presque violet, et l'air se rafraîchit. Nala le petit lion est allongé dans l'herbe tiède, entre les pattes de sa maman. Il ouvre une grande bouche.",
      "Aaaah ! Un bâillement gros comme une montagne, avec de toutes petites dents pointues au milieu.",
      "La girafe le voit depuis là-haut, tout en haut de son cou. Elle essaie de résister. Elle serre les dents très fort. Elle ne peut pas. Aaaah ! Un bâillement long comme son cou, qui descend jusqu'en bas.",
      "Le zèbre voit la girafe bâiller. Aaaah ! Un bâillement à rayures noires et blanches.",
      "Le singe voit le zèbre. Aaaah ! Un bâillement qui manque de le faire tomber de sa branche. Même l'éléphant, qui est très sérieux et qui ne bâille jamais devant les autres, ouvre sa grande bouche. Aaaaaaah !",
      "Le bâillement continue son voyage à travers la savane. Les gazelles, une par une. Les flamants roses, tous ensemble.",
      "Il réveille même le vieux crocodile de la rivière, qui bâille en montrant beaucoup trop de dents. Il fait tout le tour de la savane, passe par le baobab, et revient jusqu'à Nala. « Oh non », dit Nala. Et il bâille encore une fois, deux fois, trois fois.",
      "Alors toute la savane s'allonge dans l'herbe tiède. Un bâillement, ça se donne comme un cadeau : ça finit toujours par revenir.",
    ],
    quiz: [
      {
        question: "Qui bâille en premier ?",
        choices: ["La girafe", "Nala le petit lion", "L'éléphant"],
        answer: 1,
        explanation: "C'est Nala le petit lion qui ouvre la première grande bouche.",
      },
      {
        question: "Qui bâille juste après la girafe ?",
        choices: ["Le zèbre", "Le singe", "Nala"],
        answer: 0,
        explanation: "Le zèbre voit la girafe bâiller, et il bâille à son tour.",
      },
      {
        question: "Que fait la savane à la fin ?",
        choices: ["Elle s'allonge dans l'herbe tiède", "Elle part en courant", "Elle chante"],
        answer: 0,
        explanation: "Toute la savane s'allonge dans l'herbe tiède pour dormir.",
      },
    ],
    glossary: [
      { word: "savane", definition: "Un très grand pays d'herbes hautes et chaudes, où vivent les lions." },
      { word: "bâillement", definition: "Le grand oh de la bouche qui sort tout seul quand on a sommeil." },
      { word: "tiède", definition: "Ni chaud ni froid : tout doux, comme un bain bien agréable." },
    ],
  },
  "les-bottes-rouges-de-lila": {
    body: [
      "Il pleut sur la ville depuis ce matin. Lila regarde par la fenêtre, le nez écrasé contre la vitre froide. « On sort quand même ? » demande-t-elle. Dehors, les gouttes font des ronds qui grandissent sur le trottoir.",
      "Maman arrive avec un paquet sous le bras. Dedans, il y a deux bottes toutes neuves. Rouges comme des pommes.",
      "Une botte, deux bottes. Un manteau bien fermé. Un chapeau jaune sur les oreilles. Et hop, dehors ! Devant la porte, il y a une flaque. Une toute petite, à peine plus grande qu'une assiette.",
      "Lila met un pied dedans, très doucement, juste pour voir ce qui va se passer. Splash !",
      "L'éclaboussure monte jusqu'à ses genoux. Lila rit très fort, si fort qu'un pigeon s'envole. Alors elle cherche la flaque suivante. Celle du trottoir, devant la boulangerie qui sent le pain chaud.",
      "Puis une plus grande, au bord du caniveau, avec une feuille qui flotte dessus comme un bateau.",
      "Puis la plus grande de toutes, devant le parc, celle qui fait presque une petite mer. Splash, splash, splash ! Les bottes rouges deviennent des bottes marron, et Maman rit sous son parapluie en faisant semblant de ne pas voir.",
      "À la maison, on lave les bottes et elles redeviennent rouges. Un jour de pluie n'est pas un jour perdu : il faut juste les bonnes bottes.",
    ],
    quiz: [
      {
        question: "De quelle couleur sont les bottes de Lila ?",
        choices: ["Rouges", "Jaunes", "Vertes"],
        answer: 0,
        explanation: "Les bottes toutes neuves de Lila sont rouges comme des pommes.",
      },
      {
        question: "Que fait Lila dans la première flaque ?",
        choices: ["Elle la contourne", "Elle met un pied dedans", "Elle la montre à maman"],
        answer: 1,
        explanation: "Lila met un pied dans la flaque, et splash !",
      },
      {
        question: "Pourquoi les bottes deviennent-elles marron ?",
        choices: ["À cause de la boue des flaques", "Parce qu'elles ont séché", "Parce qu'il fait nuit"],
        answer: 0,
        explanation: "À force de sauter dans les flaques, les bottes rouges se couvrent de boue.",
      },
    ],
    glossary: [
      { word: "flaque", definition: "Une petite mare d'eau qui reste par terre après la pluie." },
      { word: "éclaboussure", definition: "L'eau qui saute partout quand on tape dedans avec le pied." },
      { word: "bottes", definition: "Des chaussures hautes en caoutchouc, qui gardent les pieds bien au sec." },
    ],
  },
};

/** Generic fallback for stories without dedicated content yet. */
const FALLBACK_CONTENT: StoryContent = {
  body: [
    "Il était une fois, au fond d'un bois où même les plus vieux chênes avaient oublié leur nom, une petite maison aux volets bleus. Personne n'avait pensé qu'on pouvait y vivre, et pourtant, quelqu'un y vivait bel et bien.",
    "La maison appartenait à une enfant que les autres appelaient, faute de mieux, « la petite ». Son vrai nom, elle le gardait pour elle, comme on garde une noisette précieuse dans le creux de sa main.",
    "Un jour de novembre, tandis qu'elle préparait un thé à la verveine, la petite entendit gratter à sa porte. Elle ouvrit. Sur le pas de la porte se tenait un renard, un livre relié de cuir bleu sous le bras.",
    "« Pardon, je me suis perdu dans mon histoire. Pourriez-vous m'aider à retrouver la page ? »",
    "La petite s'écarta, tendit la main, et dit avec beaucoup de sérieux : « Entrez donc. Le thé est presque prêt. »",
  ],
  quiz: [
    {
      question: "Qui frappe à la porte de la petite maison ?",
      choices: ["Un loup affamé", "Un renard avec un livre", "Le facteur du village"],
      answer: 1,
      explanation: "C'est un renard, fatigué, qui porte un livre relié de cuir bleu.",
    },
    {
      question: "Que prépare la petite ?",
      choices: ["Un gâteau", "Une soupe", "Un thé à la verveine"],
      answer: 2,
      explanation: "Elle préparait un thé à la verveine, un jour de novembre.",
    },
    {
      question: "Que demande le renard ?",
      choices: ["De retrouver sa page", "Un endroit pour dormir", "Le chemin de la forêt"],
      answer: 0,
      explanation: "Il s'est perdu dans son histoire et cherche à retrouver la page.",
    },
  ],
  glossary: [
    { word: "verveine", definition: "Une plante qu'on fait infuser pour préparer une tisane au goût doux." },
    { word: "relié", definition: "Un livre relié a une couverture solide, souvent en cuir ou en carton épais." },
  ],
};

/** Generic English fallback. */
const FALLBACK_CONTENT_EN: StoryContent = {
  body: [
    "Once upon a time, deep in a wood where even the oldest oaks had forgotten their names, there was a little house with blue shutters. No one thought anyone could live there, and yet someone did.",
    "The house belonged to a child the others called, for lack of anything better, 'the little one'. Her real name she kept to herself, the way you keep a precious hazelnut in the hollow of your hand.",
    "One November day, while she was making verbena tea, the little one heard a scratching at her door. She opened it. On the doorstep stood a fox, a leather-bound blue book under one arm.",
    "'Excuse me, I got lost inside my story. Could you help me find the page again?'",
    "The little one stepped aside, held out her hand, and said very seriously: 'Do come in. The tea is almost ready.'",
  ],
  quiz: [
    {
      question: "Who knocks at the little house's door?",
      choices: ["A hungry wolf", "A fox with a book", "The village postman"],
      answer: 1,
      explanation: "It is a tired fox, carrying a leather-bound blue book.",
    },
    {
      question: "What is the little one making?",
      choices: ["A cake", "A soup", "Verbena tea"],
      answer: 2,
      explanation: "She was making verbena tea, one November day.",
    },
    {
      question: "What does the fox ask for?",
      choices: ["To find his page", "A place to sleep", "The way out of the forest"],
      answer: 0,
      explanation: "He got lost inside his story and is looking for his page.",
    },
  ],
  glossary: [
    { word: "verbena", definition: "A plant brewed to make a gently flavoured herbal tea." },
    { word: "leather-bound", definition: "A book with a solid cover, often made of leather or thick board." },
  ],
};

/**
 * English per-story content. Populated story by story (and by the generation
 * pipeline later). Anything missing falls back to the French text so the page
 * still works, while audio/PDF stay consistent with whatever language is shown.
 */
const STORY_CONTENT_EN: Record<string, StoryContent> = {
  "le-renard-qui-ne-voulait-pas-dormir": {
    body: [
      "Filo the little fox did not want to sleep. Ever. “Five more minutes!” he said every night. Then five more. And five more again.",
      "That evening, his mum blew out the candle and kissed him between the ears. But the moment she left the den, Filo opened his eyes wide again. Sleep, really? While outside the night was doing mysterious things without him?",
      "He poked his snout out of the den. The sky was huge and pricked with stars. And there, right at the top, the moon was watching him. “Not asleep, little fox?” she asked, in a voice as soft as an eiderdown.",
      "“I don't want to sleep,” said Filo. “If I sleep, I'll miss everything!” The moon smiled. “Miss everything? Come, let me show you a secret.”",
      "She lit up the sleeping forest. Filo saw the closed flowers getting their colours ready for tomorrow. He saw the huddled birds mending their songs. He even saw the wind, lying down in the branches, gathering strength to blow the morning clouds.",
      "“You see,” whispered the moon. “At night, no one misses anything. Everyone is getting ready for tomorrow. The most beautiful things of the day are made while we sleep.”",
      "Filo gave a great big foxy yawn. If even the wind was having a nap, then maybe... He curled back up in the den, his tail wrapped around his nose.",
      "And that night, Filo slept deeply, to get ready, like everyone else, for a very big day. Good night, little fox.",
    ],
    quiz: [
      {
        question: "What does Filo say every night so he won't sleep?",
        choices: ["'Five more minutes!'", "'I'm too hungry!'", "'There's a monster!'"],
        answer: 0,
        explanation: "Filo always asks for five more minutes, then five more!",
      },
      {
        question: "Who talks to Filo when he leaves the den?",
        choices: ["An owl", "The moon", "His mum"],
        answer: 1,
        explanation: "It is the moon, with her voice as soft as an eiderdown.",
      },
      {
        question: "What do the flowers do during the night?",
        choices: ["They dance", "They get their colours ready for tomorrow", "They change places"],
        answer: 1,
        explanation: "At night, the closed flowers get their colours ready for the next day.",
      },
    ],
    glossary: [
      { word: "den", definition: "The home dug under the ground where foxes and rabbits live." },
      { word: "eiderdown", definition: "A big, soft, puffy quilt filled with feathers." },
    ],
  },
  "bonne-nuit-petit-lapin": {
    body: [
      "Evening falls on the burrow. Mummy Rabbit tucks Pilou in with the woolly blanket, the scratchy one that smells so good. “Time to sleep, my little one.” Pilou opens his eyes wide. “Wait! I haven't said good night.”",
      "“To whom, my Pilou?” asks Mummy Rabbit. “To everyone,” says Pilou, very seriously.",
      "He sits up in bed, because this is important work and you cannot do it lying down. So Pilou starts with the things he can see. “Good night, door. Good night, rug. Good night, my boots, both of you.”",
      "He whispers, because at night we speak very softly. “Good night, lamp. Good night, dinner spoon.”",
      "“Good night, carrot,” says Pilou. Mummy Rabbit laughs behind her paw. “The carrot is already in your tummy.” “Then good night, tummy.” Next he says good night to the things he cannot see. “Good night, garden. Good night, rain from earlier.”",
      "“Good night, friends in the burrow next door. Good night, wind in the tall grass.”",
      "Mummy Rabbit sits on the edge of the bed and says nothing at all. Outside, the night is soft and round like a pebble. Pilou's whiskers move slower and slower. “Good night, stars... good night, moon... and good night, mummy...”",
      "Mummy Rabbit blows out the lamp. Saying good night to everything you love is already the start of beautiful dreams.",
    ],
    quiz: [
      {
        question: "Why doesn't Pilou want to sleep straight away?",
        choices: ["He is hungry", "He hasn't said good night yet", "He lost his boots"],
        answer: 1,
        explanation: "Pilou wants to say good night to everyone before closing his eyes.",
      },
      {
        question: "How does Pilou say good night?",
        choices: ["He shouts very loudly", "He whispers very softly", "He sings"],
        answer: 1,
        explanation: "At night we speak very softly, so Pilou whispers.",
      },
      {
        question: "Who gets Pilou's last good night?",
        choices: ["The moon and his mummy", "The door", "His boots"],
        answer: 0,
        explanation: "The last good nights go to the moon, then to mummy.",
      },
    ],
    glossary: [
      { word: "burrow", definition: "The home dug under the ground where rabbits and foxes live." },
      { word: "whispers", definition: "To speak very quietly, with a tiny voice, so you don't wake anyone." },
      { word: "whiskers", definition: "The long thin hairs on a rabbit's nose. They wiggle when he sniffs." },
    ],
  },
  "le-doudou-de-nino": {
    body: [
      "It is bedtime. Nino has put on his pyjamas, drunk his glass of water and listened to his story. Only one thing is missing. “My cuddly toy! Where is my cuddly toy?”",
      "Nino's cuddly toy is a little grey rabbit with one ear longer than the other. Without him, the night is far too big.",
      "Dad looks under the bed. He finds one sock and two little cars. But no cuddly toy. Mum opens the drawer. She finds clean pyjamas, a woolly hat and three pencils. But no cuddly toy.",
      "Big sister looks behind the curtain. She finds the cat, who was sleeping very nicely and is not pleased at all. But no cuddly toy.",
      "Nino's eyes sting a little. “Is he lost for ever?” “We keep looking,” says Dad. So the whole family searches the whole house.",
      "The kitchen: under the table, inside the saucepan cupboard. Nothing at all.",
      "The living room: under the sofa cushions, behind the big plant. Nothing at all. Then Nino climbs onto his bed, very slowly, and lifts his pillow. And there... the cuddly toy! Already asleep, all by himself, one ear folded over.",
      "Nino hugs him tight. He had not lost his cuddly toy after all: his cuddly toy had been waiting in exactly the right place the whole time. Good night, you two.",
    ],
    quiz: [
      {
        question: "What does Dad find under the bed?",
        choices: ["A sock and two cars", "The cuddly toy", "The cat"],
        answer: 0,
        explanation: "Under the bed, Dad finds one sock and two little cars.",
      },
      {
        question: "Who was sleeping behind the curtain?",
        choices: ["Big sister", "The cat", "Nino"],
        answer: 1,
        explanation: "It is the cat, sleeping very nicely behind the curtain.",
      },
      {
        question: "Where was the cuddly toy?",
        choices: ["In the drawer", "Under Nino's pillow", "In the kitchen"],
        answer: 1,
        explanation: "The cuddly toy was waiting quietly under the pillow on Nino's bed.",
      },
    ],
    glossary: [
      { word: "cuddly toy", definition: "The soft toy or little blanket you keep with you to fall asleep." },
      { word: "drawer", definition: "The box that slides out of a piece of furniture, where clothes are kept." },
      { word: "pillow", definition: "The soft cushion you rest your head on to sleep." },
    ],
  },
  "coucou-petit-chat": {
    body: [
      "Moustache the cat loves playing hide-and-seek. It is his favourite game, even better than napping. “Count to three!” he tells Lila. One... two... three.",
      "Moustache has vanished! Well, almost.",
      "Behind the curtain there is a little striped tail sticking out. It wiggles a bit, left, then right. Peekaboo, little cat! Moustache finds a new hiding place. He slips into the laundry basket, under a towel. Very clever.",
      "But the striped tail is still sticking out. It wiggles and wiggles. Peekaboo, little cat!",
      "Moustache tries under the table, between the chairs, right at the back. The tail sticks out anyway. He tries behind the big green plant, holding very still and not breathing at all. The tail sticks out anyway.",
      "He tries inside the moving box, right at the bottom. The tail still sticks out, and now it is wagging happily too.",
      "Every time, his tail says hello before he does. Moustache cannot understand why he is found so fast. “You are the champion of hiding places,” says Lila, tickling him under the chin. Moustache is very proud.",
      "So he curls up on Lila's lap and starts to purr. Hiding is fun, but being found by someone who loves you is even better.",
    ],
    quiz: [
      {
        question: "What game does Moustache play?",
        choices: ["Ball", "Hide-and-seek", "Leapfrog"],
        answer: 1,
        explanation: "Moustache loves playing hide-and-seek.",
      },
      {
        question: "What always sticks out of his hiding place?",
        choices: ["His striped tail", "His ears", "His whiskers"],
        answer: 0,
        explanation: "It is his little striped tail that sticks out every time.",
      },
      {
        question: "What does Moustache do at the end?",
        choices: ["He hides in the box", "He purrs on Lila's lap", "He counts to three"],
        answer: 1,
        explanation: "He curls up on Lila's lap and purrs.",
      },
    ],
    glossary: [
      { word: "hiding place", definition: "The secret spot where you hide so nobody can find you." },
      { word: "basket", definition: "A container with handles, used for laundry or for carrying things." },
      { word: "purr", definition: "The soft rumbling sound a cat makes when it is very happy." },
    ],
  },
  "le-hibou-qui-compte-les-etoiles": {
    body: [
      "Hulotte the owl has a very important job, the most important in the whole forest. Every evening, she counts the stars. She settles on her favourite branch, the one that creaks a little when she moves, and looks up at the big dark sky.",
      "“One, two, three...” The stars come out slowly, one by one, like little lamps being switched on inside houses.",
      "“Ten, eleven, twelve...” Down below, the forest falls asleep. The stream talks to itself and the leaves barely move. “Twenty, twenty-one, twenty-two...” The wind slips between the trees. Hulotte fluffs her feathers tightly around her neck.",
      "“Thirty-five, thirty-six...” A bat waves as it passes, hanging upside down. Hulotte does not answer: when you are counting, you do not talk.",
      "“Forty-eight, forty-nine, fifty...” Her eyelids grow as heavy as two big river pebbles. “Fifty-eight... fifty-nine... sixty...” Her voice goes very small.",
      "She gives a great big owly yawn, so big you can see all the way down her beak.",
      "“Sixty-one... sixty... erm... sixty something...” She has already forgotten where she was. And off she goes, asleep on her branch, head tucked into her feathers, one foot folded up beneath her.",
      "Tomorrow evening she will start again at one. Some things are too big to ever finish, and that is quite all right: they give us beautiful dreams every night.",
    ],
    quiz: [
      {
        question: "What is Hulotte's job?",
        choices: ["Counting the stars", "Waking the forest", "Tidying the clouds"],
        answer: 0,
        explanation: "Every evening, Hulotte counts the stars from her branch.",
      },
      {
        question: "What happens when she reaches sixty?",
        choices: ["She sings", "She falls asleep", "She flies away"],
        answer: 1,
        explanation: "Her eyelids grow heavy and Hulotte falls asleep on her branch.",
      },
      {
        question: "What will Hulotte do tomorrow evening?",
        choices: ["Start counting again at one", "Count the clouds", "Sleep all night"],
        answer: 0,
        explanation: "Tomorrow evening, Hulotte will start her counting again at one.",
      },
    ],
    glossary: [
      { word: "owl", definition: "A night bird with big round eyes, who sleeps during the day." },
      { word: "branch", definition: "The long wooden arm of a tree, where birds like to sit." },
      { word: "yawn", definition: "Opening your mouth wide without meaning to, when you are very sleepy." },
    ],
  },
  "un-calin-pour-papa-ours": {
    body: [
      "This evening, Daddy Bear is sitting in the dark, right at the end of the armchair. He says nothing at all and barely moves. Usually he tells stories. Usually he does the funny voices and gets them wrong on purpose. Not tonight.",
      "Little Bear comes closer without making a sound, on tiptoe paws. “Daddy, are you grumpy?”",
      "“No, my little cub. I am just tired.” Daddy Bear lets out a very big sigh, as long as a winter evening. Little Bear sits down on the floor, against the armchair, and thinks very hard. He knows this kind of evening well.",
      "When he is sad, mummy does something magic. She does not talk. She does not ask questions. She does not even say it will pass.",
      "So Little Bear climbs onto the armchair, one paw after the other, very slowly so as not to disturb. He rests his head against Daddy Bear's shoulder, right where the fur is softest and warmest.",
      "And he gives a hug. A long, long bear-cub hug, with both arms, squeezing as tight as he can.",
      "Daddy Bear still says nothing. But his shoulders come down, very slowly, like snow sliding off a branch. And then he smiles a little, there in the dark, and rests his big paw on Little Bear's back. “Thank you, my little cub.”",
      "Little Bear is happy. You do not have to be big, or find the right words, to comfort someone.",
    ],
    quiz: [
      {
        question: "How does Daddy Bear feel this evening?",
        choices: ["He is tired", "He is hungry", "He is angry"],
        answer: 0,
        explanation: "Daddy Bear is not grumpy, he is just very tired.",
      },
      {
        question: "What does Little Bear do to help?",
        choices: ["He sings a song", "He gives a long hug", "He turns on the light"],
        answer: 1,
        explanation: "Little Bear climbs onto the armchair and gives a long hug with both arms.",
      },
      {
        question: "What changes for Daddy Bear at the end?",
        choices: ["He falls asleep", "He smiles a little", "He goes outside"],
        answer: 1,
        explanation: "His shoulders come down and he smiles a little.",
      },
    ],
    glossary: [
      { word: "grumpy", definition: "In a bad mood, answering with a small cross voice." },
      { word: "sigh", definition: "A big breath that comes out on its own when you are tired or sad." },
      { word: "shoulder", definition: "The top of your arm, next to your neck: a perfect place to rest a head." },
    ],
  },
  "le-premier-flocon-du-renardeau": {
    body: [
      "Little Rusty the fox cub comes out of the burrow rubbing his eyes. And he stops dead. The world is all white. The tree stump is white. The ferns are white. Even the big rock is white.",
      "“Mummy! Somebody has repainted the forest!”",
      "Mummy Fox comes out too and laughs. “That is snow, my little one. It comes every winter.” “Every winter? And I have never seen it before?” “This is your very first one,” says Mummy Fox, nudging him gently.",
      "Little Rusty puts out one paw, very carefully. Crunch. The snow makes music under his steps.",
      "He puts out a second one. Crunch. Then he runs in circles, just for the sound. Crunch, crunch, crunch! Then he lifts his head. A snowflake floats down, spins, hesitates... and lands on his nose.",
      "It is cold! Little Rusty sneezes, and the snowflake disappears. “Oh! It's gone!”",
      "He waits, nose in the air, mouth open, but nothing comes back at all. His tail droops a little in the snow. “Look,” says Mummy Fox. And the whole sky begins to send thousands more, gently, in no hurry at all.",
      "Little Rusty spins around with his tongue out. The prettiest things only last a moment, but winter hands you a whole forest of them.",
    ],
    quiz: [
      {
        question: "What does Little Rusty think when he leaves the burrow?",
        choices: ["That someone repainted the forest", "That it is night", "That mummy has gone"],
        answer: 0,
        explanation: "Everything is white, so Little Rusty thinks the forest has been repainted.",
      },
      {
        question: "Where does the first snowflake land?",
        choices: ["On his tail", "On his nose", "On his paw"],
        answer: 1,
        explanation: "The snowflake floats down, hesitates, then lands on his nose.",
      },
      {
        question: "Why does the snowflake disappear?",
        choices: ["Little Rusty sneezes", "Mummy Fox blows it away", "The wind carries it off"],
        answer: 0,
        explanation: "The snowflake is cold, Little Rusty sneezes, and it is gone.",
      },
    ],
    glossary: [
      { word: "fox cub", definition: "A baby fox, still very small and very curious." },
      { word: "snowflake", definition: "A tiny piece of snow that spins as it falls from the sky." },
      { word: "burrow", definition: "The home dug under the ground where foxes and rabbits live." },
    ],
  },
  "le-gateau-danniversaire-de-mimi": {
    body: [
      "Today, Mimi the mouse is one year old. It is written on the wall of her hole, in tiny grey marks. “I want a cake!” she says, jumping out of bed. “A real cake, with a candle on top.”",
      "So Mimi takes out her smallest bowl, her smallest whisk and her smallest apron. And she gets to work.",
      "She takes one spoonful of flour, no more. A mouse does not eat very much, even on her birthday. She adds a drop of milk, a crumb of sugar and a tiny piece of butter the size of a pea.",
      "She stirs and stirs and stirs, until both her arms are tired and the batter is perfectly smooth.",
      "The cake bakes inside a thimble set beside the candle. The hole smells wonderful, and so does the corridor next door. Mimi puts a candle on top. Well, a matchstick, because a real candle would be taller than the house.",
      "All her friends arrive: two mice from the attic, one very late snail, and a rather shy ladybird who stays near the door.",
      "“Happy birthday, Mimi!” They all sing together, slightly out of tune, and the snail is still singing when the others have finished. Then they all blow together. Poof! The light goes out at once and everyone laughs in the dark.",
      "The cake is exactly one mouthful each. A tiny cake shared with friends fills a very big heart.",
    ],
    quiz: [
      {
        question: "How old is Mimi today?",
        choices: ["One year old", "Three years old", "Ten years old"],
        answer: 0,
        explanation: "Today, Mimi the mouse is one year old.",
      },
      {
        question: "What does the cake bake in?",
        choices: ["A thimble", "A saucepan", "A cup"],
        answer: 0,
        explanation: "The cake is so small that it bakes inside a thimble.",
      },
      {
        question: "Who comes to the party?",
        choices: ["Two mice, a snail and a ladybird", "A cat and a dog", "Nobody"],
        answer: 0,
        explanation: "Two mice, a snail and one shy ladybird come to celebrate with Mimi.",
      },
    ],
    glossary: [
      { word: "flour", definition: "The white powder made from wheat that is used to bake cakes." },
      { word: "crumb", definition: "A tiny little piece, so small you can barely see it." },
      { word: "candle", definition: "The little wax stick you light and blow out on your birthday." },
    ],
  },
  "le-petit-lion-qui-baille": {
    body: [
      "The sun is setting over the savannah. Everything turns orange, then pink, then almost purple, and the air grows cool. Nala the little lion is lying in the warm grass, between his mother's paws. He opens a great big mouth.",
      "Aaaah! A yawn as big as a mountain, with tiny pointed teeth in the middle.",
      "The giraffe sees it from up there, right at the top of her neck. She tries to resist. She clenches her teeth hard. She cannot. Aaaah! A yawn as long as her neck, travelling all the way down.",
      "The zebra sees the giraffe yawn. Aaaah! A yawn with black and white stripes.",
      "The monkey sees the zebra. Aaaah! A yawn that nearly knocks him off his branch. Even the elephant, who is very serious and never yawns in front of others, opens his great big mouth. Aaaaaaah!",
      "The yawn carries on its journey across the savannah. The gazelles, one by one. The pink flamingos, all together.",
      "It even wakes the old crocodile in the river, who yawns showing far too many teeth. It travels all the way around the savannah, past the baobab, and comes back to Nala. “Oh no,” says Nala. And he yawns again, twice, three times.",
      "So the whole savannah lies down in the warm grass. A yawn is something you give away like a present: it always comes back to you.",
    ],
    quiz: [
      {
        question: "Who yawns first?",
        choices: ["The giraffe", "Nala the little lion", "The elephant"],
        answer: 1,
        explanation: "Nala the little lion opens the first great big mouth.",
      },
      {
        question: "Who yawns right after the giraffe?",
        choices: ["The zebra", "The monkey", "Nala"],
        answer: 0,
        explanation: "The zebra sees the giraffe yawn, and yawns in turn.",
      },
      {
        question: "What does the savannah do at the end?",
        choices: ["Lies down in the warm grass", "Runs away", "Sings"],
        answer: 0,
        explanation: "The whole savannah lies down in the warm grass to sleep.",
      },
    ],
    glossary: [
      { word: "savannah", definition: "A very big land of tall warm grasses, where lions live." },
      { word: "yawn", definition: "The big open mouth that comes out on its own when you are sleepy." },
      { word: "warm", definition: "Not hot and not cold: gentle and pleasant, like a nice bath." },
    ],
  },
  "les-bottes-rouges-de-lila": {
    body: [
      "It has been raining over the town since this morning. Lila looks out of the window, her nose squashed against the cold glass. “Can we still go out?” she asks. Outside, the raindrops make circles that grow wider on the pavement.",
      "Mum arrives with a parcel under her arm. Inside, there are two brand new boots. Red like apples.",
      "One boot, two boots. A coat done right up. A yellow hat over her ears. And off they go! In front of the door there is a puddle. A very small one, barely bigger than a plate.",
      "Lila puts one foot in it, very slowly, just to see what will happen. Splash!",
      "The splash goes all the way up to her knees. Lila laughs out loud, so loud that a pigeon flies away. So she looks for the next puddle. The one on the pavement, outside the bakery that smells of warm bread.",
      "Then a bigger one, by the gutter, with a leaf floating on it like a little boat.",
      "Then the biggest of them all, outside the park, the one that is almost a small sea. Splash, splash, splash! The red boots turn into brown boots, and Mum laughs under her umbrella, pretending not to notice.",
      "Back home the boots are washed and they turn red again. A rainy day is not a wasted day: you just need the right boots.",
    ],
    quiz: [
      {
        question: "What colour are Lila's boots?",
        choices: ["Red", "Yellow", "Green"],
        answer: 0,
        explanation: "Lila's brand new boots are red like apples.",
      },
      {
        question: "What does Lila do in the first puddle?",
        choices: ["She walks around it", "She puts one foot in", "She shows it to mum"],
        answer: 1,
        explanation: "Lila puts one foot into the puddle, and splash!",
      },
      {
        question: "Why do the boots turn brown?",
        choices: ["Because of the mud in the puddles", "Because they dried", "Because it is night"],
        answer: 0,
        explanation: "After all that jumping, the red boots get covered in mud.",
      },
    ],
    glossary: [
      { word: "puddle", definition: "A little pool of water left on the ground after the rain." },
      { word: "splash", definition: "The water that jumps everywhere when you stamp your foot in it." },
      { word: "boots", definition: "Tall rubber shoes that keep your feet nice and dry." },
    ],
  },
};

/** Pick the content for a story in the requested locale (FR text if no EN yet). */
function contentFor(slug: string, locale: string): StoryContent {
  if (locale === "en") {
    return STORY_CONTENT_EN[slug] ?? STORY_CONTENT[slug] ?? FALLBACK_CONTENT_EN;
  }
  return STORY_CONTENT[slug] ?? FALLBACK_CONTENT;
}

/**
 * How many quiz questions a story deserves, driven by its actual length: a
 * short bedtime read gets 2 or 3, a long one goes up to 6. Mirrors
 * `quizLength()` on the personalized story page so both libraries behave the
 * same. Single source of truth: `storyQuiz` slices to this, so a story whose
 * body grows or shrinks gets the right number without touching the data.
 */
export function quizLength(words: number): number {
  if (words < 200) return 2;
  if (words < 500) return 3;
  if (words < 900) return 4;
  if (words < 1400) return 5;
  return 6;
}

export function storyQuiz(slug: string, locale: string = "fr"): QuizQuestion[] {
  const content = contentFor(slug, locale);
  const words = content.body.join(" ").split(/\s+/).filter(Boolean).length;
  return content.quiz.slice(0, quizLength(words));
}

export type GlossaryEntry = { word: string; definition: string };

/** Per-story glossary — powers the inline dotted-underline definitions. */
export function storyGlossary(slug: string, locale: string = "fr"): GlossaryEntry[] {
  return contentFor(slug, locale).glossary;
}

/**
 * Interactive story tree — branching segments with a 3-choice question at
 * each junction. Selecting a choice reveals the next segment; re-selecting
 * an earlier choice hides everything after it (brief §32). Mock content
 * shared by the interactive stories until the pipeline generates real trees.
 */
export type InteractiveNode = {
  paragraphs: string[];
  question?: string;
  choices?: { label: string; next: InteractiveNode }[];
};

export function interactiveTree(_slug: string, locale: string = "fr"): InteractiveNode {
  if (locale === "en") return interactiveTreeEn();
  // ----- Final endings -----
  const finDouce: InteractiveNode = {
    paragraphs: [
      "Tu décides de les raccompagner tout doucement, sans te presser. Tu te souviens de la berceuse que ta maman te chante les soirs d'orage, celle qui parle d'une lune qui veille et d'un vent qui se couche. Tu la fredonnes, d'abord du bout des lèvres, puis un peu plus fort, et ta voix tremble à peine.",
      "Une chose étonnante se produit : les étoiles, qui dansaient en tous sens comme des moustiques affolés, ralentissent. Elles s'approchent de ta bouche pour mieux écouter, tièdes comme des braises douces, et leur lumière bat au rythme de ta chanson.",
      "Une à une, apaisées, elles remontent vers le ciel et se posent exactement à leur place, comme des perles qu'on remet sur un collier. Là où il y avait des trous noirs, la nuit redevient entière, et le grand sourire du ciel retrouve toutes ses dents.",
      "La plus petite étoile s'attarde une seconde près de ta joue, si proche que tu sens sa chaleur, légère comme un baiser. « Tu nous as parlé avec douceur alors que tu aurais pu avoir peur, murmure-t-elle. On s'en souviendra. Reviens nous voir, en rêve. »",
      "Puis elle file rejoindre les autres. Tu refermes la fenêtre, le cœur tout calme, et tu te glisses sous la couette. Cette nuit-là, tu dors comme on dort après avoir fait quelque chose de bien : profondément, et le sourire aux lèvres. Fin.",
    ],
  };
  const finCourse: InteractiveNode = {
    paragraphs: [
      "Tu décides de faire la course ! « Le dernier au ciel a perdu ! » cries-tu en riant. Les étoiles adorent l'idée : elles se mettent à tourbillonner autour de toi, impatientes, en lâchant de minuscules étincelles d'excitation.",
      "Tu les lances vers le haut comme on lance des cerfs-volants, et elles filent en riant, laissant derrière elles de longues traînées argentées qui restent un moment accrochées dans l'air avant de s'effacer.",
      "Le ciel se remplit de rires et de lumière. On dirait un feu d'artifice qui aurait décidé de rentrer à la maison tout seul. Les chats du quartier lèvent la tête, les chouettes hululent d'étonnement, et même la vieille horloge de l'église semble retenir son tic-tac pour regarder.",
      "Jamais une nuit n'avait été aussi joyeuse. Tu cours d'un bout à l'autre du jardin pour ne rien rater, la tête renversée, jusqu'à ce que la toute dernière étoile retrouve sa place tout là-haut.",
      "Alors le ciel entier scintille plus fort que d'habitude, juste une seconde, juste pour te remercier. Tu rentres te coucher, essoufflé, le cœur qui bat encore comme un tambour de fête. Tu mets longtemps à t'endormir, mais ce n'est pas grave : certaines nuits méritent qu'on les savoure. Fin.",
    ],
  };

  function finalChoice(intro: string[]): InteractiveNode {
    return {
      paragraphs: intro,
      question: "Comment leur dis-tu au revoir ?",
      choices: [
        { label: "Tout doucement, en chantant", next: finDouce },
        { label: "En faisant la course jusqu'au ciel", next: finCourse },
      ],
    };
  }

  // ----- Method nodes (each leads to the final choice) -----
  const ailes = finalChoice([
    "Tu enfiles les ailes en tissu. Elles sont plus légères qu'un mouchoir et sentent la lavande et le grenier. Pendant une seconde, tu te sens un peu ridicule, planté là avec des ailes cousues main sur les épaules.",
    "Puis, à peine posées, elles se mettent à battre toutes seules, d'abord en frémissant, ensuite à grands coups réguliers, et tes pieds quittent le plancher. Te voilà dans le ciel, plus haut que les nuages, plus haut que le clocher du village dont la girouette grince en te regardant passer.",
    "Les étoiles perdues s'envolent derrière toi et te suivent comme des poussins suivent leur maman. Le vent est doux, l'air sent la nuit et la réglisse, et la ville en dessous ressemble à une maquette éclairée par des bougies.",
    "Tu n'as pas peur du tout : on dirait que tu sais voler depuis toujours, que tu n'avais simplement jamais essayé. Tu montes encore, jusqu'au-dessus des toits, jusqu'au-dessus du vent, jusque tout là-haut où chaque étoile a son petit trou de lumière qui l'attend, exactement à sa taille.",
  ]);
  const bateau = finalChoice([
    "Tu montes sur le bateau de papier en faisant bien attention de ne pas le déchirer. Dès que tu poses le pied dedans, il grandit d'un coup, grandit encore, jusqu'à devenir un vrai voilier dont la coque sent le carton et l'aventure, avec une voile blanche pliée comme une page.",
    "Il glisse hors du jardin et se met à voguer sur un fleuve de lumière qui n'était pas là une minute plus tôt, un ruban argenté qui traverse la nuit en serpentant entre les toits endormis et les cheminées qui fument doucement.",
    "Les étoiles perdues s'installent à bord, soulagées, et se serrent les unes contre les autres à la proue. Elles entonnent une chanson de marins toute douce, dans une langue que tu ne connais pas mais que tu comprends quand même : elle parle de rentrer chez soi.",
    "Le fleuve monte, monte en pente douce vers le ciel, et au bout, une cascade renversée d'étoiles coule vers le haut, vers la nuit. Ton voilier s'en approche tout doucement, et tu sens que le moment des adieux est arrivé.",
  ]);
  const renard = finalChoice([
    "Tu sonnes la clochette de cuivre. Son tintement clair se perd dans la nuit, et tu attends, le cœur battant. Puis, en trois bonds souples, un renard surgit de l'ombre, son pelage roux luisant sous la lune et un gros livre relié de cuir bleu coincé sous le bras.",
    "« Des étoiles perdues ? dit-il en ajustant de petites lunettes rondes sur son museau. Quelle chance, j'ai justement un chapitre là-dessus. » Il s'assoit, pose le livre sur ses genoux et le feuillette avec sérieux, mouillant son doigt pour tourner les pages.",
    "Le livre s'ouvre enfin sur une carte du ciel toute scintillante, où chaque étoile porte un nom écrit en lettres minuscules. « Voilà, dit le renard. Il suffit de lire le nom de chaque étoile à voix haute, et elle retrouve son chemin toute seule. Mais il faut le dire avec le cœur, pas seulement avec la bouche. »",
    "Alors vous lisez ensemble, ta voix et la sienne mêlées, doucement, nom après nom. À chaque nom prononcé, une étoile se redresse, frémit, et se prépare à repartir. Bientôt, elles sont toutes prêtes, alignées devant toi comme une classe avant la récréation.",
  ]);

  // ----- Second level: where the stars are hidden -----
  const grenier: InteractiveNode = {
    paragraphs: [
      "Tu montes au grenier sur la pointe des pieds. Chaque marche grince d'une note différente, comme si l'escalier essayait de te raconter un secret trop vieux pour les mots. Tout en haut, la porte est entrouverte, et un rai de lumière argentée passe par la fente.",
      "Sous la lucarne couverte de poussière et de toiles d'araignée, une vieille boîte en bois vibre tout doucement, comme un cœur qui bat. Plus tu t'approches, plus la vibration se transforme en un tintement minuscule, celui-là même qui t'a réveillé.",
      "Tu soulèves le couvercle avec précaution. À l'intérieur, blotties dans un vieux foulard, trois étoiles minuscules tombées du ciel clignotent comme des lucioles fatiguées. « Aide-nous à rentrer, chuchote la plus brillante d'une voix de clochette. On ne sait plus comment remonter, et le ciel a froid sans nous. »",
      "Tu regardes autour de toi. Sur l'étagère poussiéreuse, à côté d'un cheval à bascule qui te manque depuis des années, trois objets étranges semblent t'attendre, posés là exprès : une paire d'ailes en tissu cousues main, un bateau de papier plié avec un soin extraordinaire, et une petite clochette en cuivre toute cabossée.",
    ],
    question: "Comment vas-tu raccompagner les étoiles ?",
    choices: [
      { label: "Enfiler les ailes en tissu", next: ailes },
      { label: "Embarquer sur le bateau de papier", next: bateau },
      { label: "Sonner la clochette (elle appelle un renard !)", next: renard },
    ],
  };

  const jardin: InteractiveNode = {
    paragraphs: [
      "Tu sors dans le jardin, pieds nus dans l'herbe fraîche qui chatouille et qui mouille tes orteils. La nuit est tiède, étonnamment tiède pour la saison, et tout sent bon la terre humide, le jasmin et un peu la pluie de la veille.",
      "Tu fais quelques pas et tu t'arrêtes net, le souffle coupé. L'herbe est pleine de petites lumières : des étoiles tombées pendant la nuit, accrochées aux brins comme des gouttes de rosée géantes. Elles tintent doucement quand tu t'approches, toutes ensemble, comme un carillon minuscule suspendu dans le noir.",
      "« Vous êtes tombées ? » demandes-tu tout bas. Pour toute réponse, elles brillent un peu plus fort, comme des enfants timides qui n'osent pas avouer qu'ils se sont perdus. Tu comprends qu'elles attendent que quelqu'un les ramène là-haut.",
      "Au fond du jardin, trois chemins s'offrent à toi, et chacun semble t'appeler à sa manière : l'échelle du vieux cerisier, qui monte ce soir bien plus haut que d'habitude et se perd dans les nuages ; la vieille barque retournée près du bassin, qui frémit comme si elle avait hâte ; et le terrier du renard, d'où sort une étrange lueur bleue et une odeur de vieux livres.",
    ],
    question: "Par où passes-tu pour les ramener ?",
    choices: [
      { label: "Grimper à l'échelle du cerisier (comme des ailes)", next: ailes },
      { label: "Retourner la barque près du bassin", next: bateau },
      { label: "Frapper au terrier du renard", next: renard },
    ],
  };

  // ----- Root -----
  return {
    paragraphs: [
      "Cette nuit-là, un bruit étrange te réveille : un tintement léger, comme des grelots agités très loin, ou comme du verre qui s'entrechoque tout doucement. Tu ouvres un œil, puis les deux. Tu attends, immobile sous la couette, persuadé que ça va s'arrêter. Mais le bruit continue, patient, régulier.",
      "Tu repousses la couette et tu vas à la fenêtre, le carrelage froid sous tes pieds. Et là, tu remarques quelque chose d'absolument impossible : il manque des étoiles dans le ciel. De grands trous noirs s'ouvrent là où elles brillaient hier soir encore. On dirait un sourire à qui il manque plusieurs dents.",
      "Tu te frottes les yeux. Tu comptes les trous : un, deux, trois, et peut-être un quatrième plus loin. Le ciel a l'air blessé, incomplet, et ça te serre un peu le cœur sans que tu saches pourquoi.",
      "Le tintement recommence, plus net cette fois, et tu es sûr d'une chose : il ne vient pas du dehors, mais de l'intérieur. De quelque part dans la maison qui dort... ou peut-être du jardin, juste en dessous. Tu hésites une seconde, le cœur battant, puis tu décides d'aller voir.",
    ],
    question: "Où vas-tu chercher en premier ?",
    choices: [
      { label: "Au grenier, sur la pointe des pieds", next: grenier },
      { label: "Dans le jardin, pieds nus dans l'herbe", next: jardin },
    ],
  };
}

/** English version of the interactive "lost stars" story (same structure). */
function interactiveTreeEn(): InteractiveNode {
  const endSoft: InteractiveNode = {
    paragraphs: [
      "You decide to take them home gently, without rushing. You remember the lullaby your mum sings on stormy nights, the one about a watching moon and a wind lying down to rest. You hum it, softly at first, then a little louder, your voice barely trembling.",
      "Something wonderful happens: the stars, which were darting about like startled midges, begin to slow. They lean towards your mouth to listen, warm as gentle embers, their light beating in time with your song.",
      "One by one, calmed, they rise back to the sky and settle exactly in their places, like pearls returned to a necklace. Where the black gaps had been, the night is whole again, and the great smile of the sky gets all its teeth back.",
      "The smallest star lingers a second by your cheek, so close you feel its warmth, light as a kiss. 'You spoke to us gently when you could have been afraid,' it whispers. 'We won't forget. Come and see us, in a dream.'",
      "Then it darts off to join the others. You close the window, your heart all calm, and slip under the covers. That night you sleep the way you sleep after doing something kind: deeply, with a smile. The End.",
    ],
  };
  const endRace: InteractiveNode = {
    paragraphs: [
      "You decide to race! 'Last one to the sky loses!' you cry, laughing. The stars love the idea: they whirl around you, impatient, letting off tiny sparks of excitement.",
      "You fling them upward like kites, and they shoot off laughing, trailing long silver streaks that hang in the air for a moment before fading.",
      "The sky fills with laughter and light. It looks like fireworks that decided to come home all by themselves. The neighbourhood cats look up, the owls hoot in surprise, and even the old church clock seems to hold its tick to watch.",
      "Never had a night been so joyful. You run from one end of the garden to the other so as not to miss a thing, head tipped back, until the very last star finds its place high above.",
      "Then the whole sky sparkles brighter than usual, just for a second, just to thank you. You go back to bed, out of breath, your heart still drumming like a festival. The End.",
    ],
  };

  const finalChoice = (intro: string[]): InteractiveNode => ({
    paragraphs: intro,
    question: "How do you say goodbye to them?",
    choices: [
      { label: "Very gently, with a song", next: endSoft },
      { label: "By racing up to the sky", next: endRace },
    ],
  });

  const wings = finalChoice([
    "You slip on the cloth wings. They are lighter than a handkerchief and smell of lavender and attic. For a second you feel a little silly, standing there with hand-sewn wings on your shoulders.",
    "Then, the moment they settle, they begin to beat on their own, gently at first, then in strong steady strokes, and your feet leave the floor. There you are in the sky, higher than the clouds, higher than the village steeple.",
    "The lost stars fly behind you like ducklings following their mother. The wind is soft, the air smells of night and liquorice, and the town below looks like a model lit by candles.",
    "You are not afraid at all: it feels as if you have always known how to fly. You climb higher still, all the way up to where each star has its own little hole of light waiting for it.",
  ]);
  const boat = finalChoice([
    "You climb onto the paper boat, careful not to tear it. The moment you step in, it grows, and grows, until it is a real sailboat whose hull smells of cardboard and adventure, with a white sail folded like a page.",
    "It slips out of the garden and sails along a river of light that was not there a minute before, a silver ribbon winding through the night between sleeping roofs and gently smoking chimneys.",
    "The lost stars settle on board, relieved, huddling at the bow. They strike up a soft sailors' song in a language you do not know but understand all the same: it is about going home.",
    "The river climbs in a gentle slope towards the sky, and at the end a waterfall of stars pours upward into the night. Your boat draws slowly near, and you feel the time for goodbyes has come.",
  ]);
  const fox = finalChoice([
    "You ring the little brass bell. Its clear chime fades into the night, and you wait, heart pounding. Then, in three soft bounds, a fox appears from the shadows, his red coat gleaming in the moonlight and a big blue leather book under his arm.",
    "'Lost stars? he says, adjusting small round glasses on his snout. How lucky, I have a chapter on that.' He sits, lays the book on his knees and leafs through it carefully, wetting a finger to turn the pages.",
    "The book opens at last on a sparkling map of the sky, each star named in tiny letters. 'There,' says the fox. 'You just read each star's name aloud, and it finds its own way home. But you must say it with your heart, not only your mouth.'",
    "So you read together, your voice and his, softly, name after name. With each name spoken, a star straightens, shivers, and gets ready to leave. Soon they are all ready, lined up before you like a class before playtime.",
  ]);

  const attic: InteractiveNode = {
    paragraphs: [
      "You climb to the attic on tiptoe. Each step creaks a different note, as if the staircase were trying to tell a secret too old for words. At the top, the door is ajar, and a beam of silver light slips through the gap.",
      "Under the dusty skylight, an old wooden box vibrates very softly, like a beating heart. The closer you get, the more the vibration turns into a tiny chiming, the very one that woke you.",
      "You lift the lid carefully. Inside, nestled in an old scarf, three tiny fallen stars blink like tired fireflies. 'Help us home,' whispers the brightest in a bell-like voice. 'We don't know how to climb back, and the sky is cold without us.'",
      "You look around. On the dusty shelf, beside a rocking horse you have missed for years, three strange objects seem to be waiting just for you: a pair of hand-sewn cloth wings, a paper boat folded with extraordinary care, and a little dented brass bell.",
    ],
    question: "How will you take the stars back?",
    choices: [
      { label: "Put on the cloth wings", next: wings },
      { label: "Board the paper boat", next: boat },
      { label: "Ring the bell (it calls a fox!)", next: fox },
    ],
  };

  const garden: InteractiveNode = {
    paragraphs: [
      "You step out into the garden, barefoot in the cool grass that tickles and wets your toes. The night is warm, surprisingly warm for the season, and everything smells of damp earth, jasmine, and a little of yesterday's rain.",
      "You take a few steps and stop short, breath caught. The grass is full of little lights: stars fallen during the night, clinging to the blades like giant dewdrops. They chime softly as you approach, all together, like a tiny carillon hung in the dark.",
      "'Did you fall?' you ask under your breath. For an answer, they shine a little brighter, like shy children who dare not admit they got lost. You understand they are waiting for someone to take them back up.",
      "At the bottom of the garden, three paths offer themselves, each calling to you in its own way: the ladder of the old cherry tree, climbing far higher than usual tonight; the upturned old boat by the pond, quivering as if eager; and the fox's burrow, with its strange blue glow and a smell of old books.",
    ],
    question: "Which way do you go to bring them back?",
    choices: [
      { label: "Climb the cherry-tree ladder (like wings)", next: wings },
      { label: "Turn the boat over by the pond", next: boat },
      { label: "Knock at the fox's burrow", next: fox },
    ],
  };

  return {
    paragraphs: [
      "That night, a strange sound wakes you: a light chiming, like little bells shaken far away, or like glass clinking very gently. You open one eye, then both. You wait, still under the covers, sure it will stop. But the sound goes on, patient, steady.",
      "You push back the covers and go to the window, the cold tiles under your feet. And there, you notice something utterly impossible: stars are missing from the sky. Great black gaps have opened where they shone only last night. It looks like a smile with several teeth missing.",
      "You rub your eyes. You count the gaps: one, two, three, and maybe a fourth further off. The sky looks hurt, unfinished, and it tightens your chest a little without your knowing why.",
      "The chiming starts again, clearer now, and you are sure of one thing: it does not come from outside, but from within. From somewhere in the sleeping house... or perhaps from the garden, just below. You hesitate a second, heart pounding, then decide to go and look.",
    ],
    question: "Where do you look first?",
    choices: [
      { label: "In the attic, on tiptoe", next: attic },
      { label: "In the garden, barefoot in the grass", next: garden },
    ],
  };
}

/**
 * Quiz + glossary matched to the interactive "étoiles perdues" tree above.
 * Interactive stories share the same branching content for now, so they share
 * this quiz instead of the unrelated FALLBACK_CONTENT trio (feedback: the
 * interactive quiz was about the wrong story).
 */
export function interactiveQuiz(locale: string = "fr"): QuizQuestion[] {
  if (locale === "en") {
    return [
      {
        question: "What wakes the child that night?",
        choices: ["A faint chiming, like little bells", "A big storm", "A bad dream"],
        answer: 0,
        explanation: "It is a chiming, like bells far away, that wakes them.",
      },
      {
        question: "What does the child notice through the window?",
        choices: ["It is snowing", "Stars are missing from the sky", "The moon has vanished"],
        answer: 1,
        explanation: "Stars are missing, like a smile with gaps in its teeth.",
      },
      {
        question: "What must be done to help the little stars?",
        choices: ["Hide them in a box", "Take them back up to the sky", "Keep them at home"],
        answer: 1,
        explanation: "They must be taken back up high, to their place in the sky.",
      },
      {
        question: "What does the hero learn along the way?",
        choices: [
          "That it is better to sleep right away",
          "That the night hides adventures and you can help someone smaller than you",
          "That you must never get out of bed",
        ],
        answer: 1,
        explanation: "The night holds lovely surprises, and even a child can help the stars get home.",
      },
    ];
  }
  return [
    {
      question: "Qu'est-ce qui réveille l'enfant cette nuit-là ?",
      choices: ["Un tintement, comme des grelots", "Un gros orage", "Un mauvais rêve"],
      answer: 0,
      explanation: "C'est un tintement, comme des grelots très loin, qui le réveille.",
    },
    {
      question: "Que remarque l'enfant par la fenêtre ?",
      choices: ["Il neige", "Il manque des étoiles dans le ciel", "La lune a disparu"],
      answer: 1,
      explanation: "Il manque des étoiles, comme un sourire à qui il manque des dents.",
    },
    {
      question: "Que faut-il faire pour aider les petites étoiles ?",
      choices: ["Les cacher dans une boîte", "Les raccompagner jusqu'au ciel", "Les garder à la maison"],
      answer: 1,
      explanation: "Il faut les raccompagner tout là-haut, à leur place dans le ciel.",
    },
    {
      question: "Qu'apprend le héros au fil de cette aventure ?",
      choices: [
        "Qu'il vaut mieux dormir tout de suite",
        "Que la nuit cache des aventures et qu'on peut aider plus petit que soi",
        "Qu'il ne faut jamais sortir de son lit",
      ],
      answer: 1,
      explanation: "La nuit réserve de belles surprises, et même un enfant peut aider les étoiles à rentrer.",
    },
  ];
}

export function interactiveGlossary(locale: string = "fr"): GlossaryEntry[] {
  if (locale === "en") {
    return [
      { word: "chiming", definition: "The small, clear sound a little bell makes." },
      { word: "skylight", definition: "A tiny window, often set in a roof or an attic." },
      { word: "sailboat", definition: "A boat that moves thanks to the wind pushing its sails." },
    ];
  }
  return [
    { word: "tintement", definition: "Le petit bruit clair que fait une clochette ou un grelot." },
    { word: "lucarne", definition: "Une toute petite fenêtre, souvent dans un toit ou un grenier." },
    { word: "voilier", definition: "Un bateau qui avance grâce au vent qui pousse ses voiles." },
  ];
}

/**
 * Rich reading text used on the detail page. Kept separate from the card data
 * to avoid shipping long bodies in grid queries.
 */
export function storyBody(slug: string, locale: string = "fr"): string[] {
  return contentFor(slug, locale).body;
}
