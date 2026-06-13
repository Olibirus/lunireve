/**
 * FAQ content (#21/#28), grouped by section. Used by the dedicated /faq
 * page (accordion per section) and a shorter selection on the About page.
 */

export type FaqSection = {
  id: string;
  titleKey: string; // i18n key under faq.sections
  items: { q: string; a: string }[];
};

export const FAQ_FR: FaqSection[] = [
  {
    id: "howItWorks",
    titleKey: "howItWorks",
    items: [
      {
        q: "Comment fonctionne Lunireve ?",
        a: "Lunireve est une bibliothèque d'histoires pour les enfants de 1 à 12 ans, à lire et à écouter. Vous pouvez parcourir la bibliothèque gratuitement, créer un compte pour suivre les lectures, et générer des histoires personnalisées où votre enfant devient le héros.",
      },
      {
        q: "Faut-il un compte pour lire ?",
        a: "Non. Toute la bibliothèque et l'audio sont accessibles sans compte. Un compte gratuit débloque les favoris, l'historique, la reprise de lecture, les profils enfants et la création d'histoires personnalisées.",
      },
      {
        q: "Les histoires sont-elles écrites par des humains ?",
        a: "Nos histoires sont créées avec l'intelligence artificielle, selon une ligne éditoriale précise et un contrôle qualité continu. Nous l'assumons en toute transparence. Seuls les livres personnalisés imprimés sont relus page par page par un humain avant impression.",
      },
      {
        q: "À partir de quel âge ?",
        a: "De 1 à 12 ans. Chaque histoire est classée par tranche d'âge (1-2, 3-4, 5-6, 7-8, 9-10, 11-12 ans) et sa longueur est adaptée à l'âge.",
      },
      {
        q: "Lunireve est-il disponible en plusieurs langues ?",
        a: "Lunireve est disponible en français, et la version anglaise arrive bientôt. D'autres langues suivront pour accompagner les familles partout dans le monde.",
      },
    ],
  },
  {
    id: "pricing",
    titleKey: "pricing",
    items: [
      {
        q: "Lunireve est-il gratuit ?",
        a: "Oui, la formule Découverte est gratuite : bibliothèque illimitée, audio, 1 profil enfant et 3 histoires personnalisées par mois. Des formules payantes (à venir) ajoutent plus de profils, plus d'histoires et des options avancées.",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui. Les abonnements payants seront sans engagement, résiliables en un clic, avec 14 jours de rétractation.",
      },
      {
        q: "Y a-t-il un essai gratuit ?",
        a: "Il n'y a pas besoin d'essai : la formule Découverte est gratuite pour toujours. Vous montez en gamme seulement si vous le souhaitez.",
      },
    ],
  },
  {
    id: "download",
    titleKey: "download",
    items: [
      {
        q: "Puis-je télécharger les histoires en PDF ?",
        a: "Oui. Chaque histoire se télécharge en PDF (avec un léger filigrane pour les comptes gratuits). Le PDF contient l'histoire, le quiz et le glossaire, joliment mis en page.",
      },
      {
        q: "Puis-je télécharger l'audio ?",
        a: "Le téléchargement de l'audio (MP3) est réservé aux comptes payants. L'écoute en ligne reste gratuite pour toutes les histoires.",
      },
      {
        q: "Puis-je utiliser les histoires à des fins commerciales ?",
        a: "Non. Les téléchargements sont réservés à un usage personnel et familial. L'usage commercial n'est pas autorisé avec un compte gratuit.",
      },
    ],
  },
  {
    id: "personalization",
    titleKey: "personalization",
    items: [
      {
        q: "Comment créer une histoire personnalisée ?",
        a: "Depuis votre espace, choisissez le héros (prénom, âge, trait), le thème, l'ambiance, la longueur et le style d'illustration. En quelques minutes, l'histoire est créée rien que pour votre enfant.",
      },
      {
        q: "Combien d'histoires personnalisées puis-je créer ?",
        a: "3 par mois avec la formule gratuite. Les formules payantes augmentent ce nombre.",
      },
      {
        q: "Mes histoires personnalisées sont-elles privées ?",
        a: "Oui, elles sont privées par défaut et n'apparaissent pas sur le site. Vous pouvez choisir de partager le lien avec vos proches.",
      },
    ],
  },
  {
    id: "privacy",
    titleKey: "privacy",
    items: [
      {
        q: "Où sont stockées mes données ?",
        a: "Vos données et celles de vos enfants restent hébergées en Europe, chiffrées, et ne sont jamais revendues.",
      },
      {
        q: "Puis-je supprimer mon compte et mes données ?",
        a: "Oui, à tout moment et sur simple demande. L'export et la suppression de vos données sont disponibles à hello@lunireve.com.",
      },
      {
        q: "Quelles informations sur l'enfant sont conservées ?",
        a: "Le strict minimum : un prénom et un âge. Aucune photo n'est demandée.",
      },
    ],
  },
  {
    id: "audio",
    titleKey: "audio",
    items: [
      {
        q: "Les histoires sont-elles disponibles en audio ?",
        a: "Oui. Chaque histoire peut être écoutée gratuitement en ligne, avec une voix douce pensée pour le coucher. L'audio est créé à la première écoute, puis conservé pour les fois suivantes.",
      },
      {
        q: "Peut-on écouter une histoire sans regarder l'écran ?",
        a: "Oui. Lancez la lecture audio, posez le téléphone et laissez l'histoire bercer votre enfant. Un mode d'écoute à écran noir, idéal pour l'endormissement, arrive prochainement.",
      },
      {
        q: "Les histoires audio aident-elles les enfants à s'endormir ?",
        a: "Oui. Le rythme, le ton et la longueur sont pensés pour accompagner l'endormissement et prolonger en douceur le rituel du soir.",
      },
    ],
  },
  {
    id: "account",
    titleKey: "account",
    items: [
      {
        q: "Comment créer un compte ?",
        a: "En quelques secondes avec une adresse email. Le compte gratuit donne accès aux favoris, à l'historique, à la reprise de lecture et aux profils enfants.",
      },
      {
        q: "Puis-je créer un profil pour chaque enfant ?",
        a: "Oui. La formule gratuite inclut un profil enfant, et les formules payantes en ajoutent davantage, chacun avec son avatar, ses favoris et sa série de lecture.",
      },
      {
        q: "Lunireve fonctionne-t-il sur mobile et tablette ?",
        a: "Oui. Le site est conçu d'abord pour le mobile, parfait pour la lecture du soir dans une chambre sombre, et fonctionne aussi sur tablette et ordinateur.",
      },
    ],
  },
];

/** English mirror (same structure). */
export const FAQ_EN: FaqSection[] = [
  {
    id: "howItWorks",
    titleKey: "howItWorks",
    items: [
      {
        q: "How does Lunireve work?",
        a: "Lunireve is a library of stories for children ages 1 to 12, to read and to listen to. Browse the library for free, create an account to track reading, and generate personalised stories where your child is the hero.",
      },
      {
        q: "Do I need an account to read?",
        a: "No. The whole library and audio are free without an account. A free account unlocks favourites, history, resume reading, child profiles and personalised story creation.",
      },
      {
        q: "Are the stories written by humans?",
        a: "Our stories are created with artificial intelligence, under a precise editorial line and continuous quality control. We're fully transparent about it. Only personalised printed books are proofread page by page by a human before printing.",
      },
      {
        q: "From what age?",
        a: "From 1 to 12 years old. Each story is sorted by age band and its length is adapted to the age.",
      },
      {
        q: "Is Lunireve available in several languages?",
        a: "Lunireve is available in French, with the English version coming soon. More languages will follow, to support families everywhere.",
      },
    ],
  },
  {
    id: "pricing",
    titleKey: "pricing",
    items: [
      {
        q: "Is Lunireve free?",
        a: "Yes, the Discovery plan is free: unlimited library, audio, 1 child profile and 3 personalised stories per month. Paid plans (coming soon) add more profiles, more stories and advanced options.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Paid subscriptions will be commitment-free, cancellable in one click, with a 14-day withdrawal period.",
      },
      {
        q: "Is there a free trial?",
        a: "No trial needed: the Discovery plan is free forever. You upgrade only if you want to.",
      },
    ],
  },
  {
    id: "download",
    titleKey: "download",
    items: [
      {
        q: "Can I download stories as PDF?",
        a: "Yes. Every story downloads as a PDF (with a light watermark on free accounts), containing the story, quiz and glossary, beautifully laid out.",
      },
      {
        q: "Can I download the audio?",
        a: "Audio (MP3) download is reserved for paid accounts. Online listening stays free for every story.",
      },
      {
        q: "Can I use the stories commercially?",
        a: "No. Downloads are for personal and family use only. Commercial use is not allowed with a free account.",
      },
    ],
  },
  {
    id: "personalization",
    titleKey: "personalization",
    items: [
      {
        q: "How do I create a personalised story?",
        a: "From your space, pick the hero (name, age, trait), theme, mood, length and illustration style. In minutes, the story is created just for your child.",
      },
      {
        q: "How many personalised stories can I create?",
        a: "3 per month on the free plan. Paid plans increase that.",
      },
      {
        q: "Are my personalised stories private?",
        a: "Yes, private by default and not shown on the site. You can choose to share the link with loved ones.",
      },
    ],
  },
  {
    id: "privacy",
    titleKey: "privacy",
    items: [
      {
        q: "Where is my data stored?",
        a: "Your data and your children's stays hosted in Europe, encrypted, and is never sold.",
      },
      {
        q: "Can I delete my account and data?",
        a: "Yes, anytime on request. Export and deletion are available at hello@lunireve.com.",
      },
      {
        q: "What child information is kept?",
        a: "The bare minimum: a first name and an age. No photo is ever requested.",
      },
    ],
  },
  {
    id: "audio",
    titleKey: "audio",
    items: [
      {
        q: "Are the stories available as audio?",
        a: "Yes. Every story can be listened to for free online, with a gentle voice made for bedtime. Audio is created on first listen, then kept for next time.",
      },
      {
        q: "Can I listen to a story without looking at the screen?",
        a: "Yes. Start audio playback, put the phone down and let the story lull your child. A black-screen listening mode, ideal for falling asleep, is coming soon.",
      },
      {
        q: "Do the audio stories help children fall asleep?",
        a: "Yes. The pace, tone and length are designed to ease the way to sleep and gently extend the evening ritual.",
      },
    ],
  },
  {
    id: "account",
    titleKey: "account",
    items: [
      {
        q: "How do I create an account?",
        a: "In seconds with an email address. The free account unlocks favourites, history, resume reading and child profiles.",
      },
      {
        q: "Can I create a profile for each child?",
        a: "Yes. The free plan includes one child profile, and paid plans add more, each with its own avatar, favourites and reading streak.",
      },
      {
        q: "Does Lunireve work on mobile and tablet?",
        a: "Yes. The site is built mobile-first, perfect for bedtime reading in a dark room, and also works on tablet and desktop.",
      },
    ],
  },
];
