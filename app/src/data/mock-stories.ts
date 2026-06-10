/**
 * Mock story data for Phase 1. Real data lives in `stories` table (schema.ts)
 * and will be wired in once n8n starts populating the library.
 *
 * The shape here intentionally mirrors a subset of the DB `stories` row so
 * swapping from mock → Drizzle query is a one-line replacement.
 */

export type MockStory = {
  slug: string;
  title: string;
  language: "fr" | "en";
  ageRange: "3-5" | "6-8" | "9-11";
  readingMinutes: number;
  theme: string; // slug key for i18n (theme.aventure, theme.amitie, …)
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
  rating: number;
  hasAudio: boolean;
};

export const mockStories: MockStory[] = [
  {
    slug: "le-renard-qui-ne-voulait-pas-dormir",
    title: "Le renard qui ne voulait pas dormir",
    language: "fr",
    ageRange: "3-5",
    readingMinutes: 6,
    theme: "emotions",
    excerpt:
      "Filo le petit renard trouve toujours une raison pour ne pas aller au lit. Jusqu'à la nuit où la lune lui confie un secret.",
    cover: "cover-night",
    rating: 4.8,
    hasAudio: true,
  },
  {
    slug: "lea-et-la-baleine-bleue",
    title: "Léa et la baleine bleue",
    language: "fr",
    ageRange: "6-8",
    readingMinutes: 10,
    theme: "aventure",
    excerpt:
      "Le jour où Léa tombe de son voilier, elle rencontre une baleine qui l'emmène bien plus loin qu'elle ne l'imaginait.",
    cover: "cover-sea",
    rating: 4.9,
    hasAudio: true,
  },
  {
    slug: "le-potager-magique-de-mamie-rose",
    title: "Le potager magique de Mamie Rose",
    language: "fr",
    ageRange: "3-5",
    readingMinutes: 7,
    theme: "nature",
    excerpt:
      "Chez Mamie Rose, les tomates chantent et les carottes dansent. Aujourd'hui, une graine mystérieuse vient d'arriver.",
    cover: "cover-meadow",
    rating: 4.7,
    hasAudio: false,
  },
  {
    slug: "timothee-et-le-dragon-timide",
    title: "Timothée et le dragon timide",
    language: "fr",
    ageRange: "6-8",
    readingMinutes: 12,
    theme: "amitie",
    excerpt:
      "Dans la forêt d'Argoat vit un dragon qui n'ose pas faire peur à personne. Timothée va lui apprendre le courage.",
    cover: "cover-peach",
    rating: 4.6,
    hasAudio: true,
  },
  {
    slug: "la-course-des-etoiles-filantes",
    title: "La course des étoiles filantes",
    language: "fr",
    ageRange: "9-11",
    readingMinutes: 18,
    theme: "aventure",
    excerpt:
      "Chaque siècle, les étoiles organisent une course folle. Cette année, une enfant a été invitée à y participer.",
    cover: "cover-indigo",
    rating: 4.9,
    hasAudio: true,
  },
  {
    slug: "petit-ours-apprend-a-attendre",
    title: "Petit ours apprend à attendre",
    language: "fr",
    ageRange: "3-5",
    readingMinutes: 5,
    theme: "emotions",
    excerpt:
      "Petit ours voudrait que le printemps arrive plus vite. Heureusement, sa maman connaît un truc magique.",
    cover: "cover-mint",
    rating: 4.5,
    hasAudio: false,
  },
  {
    slug: "le-marchand-de-reves-du-souk",
    title: "Le marchand de rêves du souk",
    language: "fr",
    ageRange: "9-11",
    readingMinutes: 16,
    theme: "decouverte",
    excerpt:
      "Au cœur du vieux Marrakech, un homme vend des rêves en bocal. Mais que se passe-t-il quand un bocal se brise ?",
    cover: "cover-sand",
    rating: 4.8,
    hasAudio: true,
  },
  {
    slug: "les-jumeaux-et-la-comete",
    title: "Les jumeaux et la comète",
    language: "fr",
    ageRange: "6-8",
    readingMinutes: 11,
    theme: "aventure",
    excerpt:
      "Émile et Zoé voient chaque soir la même étoile filante. Et si cette étoile cherchait quelque chose ?",
    cover: "cover-dusk",
    rating: 4.7,
    hasAudio: true,
  },
  {
    slug: "la-bibliotheque-qui-marche-la-nuit",
    title: "La bibliothèque qui marche la nuit",
    language: "fr",
    ageRange: "9-11",
    readingMinutes: 20,
    theme: "fantastique",
    excerpt:
      "On raconte que certaines nuits, la bibliothèque municipale change de trottoir. Camille a décidé d'en avoir le cœur net.",
    cover: "cover-night",
    rating: 4.9,
    hasAudio: true,
  },
  {
    slug: "le-gateau-qui-ne-voulait-pas-cuire",
    title: "Le gâteau qui ne voulait pas cuire",
    language: "fr",
    ageRange: "3-5",
    readingMinutes: 5,
    theme: "humour",
    excerpt:
      "Ce matin, le gâteau au chocolat refuse d'entrer dans le four. Il a des choses à dire, lui aussi.",
    cover: "cover-peach",
    rating: 4.6,
    hasAudio: false,
  },
  {
    slug: "le-petit-phare-et-la-tempete",
    title: "Le petit phare et la tempête",
    language: "fr",
    ageRange: "6-8",
    readingMinutes: 9,
    theme: "courage",
    excerpt:
      "Au bout de la Bretagne, un tout petit phare va devoir sauver un bateau malgré sa lumière vacillante.",
    cover: "cover-sea",
    rating: 4.8,
    hasAudio: true,
  },
  {
    slug: "la-reine-des-champignons",
    title: "La reine des champignons",
    language: "fr",
    ageRange: "6-8",
    readingMinutes: 10,
    theme: "nature",
    excerpt:
      "Sous la mousse du vieil hêtre règne une reine minuscule. Cette semaine, son royaume a été volé.",
    cover: "cover-meadow",
    rating: 4.5,
    hasAudio: false,
  },
];

export function findStory(slug: string): MockStory | undefined {
  return mockStories.find((s) => s.slug === slug);
}

/**
 * Rich reading text used on the detail page. Kept separate from the card data
 * to avoid shipping long bodies in grid queries.
 */
export function storyBody(slug: string): string[] {
  const fallback = [
    "Il était une fois, au fond d'un bois où même les plus vieux chênes avaient oublié leur nom, une petite maison aux volets bleus. Personne n'avait pensé qu'on pouvait y vivre — et pourtant, quelqu'un y vivait bel et bien.",
    "La maison appartenait à une enfant que les autres appelaient, faute de mieux, « la petite ». Ce n'était pas son vrai nom. Son vrai nom, elle le gardait pour elle, comme on garde une noisette précieuse dans le creux de sa main.",
    "Chaque matin, la petite ouvrait ses volets et disait bonjour aux choses. Bonjour à la théière. Bonjour au pin derrière la fenêtre. Bonjour à l'araignée qui vivait dans le coin droit de la cuisine et qui, pour tout remerciement, tissait des toiles en forme d'étoile.",
    "Un jour de novembre, tandis qu'elle préparait un thé à la verveine, la petite entendit gratter à sa porte. Elle mit d'abord cela sur le compte du vent : novembre a souvent la langue qui fourche, et il confond toutes sortes de bruits. Mais le gratouillement insista.",
    "Elle ouvrit. Sur le pas de la porte se tenait un renard. Un renard qui semblait fatigué, qui portait sous son bras un livre relié de cuir bleu. Il leva la tête, cligna des yeux dorés, et dit, comme si c'était la chose la plus naturelle du monde :",
    "— Pardon, je me suis perdu dans mon histoire. Pourriez-vous m'aider à retrouver la page ?",
    "La petite resta un long moment immobile, parce que — vous en conviendrez — ce n'est pas tous les jours qu'un renard vient vous demander pareille chose. Puis elle s'écarta, tendit la main, et dit avec beaucoup de sérieux :",
    "— Entrez donc. Le thé est presque prêt.",
  ];
  const s = findStory(slug);
  if (!s) return fallback;
  return fallback;
}
