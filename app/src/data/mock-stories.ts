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
export function ageLabel(range: AgeRange | string): string {
  return `${String(range).replace("-", "–")} ans`;
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
    readingMinutes: 4,
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
    readingMinutes: 8,
    genre: "aventure",
    theme: "aventure",
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
    readingMinutes: 4,
    genre: "conte",
    theme: "nature",
    subTheme: "jardin",
    character: "grand-mere",
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
    readingMinutes: 9,
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
    readingMinutes: 11,
    genre: "science-fiction",
    theme: "aventure",
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
    readingMinutes: 3,
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
    readingMinutes: 13,
    genre: "conte",
    theme: "decouverte",
    subTheme: "mille-et-une-nuits",
    character: "marchand",
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
    readingMinutes: 8,
    genre: "science-fiction",
    theme: "aventure",
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
    readingMinutes: 14,
    genre: "mystere",
    theme: "fantastique",
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
    theme: "humour",
    subTheme: "inventions-farfelues",
    character: "gateau",
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
    readingMinutes: 6,
    genre: "aventure",
    theme: "courage",
    subTheme: "mer",
    character: "phare",
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
    readingMinutes: 6,
    genre: "fantastique",
    theme: "nature",
    subTheme: "royaume-miniature",
    character: "reine",
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
      "Mais ce matin-là, la mer décida de lui apprendre quelque chose de nouveau. Une rafale claqua dans la voile, le bateau pencha, et Léa, qui rangeait un cordage, bascula par-dessus bord.",
      "L'eau était froide et profonde. Léa savait nager, son père le lui avait appris avant même de marcher, mais le Cormoran s'éloignait déjà, poussé par le vent. Elle cria. La voile ne se retourna pas.",
      "C'est alors qu'elle sentit la mer bouger sous elle. Pas une vague : quelque chose d'immense, de doux et de vivant. Un dos bleu, large comme une île, remonta lentement et la souleva hors de l'eau.",
      "« N'aie pas peur, petite humaine. » La voix était grave et profonde, elle faisait vibrer l'eau tout autour. « Je m'appelle Vaïa. Je suis une baleine bleue, et tu es sur mon dos. »",
      "Léa, trempée et stupéfaite, s'accrocha. « Mon bateau... mon père... » « Je sais où va ton bateau, répondit Vaïa. Mais le chemin le plus court n'est pas toujours le plus droit. Tiens-toi bien. »",
      "Et Vaïa plongea dans un monde que Léa n'avait jamais vu. Elles traversèrent un banc de poissons d'argent qui s'ouvrit comme un rideau. Elles longèrent une forêt d'algues géantes où dormaient des tortues. Elles passèrent au-dessus d'une vallée si profonde que le bleu y devenait presque noir.",
      "« C'est chez moi, expliqua Vaïa. Les humains naviguent SUR la mer. Mais la mer, la vraie, est en dessous. Maintenant tu sais. »",
      "Quand elles refirent surface, le Cormoran était là, voiles affalées. Le père de Léa, fou d'inquiétude, n'en crut pas ses yeux : sa fille arrivait assise sur le dos d'une baleine bleue, comme une reine des mers.",
      "« Merci Vaïa », chuchota Léa en glissant dans les bras de son père. La baleine souffla un grand jet d'écume en guise d'au revoir et s'enfonça dans le bleu.",
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
      "Timothée, lui, n'y croyait pas trop. « Un dragon qui n'a jamais mangé personne ? Un dragon qu'on n'a jamais vu ? Drôle de dragon. » Un mercredi, il prit son sac, trois biscuits, et partit voir.",
      "Il marcha longtemps, suivit la fumée, et arriva dans une clairière. Là, assis contre un rocher, il y avait bel et bien un dragon. Immense. Couvert d'écailles vertes. Avec des griffes comme des faux. Et ce dragon... pleurait.",
      "« Bonjour ? » dit Timothée. Le dragon sursauta si fort qu'il se cogna la tête contre le rocher. « Aaah ! Un humain ! » Et il se cacha derrière le rocher. Enfin, il essaya : le rocher était beaucoup trop petit pour cacher un dragon.",
      "« Tu... tu as peur de moi ? » demanda Timothée, stupéfait. « Évidemment, renifla le dragon. Vous êtes terrifiants, les humains. Vous criez. Vous courez dans tous les sens. Et vous racontez des histoires affreuses sur les dragons. »",
      "Timothée s'assit dans l'herbe et sortit ses biscuits. « Moi c'est Timothée. Tu en veux un ? » Le dragon hésita, se pencha, et prit le biscuit du bout des griffes, délicatement, comme on cueille une fleur. « Gaspard, dit-il. Merci. »",
      "Ils parlèrent tout l'après-midi. Gaspard avoua qu'il faisait de la fumée en essayant de se faire cuire des châtaignes. Que les branches craquaient parce qu'il était maladroit. Et qu'il rêvait d'une seule chose : être tranquille, et peut-être, un jour, avoir un ami.",
      "« Le courage, dit Timothée en rentrant ce soir-là, ce n'est pas de ne pas avoir peur. C'est d'aller voir quand même. » Gaspard hocha sa grosse tête : c'était exactement ce qu'il venait de faire, lui aussi.",
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
    ],
    glossary: [
      { word: "clairière", definition: "Un endroit sans arbres au milieu d'une forêt, comme une pièce à ciel ouvert." },
      { word: "écailles", definition: "Les petites plaques dures qui couvrent la peau des dragons, des serpents et des poissons." },
      { word: "stupéfait", definition: "Tellement étonné qu'on ne sait plus quoi dire." },
    ],
  },
  "petit-ours-apprend-a-attendre": {
    body: [
      "Petit Ours regarde par la fenêtre. Dehors, tout est blanc. « Maman, c'est quand le printemps ? »",
      "« Bientôt, mon ourson. Quand la neige aura fondu. » Petit Ours souffle sur la vitre. « Mais c'est long, bientôt ! »",
      "Maman Ours sourit. « Viens, je connais un truc magique pour faire passer l'attente. » Elle prend un pot, de la terre, et une petite graine de tournesol.",
      "« Plante-la. Arrose-la chaque matin. Quand la fleur sera aussi haute que toi, le printemps sera là. »",
      "Alors Petit Ours arrose. Chaque matin, une petite tasse d'eau. Un jour, deux jours, beaucoup de jours. Et un matin : une pousse verte !",
      "La pousse grandit, grandit. Petit Ours aussi attend, mais maintenant, attendre c'est moins long : il a quelque chose à regarder pousser.",
      "Et un matin, la fleur touche son museau, toute jaune, et dehors... la neige a disparu ! « Maman ! Le printemps est arrivé ! En même temps que ma fleur ! »",
      "Maman Ours fait un clin d'œil. Le truc magique, ce n'était pas la graine. C'était d'attendre en prenant soin de quelque chose. Mais ça, Petit Ours le comprendra quand il sera Grand Ours.",
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
      "Sur ses étagères s'alignent des centaines de bocaux. Dans chacun, une lueur tourne doucement, comme un poisson de lumière. Bleu nuit pour les rêves de voyage. Doré pour les rêves de gloire. Vert d'eau pour les rêves doux, ceux qu'on fait blotti contre quelqu'un.",
      "Yasmine, douze ans, livre le pain de son père dans la médina. Chaque soir, elle s'arrête devant la vitrine. Pas pour acheter, les rêves de Monsieur Slimane coûtent cher : un souvenir heureux pièce. Juste pour regarder.",
      "Un soir de grand vent, alors que le souk replie ses toiles, un chat bondit sur l'étagère. Un bocal vacille, roule, et se brise au sol dans un tintement de cristal. La lueur qu'il contenait, une lueur argentée, hésite, puis file dans la ruelle comme une hirondelle.",
      "« Rattrape-le ! » crie Monsieur Slimane à Yasmine. « Un rêve échappé, c'est un rêve qui cherche une tête où entrer ! Et celui-là n'est pas fini, il est dangereux comme une histoire sans fin ! »",
      "Yasmine court. Le rêve argenté zigzague entre les étals, frôle un vendeur d'oranges, traverse la place aux mille lanternes. Partout où il passe, les gens s'arrêtent, les yeux soudain pleins d'étoiles, oubliant ce qu'ils faisaient.",
      "Elle le coince enfin dans une impasse, sous un panier renversé. Mais à travers l'osier, le rêve lui parle. « Laisse-moi entrer, souffle-t-il. Je suis un rêve de grandeur. Avec moi, tu seras reine, célèbre, immense. Tu n'auras plus jamais à livrer du pain. »",
      "Yasmine hésite. La voix est belle. Mais elle se souvient de ce que dit toujours Monsieur Slimane : un rêve inachevé promet tout, parce qu'il ne sait pas finir les phrases. Elle serre le panier et rapporte le rêve à la boutique.",
      "Le vieux marchand l'enferme dans un bocal neuf, qu'il scelle de cire rouge. Puis il regarde Yasmine longuement. « Tu l'as entendu, n'est-ce pas ? Et tu as su lui dire non. C'est rare. » Il décroche un bocal vert d'eau, le plus doux de la boutique. « Pour toi. Tu l'as gagné. »",
      "« Mais je n'ai pas de souvenir heureux à te donner », proteste Yasmine. Monsieur Slimane sourit dans sa barbe blanche. « Si. Celui de ce soir. Tu m'en donneras la moitié, et tu verras qu'un souvenir partagé, ça fait deux souvenirs. »",
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
      "« Les étoiles filantes ne repassent pas deux fois, dit Zoé qui lit beaucoup. Donc ce n'est pas une étoile filante. » « Alors c'est quoi ? » demande Émile. « C'est ce qu'on va découvrir. »",
      "Le samedi, ils installent leur campement : une tente, deux paires de jumelles, un carnet, et le vieux télescope du grenier. À neuf heures neuf, ils retiennent leur souffle. À neuf heures dix, la lumière apparaît.",
      "Dans le télescope, ce n'est pas une étoile. C'est une petite comète, avec une queue scintillante, et elle ne file pas droit : elle tourne en rond, comme quelqu'un qui cherche ses clés.",
      "« Elle est perdue », souffle Émile. Zoé fronce les sourcils, vérifie dans son livre d'astronomie, et déclare : « Les comètes suivent un chemin précis dans le ciel. Si elle tourne en rond, c'est qu'elle a perdu le sien. »",
      "Alors les jumeaux font ce qu'ils savent faire de mieux quand ils sont d'accord : un plan. Émile, le bricoleur, démonte tous les lampions de la fête des voisins. Zoé, la calculatrice, trace sur le sol la forme exacte du chemin que la comète devrait suivre, une grande courbe qui passe au-dessus du cerisier.",
      "À neuf heures dix, le jardin s'allume : cinquante lampions dessinent une flèche courbe dans l'herbe, une piste d'atterrissage à l'envers, une piste de décollage vers le bon coin du ciel.",
      "La comète ralentit. Tourne une dernière fois. Puis, comme si elle lisait la carte, elle suit la courbe de lumière, prend de la vitesse, et file droit vers l'horizon d'est, là où l'attendait son chemin.",
      "Juste avant de disparaître, elle laisse tomber une pluie de poussière dorée sur le jardin. Le lendemain, à l'endroit exact de la flèche, les fleurs ont poussé en spirale.",
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
      "Une nuit de novembre, la tempête arrive. Une vraie tempête de Bretagne, avec des vagues hautes comme des maisons et un vent qui arrache les volets. Et là, catastrophe : la foudre frappe le grand phare de la pointe. Sa lumière s'éteint d'un coup.",
      "Au large, un petit bateau de pêche cherche le port. Sans le grand phare, le pêcheur ne voit plus rien. Les rochers sont partout, invisibles dans le noir.",
      "« À moi de jouer », souffle Loïk. Il rassemble toute son électricité, jusqu'à la dernière étincelle, et il fait quelque chose qu'aucun phare ne fait jamais : au lieu de tourner, il cligne. Trois coups courts. Trois coups longs. Trois coups courts.",
      "Sur le bateau, le pêcheur écarquille les yeux. Ça, il connaît : c'est le signal des marins ! Il barre droit vers la petite lumière qui clignote, longe le chenal qu'elle éclaire, et entre au port juste avant la plus grosse vague.",
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
      "Chaque matin, la reine compte son trésor : les spores d'or, ces poussières magiques qui font pousser les champignons de toute la forêt. Sans elles, plus de girolles, plus de cèpes, plus de petites maisons rouges à pois blancs.",
      "Mais ce matin-là, le coffre de noisette est vide. « On m'a volée ! » s'écrie la reine. Le royaume entier retient son souffle. Sans spores, dans une semaine, le royaume commencera à faner.",
      "La reine convoque Nour, une jeune fourmi détective connue pour retrouver n'importe quoi, même les choses pas perdues. Nour examine le coffre avec sa loupe en aile de moucheron. « Hmm. Pas de traces de pas. Pas de porte forcée. Mais... des miettes de noisette PARTOUT. »",
      "Nour suit les miettes. Elles montent le long du tronc, passent la deuxième branche, et mènent tout droit... au nid de Casse-Noix, l'écureuil le plus étourdi de la forêt.",
      "Casse-Noix dort, roulé dans sa queue, le coffre de noisette serré contre lui. « Réveille-toi ! » crie Nour. L'écureuil ouvre un œil. « Hein ? Quoi ? J'ai trouvé cette super noisette hier, je l'ai rangée pour l'hiver ! »",
      "« Ce n'est pas une noisette, c'est le coffre royal ! » Casse-Noix devient tout rouge sous son poil roux. Il n'avait pas volé : il avait rangé. C'est plus fort que lui, il range tout ce qui ressemble à une noisette.",
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
    ],
    glossary: [
      { word: "spores", definition: "Les minuscules graines invisibles grâce auxquelles les champignons se multiplient." },
      { word: "souveraine", definition: "Une autre façon de dire « reine » : celle qui règne sur un royaume." },
      { word: "faner", definition: "Se flétrir et perdre ses couleurs, comme une fleur qui manque d'eau." },
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
      "Filo the little fox did not want to sleep. Ever. 'Five more minutes!' he said every night. Then five more. And five more again.",
      "That evening, his mum blew out the candle and kissed him between the ears. But the moment she left the den, Filo opened his eyes wide again. Sleep, really? While outside the night was doing mysterious things without him?",
      "He poked his snout out of the den. The sky was huge and pricked with stars. And there, right at the top, the moon was watching him. 'Not asleep, little fox?' she asked, in a voice as soft as an eiderdown.",
      "'I don't want to sleep,' said Filo. 'If I sleep, I'll miss everything!' The moon smiled. 'Miss everything? Come, let me show you a secret.'",
      "She lit up the sleeping forest. Filo saw the closed flowers getting their colours ready for tomorrow. He saw the huddled birds mending their songs. He even saw the wind, lying down in the branches, gathering strength to blow the morning clouds.",
      "'You see, whispered the moon. At night, no one misses anything. Everyone is getting ready for tomorrow. The most beautiful things of the day are made while we sleep.'",
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
};

/** Pick the content for a story in the requested locale (FR text if no EN yet). */
function contentFor(slug: string, locale: string): StoryContent {
  if (locale === "en") {
    return STORY_CONTENT_EN[slug] ?? STORY_CONTENT[slug] ?? FALLBACK_CONTENT_EN;
  }
  return STORY_CONTENT[slug] ?? FALLBACK_CONTENT;
}

export function storyQuiz(slug: string, locale: string = "fr"): QuizQuestion[] {
  return contentFor(slug, locale).quiz;
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
