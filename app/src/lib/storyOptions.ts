/**
 * Story-creation option catalogue, shared by the /creer wizard (client) and
 * generateStoryAction (server prompt composition). No "use client": both
 * sides import real values from here.
 */

export type StoryOpt = { id: string; fr: string; en: string };

export function storyOptLabel(opt: StoryOpt, locale: string): string {
  return locale === "en" ? opt.en : opt.fr;
}

/**
 * "jean-luc de la mare" -> "Jean-Luc De La Mare": capitalize the first letter
 * after start / space / hyphen / apostrophe, so generated stories always show
 * proper names even when the parent typed lowercase. Applied client-side for
 * display and server-side (authoritative) before the prompt.
 */
export function capitalizeName(name: string): string {
  return name
    .trim()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Story themes, organized in two labeled groups so genres (how it feels) and
 * universes (what it is about) stop reading as one confusing mixed list.
 * Both feed the single `params.theme` value.
 */
export const THEME_GENRES = [
  "aventure",
  "amitie",
  "emotions",
  "fantastique",
  "humour",
  "courage",
  "decouverte",
  "famille",
] as const;

export const THEME_UNIVERSES = [
  "animaux",
  "nature",
  "espace",
  "mer",
  "ecole",
  "voyage",
  "sport",
  "saisons",
  "noel",
  "anniversaire",
] as const;

/**
 * Hero kind. Free plan: child heroes only (boy/girl), per the brief; animal
 * and adult heroes are paid perks. Enforced in the UI AND server-side.
 */
export const HERO_TYPES: (StoryOpt & { free: boolean })[] = [
  { id: "garcon", fr: "Un garçon", en: "A boy", free: true },
  { id: "fille", fr: "Une fille", en: "A girl", free: true },
  { id: "animal", fr: "Un animal", en: "An animal", free: false },
  { id: "adulte", fr: "Un adulte", en: "An adult", free: false },
];

/** Free plan: hero age capped at 12 (13+ heroes are a paid perk). */
export const FREE_HERO_MAX_AGE = 12;

/** Relations for secondary characters ("Léo est... un copain"). */
export const COMPANION_RELATIONS: StoryOpt[] = [
  { id: "copain", fr: "un copain", en: "a friend (boy)" },
  { id: "copine", fr: "une copine", en: "a friend (girl)" },
  { id: "frere", fr: "son frère", en: "their brother" },
  { id: "soeur", fr: "sa sœur", en: "their sister" },
  { id: "papa", fr: "son papa", en: "their dad" },
  { id: "maman", fr: "sa maman", en: "their mum" },
  { id: "grandpere", fr: "son grand-père", en: "their grandpa" },
  { id: "grandmere", fr: "sa grand-mère", en: "their grandma" },
  { id: "cousin", fr: "un cousin", en: "a cousin (boy)" },
  { id: "cousine", fr: "une cousine", en: "a cousin (girl)" },
  { id: "animal", fr: "son animal de compagnie", en: "their pet" },
  { id: "doudou", fr: "son doudou", en: "their cuddly toy" },
  { id: "ami-imaginaire", fr: "son ami imaginaire", en: "their imaginary friend" },
  { id: "creature", fr: "une créature magique", en: "a magical creature" },
  { id: "enseignant", fr: "son enseignant ou son enseignante", en: "their teacher" },
  { id: "voisin", fr: "un voisin ou une voisine", en: "a neighbour" },
  { id: "rival", fr: "un rival ou une rivale", en: "a rival" },
  { id: "autre", fr: "un proche", en: "someone close" },
];

export const MAX_COMPANIONS = 4;
export const MAX_EXTRA_INFO = 3;

/**
 * Optional sub-themes per theme (meshistoiresdusoir-style drilldown, kept
 * light): a handful of curated angles per theme plus a free "custom" input in
 * the wizard. Themes without an entry simply skip the sub-theme rail.
 */
export const STORY_SUBTHEMES: Record<string, StoryOpt[]> = {
  aventure: [
    { id: "tresor", fr: "Chasse au trésor", en: "Treasure hunt" },
    { id: "ile", fr: "Île mystérieuse", en: "Mysterious island" },
    { id: "jungle", fr: "Expédition dans la jungle", en: "Jungle expedition" },
    { id: "pirates", fr: "Pirates", en: "Pirates" },
    { id: "montagne", fr: "Sommet à gravir", en: "Mountain to climb" },
  ],
  fantastique: [
    { id: "magie", fr: "Apprenti magicien", en: "Apprentice wizard" },
    { id: "dragons", fr: "Dragons", en: "Dragons" },
    { id: "fees", fr: "Fées et lutins", en: "Fairies and elves" },
    { id: "chevaliers", fr: "Chevaliers et châteaux", en: "Knights and castles" },
    { id: "monde-secret", fr: "Monde secret", en: "Secret world" },
  ],
  emotions: [
    { id: "peur-noir", fr: "Peur du noir", en: "Fear of the dark" },
    { id: "colere", fr: "Apprivoiser la colère", en: "Taming anger" },
    { id: "timidite", fr: "Vaincre sa timidité", en: "Overcoming shyness" },
    { id: "separation", fr: "Séparation et retrouvailles", en: "Being apart, reuniting" },
    { id: "confiance", fr: "Confiance en soi", en: "Self-confidence" },
  ],
  amitie: [
    { id: "nouvel-ami", fr: "Un nouvel ami", en: "A new friend" },
    { id: "dispute", fr: "Se réconcilier", en: "Making up after a quarrel" },
    { id: "entraide", fr: "S'entraider", en: "Helping each other" },
    { id: "difference", fr: "Aimer les différences", en: "Loving differences" },
  ],
  nature: [
    { id: "foret", fr: "Forêt enchantée", en: "Enchanted forest" },
    { id: "ocean", fr: "Fond des océans", en: "Deep ocean" },
    { id: "jardin", fr: "Jardin secret", en: "Secret garden" },
    { id: "saisons", fr: "La ronde des saisons", en: "The turning seasons" },
  ],
  espace: [
    { id: "fusee", fr: "Voyage en fusée", en: "Rocket trip" },
    { id: "planetes", fr: "Planètes inconnues", en: "Unknown planets" },
    { id: "etoiles", fr: "Nuit des étoiles", en: "Night of stars" },
    { id: "extraterrestre", fr: "Ami extraterrestre", en: "Alien friend" },
  ],
  animaux: [
    { id: "ferme", fr: "Animaux de la ferme", en: "Farm animals" },
    { id: "sauvage", fr: "Animaux sauvages", en: "Wild animals" },
    { id: "refuge", fr: "Sauver un animal", en: "Rescuing an animal" },
    { id: "dinosaures", fr: "Dinosaures", en: "Dinosaurs" },
  ],
  humour: [
    { id: "farces", fr: "Farces et fous rires", en: "Pranks and giggles" },
    { id: "monde-envers", fr: "Monde à l'envers", en: "Upside-down world" },
    { id: "animal-rigolo", fr: "Animal trop rigolo", en: "A very silly animal" },
  ],
};

export function subThemeLabel(theme: string, id: string, locale: string): string {
  const s = (STORY_SUBTHEMES[theme] ?? []).find((x) => x.id === id);
  return s ? storyOptLabel(s, locale) : id;
}

/**
 * Occasion presets (#5) — one tap fills theme + angle + mood + a plot note for
 * a real-life milestone (birthday, first day of school, tooth fairy...). These
 * are the stories parents most want printed, and the fastest way to remove the
 * blank-page friction. `theme` must be a real THEME_OPTIONS slug; `subTheme`
 * and `extra` are stored as the localized free-text the model reads.
 */
export type OccasionPreset = {
  id: string;
  emoji: string;
  fr: string;
  en: string;
  theme: string;
  mood: "drole" | "mysterieux" | "touchant" | "palpitant" | "doux";
  subThemeFr?: string;
  subThemeEn?: string;
  extraFr?: string;
  extraEn?: string;
};

export const OCCASION_PRESETS: OccasionPreset[] = [
  {
    id: "anniversaire",
    emoji: "🎂",
    fr: "Anniversaire",
    en: "Birthday",
    theme: "anniversaire",
    mood: "drole",
    subThemeFr: "Une fête surprise",
    subThemeEn: "A surprise party",
    extraFr: "C'est l'anniversaire du héros aujourd'hui, et une belle surprise l'attend.",
    extraEn: "It is the hero's birthday today, and a lovely surprise is waiting.",
  },
  {
    id: "rentree",
    emoji: "🎒",
    fr: "Rentrée des classes",
    en: "First day of school",
    theme: "ecole",
    mood: "touchant",
    subThemeFr: "Le premier jour d'école",
    subThemeEn: "The very first day of school",
    extraFr: "Le héros fait sa rentrée, un peu intimidé, et se fait un nouvel ami.",
    extraEn: "The hero starts school, a little nervous, and makes a new friend.",
  },
  {
    id: "petite-souris",
    emoji: "🦷",
    fr: "La petite souris",
    en: "The tooth fairy",
    theme: "fantastique",
    mood: "doux",
    subThemeFr: "La petite souris des dents",
    subThemeEn: "The tooth fairy visit",
    extraFr: "Le héros perd sa première dent et attend la visite de la petite souris.",
    extraEn: "The hero loses their first tooth and waits for the tooth fairy.",
  },
  {
    id: "nouveau-bebe",
    emoji: "👶",
    fr: "Un nouveau bébé",
    en: "A new baby",
    theme: "famille",
    mood: "touchant",
    subThemeFr: "Devenir grand frère ou grande sœur",
    subThemeEn: "Becoming a big brother or big sister",
    extraFr: "Un nouveau bébé arrive dans la famille et le héros apprend à devenir grand.",
    extraEn: "A new baby arrives in the family and the hero learns to be the big one.",
  },
  {
    id: "demenagement",
    emoji: "📦",
    fr: "Le déménagement",
    en: "Moving house",
    theme: "emotions",
    mood: "touchant",
    subThemeFr: "Un nouveau chez-soi",
    subThemeEn: "A brand-new home",
    extraFr: "Le héros déménage dans une nouvelle maison et apprivoise ce grand changement.",
    extraEn: "The hero moves to a new home and gently gets used to the big change.",
  },
  {
    id: "nuit-sans-peur",
    emoji: "🌙",
    fr: "Une nuit sans peur",
    en: "A night without fear",
    theme: "emotions",
    mood: "doux",
    subThemeFr: "Apprivoiser la peur du noir",
    subThemeEn: "Taming the fear of the dark",
    extraFr: "Le héros a un peu peur du noir et découvre que la nuit peut être douce.",
    extraEn: "The hero is a little afraid of the dark and finds out the night can be gentle.",
  },
];

/**
 * Real-life situations to work through (#c): one tap fills theme + mood + a
 * plot note, so parents never have to word the hard stuff themselves. Same
 * shape as OCCASION_PRESETS, rendered as a second preset group.
 */
export const SITUATION_PRESETS: OccasionPreset[] = [
  {
    id: "dispute-fratrie",
    emoji: "🤝",
    fr: "Dispute entre frères et sœurs",
    en: "Sibling quarrel",
    theme: "famille",
    mood: "touchant",
    extraFr: "Le héros s'est disputé avec son frère ou sa sœur et découvre comment se réconcilier.",
    extraEn: "The hero quarrelled with their sibling and finds out how to make up.",
  },
  {
    id: "peur-docteur",
    emoji: "🩺",
    fr: "Peur du docteur",
    en: "Fear of the doctor",
    theme: "emotions",
    mood: "doux",
    extraFr: "Le héros doit aller chez le docteur, il a un peu peur, et découvre que tout se passe bien.",
    extraEn: "The hero has to visit the doctor, feels a little scared, and finds out it all goes fine.",
  },
  {
    id: "moqueries",
    emoji: "🛡️",
    fr: "Moqueries à l'école",
    en: "Teasing at school",
    theme: "courage",
    mood: "touchant",
    extraFr: "Un enfant se moque du héros à l'école ; le héros apprend à se protéger, à en parler et à trouver du soutien.",
    extraEn: "Someone teases the hero at school; the hero learns to stand up, speak up and find support.",
  },
  {
    id: "grosses-coleres",
    emoji: "🌋",
    fr: "Grosses colères",
    en: "Big tantrums",
    theme: "emotions",
    mood: "doux",
    extraFr: "Le héros sent parfois une grosse colère monter comme un volcan et apprend à la faire redescendre.",
    extraEn: "The hero sometimes feels a big anger rise like a volcano and learns how to let it settle.",
  },
  {
    id: "velo",
    emoji: "🚲",
    fr: "Apprendre à faire du vélo",
    en: "Learning to ride a bike",
    theme: "courage",
    mood: "touchant",
    subThemeFr: "Le premier tour de vélo sans roulettes",
    subThemeEn: "The first ride without training wheels",
    extraFr: "Le héros apprend à faire du vélo sans les petites roues : il tombe, recommence, et finit par y arriver.",
    extraEn: "The hero learns to ride a bike without training wheels: falling, trying again, and finally getting it.",
  },
  {
    id: "deuil-animal",
    emoji: "🕊️",
    fr: "Perte d'un animal",
    en: "Loss of a pet",
    theme: "emotions",
    mood: "touchant",
    extraFr: "L'animal adoré du héros est parti ; l'histoire aborde ce départ avec beaucoup de douceur et de beaux souvenirs.",
    extraEn: "The hero's beloved pet is gone; the story handles the goodbye with great gentleness and lovely memories.",
  },
  {
    id: "parents-separes",
    emoji: "🏡",
    fr: "Parents séparés",
    en: "Separated parents",
    theme: "famille",
    mood: "touchant",
    extraFr: "Les parents du héros vivent maintenant dans deux maisons ; le héros découvre qu'il est aimé pareil dans les deux.",
    extraEn: "The hero's parents now live in two homes; the hero finds out they are loved just the same in both.",
  },
];

/**
 * Optional moral for the story's ending: one tap for the classics, or free
 * text for a precise lesson (the wizard also accepts a custom sentence).
 */
export const STORY_MORALS: StoryOpt[] = [
  { id: "courage", fr: "Avoir du courage", en: "Being brave" },
  { id: "partage", fr: "Partager", en: "Sharing" },
  { id: "honnetete", fr: "Dire la vérité", en: "Telling the truth" },
  { id: "perseverance", fr: "Ne jamais abandonner", en: "Never giving up" },
  { id: "confiance", fr: "Croire en soi", en: "Believing in yourself" },
  { id: "amitie", fr: "Prendre soin de ses amis", en: "Caring for your friends" },
  { id: "difference", fr: "Accepter les différences", en: "Accepting differences" },
  { id: "patience", fr: "Être patient", en: "Being patient" },
  { id: "ecoute", fr: "Écouter les autres", en: "Listening to others" },
];

/** Optional skin-tone preference for the illustrations (ids match characterOptions). */
export const STORY_SKIN_TONES: StoryOpt[] = [
  { id: "claire", fr: "Peau claire", en: "Light skin" },
  { id: "mate", fr: "Peau mate", en: "Tan skin" },
  { id: "foncee", fr: "Peau foncée", en: "Dark skin" },
];

export function relationLabel(id: string, locale: string): string {
  const r = COMPANION_RELATIONS.find((x) => x.id === id);
  return r ? storyOptLabel(r, locale) : id;
}

export function heroTypeLabel(id: string | undefined, locale: string): string {
  const h = HERO_TYPES.find((x) => x.id === id);
  return h ? storyOptLabel(h, locale) : "";
}
