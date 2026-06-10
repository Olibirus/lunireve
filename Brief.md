# REQUIREMENTS TO HAVE:

1\) On each story page, recommend similar story (same age / theme)

2\) there should be a page for each main filter (theme, age, duration), when clicking on a category, it should funnel down the choice to have the right story:  
first choose style or age, then it trigger a new   
For example if we go by style:  
page style: then propose age page, then theme page then character page then all story available for this filter down.  
Note on all page there are the next filter secion as hero and below are all the stories available for the previous filtr.  
Example: once choose a style, it will ask the age filter, but below that filter it shows all story for the style. Once choose the age, it will open theme page which will show the different theme filter and all stories available for the age (preiously).  
The main pages are:   
\- homepage  
\- genre page (by genre)  
\- Age page  
\- Audio page/genre /theme  
\- interactive page  
\- duration page  
\- create a story page

the filter section (breadcrumb) are as follow (each filter open a new 'sub'page):  
\- genre page/age/theme/character/result of stories  
\- Age page/genre/theme/character/result of stories  
\- Audio page/genre/theme/result of stories  
\- interactive page/theme/result of stories \+ fitler to adjust age.  
\- duration page/result of stories  
\- create a story page/result of stories

There should always have a filter age on each page so it keep the existing selection (theme / genre...) but adjust to the age.

3\) loading bar for personalized story generation:  
Création de votre histoire en cours  
Loading...  
01  
En attente   
Votre histoire est dans la file d'attente.  
02  
Rédaction en cours  
Nous écrivons une histoire unique avec comme héros jdy \!  
03  
Création de l'illustration  
Nous concevons une jolie illustration pour accompagner votre histoire.  
04  
Finalisation  
Derniers réglages et dernières vérifications avant que vous puissiez lire votre histoire.

\[summary of the story\]

Make the loading faster at the beginning and longer at the end. if possible add a visual skeleton for loaing (to show the creation of the story)

4\) for personalize story (and maybe all story?): the audio should be only generated once a user click on the audio, then it will generate and store the audio in the DB. in this way we save cost and time for story that has nevre been listened to (save cost).

5\) after a personalized story is created suggest to share it with email or social media, but not publicquly on the website:  
add the message in a card belwo the story.  
Information et partage  
Cette histoire est privée et n'apparaît pas sur le site Mes Histoires du Soir. Cependant, vous êtes libre de partager l'adresse de votre histoire avec qui vous le souhaitez, que ce soit par e-mail ou sur les réseaux sociaux :  
\[LINK URL\]  copier

7\) create a story should be done in the user profile page. forcing user to create account if they don't have.

8\) when audio player modal is closed it stop the audio (media player popup should be always open to listen to audio, unless it is a paid user account. Possibility to minisize and read the story at the same time BUT, the windows should always be active (visible) in the browser. No background play, unless paid extra premium user.

9\) personalized story: loading time can be long: need to have the possibility to continue navigation while story is creating, there will be a notification a in app notification when it is done (and maybe email?)

10\) Need to have interactive story with different scenario (3 choices to continue the story) number of interaction depends on the age range. for example 1-2 years \= 2 interaction (3 choice each time). But older might have more interaction (always proposed 2 or 3 choices for each)

11\) should have personalized story interaction.

12\) rallye can be accessible for all created account, (free account \= small scales, and big scale for larger plan)

13\) in V3: have the possibility to clone voice: for parent or grand parent or kids to 'read' the story.  
Note: i don't want the user to record their story and then it is played, i want to record their voice (sample) so it can be cloned, then our system will make the audio based on the 

14\) all types of stories:  
\- Standard stories (text \+ 1\~2 images \+ audio)  
\- Interactive story: (text with choices \+ 1\~2 images \+ audio)  
\- Personalized text stories (text \+ 1\~2 images \+ audio)  
\- Personalized image stories (text \+ 8-15 images \+ audio \+ Can be printed)

15\)   
For personalized image stories: need to choose the language (as it will not be in all languages).   
For personalized text stories: the story can be in all languages (translate image, audio, slug...). 

16\) user possibility has the to submit story to admin for review (no guarantee of publish)

17\) user have the possibility to 'published' their story (personalized) only if they want.

18\) maybe make a bank of personalized image stories samples for review (so 7ser can see what it looks like)

19\) create serie (continue the story).  
For paid account, can auto create the story monthly?

20\) media player:   
free account \= basic function \+ \+ auto play next \+ cannot be reduced  
paid account \= advance feature \+ can reduce \+ timer / sleep timer 

21\) paid account can download audio (limited number / months)

22\) download:   
\- all account can download standard stories with watermark.  
\- all text personalized version can be downloaded by with watermark  
\- All visual personalized story can be downloaded (not printed version / quality) with small watermark

23\) text personalized story have quiz, lexical.

24\) need to define the commercial use: should not be possible. to be confirmed.

25\) need the function "resume reading"

26\) can add to favorite, maybe limit the number of favorite for free account.

27\) need to have recuring character (need to have account, quota based on account tier).

28\) possiblility to download as epub (maybe but quota base don account tier)

29\)  User account: history, liked

30\) possibility to randomized the story to avoid to loose user in long filter selection

31\) the story page structure in meshistoiredusoir.fr is very good:  
\- Hero background with image and strong filter  
\- Breadcrumbs  
\- key filter selected (not clicabkable)  
\- Title  
\- summary  
\- download options (PDF or epub)  
\- picture  
\- Audio player  
\- Setting for text (size font and dyslexia)  
\- chapter and text  
\- CTA upgrade plan  
\- Favorite / share  
\- rate  
\- Quizz  
\- glossaire (hidden, need click to drop down)  
\- CTA to create personalized story  
\- THeme link the story (clickable button)  
\- Button for download pDF / EPUB / Audio  
\- Read next: Carrousel for same theme same age.  
\- Newsletter cta

32\) Interactive story:  
display the text, and at the end put the question with 3 choices (don't show the rest of the text yet). clicking on one of the choice, will show the next part of the story, then have a new question with 3 choices, which will show the next part of the story and so on.  
The slection of the answer is still possible, so clicking on aNOTHER answer of a previous  question will show the story from that new answer (and hide the rest of the story).

33\) Possibility to restart the quizz after taking it.  
quiz should show question in step (one by one, need to select and click 'next' to see the next one).  
At the end, show all the reply for each question (with clear right or wrong, and say You answer XXX, the ight reply was YYY).

34\) here is the full content of meshistoiresdusoir.fr for the rally part.  
i think it is pretty solid. keep the same or improve it to go even further:  
Créez des Rallyes Lecture magiques pour vos enfants \!  
Vous cherchez une manière ludique et éducative de stimuler la lecture chez les enfants ? Découvrez notre outil révolutionnaire pour créer des rallyes lecture captivants. Que vous soyez enseignant ou parent, notre plateforme est conçue pour transformer la lecture en une aventure passionnante.

Gratuit jusqu'à 35 enfants et 5 rallyes lectures simultanément, sans durée limitée

Gratuit et facile à utiliser  
Des milliers d'histoires au choix  
Questionnaires inclus pour chaque histoire  
Suivi de la progression des enfants  
Étapes pour créer un Rallye Lecture  
Image  
Étape 1  
Ajouter les Enfants et leur attribuer des Groupes  
Commencez par ajouter les enfants participants à votre interface, que vous en ayez 1, 2 ou même 30 \! Vous pouvez organiser les enfants en différents groupes selon leurs classes, âges ou niveaux de lecture. Cette classification permet une gestion simplifiée et une adaptation des contenus de lecture à chaque groupe. Vous pouvez en option définir un mot de passe pour chaque enfant pour garantir la confidentialité de leur expérience et de leurs résultats avec les autres enfants.

Image  
Étape 2  
Créer un Rallye Lecture et y ajouter des histoires  
Créez un nouveau rallye lecture en y associant un ou plusieurs groupes d’enfants. Ajoutez des histoires depuis notre vaste bibliothèque ou créez des histoires personnalisées avec notre outil exclusif. Vous pouvez sélectionner des histoires basées sur les intérêts et les niveaux de lecture des enfants pour rendre l'expérience encore plus engageante.

Image  
Étape 3  
Les enfants participent et vous visualisez leurs résultats  
Fournissez aux enfants l'adresse URL dédiée pour accéder à leurs rallyes lecture (ou ouvrez la page sur un navigateur web, que ce soit sur ordinateur, tablette ou smartphone). Chaque enfant peut se connecter en cliquant sur son nom et, si vous le souhaitez, en entrant un mot de passe pour plus de sécurité. L'enfant peut lire (ou se faire lire) les histoires que vous avez sélectionné puis répondre aux questionnaires pour vérifier sa compréhension.

Depuis votre interface, suivez en temps réel les progrès des enfants, leurs scores aux questionnaires et même leur vitesse de lecture.

À qui s’adresse cet outil ?  
Un outil adapté pour tous : enseignants, parents et plus  
teacher  
Enseignants  
Parents  
Bibliothécaires  
Autres  
Enseignants : Dynamisez Votre Classe avec des Rallyes Lecture Engagés  
Les rallyes lecture sont une méthode efficace pour encourager la lecture et l'analyse critique chez les élèves. En utilisant notre outil, les enseignants de maternelle et de primaire peuvent organiser des activités de lecture interactives et captivantes. Créez des groupes par classe ou niveau de lecture, sélectionnez des histoires adaptées à chaque groupe et suivez la progression de chaque élève en temps réel. Nos questionnaires automatisés permettent de vérifier la compréhension des textes lus, tandis que les badges et messages personnalisés incitent les élèves à persévérer et à se surpasser. Transformez votre salle de classe en un espace où la lecture devient une aventure collective et enrichissante.

À propos de Mes Histoires du Soir  
Plongez dans l'Univers Magique de Mes Histoires du Soir  
Découvrez comment Mes Histoires du Soir transforme chaque lecture en une aventure captivante et éducative.

Enfant qui lit un livre  
Des Milliers d'Histoires à Découvrir  
Chez Mes Histoires du Soir, nous croyons que chaque enfant mérite une histoire magique. Avec notre vaste bibliothèque de milliers d'histoires pour enfants, classées par âge, genre et thème, il y a toujours quelque chose pour chaque jeune lecteur.

Créez des Histoires Personnalisées  
Grâce à notre outil exclusif basé sur l'IA, vous pouvez créer des histoires personnalisées où chaque enfant est le héros de son histoire. Choisissez un lieu, un thème, des personnages secondaires, des situations, des intrigues et laissez la magie opérer. Cet outil permet aux parents et enseignants de créer des récits uniques et mémorables, renforçant ainsi l'intérêt des enfants pour la lecture.

Stimulez l'Imagination et l'Apprentissage des Enfants  
Nos histoires et rallyes lecture sont conçus pour inspirer un amour durable de la lecture tout en renforçant les compétences de compréhension des enfants. Grâce à une interface conviviale et intuitive, même les plus jeunes peuvent naviguer facilement et s'engager pleinement. Une chose est certaine : ils deviendront aussi accros que vous \!

Créez dès maintenant votre premier rallye lecture \!  
Ça vous plait ? Essayez maintenant \!  
Gratuit jusqu'à 35 enfants et 5 rallyes lectures simultanément, sans durée limitée

Fonctionnalités clés  
Une Palette Complète de Fonctions pour des Rallyes Lecture Enrichissants et Captivants

Gestion des Groupes  
Créez et attribuez des groupes d'enfants par classe, âge ou niveau de lecture. Facilitez ainsi la gestion et l'assignation des histoires.

Bibliothèque d'Histoires  
Accédez à des milliers d'histoires classées par âge, genre et thème, pour des heures de lecture variée et adaptée.

Création d'Histoires Personnalisées  
Utilisez notre outil basé sur l'IA pour créer des histoires sur mesure où l'enfant est le héros et/ou pour aborder les thèmes de votre choix.

Gestion des Groupes  
Créez et attribuez des groupes d'enfants par classe, âge ou niveau de lecture. Facilitez ainsi la gestion et l'assignation des histoires.

Bibliothèque d'Histoires  
Accédez à des milliers d'histoires classées par âge, genre et thème, pour des heures de lecture variée et adaptée.

Création d'Histoires Personnalisées  
Utilisez notre outil basé sur l'IA pour créer des histoires sur mesure où l'enfant est le héros et/ou pour aborder les thèmes de votre choix.

Suivi de Progression  
Visualisez les progrès, scores et vitesse de lecture de chaque enfant en temps réel, permettant un suivi personnalisé.

Interface Conviviale et Sécurisée  
Accès privé pour les enfants avec option de mot de passe pour plus de confidentialité. L'interface parent/enseignant est entièrement sécurisée et facile à utiliser, assurant une gestion optimale.

Questionnaires Adaptés  
Évaluez la compréhension des enfants avec des questionnaires adaptés à leur âge, conçus pour renforcer leur mémorisation et compréhension des histoires.

Gestion des Groupes  
Créez et attribuez des groupes d'enfants par classe, âge ou niveau de lecture. Facilitez ainsi la gestion et l'assignation des histoires.

Bibliothèque d'Histoires  
Accédez à des milliers d'histoires classées par âge, genre et thème, pour des heures de lecture variée et adaptée.

Création d'Histoires Personnalisées  
Utilisez notre outil basé sur l'IA pour créer des histoires sur mesure où l'enfant est le héros et/ou pour aborder les thèmes de votre choix.

Suivi de Progression  
Visualisez les progrès, scores et vitesse de lecture de chaque enfant en temps réel, permettant un suivi personnalisé.

Interface Conviviale et Sécurisée  
Accès privé pour les enfants avec option de mot de passe pour plus de confidentialité. L'interface parent/enseignant est entièrement sécurisée et facile à utiliser, assurant une gestion optimale.

Questionnaires Adaptés  
Évaluez la compréhension des enfants avec des questionnaires adaptés à leur âge, conçus pour renforcer leur mémorisation et compréhension des histoires.

Badges et Encouragements Personnalisés  
Ajoutez des messages et des badges personnalisés pour encourager les enfants et célébrer leurs succès.

Accès Multiplateforme  
Compatible avec ordinateurs, tablettes et smartphones, permettant une lecture flexible n'importe où et n'importe quand.

Support et Assistance  
Une équipe dédiée pour répondre à vos questions et vous aider à tirer le meilleur parti de l'outil.

Un outil gratuit, et qui le restera \!  
Jusqu’à 35 enfants et 5 rallyes lectures actifs simultanément GRATUITEMENT. Une option payante est disponible pour des besoins plus importants.

Vous avez des questions ?  
Trouvez les réponses dans notre FAQ.

Qu'est-ce qu'un rallye lecture ?  
Un rallye lecture est une activité éducative où les enfants lisent une série d'histoires et répondent à des questionnaires pour évaluer leur compréhension. Cela rend la lecture ludique et interactive.

Est-ce que l'outil est vraiment gratuit ?  
Oui, notre outil est entièrement gratuit avec une limite de 35 enfants et 5 rallyes lectures actifs simultanément. Pour augmenter ces limites, une offre payante est disponible à partir de 6,99€/mois.À qui s'adresse cet outil ?  
Cet outil est idéal pour les enseignants de maternelle et primaire, les parents, les grands-parents, les bibliothécaires, les animateurs périscolaires et les centres de loisirs.  
Comment les enfants accèdent-ils aux rallyes lecture ?  
Ils se connectent via une URL unique que vous leur fournissez. Ils cliquent ensuite sur leur nom et peuvent entrer un mot de passe pour plus de sécurité, bien que cela ne soit pas obligatoire.  
Puis-je personnaliser les questionnaires ?  
Les questionnaires sont automatiquement adaptés à l'âge cible et ne sont pas personnalisables. Ils sont conçus pour évaluer la compréhension de l'histoire lue.  
Comment ajouter des histoires à un rallye lecture ?  
Vous pouvez ajouter des histoires depuis notre bibliothèque en cliquant sur le bouton "Ajouter au(x) rallye(s) lecture" présent sur chaque histoire (dès que vous avez activé l'outil) ou en créant des histoires personnalisées avec notre outil exclusif.  
Puis-je suivre la progression des enfants ?  
Oui, vous pouvez suivre les progrès, les scores et la vitesse de lecture de chaque enfant en temps réel depuis votre interface privée et sécurisée.  
L'interface est-elle sécurisée ?  
Absolument, l'interface pour les parents et enseignants est 100% sécurisée. Les enfants ont un accès privé avec une option de mot de passe pour plus de confidentialité.  
Les enfants peuvent-ils accéder à des contenus inappropriés ou à de la publicité ?  
Non, toutes les histoires disponibles sur notre site sont adaptées aux enfants et classées par âge pour garantir un contenu approprié. Il n'y a par ailleurs aucune publicité d'affichée sur l'interface des enfants, même en version gratuite.  
Puis-je ajouter des contenus externes ?  
Non, vous ne pouvez ajouter à vos rallyes lecture que les histoires disponibles sur notre site ou celles que vous avez créées à l'aide de notre outil de création d'histoires personnalisées. Cependant, cette option vous offre la flexibilité de créer des histoires sur des thématiques spécifiques qui vous tiennent à cœur. Par exemple, vous pouvez concevoir un rallye lecture sur des thèmes comme le sport, l'écologie, ou le handicap en créant des histoires personnalisées adaptées à ces sujets. Cela vous permet de proposer un contenu riche et pertinent tout en restant dans un environnement sécurisé.  
Comment puis-je personnaliser les badges et les messages de félicitations ?  
Dans votre interface, allez dans les paramètres de vos rallyes lecture et ajoutez vos messages et badges personnalisés (selon les résultats obtenus) pour encourager et récompenser les enfants.  
Mes données et celles des enfants sont-elles protégées ?  
Oui, toutes vos données sont protégées et nous respectons les normes de confidentialité les plus strictes.  
L'outil est-il accessible sur mobile ?  
Oui, notre outil est compatible avec les ordinateurs, tablettes et smartphones, permettant une lecture flexible n'importe où et n'importe quand. Néanmoins, nous vous recommandons d'effectuer le paramétrage de vos rallyes lecture sur ordinateur (ou tablette) pour plus de confort d'utilisation.  
Comment fonctionne le suivi de la vitesse de lecture ?  
La vitesse de lecture est mesurée en mots par minute (mpm). Lorsque l'enfant commence à lire une histoire, il doit cliquer sur un bouton pour l'afficher, ce qui déclenche le chronomètre. Une fois la lecture terminée, le chronomètre s'arrête et le questionnaire apparaît. Ces données de vitesse de lecture sont disponibles dans les rapports de progression de votre interface. Il est important de noter que cette mesure est indicative : si l'enfant fait une pause durant sa lecture, sa vitesse de lecture pourrait être sous-estimée.  
Les enfants peuvent-ils relire les histoires après avoir répondu à un questionnaire ?  
Oui, les enfants peuvent relire les histoires autant de fois qu'ils le souhaitent après avoir répondu aux questionnaires. Cependant, leurs résultats aux questionnaires sont déjà enregistrés, donc ils ne peuvent pas retenter le questionnaire pour la même histoire. Cela leur permet de revisiter les histoires pour le plaisir de la lecture ou pour renforcer leur compréhension.  
Puis-je voir les réponses incorrectes des enfants ?  
Oui, après chaque questionnaire, les enfants et les adultes peuvent voir les réponses incorrectes avec des explications correctives pour aider à la compréhension.  
Puis-je organiser des concours de lecture ?  
Absolument \! Vous pouvez utiliser notre outil pour organiser des concours de lecture, suivre les scores et remettre des récompenses aux gagnants.  
Y a-t-il un support disponible si j'ai des questions ?  
Oui, notre équipe dédiée est disponible pour répondre à vos questions et vous aider à tirer le meilleur parti de l'outil. Vous pouvez nous contacter via notre formulaire de contact.  
Comment puis-je signaler un problème technique ?  
Vous pouvez signaler un problème technique en contactant notre support via le formulaire de contact sur notre site. Nous nous efforcerons de résoudre le problème dans les plus brefs délais.

35\) dyslexia mode and font size selection are for paid account only.

36\) In the database, should have a column for author of the stoyr. For now it’s not oging to be used, but when user submit their story or personalized story is published (if they allow it) we can note them as author.  
FOr now (v1-2) it’s not going to be display publicly n the website, but in the future, if we lauch author pag e/ community / vote, we might add the name of the author (Lunireve for admin, and user name when they publish a story)

37\) show or at least keep records of story read (to add more data / analytics in the	 future)

38\) audio should have option to play next xx story (max 10 maybe) on autopilot play. And after put a sleeping sounds (choice of waves, wind, rain, zen, white noise, lullaby) with a timer of 50 to 30min  and slow fade

39\) need advance analysis for story (%read, % open, completion rate, shared, liked report,  personalized story metrics (what is created the most…), %create account, frequency of user, number of children account, newsletter analytics……etc.   
Should be able to choose time range (7 / 15 / 30 / 60 / 90 / 180 / 360 / All / custom) to show the analytics.  
Should be able to download by Excel / pDf.

40\) paid user: black screen option for listing mode (for parents against screen time)

41\) no trial. Just free with ads or paid account (with 14day sretractation).

42\) Possibility to add moral to story / educational. Add topics to manage emotions, overcome fears, handle bullying, dealing with sibling, divoice, grief, first day at school, friendship, respect differences, self confidence, social skills, anxiety, self esteem, …etc.therapeutic tehcnique that can be practice in real life, 

43\) MEDIA AUDIO PLAYER OPTIONS:  
Free user:  
The audio player have only play/pause / previous chapter/next chapter / Restart story. Once the story is finish it suggest the next story.  
The player cannot be minimized. We can close the modal to resume reading but it stop the audio.  
Once the modla is closed it will scroll the text where the audio stopped, so user can continue reading from the exact spot audio stoped.  
Paid users have:   
Advanced audio options:   
\- play/pause / previous chapter/next chapter / Restart story / speed of the audio (x0.8 x1 x 1.2) /   
\- auto play next (choose up to 10 stories auto play with a scroll number: autoplay the next 10 stories related to this one) It should automatically reduce after the next story (for example a user slecte play the next 5 stories, after the 1st story is over, it start the 2nd story, and the number of next story to play is 4 and so on until the end.).  
\- Sleep timer   
\- black screen during audio  
\- timer: turnoff audio after 5/10/15/20/25/30min or after 1 to 10 stories.  
\- ambient noise for sleeping: waves, wind, rain, bird chipping, meditation, whit enoise, Lunireve’s lullaby for a   
\- Possibility to minimized hte audio player to read the story at the same time

44\) Premium feature (for paid user) Offline access: download story so it can be listend / read with internet connection.  
PDF can be downloaded for free (with a number allowed per month), Audio is only for paid user (also with monthly limitation)

45\) tap to pronounce difficult words (maybe the same as the one with lexical / glossaire)? 

46\) in the personalized serie: possibility to generate a ‘next episode’ of a perticular story:   
Possibility to choose from list of existing personalized stories created or create the next chapter of an existing story in Lunireve bank.  
Once select a ‘create a next episode’ it should be by defaut on “autopilot” which will be the natual next step of the next episode based on the previous (same character, different story, or similar adventure, but go further or deeper, or new character or …or  … or etc). But user should also be able to personalized with a list of personalization so user cna adjust the story as they liked. So it should be like a toggle switch: by default it is on ‘autopilot’ (la prochaine aventure en se basant sur la derniere histoire) or if they click on ‘autopilot off’ it will show the list of personalization for the next episode (otherwise all personalization is hidden).  
When a personalization field is let empty, the Ai will choose on best option to follow the previous story.  
Write somewhere that all field are optional, any left empty will be choosen by Lunivere.  
If the user choose to create a ‘next episode’ of a lunireve bank story, they should have a research with filter to find the said story. Maybe they will just remember the name of the character, or the type of animal(s), or the theme or the age of the title of the story, story read, story liked, …etc. the search should be intuitive so they can find it back easily. Result should be dynamic (when start to type in search bar, it should automatically show results with image, title and summary). Add a filter on the resultat by last read or relevance.

47\) no ads for paid accounts. (when ads are in place).

48\) add more character (always have one hero, but can have sibling, paretnt, friends, pets…) for paid acocunt.

49\) Add moral / lesson for story personalization.

50\) Select choice of illustration: give 4-5 styles for free. Premium users will have more choice (maybe 15).

51\) Have teacher account for rallies

52\) Make each story personalzable with child name:  
On each story page put the possibility to click “personalize” the story with child name. Need to have child account so the main character can be change to child name. Only available for the same gender story as per the account (for example if the account is for  girl, any story with a girl main character can be personalized with the account name)  
Need to be adjusted to the gender of the 

53\) Newsletter: choose   
Make different newsletter with a on/off switch:  
a) story (send weekly stories based on age)  
B) promotion (discount)  
c) news (new function, new things)

54\) All names of character should “speak” to the readers. So use modern, simple, up to date names.

55\) offer subscription gift and printed book gift.   
Make a dedicated landing page for this.

56\) bedtime mode: timer, dimer light , ambient sounds after the last story

57\) top story of the week (most read or most rated) 

58\)  i want the story banks (all free stories) to be a SEO engine for the platform AND a funnel to lead to printing books.

59\) i want the printing book to be available for automatic re-ordering: for example:  
Print option: auto-print the next episode (either on autopilot story mode or personalized if the users want to choose the story they want next). The idea is to create habits (1-2-3-4 times / month). Need to manage payment in a smart way (pay in advance?)  
User has the possibility to validate the story before printing (an email will be sent XX days before), but if not validated XXh before the printing, then it should be automatically consider as approved

60\) all printing books are reviewed by our team (human) before to be printed.

61\) all gift cards code are valid for 12 months.

62\) Print version: need to have a strong unboxing effect with personalisation

63\) for printed book: first it should be generated digitally: basic resolution (not printable, but good to read on computer / phone), if approved, then goes to higher quality and for printing.

64\) the printed book quality should be very good / have a premium feel and for early ages it should “child proof” (babies bite, spit, spill,  torn, throw out…etc)

65\) avoid repetition (same words many times, same sentence or same meaning repeated multiple times…etc).

66\) Manage printed version delivery carefully (to make sure it arrive on time).  
Propose standard delivery XX days or express YY days.

67\) personalized visual story should also generate the audio (all story text, perosnalized text or visual) should have audio.

68\) Physical book should have dedication pages with tailored message and possibly a selection of 1\~3 fonts for the message (hand written) and signature.  
Put a defaut message: ‘This book is offered by XX to YY, with love”, but can be fully customeized (free text)  
Need to check that the content of dedication is ‘approved’ (no violence / nudity, strong lanaguge…). 

69\) when create a personalized story, provide a link to share with loved one / social media.

70\) options when to buy a printed version of a book:  
\- Optional gift wrapping  
\- Option gift card insert

71\) When audio player is minimized (paid user) make it still visible but only limited option (play / pause / previous chapter / next chapter)

72\) when creating a story have a list of existing character created.  
73\) secondary character is free (father, mother, brother sister, pet), but other are for paid users.  
74\) Main character from 13year old are for paid user only (goes up to 120years on meshistoiresdusoir).  
75\) main character in only boy or girl. All other type (fairy, animal, knight, alien… are for paid user).  
Here is the list of the character selection on meshistoiresdusoir:

Enfants fille  
garçon  
Animaux (abonnement requis)  
canard  
chat  
cheval  
chien  
coccinelle  
cochon  
coq  
corbeau  
crocodile  
éléphant  
escargot  
girafe  
grenouille  
hérisson  
Lapin

lion  
loup  
marmotte  
ours  
poule  
rat  
renard  
renne  
serpent  
singe  
souris  
tortue  
Prince et Princesse (abonnement requis)  
prince  
princesse  
Sorciers et Sorcières (abonnement requis)  
apprenti sorcier  
apprentie sorcière  
sorcier  
Sorcière

Créatures légendaires (abonnement requis)  
dragon  
elfe  
fantôme  
fée  
géant  
licorne  
loup-garou  
lutin  
monstre  
ogre  
sirène  
troll  
vampire  
Yéti  
Adultes (abonnement requis)  
femme  
homme  
Dinosaures (abonnement requis)  
Diplodocus

stégosaure triceratops  
Tyrannosaure Rex  
vélociraptor  
Personnages de contes de fées (abonnement requis)  
Aladdin  
Blanche-Neige Cendrillon  
la Belle au bois dormant  
La reine des neiges (du conte de Hans Christian Andersen)  
le Chat botté  
le Petit Chaperon rouge  
le Petit Poucet  
les Trois Petits Cochons  
Pinocchio  
Chevaliers (abonnement requis)  
chevaleresse (femme chevalier)  
chevalier  
Autre type de personnage principal (abonnement requis)  
Type de personnage principal personnalisé

76\) Possibility to create recurring character (that can be used as main or secondary).  
77\) Creating story is 4 steps: 

- Hero  
- Autres personnages  
- Intrigue  
- Illustration

78\) create a character is in 4 steps:  
\- Type de personnage (enfant (0-12years) / teen or adult / animal

- Identité du personnage (name, gender, age (by name, not by age (like senior, teen, newborn…), type (home pet, ,wild animal, …)  
- Apparence du personnage (type, main color of the character)  
- Personality (choose 4):  
  Personnalité  
  Choisissez jusqu’à 4 traits de caractère pour votre personnage animal.  
  Traits positifs :  
  affectueux  
  protecteur  
  joueur  
  fidèle  
  calme  
  énergique  
  observateur  
  sociable  
  patient  
  Traits négatifs :  
  timide  
  territorial  
  peureux  
  destructeur  
  possessif  
  agressif  
  bruyant  
  têtu  
  impatient  
  Traits neutres (selon les contextes) :  
  solitaire  
  prudent  
  nocturne  
  indépendant  
  opportuniste  
  curieux  
  méfiant  
  réservé  
  explorateur  
  chasseur  
  jaloux  
  Autres caractéristiques comportementales :  
  sauvage  
  dominant  
  dominé  
  docile  
  éveillé  
  fougueux  
  loyal  
  gardien  
  aventurier


Have a maximum of 3 personalized character on free plan. Once the character is created, we can:  
modifier le personnage  
créer une histoire avec ce personnage  
histoires avec ce personnage en vedette (0)  
supprimer le personnage

79\) Genre of the story:

Conte  
Histoire d'aventure  
Histoire de fête  
Mystère et Enquête  
Histoire de science-fiction  
Histoire éducative  
Histoire fantastique  
Histoire rigolote  
Histoire sur un métier

Thematique for each category:  
Conte

- Contes africains Contes d'aventure Contes de fées Contes de princesses et de princes Contes du Japon Contes effrayants Contes inspirés des Mille et Une Nuits Contes nordiques et vikings Contes philosophiques Contes traditionnels de Noël Grand méchant loup Choix personnalisé Autre thématique 

Histoire d'aventure

- Histoires d'explorateurs Histoires de chevaliers Histoires de cow-boys Histoires de pirates Histoires de trésors cachés Histoires de voyages sous la mer Les petits aventuriers Choix personnalisé Autre thématique 

Histoire de fête

- Histoires d'Anniversaires Histoires d'Halloween Histoires de carnaval Histoires de Noël Histoires de Saint-Valentin Histoires du Lutin Farceur de Noël Histoires du Ramadan Histoires sur la fête des mères Histoires sur la fête des pères Histoires sur la fête du nouvel an Histoires sur Pâques Choix personnalisé Autre thématique 

Mystère et Enquête

- Histoires de détectives Histoires de petits enquêteurs Choix personnalisé Autre thématique 

Histoire de science-fiction  
\-Histoires d'extraterrestres Histoires de super-héros Histoires de villes futuristes Histoires de voyages dans le temps Histoires de voyages spatiaux Choix personnalisé Autre thématique   
Histoire éducative

- Histoires pour dormir : zen et bien-être Histoires sur l'amitié Histoires sur l'automne Histoires sur l'école Histoires sur l'écologie Histoires sur l'égalité des genres Histoires sur l'hiver Histoires sur la confiance en soi Histoires sur la diversité Histoires sur la guerre Histoires sur la maladie Histoires sur la mort Histoires sur la Neurodiversité (TDAH, HPI, DYS, autisme...) Histoires sur la pauvreté Histoires sur la peur du noir Histoires sur la rentrée des classes Histoires sur la séparation et le divorce Histoires sur la tolérance Histoires sur le changement climatique Histoires sur le handicap Histoires sur le harcèlement Histoires sur le mensonge Histoires sur le printemps Histoires sur le racisme Histoires sur les écrans Histoires sur les émotions Histoires sur les parents Histoires sur les peurs des enfants Histoires sur les sports Histoires sur les vacances d'été Histoires sur les voyages Choix personnalisé Autre thématique 

Histoire fantastique

- Fantasy historique Fantasy humoristique (light fantasy) Fantasy Mythique (Myth Fantasy) Fantasy urbaine (Urban fantasy) Heroic Fantasy (Médiéval-Fantastique) Histoires fantastiques de sorcellerie Histoires qui font peur (Horreur) Science Fantasy Space fantasy Choix personnalisé Autre thématique 

Histoire rigolote

- Histoires amusantes de frères et sœurs Histoires d'inventions farfelues Histoires de cirque Histoires de défis impossibles Histoires de super-héros comiques Histoires drôles pour dormir Histoires ensorcelantes et amusantes Histoires loufoques et absurdes Histoires rigolotes du royaume enchanté Histoires rigolotes sur les copains Choix personnalisé Autre thématique 

Histoire sur un métier

- Histoires d'Agriculteurs et de Ferme Histoires d'Archéologues Histoires d'Artistes Histoires d'Astronautes Histoires d'Instituteurs et institutrices Histoires d'Inventeurs Histoires de Boulangers Histoires de Chanteurs et Musiciens Histoires de Chefs cuisiniers Histoires de Joueurs de football Histoires de Médecins Histoires de Pilotes d'avion Histoires de Policiers Histoires de Pompiers Histoires de Vétérinaires Choix personnalisé , Autre thématique 

Suggestion of places to choose from   
Choisissez un lieu  
À la maison (suggestion)  
À l'école (suggestion)  
Dans le jardin (suggestion)  
Au parc (suggestion)  
Chez les grands-parents (suggestion)  
Dans la cuisine (suggestion)  
Dans la chambre (suggestion)  
Dans la cour de récréation (suggestion)  
Chez un(e) ami(e) (suggestion)  
À la plage (suggestion)  
Au terrain de sport (suggestion)  
Dans une forêt enchantée (suggestion)  
Sur une île mystérieuse (suggestion)  
Sur une montagne enneigée (suggestion)  
Dans une ville futuriste (suggestion)  
Sur un bateau pirate en pleine mer (suggestion)  
Dans une école de magie (suggestion)  
Dans l’espace, à bord d’un vaisseau spatial (suggestion)  
Au cirque magique (suggestion)  
Dans un zoo secret rempli d’animaux fantastiques (suggestion)  
Dans un parc d’attractions gigantesque (suggestion)  
Dans une maison hantée (suggestion)  
Au sommet d’une montagne enneigée (suggestion)  
Dans un désert mystérieux (suggestion)  
Dans un jardin géant rempli de fleurs parlantes (suggestion)

Additional information too choose from:  
L'histoire doit parler d'un secret que le personnage principal découvre dans son école (suggestion)  
Le personnage principal doit affronter une grande peur (suggestion)  
L'histoire se passe lors d'une fête d'anniversaire où un mystère doit être résolu (suggestion)  
Le personnage principal trouve un objet magique qui l'aide à accomplir des missions (suggestion)  
L'histoire se déroule dans un monde imaginaire où le personnage principal rencontre des créatures fantastiques (suggestion)  
Le personnage principal doit aider un ami à retrouver un trésor perdu (suggestion)  
L'histoire doit aborder le thème de l'amitié et de la solidarité entre les personnages (suggestion)  
L'histoire parle d'un grand défi que le personnage principal doit relever (suggestion)  
Le personnage principal a la capacité de communiquer avec les animaux (suggestion)  
L’histoire doit parler d’une dispute entre frère et sœur qui finit par les rapprocher (suggestion)  
Le personnage principal vit une aventure à travers le temps (suggestion)  
L’histoire inclut un animal qui aide le personnage principal dans sa quête (suggestion)  
L'histoire doit aborder la confiance en soi et le courage d'affronter ses peurs (suggestion)  
L’histoire se passe lors d’une grande aventure en forêt (suggestion)  
Un personnage mystérieux apparaît et aide le personnage principal à accomplir sa mission (suggestion)  
Le personnage principal découvre un pouvoir magique qu’il ne sait pas contrôler (suggestion)  
Le personnage principal a un ami invisible qui l’aide à résoudre des problèmes (suggestion)  
L’histoire doit inclure un personnage qui voyage dans l’espace (suggestion)  
Le personnage principal doit apprendre une leçon de vie importante, comme la persévérance (suggestion)  
Le personnage principal fait une surprise à ses parents (suggestion)  
Le personnage principal apprend à partager ses jouets avec ses amis (suggestion)  
Le personnage principal doit résoudre un conflit avec un frère ou une sœur (suggestion)  
Le personnage principal apprend à prendre soin d’un petit frère ou d’une petite sœur (suggestion)  
L’histoire se déroule lors d’une sortie scolaire (suggestion)  
Le personnage principal apprend à gérer une situation délicate (suggestion)

80\) can only add up to 3 additional information to build the story, otherwise, need to upgrade to a paid tier.

In personalized story, the last step is ‘illustration’: choose the style of the drawing (selection of free and paid user access style) and color of the characters in the story.  
Illustration style:  
Univers visuels gratuits Automatique (style livre jeunesse)  
Dessin animé 2D  
Illustration vectorielle (flat design)  
Bande dessinée européenne  
Comics américain (style super-héros)  
Manga  
Chibi / Kawaii  
Aquarelle  
Crayons de couleur  
Papier découpé  
Pâte à modeler (stop-motion)  
Film d'animation 3D (type Pixar/DreamWorks)  
Coloriage (noir & blanc)  
Gouache (texturée, mate)  
Pastel (craie douce)  
Premium (abonnement requis)  
Encre & lavis  
Collage (papier \+ textures) Pixel art (rétro jeu vidéo) Gravure (linogravure / estampé) Livre ancien (conte classique)  
Art naïf (folk art)  
Feutrine (cousu / doudou)  
Croquis aquarellé (trait fin \+ aquarelle)  
Origami (papier plié)  
Tableau à la craie  
Pop art (très coloré)  
Rêve lumineux (halo doux)  
Boule à neige (mini-monde)  
Silhouettes (ombres colorées)  
Jouets en bois (diorama de jouets)  
Mini-figurines 3D souples (figurines mignonnes)  
Vitrail  
Photo réaliste  
Diorama en briques de construction  
Dessin d'enfant (gribouillis au crayon)  
Peinture à l'huile  
Peinture acrylique  
Encre minimaliste (style sumi-e)  
Broderie (fil et couture)  
Pastel gras (texture douce)  
Airbrush retro  
Gradient mesh  
Duotone (2 couleurs)  
Théâtre d'ombres (contre-jour) Aquarelle éclaboussée  
Encre fine \+ aplats de couleur  
Tampons (effet imprimé)  
Tableau de feutrine  
Monde en laine tricotée  
Laine feutrée  
Bas-relief en pâte à modeler  
Maison de poupée  
Livre pop-up (papier en volume)  
Stickers en mousse  
BD douce (trame légère)  
Papier déchiré  
Masking tape (washi tape)  
Pâte à modeler lisse (figurines rondes)  
Ballons sculptés  
Bonbons gélifiés  
Aquarelle \+ stylo gel  
Planche de stickers  
Doodles (petits dessins autour)  
Figurines en plastique (type Playmobil)  
Poupées de mode (type Barbie)  
Poupées type 'L.O.L. Surprise\!'  
Maquette miniature (photo de diorama)  
3D cartoon (cel-shading)  
Peluches (diorama cosy)  
Papier mâché (artisanal)  
Perles à repasser (mosaïque pixel) Kawaii minimal (petits visages simples) Art déco (affiche douce)  
Appliqué tissu (pièces cousues)  
Crayon graphite \+ touches de couleur  
Fusain \+ pastel  
Pointillés à l'encre (stipple)  
Pointillisme coloré  
Cartoon rétro (années 1930, adouci)  
Dessin animé TV (années 90\)  
Illustration avec cadre décoratif  
Scrapbooking  
Vignette BD (une case)  
Noir et blanc doux (encre légère)  
Affiche en blocs de couleur  
Toile texturée (gesso) Aquarelle brosse sèche  
Encre sépia (carnet ancien doux) Encres colorées (éclats contrôlés) Gouache affiche (aplats opaques) Pastel sec (poudreux et estompé) Fusain \+ trait fin (mixte)  
Carnet quadrillé (doodles au stylo) Croquis en marge (carnet d'écolier) Papier superposé (vue de dessus) Collage papier de soie (transparences) Impression journal (style BD doux) Peinture douce (sans traits, très lisse) Décor en carton (plateaux de théâtre) Aquarelle granuleuse (pigments visibles)

Character color selection:  
Aucune préférence  
Variée / Diversité automatique  
Peau très claire  
Peau claire  
Peau mate  
Peau foncée  
Peau très foncée

81\) Possibility to choose an existing story and turn it into a full story book (visual personalized book). (somehting like a CTA at the end of the story to say: like this story? Make a full visual version ready to print). Possibility to edit some of the content?

