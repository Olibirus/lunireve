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

export function storyQuiz(slug: string): QuizQuestion[] {
  return (STORY_CONTENT[slug] ?? FALLBACK_CONTENT).quiz;
}

export type GlossaryEntry = { word: string; definition: string };

/** Per-story glossary — powers the inline dotted-underline definitions. */
export function storyGlossary(slug: string): GlossaryEntry[] {
  return (STORY_CONTENT[slug] ?? FALLBACK_CONTENT).glossary;
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
  return (STORY_CONTENT[slug] ?? FALLBACK_CONTENT).body;
}
