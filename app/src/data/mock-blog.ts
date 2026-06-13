/**
 * Public blog content. Long-form, structured for SEO and social reposts
 * (feedback #29): every article opens with a TLDR, then h2 sections.
 * Phase 2 reads from blog_posts (AI-assisted writing + human review).
 */

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  tldr: string[];
  publishedAt: string | null;
  readingMinutes: number;
  tag: string;
  cover: string; // cover-* gradient class
  sections: ArticleSection[];
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "peur-du-noir",
    title: "Peur du noir : le guide complet pour aider votre enfant (sans forcer)",
    excerpt:
      "Près d'un enfant sur deux a peur du noir entre 3 et 8 ans. Pourquoi cette peur apparaît, ce qui marche vraiment pour l'apaiser, et comment les histoires deviennent votre meilleur allié.",
    tldr: [
      "La peur du noir est normale et touche environ 45% des 3-8 ans : c'est le signe d'une imagination qui se développe, pas un problème.",
      "Ce qui marche : valider la peur sans la nourrir, des rituels prévisibles, une veilleuse chaude, et des histoires où le héros traverse la nuit.",
      "Ce qui ne marche pas : se moquer, forcer l'extinction totale du jour au lendemain, ou vérifier sous le lit tous les soirs (cela confirme qu'il y aurait quelque chose à vérifier).",
      "Consultez un professionnel si la peur persiste fortement après 8-9 ans ou perturbe le sommeil toutes les nuits.",
    ],
    publishedAt: "2026-05-20",
    readingMinutes: 8,
    tag: "Émotions",
    cover: "cover-night",
    sections: [
      {
        heading: "Pourquoi les enfants ont peur du noir (et pourquoi c'est bon signe)",
        paragraphs: [
          "Vers deux ans et demi ou trois ans, quelque chose d'extraordinaire se produit dans le cerveau d'un enfant : il devient capable d'imaginer ce qu'il ne voit pas. C'est une révolution cognitive. C'est aussi, précisément, le moment où les monstres apparaissent sous le lit. La peur du noir n'est pas un caprice ni une régression : c'est la conséquence directe d'une imagination toute neuve qui tourne à plein régime, sans encore les outils pour distinguer le possible de l'impossible.",
          "Les études développementales situent le pic de cette peur entre 4 et 6 ans, avec une persistance fréquente jusqu'à 8 ans. Environ un enfant sur deux est concerné à un moment ou à un autre. Autrement dit : si votre enfant appelle depuis sa chambre tous les soirs, vous êtes dans la norme statistique, pas dans l'exception.",
          "Comprendre cela change tout dans la réponse à apporter. Une peur développementale ne se corrige pas, elle s'accompagne. L'objectif n'est pas de la faire disparaître ce soir, mais de donner à l'enfant des outils pour la traverser, à son rythme.",
        ],
      },
      {
        heading: "Les 5 réponses qui marchent vraiment",
        paragraphs: [
          "1. Valider sans nourrir. « Je vois que tu as peur, c'est normal, le noir peut impressionner » reconnaît l'émotion. À l'inverse, « il n'y a RIEN sous ton lit, regarde, je vérifie » part d'une bonne intention mais envoie un message paradoxal : s'il faut vérifier, c'est qu'il pourrait y avoir quelque chose. Validez l'émotion, pas l'hypothèse du monstre.",
          "2. Un rituel prévisible, chaque soir, dans le même ordre. Bain, pyjama, brossage de dents, histoire, câlin, dodo. Le cerveau des enfants adore la prévisibilité : chaque étape annonce la suivante et prépare physiologiquement au sommeil. Les chercheurs en sommeil pédiatrique observent un endormissement plus rapide et moins d'éveils nocturnes chez les enfants à rituel stable.",
          "3. Une veilleuse, oui, mais chaude et faible. La lumière bleue ou blanche freine la production de mélatonine. Choisissez une veilleuse orangée ou rouge, la plus faible possible, idéalement en dessous du niveau des yeux de l'enfant couché.",
          "4. Donner du pouvoir à l'enfant. Un « spray anti-monstres » (de l'eau avec trois gouttes de lavande), une peluche gardienne, une formule magique inventée ensemble : ces objets paraissent anecdotiques, mais ils transfèrent le contrôle de la situation du parent vers l'enfant. Et le sentiment de contrôle est exactement ce qui manque à un enfant qui a peur.",
          "5. Les histoires, l'outil le plus sous-estimé. On y vient en détail ci-dessous, car c'est probablement le levier le plus doux et le plus efficace.",
        ],
      },
      {
        heading: "Pourquoi les histoires fonctionnent si bien",
        paragraphs: [
          "Quand un enfant écoute une histoire où un petit renard a peur de la nuit puis découvre que la lune veille sur lui, il vit ce que les psychologues appellent une exposition narrative : il traverse la situation redoutée, mais en sécurité, blotti contre vous, à distance de la peur réelle. Son cerveau enregistre une expérience de nuit qui se termine bien.",
          "Trois critères rendent une histoire vraiment efficace contre la peur du noir. D'abord, un héros du même âge que l'enfant, ou à peine plus vieux, auquel il peut s'identifier. Ensuite, une peur nommée clairement, jamais minimisée : le héros a vraiment peur, comme l'enfant. Enfin, une résolution par les propres moyens du héros : c'est lui qui trouve la solution, pas un adulte qui allume la lumière à sa place.",
          "Relisez la même histoire autant de fois que l'enfant le demande. La répétition n'est pas de la paresse : c'est de la consolidation. Chaque relecture renforce le scénario « la nuit peut être traversée » dans sa mémoire.",
        ],
      },
      {
        heading: "Ce qu'il vaut mieux éviter",
        paragraphs: [
          "Se moquer ou comparer (« ta petite sœur n'a pas peur, elle ») ajoute de la honte à la peur, sans réduire la peur. Forcer l'extinction totale du jour au lendemain transforme la chambre en lieu de lutte. Et laisser l'enfant s'endormir chaque soir dans votre lit résout le symptôme ce soir mais renforce l'évitement : le message implicite est que sa chambre n'est effectivement pas un lieu sûr.",
          "La transition vers le noir complet, si vous y tenez, se fait par étapes : veilleuse plus faible, puis porte entrouverte avec lumière du couloir, puis extinction, sur plusieurs semaines. Chaque étape doit être confortable avant de passer à la suivante.",
        ],
      },
      {
        heading: "Quand consulter",
        paragraphs: [
          "La peur du noir devient un motif de consultation si elle persiste de façon intense après 8-9 ans, si elle provoque des crises de panique au moment du coucher, si elle perturbe le sommeil presque toutes les nuits pendant plusieurs mois, ou si elle s'accompagne d'autres anxiétés envahissantes dans la journée. Dans ces cas, parlez-en à votre médecin ou à un psychologue pour enfants : quelques séances de thérapie comportementale donnent d'excellents résultats sur les peurs spécifiques.",
          "Pour tous les autres soirs, il y a le rituel, la veilleuse, le spray magique, et une bonne histoire. La collection Émotions de Lunireve contient plusieurs histoires écrites précisément pour ces moments, dont « Le renard qui ne voulait pas dormir », à lire lumière tamisée, sous la couette.",
        ],
      },
    ],
  },
  {
    slug: "lire-a-voix-haute",
    title: "Lire à voix haute 15 minutes par jour : ce que dit vraiment la science",
    excerpt:
      "1,4 million de mots d'avance avant le CP. Un vocabulaire plus riche, une meilleure concentration, un lien renforcé. Le point complet sur l'habitude familiale la mieux documentée par la recherche.",
    tldr: [
      "Un enfant à qui on lit chaque jour entend environ 1,4 million de mots de plus avant 6 ans qu'un enfant à qui on ne lit jamais (étude Ohio State, 2019).",
      "Les bénéfices vont bien au-delà du vocabulaire : attention conjointe, compréhension des émotions, association lecture-plaisir qui prédit le goût de lire à l'adolescence.",
      "15 minutes suffisent. La régularité bat la durée : mieux vaut 10 minutes chaque soir que 45 minutes le dimanche.",
      "Les soirs sans énergie, une histoire audio écoutée ensemble maintient le rituel : ce qui compte, c'est le moment partagé.",
    ],
    publishedAt: "2026-06-02",
    readingMinutes: 9,
    tag: "Rituel",
    cover: "cover-meadow",
    sections: [
      {
        heading: "Le chiffre qui a tout changé : 1,4 million de mots",
        paragraphs: [
          "En 2019, des chercheurs de l'Ohio State University ont calculé ce qu'ils ont appelé le « million word gap ». Leur méthode était simple : compter les mots contenus dans les livres pour enfants, puis projeter l'exposition cumulée selon la fréquence de lecture. Résultat : un enfant à qui l'on lit cinq livres par jour entre la naissance et 5 ans entend environ 1,4 million de mots de plus qu'un enfant à qui l'on ne lit jamais. Même une seule histoire par jour crée un écart de près de 300 000 mots.",
          "Pourquoi ce chiffre compte : le vocabulaire des livres n'est pas celui des conversations. À table, nous utilisons environ 5 000 mots courants. Les albums pour enfants, eux, parlent de phare, de tempête, de verveine, de courage et de mystère. C'est cette exposition à des mots rares qui prédit le mieux la facilité de lecture au CP, car on déchiffre beaucoup plus facilement un mot qu'on a déjà entendu.",
        ],
      },
      {
        heading: "Ce qui se construit pendant que vous lisez (et qui ne se voit pas)",
        paragraphs: [
          "Le vocabulaire n'est que la partie émergée. Pendant une histoire, l'enfant exerce son attention conjointe : la capacité à se concentrer à deux sur un même objet, vous, lui et le livre. Cette compétence, qui paraît banale, est l'un des meilleurs prédicteurs de la réussite scolaire, car toute la classe repose sur elle : écouter ensemble, regarder ensemble, suivre ensemble.",
          "S'ajoute la théorie de l'esprit : comprendre que les personnages ont des intentions, des émotions, des croyances parfois fausses. Les histoires sont un simulateur d'émotions humaines. Les enfants à qui on lit beaucoup identifient mieux les émotions d'autrui, ce qui se voit ensuite dans leurs relations sociales.",
          "Et il y a l'association la plus précieuse de toutes : lecture = plaisir + sécurité affective. Un enfant pour qui le livre est synonyme de câlin du soir a toutes les chances de devenir un adolescent qui lit. Un enfant pour qui le livre est synonyme d'exercice scolaire, beaucoup moins. C'est le rituel qui fait le lecteur, pas la méthode de déchiffrage.",
        ],
      },
      {
        heading: "Comment tenir dans la durée : 4 règles concrètes",
        paragraphs: [
          "Règle 1 : ancrer, ne pas planifier. Les habitudes qui durent sont accrochées à une étape existante. « Après le brossage de dents, l'histoire » fonctionne ; « on lira quand on aura le temps » ne fonctionne jamais. L'heure exacte importe peu, l'ordre des étapes importe énormément.",
          "Règle 2 : laisser l'enfant choisir. Même si c'est la même histoire pendant trois semaines. Le choix nourrit l'autonomie, et la répétition consolide le vocabulaire bien mieux que la nouveauté permanente. Votre ennui est le prix de son apprentissage.",
          "Règle 3 : la régularité bat la durée. Dix minutes chaque soir valent mieux que trois quarts d'heure le dimanche. C'est la répétition quotidienne qui installe l'attente, et l'attente qui installe l'habitude.",
          "Règle 4 : prévoir le plan B des soirs épuisés. Il y aura des soirs où vous n'aurez plus de voix, plus de patience, plus rien. Ces soirs-là, une histoire audio écoutée ensemble, blottis dans le noir, maintient le rituel intact. C'est exactement pour ces soirs que chaque histoire Lunireve existe en version audio : la voix prend le relais, vous restez le câlin.",
        ],
      },
      {
        heading: "À chaque âge sa lecture",
        paragraphs: [
          "Avant 2 ans, l'enfant écoute la musique de votre voix plus que l'intrigue : privilégiez les textes courts, rythmés, répétitifs, et acceptez qu'il tourne les pages dans le désordre. De 3 à 5 ans, les intrigues simples avec un héros identifiable et une vraie fin prennent le relais ; c'est l'âge d'or du « encore ! ». De 6 à 8 ans, alternez : il lit une page, vous lisez la suivante, et continuez surtout à lire À l'enfant même quand il sait déchiffrer, car sa compréhension orale dépasse de plusieurs années sa capacité de lecture autonome. De 9 à 12 ans, les romans-feuilletons lus chapitre par chapitre transforment le rituel en rendez-vous.",
          "Le fil rouge, à tous les âges : ce moment n'est pas un cours. Pas de question piège à la fin, pas de « alors, qu'est-ce qu'on a appris ? ». Le quiz a sa place dans la journée s'il amuse l'enfant ; le soir appartient au plaisir.",
        ],
      },
    ],
  },
  {
    slug: "rituel-du-soir-sans-ecran",
    title: "Remplacer l'écran du soir par les histoires : le plan en 14 jours",
    excerpt:
      "Retirer la tablette du coucher sans crise, c'est possible, à condition de remplacer le plaisir au lieu de le supprimer. Méthode progressive, jour par jour, testée par des milliers de familles.",
    tldr: [
      "La lumière des écrans retarde la production de mélatonine de 30 à 90 minutes : c'est le pire moment de la journée pour une tablette.",
      "Supprimer l'écran d'un coup déclenche une crise ; le remplacer progressivement par un rituel plus agréable fonctionne en deux semaines.",
      "Le plan : jours 1-3, l'histoire s'ajoute à l'écran. Jours 4-7, l'histoire passe avant. Jours 8-14, l'écran sort de la chambre et l'enfant choisit son format (lu ou audio).",
      "Point clé : rendre le nouveau rituel désirable (choix de l'histoire, câlin, voix) plutôt que de rendre l'écran interdit.",
    ],
    publishedAt: "2026-06-09",
    readingMinutes: 7,
    tag: "Rituel",
    cover: "cover-indigo",
    sections: [
      {
        heading: "Pourquoi l'écran du soir pose un problème spécifique",
        paragraphs: [
          "Le problème n'est pas l'écran en soi, c'est l'heure. La lumière émise par les tablettes et téléphones, riche en longueurs d'onde bleues, signale au cerveau qu'il fait jour. Résultat mesuré en laboratoire : la production de mélatonine, l'hormone qui prépare l'endormissement, est retardée de 30 à 90 minutes. S'y ajoute l'excitation du contenu lui-même : les dessins animés sont conçus pour capter l'attention, pas pour la relâcher.",
          "Concrètement, un enfant qui regarde un écran jusqu'à 20h30 s'endort souvent vers 21h30-22h, avec un sommeil plus fragmenté. Sur une semaine d'école, le déficit s'accumule et se lit dans l'humeur du matin.",
          "Bonne nouvelle : le coucher est aussi le moment où le remplacement est le plus facile, car il existe une alternative qui offre exactement ce que l'enfant cherche vraiment (un moment avec vous, du contrôle, une transition douce) : l'histoire.",
        ],
      },
      {
        heading: "Jours 1 à 3 : ajouter sans retirer",
        paragraphs: [
          "Erreur classique : annoncer « à partir de ce soir, plus de tablette ». Vous transformez le coucher en champ de bataille et l'écran en trésor confisqué. La méthode efficace commence par ne rien enlever du tout.",
          "Pendant trois soirs, l'écran reste, mais il s'éteint dix minutes plus tôt que d'habitude, et ces dix minutes deviennent une histoire courte, lue contre vous. L'enfant ne perd rien : il gagne un moment. C'est la seule chose qu'il doit retenir de cette première phase. Choisissez des histoires courtes de 3 à 5 minutes et terminez toujours par le même petit geste (un câlin, une phrase rituelle), qui deviendra le signal de fin de journée.",
        ],
      },
      {
        heading: "Jours 4 à 7 : inverser l'ordre",
        paragraphs: [
          "Quatrième soir : l'histoire passe en premier. « D'abord l'histoire, et après tu peux regarder cinq minutes si tu en as encore envie. » Cette formulation est importante : l'écran n'est pas interdit, il est devenu optionnel.",
          "Ce qui se passe en pratique surprend la plupart des parents : un enfant déjà apaisé par dix minutes d'histoire et un câlin négocie à peine ses cinq minutes d'écran. Certains soirs il les prend, d'autres il les oublie. L'écran perd son statut d'événement central du coucher, et c'est exactement l'objectif de cette phase.",
          "Si l'enfant réclame fort ses cinq minutes : accordez-les sans commentaire. La victoire n'est pas qu'il renonce ce soir, c'est que l'ordre ait changé.",
        ],
      },
      {
        heading: "Jours 8 à 14 : l'écran sort de la chambre",
        paragraphs: [
          "Deuxième semaine : l'écran ne monte plus dans la chambre. À la place, l'enfant choisit chaque soir son format : une histoire lue par vous, ou une histoire audio écoutée dans le noir. Ce choix est la pièce maîtresse du plan. Ce que l'écran donnait à l'enfant, au fond, c'était du contrôle : il choisissait sa vidéo. Le choix de l'histoire lui rend ce contrôle, dans un cadre qui prépare au sommeil au lieu de le retarder.",
          "L'histoire audio joue ici un rôle précieux : elle offre une autonomie nouvelle (c'est « son » moment, comme la vidéo l'était) tout en gardant la chambre dans le noir. Beaucoup d'enfants adoptent un mélange : histoire lue les soirs de forme, histoire audio les autres soirs.",
          "Tenez quatorze soirs. C'est la durée moyenne observée pour qu'un nouveau rituel devienne « ce qu'on fait, c'est tout ». Après deux semaines, c'est généralement l'enfant qui réclame son histoire, et la tablette du soir devient un souvenir.",
        ],
      },
      {
        heading: "Les trois pièges à éviter",
        paragraphs: [
          "Piège 1 : diaboliser l'écran. « C'est mauvais pour toi » invite au débat et au désir. Préférez le factuel : « les écrans, c'est le jour ; le soir, c'est les histoires ». Une règle d'horaire se discute moins qu'un jugement moral.",
          "Piège 2 : céder une fois sur trois. Une exception le samedi, annoncée et cadrée, ne pose aucun problème. Des exceptions aléatoires selon votre fatigue, si : l'enfant apprend alors que la règle se négocie à l'usure, et il a raison.",
          "Piège 3 : garder votre propre téléphone à la main pendant l'histoire. Les enfants repèrent l'attention divisée avec une précision redoutable. Dix minutes de présence entière valent mieux que trente minutes en pointillés. Posez le téléphone dehors, lui aussi : le rituel vaut pour toute la famille.",
        ],
      },
    ],
  },
];

export function findArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}
