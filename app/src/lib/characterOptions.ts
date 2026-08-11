"use client";

import type { SavedCharacter } from "./characters";

/**
 * Character-creation option catalogue (wizard on /compte/personnages/nouveau).
 *
 * Labels live here (fr/en inline) instead of messages/*.json: the catalogue is
 * ~150 entries and belongs with the data, while the wizard chrome (titles,
 * hints, buttons) stays in messages. Every visual option maps to a future
 * illustration at /public/illustrations/char-<category>-<id>.png (same swap
 * convention as FoxImagePlaceholder).
 */

export type Opt = {
  id: string;
  fr: string;
  en: string;
  /** Emoji prefix (personality chips). */
  emoji?: string;
  /** Swatch color for color-dot chips (hair, eyes, coat). */
  dot?: string;
};

export type WizardLocale = "fr" | "en";

export function optLabel(opt: Opt, locale: string): string {
  return locale === "en" ? opt.en : opt.fr;
}

/* ------------------------------------------------------------------ */
/* Step 1 — type                                                       */
/* ------------------------------------------------------------------ */

export const WIZARD_TYPES = [
  { id: "enfant", fr: "Enfant (0-12 ans)", en: "Child (0-12)" },
  { id: "adulte", fr: "Ado/Adulte (13 ans et +)", en: "Teen/Adult (13+)" },
  { id: "animal", fr: "Animal", en: "Animal" },
] as const;

/* ------------------------------------------------------------------ */
/* Step 2 — identity                                                   */
/* ------------------------------------------------------------------ */

/** ids match the store enum (CharacterGender). */
export const GENDER_HUMAN: Opt[] = [
  { id: "neutre", fr: "Autre / Non renseigné", en: "Other / Unspecified" },
  { id: "garcon", fr: "Masculin", en: "Male" },
  { id: "fille", fr: "Féminin", en: "Female" },
];

export const GENDER_ANIMAL: Opt[] = [
  { id: "neutre", fr: "Autre / Non renseigné", en: "Other / Unspecified" },
  { id: "garcon", fr: "Mâle", en: "Male" },
  { id: "fille", fr: "Femelle", en: "Female" },
];

/* ------------------------------------------------------------------ */
/* Step 3 — appearance (human)                                         */
/* ------------------------------------------------------------------ */

export const SKIN_OPTIONS: Opt[] = [
  { id: "claire", fr: "Peau claire", en: "Light skin" },
  { id: "mate", fr: "Peau mate", en: "Tan skin" },
  { id: "foncee", fr: "Peau foncée", en: "Dark skin" },
];

export const HAIR_COLORS: Opt[] = [
  { id: "blond", fr: "Blond", en: "Blond", dot: "#e8c56f" },
  { id: "chatain", fr: "Châtain", en: "Light brown", dot: "#9a6b43" },
  { id: "brun", fr: "Brun", en: "Brown", dot: "#5b3a26" },
  { id: "noir", fr: "Noir", en: "Black", dot: "#2b2b2e" },
  { id: "roux", fr: "Roux", en: "Red", dot: "#c1592c" },
  { id: "gris", fr: "Gris / Blanc", en: "Grey / White", dot: "#b9bcc4" },
  { id: "fantaisie", fr: "Fantaisie (vert, rose...)", en: "Fantasy (green, pink...)", dot: "#7cc3a7" },
];

export const HAIR_STYLES: Opt[] = [
  { id: "tres-court", fr: "Très court", en: "Very short" },
  { id: "court", fr: "Court", en: "Short" },
  { id: "mi-long", fr: "Mi-long", en: "Medium" },
  { id: "long", fr: "Long", en: "Long" },
  { id: "boucle-court", fr: "Bouclé court", en: "Curly short" },
  { id: "boucle-mi-long", fr: "Bouclé mi-long", en: "Curly medium" },
  { id: "queue-de-cheval", fr: "Queue de cheval", en: "Ponytail" },
  { id: "tresses", fr: "Tresses", en: "Braids" },
  { id: "double-chignon", fr: "Double chignon", en: "Double bun" },
];

/** Styles that replace color + cut entirely. */
export const HAIR_SPECIALS: Opt[] = [
  { id: "chauve", fr: "Chauve", en: "Bald" },
  { id: "foulard", fr: "Foulard", en: "Headscarf" },
  { id: "hidjab", fr: "Hidjab", en: "Hijab" },
];

export const EYE_OPTIONS: Opt[] = [
  { id: "marrons", fr: "Marrons", en: "Brown", dot: "#6b4226" },
  { id: "bleus", fr: "Bleus", en: "Blue", dot: "#4a7fb5" },
  { id: "verts", fr: "Verts", en: "Green", dot: "#5a8f5d" },
  { id: "noisette", fr: "Noisette", en: "Hazel", dot: "#8f7440" },
  { id: "gris", fr: "Gris", en: "Grey", dot: "#8b95a3" },
  { id: "bleu-clair", fr: "Bleus clairs", en: "Light blue", dot: "#8fc0e0" },
  { id: "noirs", fr: "Noirs", en: "Black", dot: "#33333a" },
  { id: "autre", fr: "Autre / Indéterminé", en: "Other / Unspecified", dot: "#c9b98a" },
];

export const GLASSES_OPTIONS: Opt[] = [
  { id: "vue-rondes", fr: "Lunettes rondes", en: "Round glasses" },
  { id: "vue-rectangulaires", fr: "Lunettes rectangulaires", en: "Rectangular glasses" },
  { id: "vue-carrees", fr: "Lunettes carrées", en: "Square glasses" },
  { id: "soleil-rondes", fr: "Solaires rondes", en: "Round sunglasses" },
  { id: "soleil-coeurs", fr: "Solaires cœurs", en: "Heart sunglasses" },
  { id: "soleil-aviateur", fr: "Solaires aviateur", en: "Aviator sunglasses" },
];

export const BUILD_OPTIONS: Opt[] = [
  { id: "indeterminee", fr: "Indéterminée", en: "Unspecified" },
  { id: "mince", fr: "Mince", en: "Slim" },
  { id: "moyenne", fr: "Moyenne", en: "Average" },
  { id: "ronde", fr: "Ronde", en: "Round" },
  { id: "costaud", fr: "Costaud", en: "Strong" },
];

export const MOBILITY_OPTIONS: Opt[] = [
  { id: "fauteuil-roulant", fr: "Fauteuil roulant", en: "Wheelchair" },
  { id: "fauteuil-electrique", fr: "Fauteuil roulant électrique", en: "Electric wheelchair" },
  { id: "bequilles", fr: "Béquilles", en: "Crutches" },
  { id: "canne", fr: "Canne", en: "Cane" },
  { id: "canne-blanche", fr: "Canne blanche", en: "White cane" },
  { id: "deambulateur", fr: "Déambulateur", en: "Walker" },
  { id: "prothese-bras", fr: "Prothèse de bras", en: "Arm prosthesis" },
  { id: "prothese-jambe", fr: "Prothèse de jambe", en: "Leg prosthesis" },
  { id: "platre-bras", fr: "Bras dans le plâtre", en: "Arm in a cast" },
  { id: "platre-jambe", fr: "Jambe dans le plâtre", en: "Leg in a cast" },
];

export const HAT_OPTIONS: Opt[] = [
  { id: "casquette", fr: "Casquette", en: "Cap" },
  { id: "bonnet", fr: "Bonnet", en: "Beanie" },
  { id: "chapeau-de-paille", fr: "Chapeau de paille", en: "Straw hat" },
  { id: "couronne", fr: "Couronne", en: "Crown" },
  { id: "beret", fr: "Béret", en: "Beret" },
  { id: "chapeau-de-magicien", fr: "Chapeau de magicien", en: "Wizard hat" },
  { id: "bandana", fr: "Bandana", en: "Bandana" },
  { id: "serre-tete", fr: "Serre-tête", en: "Headband" },
];

export const CLOTHING_OPTIONS: Opt[] = [
  { id: "t-shirt", fr: "T-shirt", en: "T-shirt" },
  { id: "pull", fr: "Pull", en: "Sweater" },
  { id: "robe", fr: "Robe", en: "Dress" },
  { id: "jupe", fr: "Jupe", en: "Skirt" },
  { id: "salopette", fr: "Salopette", en: "Overalls" },
  { id: "short", fr: "Short", en: "Shorts" },
  { id: "pantalon", fr: "Pantalon", en: "Trousers" },
  { id: "pyjama", fr: "Pyjama", en: "Pajamas" },
  { id: "manteau", fr: "Manteau", en: "Coat" },
  { id: "cape", fr: "Cape", en: "Cape" },
];

export const EXTRA_OPTIONS: Opt[] = [
  { id: "echarpe", fr: "Écharpe", en: "Scarf" },
  { id: "sac-a-dos", fr: "Sac à dos", en: "Backpack" },
  { id: "doudou", fr: "Doudou", en: "Cuddly toy" },
  { id: "montre", fr: "Montre", en: "Watch" },
  { id: "collier", fr: "Collier", en: "Necklace" },
  { id: "bracelet", fr: "Bracelet", en: "Bracelet" },
  { id: "baguette-magique", fr: "Baguette magique", en: "Magic wand" },
  { id: "livre", fr: "Livre", en: "Book" },
];

/** Max accessories overall (hat + clothing + extras), per the reference UX. */
export const MAX_ACCESSORIES = 6;
export const MAX_MOBILITY = 2;

/* ------------------------------------------------------------------ */
/* Step 3 — appearance (animal)                                        */
/* ------------------------------------------------------------------ */

export const ANIMAL_FAMILIES: Opt[] = [
  { id: "compagnie", fr: "Animal de compagnie", en: "Pet" },
  { id: "ferme", fr: "Animal de la ferme", en: "Farm animal" },
  { id: "foret", fr: "Animal de la forêt", en: "Forest animal" },
  { id: "savane", fr: "Animal de la savane", en: "Savanna animal" },
  { id: "mer", fr: "Animal marin", en: "Sea animal" },
  { id: "oiseaux", fr: "Oiseau", en: "Bird" },
  { id: "fantastique", fr: "Créature fantastique", en: "Fantastic creature" },
];

export const ANIMAL_SPECIES: Record<string, Opt[]> = {
  compagnie: [
    { id: "chien", fr: "Chien", en: "Dog" },
    { id: "chat", fr: "Chat", en: "Cat" },
    { id: "lapin", fr: "Lapin", en: "Rabbit" },
    { id: "hamster", fr: "Hamster", en: "Hamster" },
    { id: "cochon-d-inde", fr: "Cochon d'Inde", en: "Guinea pig" },
    { id: "tortue", fr: "Tortue", en: "Turtle" },
    { id: "poisson-rouge", fr: "Poisson rouge", en: "Goldfish" },
    { id: "perruche", fr: "Perruche", en: "Parakeet" },
  ],
  ferme: [
    { id: "poule", fr: "Poule", en: "Hen" },
    { id: "cochon", fr: "Cochon", en: "Pig" },
    { id: "mouton", fr: "Mouton", en: "Sheep" },
    { id: "cheval", fr: "Cheval", en: "Horse" },
    { id: "ane", fr: "Âne", en: "Donkey" },
    { id: "vache", fr: "Vache", en: "Cow" },
    { id: "canard", fr: "Canard", en: "Duck" },
    { id: "chevre", fr: "Chèvre", en: "Goat" },
  ],
  foret: [
    { id: "renard", fr: "Renard", en: "Fox" },
    { id: "ours", fr: "Ours", en: "Bear" },
    { id: "cerf", fr: "Cerf", en: "Deer" },
    { id: "ecureuil", fr: "Écureuil", en: "Squirrel" },
    { id: "herisson", fr: "Hérisson", en: "Hedgehog" },
    { id: "loup", fr: "Loup", en: "Wolf" },
    { id: "hibou", fr: "Hibou", en: "Owl" },
    { id: "blaireau", fr: "Blaireau", en: "Badger" },
  ],
  savane: [
    { id: "lion", fr: "Lion", en: "Lion" },
    { id: "elephant", fr: "Éléphant", en: "Elephant" },
    { id: "girafe", fr: "Girafe", en: "Giraffe" },
    { id: "zebre", fr: "Zèbre", en: "Zebra" },
    { id: "singe", fr: "Singe", en: "Monkey" },
    { id: "hippopotame", fr: "Hippopotame", en: "Hippo" },
    { id: "guepard", fr: "Guépard", en: "Cheetah" },
  ],
  mer: [
    { id: "dauphin", fr: "Dauphin", en: "Dolphin" },
    { id: "tortue-de-mer", fr: "Tortue de mer", en: "Sea turtle" },
    { id: "poisson", fr: "Poisson", en: "Fish" },
    { id: "pieuvre", fr: "Pieuvre", en: "Octopus" },
    { id: "baleine", fr: "Baleine", en: "Whale" },
    { id: "otarie", fr: "Otarie", en: "Sea lion" },
    { id: "hippocampe", fr: "Hippocampe", en: "Seahorse" },
  ],
  oiseaux: [
    { id: "rouge-gorge", fr: "Rouge-gorge", en: "Robin" },
    { id: "perroquet", fr: "Perroquet", en: "Parrot" },
    { id: "chouette", fr: "Chouette", en: "Owl" },
    { id: "pingouin", fr: "Pingouin", en: "Penguin" },
    { id: "flamant-rose", fr: "Flamant rose", en: "Flamingo" },
    { id: "aigle", fr: "Aigle", en: "Eagle" },
  ],
  fantastique: [
    { id: "dragon", fr: "Dragon", en: "Dragon" },
    { id: "licorne", fr: "Licorne", en: "Unicorn" },
    { id: "phenix", fr: "Phénix", en: "Phoenix" },
    { id: "griffon", fr: "Griffon", en: "Griffin" },
    { id: "yeti", fr: "Yéti", en: "Yeti" },
  ],
};

export const COAT_OPTIONS: Opt[] = [
  { id: "roux", fr: "Roux", en: "Red", dot: "#c1592c" },
  { id: "brun", fr: "Brun", en: "Brown", dot: "#5b3a26" },
  { id: "noir", fr: "Noir", en: "Black", dot: "#2b2b2e" },
  { id: "blanc", fr: "Blanc", en: "White", dot: "#f0ede4" },
  { id: "gris", fr: "Gris", en: "Grey", dot: "#9aa0ab" },
  { id: "dore", fr: "Doré", en: "Golden", dot: "#d4a94e" },
  { id: "tachete", fr: "Tacheté", en: "Spotted", dot: "#c9a87a" },
  { id: "raye", fr: "Rayé", en: "Striped", dot: "#8a7a5f" },
];

export const ANIMAL_SIZES: Opt[] = [
  { id: "tout-petit", fr: "Tout petit", en: "Tiny" },
  { id: "petit", fr: "Petit", en: "Small" },
  { id: "moyen", fr: "Moyen", en: "Medium" },
  { id: "grand", fr: "Grand", en: "Large" },
];

export const ANIMAL_ACCESSORIES: Opt[] = [
  { id: "collier", fr: "Collier", en: "Collar" },
  { id: "foulard", fr: "Foulard", en: "Bandana" },
  { id: "petit-chapeau", fr: "Petit chapeau", en: "Little hat" },
  { id: "lunettes", fr: "Lunettes", en: "Glasses" },
  { id: "cape", fr: "Cape", en: "Cape" },
  { id: "ruban", fr: "Ruban", en: "Ribbon" },
];

export const MAX_ANIMAL_ACCESSORIES = 3;

/* ------------------------------------------------------------------ */
/* Step 4 — personality                                                */
/* ------------------------------------------------------------------ */

export const MAX_TRAITS = 4;

export type TraitGroup = { id: string; fr: string; en: string; traits: Opt[] };

export const TRAIT_GROUPS: TraitGroup[] = [
  {
    id: "positive",
    fr: "Traits positifs",
    en: "Positive traits",
    traits: [
      { id: "sociable", fr: "Sociable", en: "Sociable", emoji: "🤗" },
      { id: "amical", fr: "Amical", en: "Friendly", emoji: "😊" },
      { id: "empathique", fr: "Empathique", en: "Empathetic", emoji: "🤝" },
      { id: "genereux", fr: "Généreux", en: "Generous", emoji: "🎁" },
      { id: "optimiste", fr: "Optimiste", en: "Optimistic", emoji: "🌞" },
      { id: "joyeux", fr: "Joyeux", en: "Cheerful", emoji: "😄" },
      { id: "aventureux", fr: "Aventureux", en: "Adventurous", emoji: "🌍" },
      { id: "courageux", fr: "Courageux", en: "Brave", emoji: "🦸" },
      { id: "curieux", fr: "Curieux", en: "Curious", emoji: "🔍" },
      { id: "creatif", fr: "Créatif", en: "Creative", emoji: "🎨" },
      { id: "debrouillard", fr: "Débrouillard", en: "Resourceful", emoji: "🛠️" },
      { id: "consciencieux", fr: "Consciencieux", en: "Conscientious", emoji: "🧐" },
      { id: "ambitieux", fr: "Ambitieux", en: "Ambitious", emoji: "🚀" },
      { id: "loyal", fr: "Loyal", en: "Loyal", emoji: "🛡️" },
      { id: "honnete", fr: "Honnête", en: "Honest", emoji: "🔑" },
    ],
  },
  {
    id: "negative",
    fr: "Traits négatifs",
    en: "Negative traits",
    traits: [
      { id: "timide", fr: "Timide", en: "Shy", emoji: "😶" },
      { id: "introverti", fr: "Introverti", en: "Introverted", emoji: "🙃" },
      { id: "pessimiste", fr: "Pessimiste", en: "Pessimistic", emoji: "☁️" },
      { id: "naif", fr: "Naïf", en: "Naive", emoji: "🐣" },
      { id: "peureux", fr: "Peureux", en: "Fearful", emoji: "😨" },
      { id: "tetu", fr: "Têtu", en: "Stubborn", emoji: "🐑" },
      { id: "turbulent", fr: "Turbulent", en: "Boisterous", emoji: "🌪️" },
      { id: "rebelle", fr: "Rebelle", en: "Rebellious", emoji: "⚡" },
      { id: "impatient", fr: "Impatient", en: "Impatient", emoji: "⏳" },
      { id: "arrogant", fr: "Arrogant", en: "Arrogant", emoji: "😤" },
      { id: "jaloux", fr: "Jaloux", en: "Jealous", emoji: "😒" },
      { id: "capricieux", fr: "Capricieux", en: "Capricious", emoji: "🙄" },
      { id: "menteur", fr: "Menteur", en: "Fibber", emoji: "🤥" },
    ],
  },
  {
    id: "neutral",
    fr: "Traits neutres (selon les contextes)",
    en: "Neutral traits (context-dependent)",
    traits: [
      { id: "reserve", fr: "Réservé", en: "Reserved", emoji: "🤐" },
      { id: "independant", fr: "Indépendant", en: "Independent", emoji: "🦅" },
      { id: "perfectionniste", fr: "Perfectionniste", en: "Perfectionist", emoji: "🎯" },
      { id: "reveur", fr: "Rêveur", en: "Dreamer", emoji: "🌙" },
      { id: "prudent", fr: "Prudent", en: "Cautious", emoji: "🧭" },
      { id: "serieux", fr: "Sérieux", en: "Serious", emoji: "🧑‍🏫" },
      { id: "calme", fr: "Calme", en: "Calm", emoji: "😌" },
      { id: "solitaire", fr: "Solitaire", en: "Solitary", emoji: "🛋️" },
      { id: "mefiant", fr: "Méfiant", en: "Wary", emoji: "🕵️" },
      { id: "fantasque", fr: "Fantasque", en: "Whimsical", emoji: "🎩" },
    ],
  },
  {
    id: "dominant",
    fr: "Types de personnalité dominants",
    en: "Dominant personality types",
    traits: [
      { id: "leader", fr: "Leader", en: "Leader", emoji: "🦁" },
      { id: "visionnaire", fr: "Visionnaire", en: "Visionary", emoji: "🔭" },
      { id: "methodique", fr: "Méthodique", en: "Methodical", emoji: "📋" },
      { id: "artiste", fr: "Artiste", en: "Artist", emoji: "🎭" },
      { id: "logicien", fr: "Logicien", en: "Logician", emoji: "🧠" },
      { id: "esprit-libre", fr: "Esprit libre", en: "Free spirit", emoji: "🌈" },
    ],
  },
  {
    id: "emotional",
    fr: "Caractéristiques émotionnelles",
    en: "Emotional characteristics",
    traits: [
      { id: "blagueur", fr: "Blagueur", en: "Joker", emoji: "😂" },
      { id: "sensible", fr: "Sensible", en: "Sensitive", emoji: "💗" },
      { id: "dramatique", fr: "Dramatique", en: "Dramatic", emoji: "🎭" },
      { id: "protecteur", fr: "Protecteur", en: "Protective", emoji: "🛡️" },
    ],
  },
  {
    id: "intellectual",
    fr: "Traits intellectuels",
    en: "Intellectual traits",
    traits: [
      { id: "logique", fr: "Logique", en: "Logical", emoji: "📚" },
      { id: "analytique", fr: "Analytique", en: "Analytical", emoji: "🔬" },
      { id: "philosophe", fr: "Philosophe", en: "Philosopher", emoji: "🤔" },
      { id: "imaginatif", fr: "Imaginatif", en: "Imaginative", emoji: "🎡" },
      { id: "reflechi", fr: "Réfléchi", en: "Thoughtful", emoji: "💭" },
    ],
  },
];

const ALL_TRAITS: Record<string, Opt> = Object.fromEntries(
  TRAIT_GROUPS.flatMap((g) => g.traits).map((t) => [t.id, t])
);

/* ------------------------------------------------------------------ */
/* Personality archetypes                                              */
/* ------------------------------------------------------------------ */

/**
 * Ready-made personalities: one tap sets 3 coherent traits, so a parent is not
 * asked to read 50 chips to describe their child's hero. Deliberately
 * gender-neutral. The full trait list stays one click away for parents who
 * want to compose their own.
 */
export type Archetype = Opt & { emoji: string; traits: string[] };

export const ARCHETYPES: Archetype[] = [
  {
    id: "aventurier",
    fr: "L'Esprit Aventurier",
    en: "The Adventurous Spirit",
    emoji: "🧭",
    traits: ["courageux", "curieux", "aventureux"],
  },
  {
    id: "creative",
    fr: "L'Âme Créative",
    en: "The Creative Soul",
    emoji: "🎨",
    traits: ["imaginatif", "sensible", "reveur"],
  },
  {
    id: "boute-en-train",
    fr: "Le Boute-en-train",
    en: "The Life of the Party",
    emoji: "😂",
    traits: ["joyeux", "blagueur", "sociable"],
  },
  {
    id: "coeur-fidele",
    fr: "Le Cœur Fidèle",
    en: "The Loyal Heart",
    emoji: "🤝",
    traits: ["empathique", "loyal", "protecteur"],
  },
  {
    id: "force-tranquille",
    fr: "La Force Tranquille",
    en: "The Quiet Strength",
    emoji: "😌",
    traits: ["calme", "logique", "consciencieux"],
  },
  {
    id: "esprit-libre",
    fr: "L'Esprit Libre",
    en: "The Free Spirit",
    emoji: "🌈",
    traits: ["independant", "fantasque", "debrouillard"],
  },
  {
    id: "tourbillon",
    fr: "Le Tourbillon",
    en: "The Whirlwind",
    emoji: "🌪️",
    traits: ["turbulent", "rebelle", "tetu"],
  },
];

/** Traits of an archetype, as human labels ("Courageux, Curieux, Aventureux"). */
export function archetypeTraitLabels(a: Archetype, locale: string): string {
  return a.traits
    .map((id) => (ALL_TRAITS[id] ? optLabel(ALL_TRAITS[id], locale) : id))
    .join(", ");
}

/** Label for a trait id; falls back to the raw string (legacy characters). */
export function traitLabel(id: string, locale: string): string {
  const t = ALL_TRAITS[id];
  return t ? `${t.emoji ? `${t.emoji} ` : ""}${optLabel(t, locale)}` : id;
}

/* ------------------------------------------------------------------ */
/* Description composer                                                */
/* ------------------------------------------------------------------ */

function find(list: Opt[], id?: string): Opt | undefined {
  return id ? list.find((o) => o.id === id) : undefined;
}

/**
 * Compose a readable one-line description from the saved appearance. Stored in
 * `description` at creation so story generation and the /creer chips get a
 * rich, ready-to-use seed without knowing the appearance schema.
 */
export function describeCharacter(
  c: Pick<SavedCharacter, "type" | "appearance">,
  locale: string
): string {
  const a = c.appearance;
  if (!a) return "";
  const fr = locale !== "en";
  const parts: string[] = [];

  if (c.type === "animal") {
    const species = a.family ? find(ANIMAL_SPECIES[a.family] ?? [], a.species) : undefined;
    const family = find(ANIMAL_FAMILIES, a.family);
    const base = species ?? family;
    if (base) parts.push(optLabel(base, locale).toLowerCase());
    const coat = find(COAT_OPTIONS, a.coat);
    if (coat) parts.push(fr ? `pelage ${optLabel(coat, locale).toLowerCase()}` : `${optLabel(coat, locale).toLowerCase()} coat`);
    const size = find(ANIMAL_SIZES, a.size);
    if (size) parts.push(fr ? `taille ${optLabel(size, locale).toLowerCase()}` : `${optLabel(size, locale).toLowerCase()} size`);
    const acc = (a.accessories ?? [])
      .map((id) => find(ANIMAL_ACCESSORIES, id))
      .filter((x): x is Opt => !!x)
      .map((x) => optLabel(x, locale).toLowerCase());
    if (acc.length) parts.push((fr ? "avec " : "with ") + acc.join(", "));
    return parts.join(", ");
  }

  const skin = find(SKIN_OPTIONS, a.skin);
  if (skin) parts.push(optLabel(skin, locale).toLowerCase());

  const special = find(HAIR_SPECIALS, a.hairStyle);
  if (special) {
    parts.push(optLabel(special, locale).toLowerCase());
  } else {
    const color = find(HAIR_COLORS, a.hairColor);
    const style = find(HAIR_STYLES, a.hairStyle);
    if (color || style) {
      const c1 = color ? optLabel(color, locale).toLowerCase() : "";
      const s1 = style ? optLabel(style, locale).toLowerCase() : "";
      parts.push(fr ? `cheveux ${[c1, s1].filter(Boolean).join(" ")}` : `${[c1, s1].filter(Boolean).join(" ")} hair`);
    }
  }

  const eyes = find(EYE_OPTIONS, a.eyes);
  if (eyes && a.eyes !== "autre")
    parts.push(fr ? `yeux ${optLabel(eyes, locale).toLowerCase()}` : `${optLabel(eyes, locale).toLowerCase()} eyes`);

  const glasses = find(GLASSES_OPTIONS, a.glasses);
  if (glasses) parts.push(optLabel(glasses, locale).toLowerCase());

  const build = find(BUILD_OPTIONS, a.build);
  if (build && a.build !== "indeterminee")
    parts.push(fr ? `corpulence ${optLabel(build, locale).toLowerCase()}` : `${optLabel(build, locale).toLowerCase()} build`);

  const mobility = (a.mobility ?? [])
    .map((id) => find(MOBILITY_OPTIONS, id))
    .filter((x): x is Opt => !!x)
    .map((x) => optLabel(x, locale).toLowerCase());
  if (mobility.length) parts.push(mobility.join(", "));

  const wear = [
    find(HAT_OPTIONS, a.hat),
    ...(a.clothing ?? []).map((id) => find(CLOTHING_OPTIONS, id)),
    ...(a.extras ?? []).map((id) => find(EXTRA_OPTIONS, id)),
  ]
    .filter((x): x is Opt => !!x)
    .map((x) => optLabel(x, locale).toLowerCase());
  if (wear.length) parts.push((fr ? "porte " : "wears ") + wear.join(", "));

  return parts.join(", ");
}

/* ------------------------------------------------------------------ */
/* "Surprenez-moi" randomizers                                         */
/* ------------------------------------------------------------------ */

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** n distinct entries from a list (fewer if the list is shorter). */
function pickSome<T>(list: readonly T[], n: number): T[] {
  const pool = [...list];
  const out: T[] = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

/**
 * A complete, coherent appearance for parents who would rather not pick
 * through six sections. Human and animal characters draw from their own
 * option sets; everything stays editable afterwards.
 */
export function randomAppearance(isAnimal: boolean): CharacterAppearanceDraft {
  if (isAnimal) {
    const family = pick(ANIMAL_FAMILIES).id;
    const species = ANIMAL_SPECIES[family] ?? [];
    return {
      family,
      species: species.length ? pick(species).id : undefined,
      coat: pick(COAT_OPTIONS).id,
      size: pick(ANIMAL_SIZES).id,
      // Keep it light: 0 or 1 accessory, never a cluttered animal.
      accessories: Math.random() < 0.5 ? [pick(ANIMAL_ACCESSORIES).id] : [],
    };
  }
  // Hair: mostly a normal cut, occasionally a headscarf/bald option.
  const special = Math.random() < 0.15;
  return {
    skin: pick(SKIN_OPTIONS).id,
    hairStyle: special ? pick(HAIR_SPECIALS).id : pick(HAIR_STYLES).id,
    hairColor: special ? undefined : pick(HAIR_COLORS).id,
    eyes: pick(EYE_OPTIONS).id,
    glasses: Math.random() < 0.25 ? pick(GLASSES_OPTIONS).id : undefined,
    build: pick(BUILD_OPTIONS).id,
    mobility: [],
    hat: Math.random() < 0.3 ? pick(HAT_OPTIONS).id : undefined,
    clothing: pickSome(CLOTHING_OPTIONS, Math.random() < 0.5 ? 1 : 2).map((o) => o.id),
    extras: Math.random() < 0.35 ? [pick(EXTRA_OPTIONS).id] : [],
  };
}

/** Shape returned by randomAppearance (matches CharacterAppearance loosely). */
export type CharacterAppearanceDraft = {
  skin?: string;
  hairColor?: string;
  hairStyle?: string;
  eyes?: string;
  glasses?: string;
  build?: string;
  mobility?: string[];
  hat?: string;
  clothing?: string[];
  extras?: string[];
  family?: string;
  species?: string;
  coat?: string;
  size?: string;
  accessories?: string[];
};

/**
 * A random personality: one archetype's 3 traits, so the result always reads
 * as a coherent character rather than three contradictory chips.
 */
export function randomTraits(): string[] {
  return [...pick(ARCHETYPES).traits];
}
