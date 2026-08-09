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
  language: "fr" | "en";
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
    slug: "histoires-du-soir-en-vacances",
    language: "fr",
    title: "Partir en vacances léger : toutes les histoires du soir dans votre poche",
    excerpt:
      "La valise déborde déjà, et il reste les livres du soir. Bonne nouvelle : le rituel du coucher tient désormais dans un téléphone. Voici comment garder le moment histoire intact, où que vous soyez cet été.",
    tldr: [
      "Pas besoin d'emporter la bibliothèque : toute la collection Lunireve, à lire et à écouter, tient dans votre téléphone, en voiture, à la plage ou chez les grands-parents.",
      "Le rituel du coucher est l'ancre qui rassure les enfants quand le décor change : le garder en vacances aide à mieux dormir loin de la maison.",
      "Mode hors-ligne et version audio : l'histoire fonctionne même sans bonne connexion, et la voix prend le relais les soirs de fatigue après la plage.",
      "Les favoris suivent l'enfant : il retrouve ses histoires préférées partout, sur n'importe quel écran, sans rien transporter.",
    ],
    publishedAt: "2026-06-13",
    readingMinutes: 6,
    tag: "Vacances",
    cover: "cover-peach",
    sections: [
      {
        heading: "Le vrai problème des vacances : la valise et le rituel",
        paragraphs: [
          "Chaque été, la même scène se rejoue. La valise est pleine, on a pensé à la crème solaire, aux doudous, aux brassards, et puis l'enfant demande : et mes histoires ? Emporter cinq albums, c'est cinq albums de moins pour le reste, et ce sont rarement les bons le soir venu. Résultat : on part avec deux livres au hasard, et le rituel du coucher, si bien rodé à la maison, se grippe dès la première nuit ailleurs.",
          "Or le moment histoire n'est pas un détail de confort. C'est l'un des rares repères stables quand tout le décor change : nouvelle chambre, nouveaux bruits, lumière différente. Pour un enfant, retrouver la même histoire, la même voix, le même enchaînement d'étapes, c'est retrouver un morceau de chez soi au milieu de l'inconnu.",
        ],
      },
      {
        heading: "Toute la bibliothèque, sans rien transporter",
        paragraphs: [
          "C'est exactement là que le numérique rend service, sans rien enlever à la magie. Avec Lunireve, la collection entière tient dans votre téléphone : des dizaines d'histoires classées par âge, par thème et par durée, prêtes à lire ou à écouter. Plus de tri déchirant dans la valise, plus de livre oublié sur la table de nuit à la maison. L'enfant choisit le soir venu, selon son humeur, comme il le ferait devant son étagère.",
          "Et le téléphone est déjà dans votre poche. Dans la voiture pendant le trajet, dans le train, sous la tente, à l'hôtel ou chez les grands-parents, le rituel vous suit sans peser un gramme de plus. C'est la bibliothèque de chevet, en version sans bagage.",
        ],
      },
      {
        heading: "Hors-ligne et audio : pensés pour les soirs de vacances",
        paragraphs: [
          "Les vacances riment souvent avec mauvaise connexion : un gîte perdu, un camping, un avion. La version audio des histoires se lance et accompagne l'endormissement même quand l'écran reste dans le noir, ce qui est parfait après une longue journée au soleil quand plus personne n'a la force de lire à voix haute. La voix prend le relais, vous restez le câlin.",
          "L'audio a un autre avantage en déplacement : il occupe les longs trajets sans écran allumé. Une histoire écoutée les yeux fermés à l'arrière de la voiture vaut mieux qu'un dessin animé, et prépare déjà la sieste.",
        ],
      },
      {
        heading: "Garder le rituel, même quand tout change",
        paragraphs: [
          "Le secret d'un coucher serein en vacances tient en un mot : continuité. Gardez le même ordre qu'à la maison, même raccourci. Si le rituel habituel, c'est brossage de dents, histoire, câlin, dodo, conservez-le tel quel, même dans une chambre inconnue. L'enfant reconnaît la séquence et son cerveau comprend que c'est l'heure de dormir, où qu'il se trouve.",
          "Laissez l'enfant retrouver ses favoris. Une histoire déjà adorée, relue pour la dixième fois, rassure bien plus qu'une nouveauté un soir d'excitation. Ses favoris Lunireve le suivent partout, sur n'importe quel écran : il ouvre l'application et retrouve sa petite collection, intacte, comme à la maison.",
          "Et pourquoi ne pas faire des vacances le moment d'une histoire personnalisée ? Un récit où votre enfant devient le héros de l'été, du voyage ou de la plage, à créer en quelques minutes et à garder en souvenir. C'est le genre de petit supplément qui transforme une soirée de vacances en moment dont on se souvient.",
        ],
      },
    ],
  },
  {
    slug: "peur-du-noir",
    language: "fr",
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
    language: "fr",
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
    language: "fr",
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
  {
    slug: "combien-de-temps-dort-un-enfant",
    language: "fr",
    title: "Combien d'heures de sommeil pour votre enfant ? Le tableau par âge",
    excerpt:
      "Votre enfant de 4 ans se couche à 21h et se lève à 7h : est-ce assez ? Voici les repères par âge, les signes d'un manque de sommeil que les parents confondent souvent avec du caractère, et comment recaler l'heure du coucher sans conflit.",
    tldr: [
      "Repères par âge : 11 à 14 heures pour un enfant de 1 à 2 ans, 10 à 13 heures de 3 à 5 ans, 9 à 12 heures de 6 à 12 ans (siestes comprises pour les plus petits).",
      "Le manque de sommeil chez l'enfant ne ressemble pas à de la fatigue : il ressemble à de l'agitation, de l'opposition et des larmes faciles en fin de journée.",
      "Une revue de 2025 montre que les enfants de 6 à 12 ans qui dorment davantage obtiennent de meilleurs résultats aux tests cognitifs : le sommeil profond est le moment où le cerveau consolide ce qu'il a appris.",
      "Pour avancer un coucher trop tardif : reculez de 10 à 15 minutes tous les deux ou trois soirs, jamais d'une heure d'un coup, et gardez le même rituel du soir.",
    ],
    publishedAt: "2026-08-09",
    readingMinutes: 7,
    tag: "Sommeil",
    cover: "cover-night",
    sections: [
      {
        heading: "Les repères par âge, sans culpabiliser",
        paragraphs: [
          "Commençons par les chiffres, car c'est souvent la première question. Entre 1 et 2 ans, un enfant a besoin de 11 à 14 heures de sommeil sur 24 heures, siestes comprises. Entre 3 et 5 ans, de 10 à 13 heures. Entre 6 et 12 ans, de 9 à 12 heures. Ces fourchettes sont larges, et c'est volontaire : un enfant de 4 ans qui dort 10 heures et se réveille en forme n'a pas de problème, même si son cousin du même âge en dort 12.",
          "Le bon indicateur n'est donc pas le chiffre exact, c'est la forme du matin. Un enfant suffisamment reposé se réveille de lui-même, ou se laisse réveiller sans drame, et n'a pas besoin de vingt minutes de câlin pour émerger. Si chaque matin ressemble à une négociation difficile, il manque probablement du sommeil, quel que soit le total affiché.",
          "Attention aussi au week-end : dormir deux heures de plus le samedi n'est pas un bonus, c'est le signe d'une dette accumulée pendant la semaine. Le sommeil ne se rattrape que partiellement.",
        ],
      },
      {
        heading: "Le manque de sommeil ne ressemble pas à de la fatigue",
        paragraphs: [
          "C'est le point que les parents découvrent avec le plus de soulagement. Chez l'adulte, la fatigue ralentit. Chez l'enfant, elle accélère. Un enfant en manque de sommeil devient agité, se disperse, rit trop fort, se met en colère pour un rien et fond en larmes à la moindre contrariété en fin d'après-midi.",
          "Résultat : ces comportements sont souvent interprétés comme un trait de caractère, une phase difficile ou un problème d'éducation, alors qu'ils s'améliorent parfois en une semaine avec 45 minutes de sommeil supplémentaires. Avant de vous demander comment corriger un comportement, il vaut la peine de vérifier l'heure du coucher.",
          "Autres signaux discrets : s'endormir systématiquement en voiture sur de courts trajets, avoir du mal à rester attentif en fin de journée, ou réclamer beaucoup plus de contact physique que d'habitude.",
        ],
      },
      {
        heading: "Ce que le sommeil fabrique pendant la nuit",
        paragraphs: [
          "Dormir n'est pas une pause : c'est un travail. Pendant le sommeil profond, dont les enfants ont bien plus que les adultes, le cerveau rejoue et consolide ce qu'il a appris dans la journée, y compris les correspondances entre les lettres et les sons pour un enfant qui apprend à lire. Une revue de 2025 a mesuré que les enfants de 6 à 12 ans qui dorment davantage obtiennent des scores cognitifs significativement meilleurs.",
          "Autrement dit, l'heure du coucher est un levier scolaire au moins aussi puissant que les devoirs du soir. Une demi-heure de sommeil en plus vaut souvent mieux qu'une demi-heure d'exercices supplémentaires sur un enfant déjà fatigué.",
        ],
      },
      {
        heading: "Recaler un coucher trop tardif, sans conflit",
        paragraphs: [
          "La méthode qui fonctionne tient en une phrase : par petits pas. Si votre enfant s'endort à 22h et que la cible est 20h30, n'annoncez surtout pas le nouvel horaire d'un coup. Le corps ne suit pas, l'enfant tourne dans son lit pendant une heure, et l'expérience se solde par un échec qui rend la suite plus difficile.",
          "Avancez plutôt le coucher de 10 à 15 minutes tous les deux ou trois soirs. Ce décalage est trop petit pour être ressenti, et il devient une nouvelle habitude avant que l'enfant ait eu le temps de protester. Comptez deux à trois semaines pour un décalage d'une heure et demie : c'est long, mais c'est la seule approche qui tienne dans la durée.",
          "Deuxième ingrédient : la régularité du rituel. Le cerveau apprend à reconnaître une séquence. Même ordre, mêmes gestes, même histoire du soir : bain, pyjama, dents, une histoire, câlin, lumière. Cette prévisibilité agit comme un signal biologique bien plus efficace que l'injonction de dormir.",
          "Troisième ingrédient : la lumière. Baissez l'éclairage de la maison une heure avant le coucher et sortez les écrans du dernier moment de la journée. La lumière du soir dit au cerveau qu'il fait encore jour, et retarde d'autant l'endormissement.",
        ],
      },
      {
        heading: "Quand consulter",
        paragraphs: [
          "Certains signes méritent l'avis de votre médecin plutôt qu'un ajustement de routine : un ronflement bruyant presque toutes les nuits, des pauses respiratoires pendant le sommeil, une somnolence importante en journée malgré des nuits qui semblent suffisantes, ou des réveils nocturnes multiples qui persistent pendant des mois.",
          "Ce sont des situations qui ont des explications médicales identifiables et qui se traitent bien. Le reste du temps, l'immense majorité des difficultés de sommeil des enfants se règle avec de la régularité, un rituel apaisant et un peu de patience.",
        ],
      },
    ],
  },
  {
    slug: "vocabulaire-lecture-a-voix-haute",
    language: "fr",
    title: "Pourquoi 10 minutes de lecture par soir changent le vocabulaire de votre enfant",
    excerpt:
      "Les livres pour enfants contiennent des mots que la conversation quotidienne n'utilise presque jamais. C'est précisément là que se joue l'écart de vocabulaire, et dix minutes par soir suffisent à le combler.",
    tldr: [
      "Les bébés à qui l'on fait la lecture dès six mois montrent une progression du vocabulaire compris nettement supérieure à ceux à qui l'on ne lit pas.",
      "Les livres utilisent un vocabulaire bien plus riche que la conversation ordinaire : c'est la source principale de mots nouveaux avant l'école.",
      "Les enfants avec un rituel du soir centré sur le langage à trois ans ont de meilleures compétences langagières à cinq ans.",
      "Ce qui compte n'est pas la performance de lecture mais l'échange : commenter, questionner, laisser l'enfant finir les phrases.",
    ],
    publishedAt: "2026-08-05",
    readingMinutes: 6,
    tag: "Apprentissage",
    cover: "cover-meadow",
    sections: [
      {
        heading: "Les livres parlent une autre langue que nous",
        paragraphs: [
          "Dans une journée ordinaire, un enfant entend beaucoup de mots, mais presque toujours les mêmes : les mots du quotidien, de la table, de l'habillage, du trajet. La conversation familiale, aussi riche soit-elle, tourne naturellement autour d'un vocabulaire restreint et concret.",
          "Les livres, eux, font entrer d'autres mots : un vaisseau, une clairière, hésiter, murmurer, apercevoir. Ce sont exactement les mots que l'enfant retrouvera plus tard dans les consignes scolaires et les textes qu'on lui demandera de comprendre. Lire à voix haute est le moyen le plus simple et le plus naturel de les lui donner, longtemps avant qu'il sache lire lui-même.",
        ],
      },
      {
        heading: "Ce que montrent les études",
        paragraphs: [
          "Les recherches convergent depuis vingt ans. Les bébés à qui l'on fait la lecture régulièrement à partir de six mois montrent une progression très supérieure du vocabulaire compris vers dix-huit mois, comparés à ceux à qui l'on ne lit pas. L'effet ne s'arrête pas là : des travaux présentés aux Pediatric Academic Societies ont montré que la lecture précoce influence encore les compétences en lecture et en vocabulaire quatre ans plus tard, au moment de l'entrée à l'école.",
          "Une revue publiée dans Sleep Medicine Reviews ajoute un élément intéressant pour les parents pressés : les enfants dont le rituel du soir est centré sur le langage à trois ans ont de meilleures compétences langagières à cinq ans. Le moment du coucher n'est donc pas seulement pratique, il est particulièrement efficace, sans doute parce qu'il est calme, répété et associé à un plaisir.",
        ],
      },
      {
        heading: "Dix minutes suffisent, à une condition",
        paragraphs: [
          "La bonne nouvelle : il ne s'agit pas d'y passer une heure. Dix minutes par soir, tous les soirs, produisent plus d'effet qu'une heure le dimanche. La régularité prime largement sur la durée.",
          "La condition, en revanche, est que la lecture soit un échange et non une récitation. Un adulte qui lit vite, d'une traite, pour finir, transmet beaucoup moins qu'un adulte qui s'arrête, montre une image, demande ce qui va se passer, ou reformule un mot difficile en une phrase simple. C'est dans ces micro-pauses que le vocabulaire s'installe.",
          "Trois réflexes suffisent. Un : nommez le mot difficile au lieu de le contourner (« il était perplexe, ça veut dire qu'il ne comprenait pas et que ça l'embêtait un peu »). Deux : posez une question ouverte par page, pas trois (« pourquoi il a fait ça, à ton avis ? »). Trois : laissez l'enfant finir les phrases qu'il connaît par cœur, même si cela ralentit.",
        ],
      },
      {
        heading: "Relire le même livre n'est pas une perte de temps",
        paragraphs: [
          "Tous les parents connaissent la demande : encore celle-là, la même que hier, et qu'avant-hier. C'est fastidieux pour l'adulte, mais c'est précieux pour l'enfant. La première lecture sert à suivre l'histoire. Ce n'est qu'aux lectures suivantes, quand l'intrigue n'occupe plus toute l'attention, que l'enfant se met à remarquer les mots eux-mêmes, leur ordre, leur sonorité.",
          "C'est aussi pour cela qu'un enfant qui réclame la même histoire dix soirs de suite en retient parfois des phrases entières : il ne mémorise pas par hasard, il est en train d'apprendre la langue de l'écrit.",
        ],
      },
      {
        heading: "Et quand l'enfant sait lire ?",
        paragraphs: [
          "Beaucoup de parents arrêtent la lecture du soir dès que l'enfant déchiffre seul. C'est dommage, et un peu tôt. Un enfant de sept ans comprend à l'oral des textes bien plus complexes que ceux qu'il peut lire lui-même sans effort. Continuer à lui lire des histoires plus longues, avec un vocabulaire plus riche, lui donne accès à des mots et à des structures qu'il ne rencontrerait pas seul avant plusieurs années.",
          "Le compromis qui fonctionne bien : l'enfant lit une page, vous lisez le reste. Il garde la fierté de lire, vous gardez la richesse du texte, et le rituel du soir survit à l'apprentissage de la lecture.",
        ],
      },
    ],
  },
  {
    slug: "coleres-enfant-histoires",
    language: "fr",
    title: "Grosses colères : ce qui se passe dans sa tête, et comment les histoires aident",
    excerpt:
      "Une colère d'enfant n'est pas un caprice à mater, c'est un cerveau débordé par une émotion trop grande pour lui. Voici ce qui se joue vraiment, ce qui aide sur le moment, et pourquoi les histoires travaillent pendant les moments calmes.",
    tldr: [
      "Pendant la crise, la partie du cerveau qui raisonne est hors service : expliquer, argumenter ou punir n'a aucun effet tant que la tempête n'est pas retombée.",
      "Sur le moment, trois choses aident : la sécurité, le calme de l'adulte et très peu de mots. Les explications viennent après.",
      "Le vrai travail se fait à froid, quand l'enfant est apaisé : c'est là qu'il peut mettre des mots sur ce qui s'est passé.",
      "Les histoires sont un outil idéal pour ce moment à froid : le personnage vit la colère à la place de l'enfant, ce qui lui permet d'en parler sans se sentir jugé.",
    ],
    publishedAt: "2026-08-02",
    readingMinutes: 7,
    tag: "Émotions",
    cover: "cover-peach",
    sections: [
      {
        heading: "Ce qui se passe vraiment pendant une colère",
        paragraphs: [
          "Vu de l'extérieur, une grosse colère ressemble à une provocation : l'enfant crie, se jette au sol, refuse tout. Vu de l'intérieur, c'est autre chose. Le cerveau d'un enfant de deux à six ans dispose d'un système d'alerte émotionnel déjà pleinement fonctionnel, et d'un système de régulation encore en construction, qui ne finira pas de mûrir avant l'adolescence, et même au-delà.",
          "Concrètement, l'émotion monte à pleine puissance, et le frein n'est pas encore installé. L'enfant ne choisit pas de perdre le contrôle : il le perd réellement. C'est pour cela que raisonner pendant la crise ne marche jamais. Vous vous adressez à une partie du cerveau momentanément indisponible.",
          "Cela ne signifie pas qu'il faut tout accepter. Cela signifie que le moment de la crise n'est pas le moment de l'apprentissage.",
        ],
      },
      {
        heading: "Sur le moment : sécurité, calme, peu de mots",
        paragraphs: [
          "Trois principes suffisent pendant la crise. D'abord la sécurité : écarter ce qui peut blesser, rester à proximité, éventuellement proposer un contact physique que l'enfant peut refuser. Ensuite votre propre calme, qui n'est pas un détail de posture : un adulte qui hausse le ton fait monter l'intensité, un adulte qui reste posé fait redescendre la courbe plus vite.",
          "Enfin, peu de mots. Une phrase courte, répétée sans énervement : « je vois que tu es très en colère, je reste là ». Ni négociation, ni menace, ni discours. Nommer l'émotion, sans la juger, aide l'enfant à comprendre ce qui lui arrive et lui montre que vous ne partez pas.",
          "Et si la colère survient en public, avec le regard des autres sur vous ? La règle ne change pas, seule votre gêne change. Écartez-vous si vous pouvez, et tenez la même ligne : c'est le comportement le plus efficace, quel que soit le public.",
        ],
      },
      {
        heading: "Le vrai travail se fait à froid",
        paragraphs: [
          "Une fois la tempête passée, souvent une demi-heure plus tard ou même le lendemain, l'enfant redevient capable de réfléchir à ce qui s'est produit. C'est à ce moment, et seulement à ce moment, que la conversation devient utile.",
          "L'objectif de cette conversation n'est pas d'obtenir des excuses. Il est de construire deux compétences : reconnaître les signes annonciateurs (« ça chauffe dans le ventre »), et disposer d'une ou deux stratégies concrètes à utiliser la prochaine fois (partir dans sa chambre, serrer un coussin, souffler fort trois fois).",
          "C'est un apprentissage lent. Il se compte en mois, pas en soirées, et il progresse par paliers, avec des rechutes. Un enfant qui met des mots sur sa colère au lieu de taper a déjà accompli quelque chose d'énorme, même si l'épisode reste bruyant.",
        ],
      },
      {
        heading: "Pourquoi les histoires marchent si bien à froid",
        paragraphs: [
          "Parler directement de la crise de la veille met beaucoup d'enfants sur la défensive : ils entendent un reproche, se referment, ou répondent qu'ils ne savent plus. Une histoire contourne cet obstacle avec élégance.",
          "Quand c'est un petit ours qui explose parce que sa tour s'écroule, l'enfant peut observer la scène de l'extérieur, sans être celui qu'on accuse. Il reconnaît pourtant très bien ce qu'il voit. Et comme le personnage est en sécurité dans le livre, l'enfant peut penser à sa propre colère sans la revivre.",
          "Ce déplacement offre aussi un vocabulaire prêt à l'emploi. Un enfant qui a entendu « la colère montait comme un volcan » dispose soudain d'une image pour décrire ce qu'il ressent. Or une émotion qu'on sait nommer est déjà, en partie, une émotion qu'on peut contenir.",
          "Le moment du coucher est particulièrement propice : l'enfant est calme, dans vos bras, sans enjeu. C'est le contexte idéal pour aborder des émotions difficiles par personnage interposé.",
        ],
      },
      {
        heading: "Personnaliser l'histoire, avec précaution",
        paragraphs: [
          "Une histoire où le héros porte le prénom de votre enfant et vit exactement sa situation peut être très puissante : la reconnaissance est immédiate. C'est d'ailleurs l'usage que beaucoup de familles font des histoires personnalisées.",
          "Une précaution toutefois : la veille d'une crise, un héros trop identique peut être vécu comme une leçon déguisée. Le bon dosage consiste à garder la situation reconnaissable, mais à laisser un peu d'écart : un autre âge, un animal, un décor différent. Assez proche pour qu'il se reconnaisse, assez loin pour qu'il ne se sente pas visé.",
          "Enfin, un repère utile : les colères qui restent très intenses et très fréquentes après six ou sept ans, celles qui s'accompagnent d'une réelle dangerosité pour l'enfant ou pour les autres, ou celles qui envahissent tous les moments de la journée méritent d'en parler à votre médecin. Le reste du temps, ce sont simplement les orages normaux d'un cerveau qui apprend.",
        ],
      },
    ],
  },
  {
    slug: "rentree-maternelle-preparer",
    language: "fr",
    title: "Première rentrée : préparer la séparation deux semaines à l'avance",
    excerpt:
      "Les larmes du premier matin d'école se préparent bien avant le jour J. Ce qui aide vraiment n'est pas de rassurer davantage, mais de rendre l'inconnu prévisible. Voici un plan simple sur deux semaines.",
    tldr: [
      "L'anxiété de séparation vient de l'imprévisible : votre travail consiste à transformer l'école en scénario connu, pas à promettre que tout ira bien.",
      "Deux semaines avant : recaler les horaires de sommeil décalés par l'été, par tranches de 15 minutes.",
      "Raconter la journée d'école dans l'ordre, plusieurs fois, jusqu'à ce que l'enfant la connaisse par cœur : c'est le meilleur anxiolytique.",
      "Le matin J : un au revoir court, chaleureux et sans hésitation. Les au revoir qui s'éternisent prolongent les pleurs au lieu de les apaiser.",
    ],
    publishedAt: "2026-07-29",
    readingMinutes: 6,
    tag: "École",
    cover: "cover-sea",
    sections: [
      {
        heading: "Ce que craint vraiment l'enfant",
        paragraphs: [
          "Un enfant qui pleure le matin de la rentrée n'a en général pas peur de l'école : il a peur de ne pas savoir ce qui va se passer, et de ne pas savoir si vous allez revenir. Ce sont deux angoisses très concrètes, et toutes les deux ont une réponse concrète.",
          "C'est pourquoi les phrases générales rassurent assez peu. « Tout va bien se passer, tu vas voir » ne donne aucune information exploitable. « Tu vas accrocher ton manteau, puis tu iras t'asseoir sur le tapis avec la maîtresse, et je viendrai te chercher juste après le goûter » en donne beaucoup. Le second type de phrase apaise nettement mieux, parce qu'il remplace l'inconnu par un scénario.",
        ],
      },
      {
        heading: "Deux semaines avant : le sommeil d'abord",
        paragraphs: [
          "L'été décale les horaires, parfois de plus d'une heure. Une rentrée abordée en dette de sommeil transforme la moindre contrariété en drame, et les premiers jours d'école en sont pleins.",
          "Reprenez donc les horaires deux semaines avant, par petits pas : coucher et lever avancés de 15 minutes tous les deux ou trois jours. C'est indolore à cette vitesse, et cela évite l'erreur classique du dimanche soir de rentrée où l'on demande soudain à un enfant couché à 22h tout l'été de dormir à 20h30.",
          "Profitez-en pour réinstaller le rituel du soir dans son format d'école : bain, pyjama, une histoire, dodo, à heure fixe. Le rituel lui-même est un signal de sécurité, et il sera précieux les soirs de rentrée où la journée aura été chargée en émotions.",
        ],
      },
      {
        heading: "Raconter la journée, encore et encore",
        paragraphs: [
          "C'est l'outil le plus efficace, et le plus sous-utilisé. Racontez la journée d'école dans l'ordre chronologique, comme une histoire : l'arrivée, le portemanteau, les copains, le tapis, la récréation, le repas, la sieste pour les plus petits, le goûter, et surtout le moment où vous revenez. Répétez ce récit plusieurs fois par semaine.",
          "L'objectif n'est pas d'informer une fois, mais de rendre le récit familier au point que l'enfant puisse le raconter lui-même. Un scénario qu'on connaît par cœur cesse d'être menaçant.",
          "Allez voir l'école de l'extérieur si c'est possible, montrez la porte par laquelle il entrera et celle par laquelle vous reviendrez. Nommez l'adulte référent si vous le connaissez. Chaque détail concret ajouté au scénario retire un peu d'inconnu.",
          "Les histoires sur ce thème jouent le même rôle : un personnage qui vit sa première rentrée, qui a un peu peur, et dont la journée se termine bien, offre à votre enfant une répétition générale émotionnelle, en sécurité, dans vos bras.",
        ],
      },
      {
        heading: "Le matin J : court, chaleureux, sans hésitation",
        paragraphs: [
          "Le paradoxe du premier matin est bien documenté par les enseignants : plus l'au revoir s'étire, plus les pleurs durent. Un parent qui revient sur ses pas, qui hésite à la porte, qui repart puis se retourne, communique involontairement le message inverse de celui qu'il veut donner : cet endroit est peut-être dangereux, puisque j'ai du mal à t'y laisser.",
          "Le format qui fonctionne : un câlin franc, une phrase rituelle toujours identique (« je t'aime, je reviens après le goûter »), et vous partez. Court ne veut pas dire froid : c'est chaleureux et net à la fois.",
          "Les enseignants racontent presque tous la même chose : les pleurs cessent en général très peu de temps après le départ du parent. Vous pouvez demander à être rassuré en fin de matinée, la plupart des écoles le font volontiers.",
          "Surveillez aussi vos propres signaux. Les enfants lisent l'inquiétude sur nos visages avec une précision redoutable. Montrer que vous faites confiance à cet endroit et à ces adultes autorise l'enfant à s'y attacher à son tour.",
        ],
      },
      {
        heading: "Les premières semaines, et quand s'inquiéter",
        paragraphs: [
          "Attendez-vous à des retours en arrière : un enfant qui entre en pleurant le lundi après un week-end tranquille, ou une régression passagère à la maison (pipi au lit, demandes de bébé, sommeil agité). C'est fréquent et cela s'estompe généralement en quelques semaines.",
          "Gardez le soir comme sas de décompression plutôt que comme interrogatoire. « Raconte-moi ta journée » produit souvent un « rien ». « Tu as joué avec qui ? » ou « c'était quoi le plus rigolo ? » ouvre davantage.",
          "Si, après six à huit semaines, la détresse reste intense chaque matin, si elle s'accompagne de maux de ventre quotidiens ou d'un refus scolaire net, parlez-en à l'enseignant puis à votre médecin. Cela se travaille très bien, et plus tôt on en parle, plus vite cela se dénoue.",
        ],
      },
    ],
  },
  {
    slug: "enfant-bilingue-deux-langues",
    language: "fr",
    title: "Élever un enfant bilingue : ce que la recherche dit vraiment",
    excerpt:
      "Deux langues, est-ce trop pour un petit ? Est-ce que ça retarde la parole ? Faut-il commencer tôt ? Voici ce que montrent les études, et comment les histoires du soir dans les deux langues font une grande partie du travail.",
    tldr: [
      "Le bilinguisme ne retarde pas le langage : les enfants bilingues atteignent les grandes étapes au même rythme, à condition d'être exposés régulièrement aux deux langues.",
      "L'exposition précoce compte : les enfants exposés entre 0 et 3 ans obtiennent de meilleurs résultats que ceux exposés plus tard, en lecture comme en conscience phonologique.",
      "Français et anglais partagent le même alphabet : apprendre à lire dans les deux s'entraide au lieu de se concurrencer.",
      "Ce qui fait la différence n'est pas le nombre d'heures de cours, mais la quantité de langue entendue dans des moments qui ont du sens : la lecture du soir en fait partie.",
    ],
    publishedAt: "2026-07-25",
    readingMinutes: 7,
    tag: "Apprentissage",
    cover: "cover-indigo",
    sections: [
      {
        heading: "Non, deux langues ne sont pas de trop",
        paragraphs: [
          "C'est l'inquiétude numéro un des parents, souvent alimentée par un proche bien intentionné : et s'il mélangeait tout, s'il parlait plus tard, s'il ne maîtrisait aucune des deux ? La recherche est claire et rassurante sur ce point. Les enfants bilingues atteignent les grandes étapes du langage au même rythme que les autres, dès lors qu'ils sont exposés de façon régulière et dans des situations qui ont du sens pour eux.",
          "Le mélange de mots entre deux langues, que les parents remarquent souvent vers deux ou trois ans, n'est pas un signe de confusion. C'est un comportement normal et observé partout : l'enfant utilise le mot qu'il a sous la main, exactement comme un adulte bilingue le fait encore à l'âge adulte. Cela se réorganise tout seul.",
          "Un point mérite tout de même d'être dit franchement : à un âge donné, un enfant bilingue peut connaître un peu moins de mots dans chaque langue prise séparément, tout en en connaissant davantage au total. Si l'on ne compte que dans une seule langue, on peut donc s'alarmer à tort.",
        ],
      },
      {
        heading: "L'âge d'exposition compte plus que les cours",
        paragraphs: [
          "Les travaux qui comparent les âges d'exposition vont tous dans le même sens : une exposition précoce, entre 0 et 3 ans, donne de meilleurs résultats qu'une exposition démarrée entre 3 et 6 ans, en lecture, en conscience phonologique et en compétence globale dans les deux langues.",
          "Cela ne veut pas dire qu'il est trop tard à cinq ou huit ans, loin de là. Cela veut dire que les toutes premières années sont une fenêtre particulièrement favorable, notamment pour l'accent et pour la perception fine des sons.",
          "Et surtout, ce qui prédit le mieux le niveau dans une langue, c'est la quantité de cette langue effectivement entendue. Pas le nombre d'heures de cours : le volume d'exposition réelle, dans des échanges qui ont du sens.",
        ],
      },
      {
        heading: "Lire dans deux langues qui partagent l'alphabet",
        paragraphs: [
          "Le français et l'anglais utilisent le même système d'écriture, et cela change tout au moment de l'apprentissage de la lecture. Les enfants qui apprennent à lire dans deux langues partageant un alphabet progressent souvent plus vite : ce qu'ils comprennent d'un côté (qu'une lettre code un son, que l'on lit de gauche à droite, que les mots se découpent en syllabes) se transfère de l'autre.",
          "Certains travaux vont plus loin et observent chez ces enfants un avantage de conscience phonologique par rapport à leurs camarades monolingues, c'est-à-dire une meilleure capacité à percevoir et manipuler les sons de la langue. C'est une compétence-clé pour apprendre à lire.",
          "Les bénéfices ne s'arrêtent pas à la lecture. Les enfants bilingues montrent en moyenne de meilleures performances en mémoire de travail et en fonctions exécutives : la souplesse mentale, la capacité à se concentrer et à ignorer les distractions.",
        ],
      },
      {
        heading: "Ce qui fonctionne à la maison",
        paragraphs: [
          "La stratégie la plus répandue reste la plus simple : une personne, une langue. Chaque parent parle systématiquement sa langue, ce qui donne à l'enfant un repère stable. Elle n'est pas obligatoire, mais elle a le mérite de la clarté.",
          "Autre approche courante et efficace dans les familles où les deux parents partagent la même langue : la langue de la maison. On parle la langue minoritaire à l'intérieur, l'école se charge de l'autre.",
          "Dans les deux cas, le vrai enjeu est le volume et la qualité de l'exposition à la langue la plus fragile, celle qui n'est pas celle de l'école. C'est elle qui a besoin de moments dédiés, réguliers et agréables.",
          "Un dernier conseil, très concret : ne corrigez pas la langue employée. Un enfant qui répond en français à une question posée en anglais comprend parfaitement l'anglais. Reformulez naturellement dans la langue cible et poursuivez. La correction insistante donne envie d'éviter la langue, ce qui est exactement l'inverse du but.",
        ],
      },
      {
        heading: "L'histoire du soir, l'outil le plus sous-estimé",
        paragraphs: [
          "Dix minutes de lecture par soir dans la langue fragile représentent, sur une année, plus de soixante heures d'exposition à un vocabulaire riche, dans un contexte calme, affectif et répété. Peu de dispositifs font mieux pour ce niveau d'effort.",
          "Un format qui fonctionne bien : alterner les soirs, une langue chaque soir, plutôt que de traduire la même histoire ligne à ligne. La traduction simultanée pousse l'enfant à n'écouter que la langue qu'il maîtrise le mieux.",
          "L'audio est un renfort précieux, particulièrement quand aucun parent ne parle la langue en question comme langue maternelle : l'enfant entend une prononciation naturelle, et il l'entend dans un moment qu'il aime.",
          "C'est d'ailleurs pour cette raison que Lunireve existe en français et en anglais, avec la même histoire disponible dans les deux langues : un soir dans l'une, un soir dans l'autre, sans rien changer au rituel.",
        ],
      },
    ],
  },
];

export function findArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}

/**
 * Internal linking (#): articles sharing the current article's tag come first,
 * padded with the most recent others so we always surface `limit` cards.
 */
export function relatedArticles(slug: string, limit = 3): BlogArticle[] {
  const current = findArticle(slug);
  if (!current) return [];
  // Same language only — never suggest an FR article on an EN page.
  const pool = blogArticles.filter(
    (a) => a.slug !== slug && a.language === current.language
  );
  const sameTag = pool.filter((a) => a.tag === current.tag);
  const others = pool.filter((a) => a.tag !== current.tag);
  return [...sameTag, ...others].slice(0, limit);
}

/** Articles for one site language (blog index, sitemap). */
export function articlesForLocale(locale: string): BlogArticle[] {
  const wanted = locale === "en" ? "en" : "fr";
  const matches = blogArticles.filter((a) => a.language === wanted);
  // No article written in this language yet: show the full catalogue rather
  // than an empty page (the EN pipeline will fill real pairs later).
  return matches.length > 0 ? matches : blogArticles;
}
