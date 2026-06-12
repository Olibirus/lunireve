/**
 * Public blog mock content, Phase 2 reads from the blog_posts table
 * (AI-assisted writing + human review before publish, per brief).
 */

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  tag: string;
  cover: string; // cover-* gradient class
  body: string[];
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "peur-du-noir",
    title: "5 histoires pour apprivoiser la peur du noir",
    excerpt:
      "La peur du noir touche près d'un enfant sur deux entre 3 et 8 ans. La bonne nouvelle : les histoires sont l'un des outils les plus doux pour l'apprivoiser.",
    publishedAt: "2026-05-20",
    readingMinutes: 4,
    tag: "Émotions",
    cover: "cover-night",
    body: [
      "Vers trois ans, l'imagination des enfants explose, et avec elle, les monstres sous le lit. La peur du noir n'est pas un caprice : c'est le signe d'un cerveau qui apprend à se représenter ce qu'il ne voit pas. Autrement dit, c'est une étape, pas un problème.",
      "Les histoires jouent ici un rôle que peu d'outils peuvent égaler. En suivant un héros qui traverse la nuit et en ressort grandi, l'enfant fait l'expérience, en sécurité, blotti contre vous, que l'obscurité peut être traversée. Les psychologues appellent cela l'exposition narrative ; les enfants appellent cela une bonne histoire.",
      "Quelques règles simples pour choisir la bonne histoire : un héros à peu près de l'âge de l'enfant, une peur nommée clairement (jamais minimisée), et une fin où le héros s'en sort par ses propres moyens, pas grâce à un adulte qui allume la lumière.",
      "Sur Lunireve, la collection « Émotions » réunit des histoires écrites précisément pour ces moments-là. Le renard qui ne voulait pas dormir, par exemple, suit Filo qui découvre que la nuit a ses propres trésors. À lire le soir, lumière tamisée, sous la couette.",
      "Et si la peur persiste fortement après 8 ans ou perturbe le sommeil chaque nuit, parlez-en à votre pédiatre, les histoires accompagnent, elles ne remplacent pas.",
    ],
  },
  {
    slug: "lire-a-voix-haute",
    title: "Pourquoi lire à voix haute change tout",
    excerpt:
      "Quinze minutes de lecture à voix haute par jour : c'est l'habitude la mieux documentée pour le développement du langage. Voici ce que dit la recherche, et comment s'y tenir.",
    publishedAt: "2026-06-02",
    readingMinutes: 5,
    tag: "Rituel",
    cover: "cover-meadow",
    body: [
      "Un enfant à qui on lit chaque jour entend environ 1,4 million de mots de plus avant son entrée au CP qu'un enfant à qui on ne lit jamais. Ce chiffre, issu d'une étude de l'Ohio State University, résume à lui seul pourquoi le rituel du soir vaut tous les programmes éducatifs.",
      "Mais le vocabulaire n'est que la partie visible. Lire à voix haute construit l'attention conjointe, cette capacité à se concentrer à deux sur un même objet, qui prédit la réussite scolaire mieux que bien des tests. Et surtout, cela associe la lecture au plaisir et à la sécurité affective, pas à l'effort.",
      "Le plus dur n'est pas de commencer, c'est de tenir. Trois astuces qui marchent : ancrer la lecture au même moment chaque soir (après le brossage de dents, avant le câlin), laisser l'enfant choisir l'histoire (même si c'est la même pendant deux semaines), et garder les soirs « sans énergie » une version audio sous la main.",
      "C'est exactement pour ces soirs-là que chaque histoire Lunireve existe aussi en version audio : la voix prend le relais, vous restez blottis ensemble, et le rituel tient bon même quand la journée a été longue.",
      "Quinze minutes. Chaque soir. Dans dix ans, ce sera peut-être le souvenir d'enfance qu'ils défendront le plus férocement.",
    ],
  },
  {
    slug: "rituel-du-soir-sans-ecran",
    title: "Construire un rituel du soir sans écran (sans drame)",
    excerpt:
      "Remplacer la tablette par une histoire ne se décrète pas, ça se construit. Un plan en quatre soirs pour une transition en douceur.",
    publishedAt: "2026-06-09",
    readingMinutes: 4,
    tag: "Rituel",
    cover: "cover-indigo",
    body: [
      "Soyons honnêtes : si la tablette fait partie du coucher depuis des mois, l'enlever d'un coup produira exactement ce que vous imaginez. La transition réussie est progressive, prévisible et, c'est la clé, remplace le plaisir au lieu de le supprimer.",
      "Soir 1 et 2 : l'écran reste, mais l'histoire arrive après. On éteint la tablette dix minutes plus tôt que d'habitude, et on lit une histoire courte. L'enfant ne perd rien, il gagne un moment avec vous.",
      "Soir 3 : on inverse. L'histoire d'abord, puis cinq minutes d'écran « si tu en as encore envie ». La plupart des enfants, déjà apaisés par la lecture, négocient à peine.",
      "Soir 4 et suivants : l'écran sort de la chambre. À la place, l'enfant choisit : une histoire lue par vous, ou une histoire audio dans le noir. Le choix lui rend le contrôle que l'écran lui donnait, c'est ce contrôle qui lui manquait, pas la lumière bleue.",
      "Dernier conseil : tenez bon quatorze soirs. C'est le temps moyen pour qu'un nouveau rituel devienne « ce qu'on fait, c'est tout ». Après, c'est l'enfant qui le réclamera.",
    ],
  },
];

export function findArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}
