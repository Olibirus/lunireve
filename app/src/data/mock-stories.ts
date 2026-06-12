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
  hasAudio: boolean;
  /** null = audio generated at first listen (cost-saving), then cached here */
  audioUrl: string | null;
  interactive: boolean;
};

export const mockStories: MockStory[] = [
  {
    slug: "le-renard-qui-ne-voulait-pas-dormir",
    title: "Le renard qui ne voulait pas dormir",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 4,
    genre: "educative",
    theme: "emotions",
    subTheme: "sommeil",
    character: "renard",
    tags: ["coucher", "lune", "rituel du soir"],
    excerpt:
      "Filo le petit renard trouve toujours une raison pour ne pas aller au lit. Jusqu'à la nuit où la lune lui confie un secret.",
    cover: "cover-night",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "lea-et-la-baleine-bleue",
    title: "Léa et la baleine bleue",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 8,
    genre: "aventure",
    theme: "aventure",
    subTheme: "voyages-sous-la-mer",
    character: "enfant-fille",
    tags: ["mer", "baleine", "voilier"],
    excerpt:
      "Le jour où Léa tombe de son voilier, elle rencontre une baleine qui l'emmène bien plus loin qu'elle ne l'imaginait.",
    cover: "cover-sea",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-potager-magique-de-mamie-rose",
    title: "Le potager magique de Mamie Rose",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 4,
    genre: "conte",
    theme: "nature",
    subTheme: "jardin",
    character: "grand-mere",
    tags: ["potager", "graines", "famille"],
    excerpt:
      "Chez Mamie Rose, les tomates chantent et les carottes dansent. Aujourd'hui, une graine mystérieuse vient d'arriver.",
    cover: "cover-meadow",
    rating: 0,
    ratingCount: 0,
    hasAudio: false,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "timothee-et-le-dragon-timide",
    title: "Timothée et le dragon timide",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 9,
    genre: "fantastique",
    theme: "amitie",
    subTheme: "confiance-en-soi",
    character: "dragon",
    tags: ["dragon", "forêt", "timidité"],
    excerpt:
      "Dans la forêt d'Argoat vit un dragon qui n'ose pas faire peur à personne. Timothée va lui apprendre le courage.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-course-des-etoiles-filantes",
    title: "La course des étoiles filantes",
    language: "fr",
    ageRange: "9-10",
    readingMinutes: 11,
    genre: "science-fiction",
    theme: "aventure",
    subTheme: "voyages-spatiaux",
    character: "enfant-fille",
    tags: ["étoiles", "course", "espace"],
    excerpt:
      "Chaque siècle, les étoiles organisent une course folle. Cette année, une enfant a été invitée à y participer.",
    cover: "cover-indigo",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: true,
  },
  {
    slug: "petit-ours-apprend-a-attendre",
    title: "Petit ours apprend à attendre",
    language: "fr",
    ageRange: "1-2",
    readingMinutes: 3,
    genre: "educative",
    theme: "emotions",
    subTheme: "patience",
    character: "ours",
    tags: ["patience", "printemps", "maman"],
    excerpt:
      "Petit ours voudrait que le printemps arrive plus vite. Heureusement, sa maman connaît un truc magique.",
    cover: "cover-mint",
    rating: 0,
    ratingCount: 0,
    hasAudio: false,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-marchand-de-reves-du-souk",
    title: "Le marchand de rêves du souk",
    language: "fr",
    ageRange: "11-12",
    readingMinutes: 13,
    genre: "conte",
    theme: "decouverte",
    subTheme: "mille-et-une-nuits",
    character: "marchand",
    tags: ["Marrakech", "rêves", "souk"],
    excerpt:
      "Au cœur du vieux Marrakech, un homme vend des rêves en bocal. Mais que se passe-t-il quand un bocal se brise ?",
    cover: "cover-sand",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "les-jumeaux-et-la-comete",
    title: "Les jumeaux et la comète",
    language: "fr",
    ageRange: "7-8",
    readingMinutes: 8,
    genre: "science-fiction",
    theme: "aventure",
    subTheme: "extraterrestres",
    character: "enfant-garcon",
    tags: ["comète", "jumeaux", "nuit"],
    excerpt:
      "Émile et Zoé voient chaque soir la même étoile filante. Et si cette étoile cherchait quelque chose ?",
    cover: "cover-dusk",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-bibliotheque-qui-marche-la-nuit",
    title: "La bibliothèque qui marche la nuit",
    language: "fr",
    ageRange: "11-12",
    readingMinutes: 14,
    genre: "mystere",
    theme: "fantastique",
    subTheme: "petits-enqueteurs",
    character: "enfant-fille",
    tags: ["bibliothèque", "mystère", "nuit"],
    excerpt:
      "On raconte que certaines nuits, la bibliothèque municipale change de trottoir. Camille a décidé d'en avoir le cœur net.",
    cover: "cover-night",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: true,
  },
  {
    slug: "le-gateau-qui-ne-voulait-pas-cuire",
    title: "Le gâteau qui ne voulait pas cuire",
    language: "fr",
    ageRange: "3-4",
    readingMinutes: 3,
    genre: "rigolote",
    theme: "humour",
    subTheme: "inventions-farfelues",
    character: "gateau",
    tags: ["cuisine", "chocolat", "rire"],
    excerpt:
      "Ce matin, le gâteau au chocolat refuse d'entrer dans le four. Il a des choses à dire, lui aussi.",
    cover: "cover-peach",
    rating: 0,
    ratingCount: 0,
    hasAudio: false,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "le-petit-phare-et-la-tempete",
    title: "Le petit phare et la tempête",
    language: "fr",
    ageRange: "5-6",
    readingMinutes: 6,
    genre: "aventure",
    theme: "courage",
    subTheme: "mer",
    character: "phare",
    tags: ["Bretagne", "tempête", "courage"],
    excerpt:
      "Au bout de la Bretagne, un tout petit phare va devoir sauver un bateau malgré sa lumière vacillante.",
    cover: "cover-sea",
    rating: 0,
    ratingCount: 0,
    hasAudio: true,
    audioUrl: null,
    interactive: false,
  },
  {
    slug: "la-reine-des-champignons",
    title: "La reine des champignons",
    language: "fr",
    ageRange: "5-6",
    readingMinutes: 6,
    genre: "fantastique",
    theme: "nature",
    subTheme: "royaume-miniature",
    character: "reine",
    tags: ["forêt", "champignons", "royaume"],
    excerpt:
      "Sous la mousse du vieil hêtre règne une reine minuscule. Cette semaine, son royaume a été volé.",
    cover: "cover-meadow",
    rating: 0,
    ratingCount: 0,
    hasAudio: false,
    audioUrl: null,
    interactive: false,
  },
];

/** Distinct character slugs present in the library — powers the character filter. */
export const CHARACTERS = [...new Set(mockStories.map((s) => s.character))];

export function findStory(slug: string): MockStory | undefined {
  return mockStories.find((s) => s.slug === slug);
}

/**
 * Naive client-side search across title/excerpt/tags/character.
 * Phase 2 swaps this for a Postgres full-text (or pgvector) query.
 */
export function searchStories(query: string): MockStory[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return mockStories.filter((s) =>
    [s.title, s.excerpt, s.character, s.subTheme, ...s.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export type QuizQuestion = {
  question: string;
  choices: string[];
  /** index into choices */
  answer: number;
  explanation: string;
};

/**
 * Mock quiz — Phase 2 generates these with the story via the n8n pipeline
 * (one quiz per story, age-adapted). Same questions for every story for now.
 */
export function storyQuiz(_slug: string): QuizQuestion[] {
  return [
    {
      question: "Qui frappe à la porte de la petite maison ?",
      choices: ["Un loup affamé", "Un renard avec un livre", "Le facteur du village"],
      answer: 1,
      explanation: "C'est bien un renard, fatigué, qui porte un livre relié de cuir bleu.",
    },
    {
      question: "Que prépare la petite quand elle entend gratter ?",
      choices: ["Un gâteau au chocolat", "Une soupe de potiron", "Un thé à la verveine"],
      answer: 2,
      explanation: "Elle préparait un thé à la verveine, un jour de novembre.",
    },
    {
      question: "Que demande le renard ?",
      choices: [
        "De l'aider à retrouver sa page",
        "Un endroit pour dormir",
        "Le chemin de la forêt",
      ],
      answer: 0,
      explanation: "Il s'est perdu dans son histoire et cherche à retrouver la page.",
    },
  ];
}

export type GlossaryEntry = { word: string; definition: string };

/**
 * Mock glossary — Phase 2 generates real entries per story (difficult words,
 * age-adapted). Also powers the inline dotted-underline definitions.
 */
export function storyGlossary(_slug: string): GlossaryEntry[] {
  return [
    { word: "verveine", definition: "Une plante qu'on fait infuser pour préparer une tisane au goût doux." },
    { word: "fourche", definition: "Quand la langue « fourche », les mots se mélangent et on se trompe en parlant." },
    { word: "relié", definition: "Un livre relié a une couverture solide, souvent en cuir ou en carton épais." },
    { word: "tissait", definition: "Tisser, c'est fabriquer un tissu (ou une toile d'araignée) en croisant des fils." },
  ];
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

export function interactiveTree(_slug: string): InteractiveNode {
  const finVoler: InteractiveNode = {
    paragraphs: [
      "Tu choisis les ailes. À peine posées sur tes épaules, elles battent toutes seules et te voilà dans le ciel, plus haut que les nuages. Les étoiles perdues te suivent comme des poussins suivent leur maman.",
      "Une à une, tu les raccompagnes jusqu'à leur place dans le ciel. La dernière, la plus petite, te fait promettre de revenir la voir. Tu promets. Et quelque chose te dit que tu tiendras parole. Fin.",
    ],
  };
  const finBateau: InteractiveNode = {
    paragraphs: [
      "Tu choisis le bateau de papier. Il grandit dès que tu montes dedans et vogue sur un fleuve de lumière qui traverse la nuit. Les étoiles perdues s'installent à bord, ravies de la promenade.",
      "Au bout du fleuve, une cascade d'étoiles remonte vers le ciel. Ton bateau la remonte aussi, doucement, et chaque étoile saute à sa place en te disant merci. Fin.",
    ],
  };
  const finRenard: InteractiveNode = {
    paragraphs: [
      "Tu choisis d'appeler le renard. Il arrive en trois bonds, son livre bleu sous le bras. « Des étoiles perdues ? J'ai un chapitre là-dessus », dit-il en feuilletant.",
      "Le livre s'ouvre sur une carte du ciel. Il suffit de lire le nom de chaque étoile à voix haute pour qu'elle retrouve son chemin. Vous lisez ensemble, jusqu'à la dernière. Le renard te confie alors le livre : « À toi de le garder, maintenant. » Fin.",
    ],
  };

  const grenier: InteractiveNode = {
    paragraphs: [
      "Tu montes au grenier. Sous la lucarne, une boîte en bois vibre doucement. À l'intérieur : trois étoiles minuscules, tombées du ciel, qui clignotent comme des lucioles fatiguées.",
      "« Aide-nous à rentrer », chuchote la plus brillante. Sur l'étagère, tu aperçois une paire d'ailes en tissu, un bateau de papier et une clochette pour appeler le renard.",
    ],
    question: "Comment raccompagner les étoiles ?",
    choices: [
      { label: "Enfiler les ailes en tissu", next: finVoler },
      { label: "Embarquer sur le bateau de papier", next: finBateau },
      { label: "Sonner la clochette du renard", next: finRenard },
    ],
  };

  const jardin: InteractiveNode = {
    paragraphs: [
      "Tu sors dans le jardin. L'herbe est pleine de petites lumières : des étoiles tombées pendant la nuit, accrochées aux brins comme des gouttes de rosée.",
      "Elles tintent doucement quand tu t'approches. Au fond du jardin, l'échelle du cerisier monte étrangement haut ce soir, bien plus haut que d'habitude.",
    ],
    question: "Que fais-tu ?",
    choices: [
      { label: "Grimper à l'échelle du cerisier", next: finVoler },
      { label: "Ramasser les étoiles dans ton chapeau", next: finBateau },
      { label: "Siffler pour appeler de l'aide", next: finRenard },
    ],
  };

  return {
    paragraphs: [
      "Cette nuit, un bruit étrange te réveille : un tintement, comme des grelots très loin. Par la fenêtre, tu remarques quelque chose d'impossible : il manque des étoiles dans le ciel. De grands trous noirs, là où elles brillaient hier.",
      "Le tintement recommence. Il vient de quelque part dans la maison... ou peut-être du jardin.",
    ],
    question: "Où vas-tu chercher ?",
    choices: [
      { label: "Au grenier, sur la pointe des pieds", next: grenier },
      { label: "Dans le jardin, pieds nus dans l'herbe", next: jardin },
      { label: "Sous ton lit, on ne sait jamais", next: grenier },
    ],
  };
}

/**
 * Rich reading text used on the detail page. Kept separate from the card data
 * to avoid shipping long bodies in grid queries.
 */
export function storyBody(slug: string): string[] {
  const fallback = [
    "Il était une fois, au fond d'un bois où même les plus vieux chênes avaient oublié leur nom, une petite maison aux volets bleus. Personne n'avait pensé qu'on pouvait y vivre, et pourtant, quelqu'un y vivait bel et bien.",
    "La maison appartenait à une enfant que les autres appelaient, faute de mieux, « la petite ». Ce n'était pas son vrai nom. Son vrai nom, elle le gardait pour elle, comme on garde une noisette précieuse dans le creux de sa main.",
    "Chaque matin, la petite ouvrait ses volets et disait bonjour aux choses. Bonjour à la théière. Bonjour au pin derrière la fenêtre. Bonjour à l'araignée qui vivait dans le coin droit de la cuisine et qui, pour tout remerciement, tissait des toiles en forme d'étoile.",
    "Un jour de novembre, tandis qu'elle préparait un thé à la verveine, la petite entendit gratter à sa porte. Elle mit d'abord cela sur le compte du vent : novembre a souvent la langue qui fourche, et il confond toutes sortes de bruits. Mais le gratouillement insista.",
    "Elle ouvrit. Sur le pas de la porte se tenait un renard. Un renard qui semblait fatigué, qui portait sous son bras un livre relié de cuir bleu. Il leva la tête, cligna des yeux dorés, et dit, comme si c'était la chose la plus naturelle du monde :",
    "« Pardon, je me suis perdu dans mon histoire. Pourriez-vous m'aider à retrouver la page ? »",
    "La petite resta un long moment immobile, parce que, vous en conviendrez, ce n'est pas tous les jours qu'un renard vient vous demander pareille chose. Puis elle s'écarta, tendit la main, et dit avec beaucoup de sérieux :",
    "« Entrez donc. Le thé est presque prêt. »",
  ];
  const s = findStory(slug);
  if (!s) return fallback;
  return fallback;
}
