# Décisions et adaptations design (vs maquettes Stitch)

Référence : `docs/design-audit.md`, matrice : `docs/design-traceability.md`.

1. **Bottom nav harmonisée claire** — S15 (Calcul CP2) montre une nav sombre
   `#2b2e48`, unique dans le set. Retenu : nav claire à pill sable partout
   (cohérence, contraste enfants). L'accent sombre pourra revenir en thème.
2. **Illustrations vectorielles sobres** — les maquettes utilisent des
   peintures génératives non exportables en assets propres. Remplacées par
   des SVG originaux plats dans la même palette (dunes, acacia, soleil,
   enfants dignes et variés). Les PNG Stitch restent la référence de QA.
3. **Composition : appui-pour-placer** — S13 suggère un glisser-déposer
   (« Glisse les lettres ici »). V1 : appuyer sur une tuile la place dans le
   premier emplacement libre ; appuyer sur une tuile placée la retire. Plus
   robuste pour 6–8 ans sur petits écrans ; le libellé est conservé, le drag
   viendra en polish avec gesture-handler.
4. **Fond exercices ivoire plat** — le bruit SVG fractal des maquettes coûte
   cher à reproduire fidèlement en RN ; retenu : aplat `#F4F1DE` (identique à
   l'œil sur écrans cibles). Le motif pointillé de l'accueil est reproduit.
5. **Parent gate par question de multiplication** — non maquetté ; requis par
   les stores. Choix V1 : question `7×6`-style (insoluble pour la cible
   d'âge), zéro friction de configuration. Un PIN local (secure-store) pourra
   remplacer/compléter.
6. **Carte CP2 sans fresque de fond** — la fresque désert plein écran (S09)
   est différée (asset raster lourd) : même structure de chemin/nœuds que
   CP1, sous-titres d'oasis conservés. Écart documenté à retraiter en polish.
7. **Feedback en feuille basse** — les maquettes n'explicitent pas l'état
   correct/incorrect ; conçu selon le brief : feuille chaleureuse
   verte/bleu pétrole, icône + texte + audio, jamais de croix rouge.
8. **Étoile du header leçon (S12/S14)** — décorative dans les maquettes,
   remplacée par l'ampoule d'indice quand la leçon en offre un (fonction
   réelle plutôt qu'ornement, brief §26 « aucun élément purement décoratif
   qui semble interactif »).

---

## Tablette : classes de fenêtre plutôt que type d'appareil

Les maquettes Stitch sont dessinées en 412 × 917 — un téléphone. La cible
réelle du projet est une tablette d'entrée de gamme, tenue dans les deux sens.
Plutôt que de brancher sur « est-ce une tablette ? », la mise en page branche
sur la **classe de fenêtre** (Material 3), ce qui couvre aussi la rotation et
l'écran partagé : `compact` (< 600 dp), `medium` (600–904), `expanded` (≥ 905).
Tout est dans `src/design-system/responsive`.

Quatre décisions en découlent.

**1. Colonne centrée de largeur lisible.** `EcolnaScreen` borne le contenu à
560 / 720 / 1000 dp selon la classe. Une ligne de texte étirée sur toute la
largeur d'un écran de 10 pouces est illisible pour un enfant qui déchiffre
encore lettre à lettre ; le fond, lui, occupe tout l'écran.

**2. Typographie mise à l'échelle, pas étirée.** ×1 / ×1,15 / ×1,3 sur toute
l'échelle typographique, glyphes pédagogiques compris. Une tablette se tient à
bout de bras : il faut des lettres plus grandes, pas les mêmes lettres plus
espacées. Les tailles sont arrondies au dp entier — les dalles bon marché sont
souvent en 1x ou 1,5x et un demi-pixel s'y voit. L'échelle est **plafonnée
par la hauteur** (×1 sous 520 dp, ×1,15 sous 720 dp) : la largeur seule
donnait ×1,3 à un téléphone couché (915 × 412) et à une tablette 7" couchée
(1024 × 600), dont les exercices débordaient.

**3. Deux volets en paysage.** `EcolnaExerciseLayout` place le stimulus et les
réponses côte à côte dès qu'on est en `expanded` + paysage. Empilés sur une
fenêtre large et basse, les cartes-réponses passent sous la ligne de flottaison
et l'enfant doit faire défiler pour répondre — l'exercice cesse d'être un
exercice de lecture.

**4. Surfaces de travail agrandies, mais jamais hors de l'écran.** L'ardoise
des lettres monte jusqu'à 400 dp × l'échelle et le cahier de graphisme jusqu'à
300 dp × l'échelle — un tracé se fait avec tout l'avant-bras — mais ils
prennent la hauteur que la consigne et le bouton leur laissent (180 et 160 dp
au moins). Le corps d'un exercice ne défile que s'il ne tient pas : sinon un
geste de tracé ne doit jamais être pris pour un défilement.

`app.config.ts` passe de `orientation: 'portrait'` à `'default'` : verrouiller
le portrait sur un appareil dont c'est le mode le moins naturel n'avait pas de
justification.

## Refonte v3 « Galets en relief » (octobre 2026)

La direction complète est dans `design/direction-ecrans-v3.md` ; voici les
décisions qui engagent le code.

**1. Les neutres passent de lavande à ivoire/sable.** Les surfaces venaient du
générateur Material de Stitch, d'une autre température que la palette terre :
elles se battaient avec elle. Les trois couleurs de marque (terre, pétrole, or)
ne bougent pas ; `surface*`, `locked*` et le fond d'exercice sont réchauffés
dans `tokens/colors.ts`. Aucun texte ne perd de contraste (encre sur ivoire :
16:1).

**2. Ce qui se touche est un galet.** `EcolnaGalet` pose une face sur sa
tranche (le ton `shade` de la même famille) ; appuyer enfonce la face de la
hauteur de la tranche, par une simple transformation (aucun recalcul de mise
en page). Boutons, cartes touchables, réponses, tuiles, onglets, nœuds de la
carte en sont faits. Ce qui ne se touche pas reste à plat : la tranche veut
dire « touche-moi ». L'action principale de l'enfant est le galet « soleil »
(or, texte brun à 7,4:1).

**3. Chaque écran d'enfant est un lieu.** Fini le fond à pois : un paysage du
Sahel ton sur ton (`DuneBackdrop`, ≤ 1,23:1 avec le fond), mesuré sur l'écran
réel — au-dessus de la barre d'onglets, la dune continue sous la pilule. Les
exercices gardent un ivoire calme avec un seul brin d'acacia dans un coin ;
l'espace parent reste nu.

**4. Une couleur par discipline** (`subjectColors`) : pétrole, terre cuite,
or, acacia. Elle teint la tuile de l'accueil, la porte d'« Apprendre », le
chemin parcouru sur la carte et la barre de progression de la leçon.

**5. Une seule consigne par exercice.** L'en-tête de leçon dit la consigne et
offre de la réentendre ; aucun renderer ne la répète (huit le faisaient). Un
exercice sans stimulus visuel (« compare ») centre ses réponses au lieu de
laisser un volet vide.

**6. Des tailles communes aux dix-huit exercices** (`useExerciseMetrics`) :
réponses ≥ 96 dp × 1,3 sur tablette, glyphe de 56 sp × 1,3, objets de 96 dp.
Les lettres se tracent sur une **ardoise** à la craie, dans une boîte carrée
(une lettre étirée sur un écran paysage n'est plus la lettre du cahier) ; le
graphisme sur le **cahier à double ligne**. Ce qui est tracé reste écrit.

**7. Les dessins v2 sont branchés partout** : pictogrammes du palier M
(barre d'onglets, révision, séries), `SubjectArt`, les douze avatars (accueil,
profil, réussite, création de profil), les quatorze médailles, l'enclos vide
pour la quantité zéro. `AvatarFace` et `avatarVariant` sont supprimés.

**8. La création de profil est une cérémonie** (brief v2 § 12) : une scène
persistante, une décision par étape, jamais de bouton grisé (un appui trop tôt
allume un anneau ocre autour de ce qui manque et le dit au lecteur d'écran), la
bienvenue après l'enregistrement — d'où l'on ne revient plus au formulaire : le
retour mène à l'école, sans recréer le profil.

**9. Banc de rendu web, local et non livré.** `ECOLNA_WEB_PREVIEW=1` ajoute la
plateforme web à `app.config.ts` pour faire tourner l'app réelle dans Chromium
et la capturer en iPad paysage / portrait / téléphone ; sans cette variable, la
configuration livrée est inchangée (le test de configuration le vérifie).
Mode d'emploi : `docs/visual-qa.md`.

**10. Ce que la revue de la refonte a changé** (24 constats vérifiés).
- *Android empile par élévation* avant l'ordre d'écriture : un galet ombré
  donne à sa face l'élévation de sa tranche ; ce qui chevauche une carte
  (bouton d'écoute, feuille d'indice) porte une élévation supérieure. Le banc
  web ne le montre pas : à contrôler sur appareil (`docs/visual-qa.md`).
- *Rien de grisé pour l'enfant* : « Vérifier » et les tuiles restent
  actifs ; un appui trop tôt allume l'anneau d'aide (`NudgeRing`, ocre 6:1)
  là où agir. Une révision sans leçon ciblée dit pourquoi au lieu d'offrir un
  bouton mort.
- *Relier* : chaque paire trouvée garde sa teinte (`pairTints`, sans le
  pétrole du choix en cours) **et** son numéro des deux côtés ; le lecteur
  d'écran dit « ba, paire 1 ».
- *Fermé* se dit : un module ou un monde verrouillé explique pourquoi,
  plus grand, à voix haute ; un monde terminé se rejoue. Le gris `locked`
  reste aux icônes, les textes passent à 7,5:1.
- *Typographie française* : espace insécable avant « ! ? : ; » et dans les
  guillemets, partout dans `strings.ts` — un test l'impose.
- *Grilles mesurées* : la grille d'avatars choisit ses colonnes (6, 4, 3)
  d'après la largeur réelle ; les images d'un choix se rangent en rangées
  explicites. Un test garantit qu'aucune rangée ne déborde.
- *Paysage partout* : réussite et hors-connexion se mettent côte à côte dès
  qu'un écran couché fait 640 dp de large, téléphone compris ; le banc capture
  aussi les tablettes du pilote (`tab7-l`, `tab7-p`, `tab10-l`).

## Refonte v4 « Épure » (octobre 2026)

La v3 « Galets en relief » a été jugée datée par le propriétaire (« trop
ringard ») au moment où l'app doit convaincre des cadres du ministère et des
investisseurs. La v4 la remplace entièrement ; `design/direction-v4-epure.md`
en est la référence.

- **Plat, précis, doux** : plus de tranche sous les surfaces, plus de reflet ;
  la profondeur vient d'ombres `boxShadow` en couches (sans effet sur
  l'empilement Android). Ce qui se touche le dit par un ressort à 0,96 et un
  retour haptique.
- **Une couleur par rôle** : bleu marque (choisir), soleil (agir,
  récompenser), nuit (grands moments), vert (réussir), une teinte par
  discipline aux noms du pays. Jamais de rouge pour l'enfant.
- **Une seule forme de « a »** : Ecolna Sans (Figtree, « a » scolaire figé)
  pour l'interface, Andika pour ce que l'enfant apprend à lire. Polices lues
  depuis le bundle (`useFonts`), aucun réseau.
- **Pictogrammes Phosphor** (MIT), embarqués comme données.
- **Progression sans fraction pour l'enfant** : barre segmentée par leçon,
  anneau par discipline, fil du parcours ; les nombres vont à l'espace
  parent.
- **Illustrations** : les personnages et les objets de l'école plutôt que le
  paysage — portraits redessinés, médailles plates, compositions « orbite ».
- Retirés : scènes et décors v3, glyphes M/S, jeton `depth`, polices
  Quicksand et Plus Jakarta Sans.
