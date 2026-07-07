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
