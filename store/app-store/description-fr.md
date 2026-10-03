# ECOLNA — Description App Store

**Sous-titre** (26 caractères sur 30) : `CP tchadien, sans internet`

App Store Connect ne rend aucune mise en forme dans ce champ : ni Markdown ni
HTML. Des `**astérisques**` s’afficheraient tels quels dans la fiche publiée.
Les intertitres sont donc en texte simple et les puces sont des caractères
« • ». Coller uniquement le bloc « TEXTE EXACT À COLLER », de la première à
la dernière ligne.

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
Les deux années du cours préparatoire tchadien, d’après le programme officiel, dans une application qui ne se connecte jamais à internet. Gratuite, sans publicité, sans compte.

Langage, lecture, écriture, calcul : les quatre disciplines du CP, avec le même poids horaire que dans la grille du ministère. Chaque leçon indique son trimestre, sa semaine et la page du programme dont elle vient.

Pensée pour les régions où internet est rare ou coûteux — campagnes, communautés nomades, familles sans connexion fiable — ECOLNA fonctionne 100 % hors connexion, dès le premier lancement. Tout est dans l’application : les leçons, les 824 enregistrements, les images.

Pour l’enfant
• Les deux années du cours préparatoire : 147 leçons en CP1, 161 en CP2 — 308 leçons et 1 625 exercices en tout, du premier tracé aux petites histoires
• Les quatre disciplines du CP : langage, lecture, écriture, calcul
• Toutes les consignes sont lues à voix haute : pas besoin de savoir lire pour commencer
• 27 formes d’exercices : écouter, toucher, tracer les lettres minuscules et les chiffres, former des syllabes, compter l’argent en francs CFA — pièces de 5, 10, 25, 50, 100 et 500 —, résoudre de petits problèmes de la vie courante
• Le calcul se fait en images, avec des objets du quotidien : chèvres, mangues, calebasses
• Un vocabulaire familier : la case, le puits, le mil, la calebasse, le marché, le berger
• Des encouragements bienveillants — jamais de punition, jamais de pression
• 14 badges qui récompensent un vrai progrès, réunis dans l’écran « Mon profil »

Quand une notion résiste — le b confondu avec le d, le p avec le q — l’application la repère et la ramène dans les révisions des jours suivants. L’enfant ne voit pas une sanction : il revoit, simplement.

Pour les parents
• Espace parent protégé par une question de multiplication qu’un enfant de cet âge ne sait pas résoudre : progression, notions à revoir, temps d’apprentissage, en phrases simples plutôt qu’en pourcentages
• L’application ne demande même pas l’autorisation d’accéder à internet : elle n’effectue aucun appel réseau, ni au premier lancement ni ensuite
• Aucune publicité, aucun achat intégré, aucun abonnement, aucun outil de mesure d’audience
• Aucun compte, aucune adresse e-mail, aucun mot de passe
• Le prénom, l’avatar, le niveau et la progression restent dans une base locale, sur l’appareil : rien n’en sort sans votre geste
• Pensée d’abord pour la tablette, elle fonctionne aussi sur téléphone, à la verticale comme à l’horizontale

Pour l’enseignant
Le contenu est tiré des Programmes Réactualisés de l’Enseignement Primaire, Ministère de l’Éducation Nationale — Centre National des Curricula, N’Djaména, septembre 2004. Chaque leçon cite le contenu officiel et sa page, et porte son trimestre et sa semaine. Les quatre disciplines respectent le poids horaire de la grille de la page 128. ECOLNA est une publication indépendante, non affiliée au Ministère de l’Éducation Nationale du Tchad.

Gratuite, sans compte et sans inscription. Rien à payer, maintenant ni plus tard.

Apprendre partout, même sans internet.
<!-- fin du texte à coller -->

## Notes de rédaction

- Longueur du bloc : 3 100 caractères pour une limite Apple de 4 000.
  Recompter après toute retouche.
- Les chiffres viennent de `docs/couverture-programme.md` (artefact généré) :
  308 leçons pour les deux niveaux réunis, 147 en CP1 et 161 en CP2, et 1 625
  exercices au total. Ne jamais écrire « une année scolaire complète par
  niveau » ni « par niveau » devant 308 ou 1 625 : ce sont des totaux
  CP1 + CP2. La fiche Play porte les mêmes nombres.
- La phrase d’indépendance vis-à-vis du ministère est obligatoire, ici comme
  côté Play : laisser croire à une publication officielle ou à une émanation du
  ministère est un motif de rejet (Apple 5.2.3, politique Play de fausse
  représentation). Le contenu suit le programme officiel, il n’en est pas
  l’édition : écrire « d’après le programme officiel », jamais « le
  programme officiel du CP » employé comme nom de l’app. Sept décisions
  pédagogiques attendent encore la relecture d’un enseignant
  (`docs/known-limitations.md`, `docs/pedagogical-validation.md`).
- Lexique fixé avec la fiche Play : « hors connexion » dans le corps du
  texte, « sans internet » réservé aux accroches (sous-titre, texte
  promotionnel, bandeau), « hors ligne » gardé uniquement dans les mots-clés
  App Store parce que c’est un terme de recherche. Les problèmes sont
  « de la vie courante », jamais « du quotidien » ; « objets du quotidien »
  reste correct, c’est une autre expression.
- « 27 formes d’exercices » et non « 27 types d’activités » : le manifeste
  compte bien 27 valeurs de `type`, mais `exercise-registry.tsx` les rend avec
  17 composants (les sept types de calcul passent tous par `MathExercise`).
  L’enfant voit donc moins de formes distinctes que 27 — le mot reste vrai sans
  survendre la variété visuelle.
- « Les lettres minuscules » : les gabarits de tracé des majuscules cursives
  ne sont pas dessinés (`docs/known-limitations.md`). Les chiffres, eux,
  sont traçables : `letter-paths.ts` couvre 0 à 9. Les pièces citées sont
  celles de `CFA_COINS` (`scripts/content/data/math.ts`) : 5, 10, 25, 50,
  100, 500. L’exercice
  `count_money` fait compter l’argent affiché, il ne fait pas rendre la
  monnaie : ne pas écrire « rendre la monnaie ».
- Le sous-titre ne revendique plus le programme officiel et garde « CP »,
  « tchadien » et « internet », dont `keywords-fr.md` dépend : ces mots ne
  sont pas repris dans les mots-clés, Apple indexant déjà le sous-titre.
- Apostrophes typographiques ’ et espaces insécables dans « 100 % », « 1 625 »
  et devant les deux-points : la fiche publiée coupe les lignes, et la coupure
  se voit.
- La tenue sur tablette d’entrée de gamme n’est pas revendiquée :
  `docs/known-limitations.md` classe comme bloquante la régression mémoire
  d’Hermes (RN 0.85.3 / SDK 56, corrigée en SDK 57) et aucune mesure n’a été
  faite sur l’appareil cible.
- Les 824 enregistrements sont une synthèse vocale locale et l’accent n’est pas
  tchadien (`store/shared/release-notes-1.0.0-fr.md`) : ne rien promettre de
  plus que « lues à voix haute ».
