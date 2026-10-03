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
souvent en 1x ou 1,5x et un demi-pixel s'y voit.

**3. Deux volets en paysage.** `EcolnaExerciseLayout` place le stimulus et les
réponses côte à côte dès qu'on est en `expanded` + paysage. Empilés sur une
fenêtre large et basse, les cartes-réponses passent sous la ligne de flottaison
et l'enfant doit faire défiler pour répondre — l'exercice cesse d'être un
exercice de lecture.

**4. Surfaces de travail agrandies.** Les plans de tracé passent de 340 à
460 dp (lettres) et de 260 à 360 dp (graphisme) : un tracé se fait avec tout
l'avant-bras, pas du bout du doigt.

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
rejoue la consigne par un anneau or), la bienvenue après l'enregistrement.

**9. Banc de rendu web, local et non livré.** `ECOLNA_WEB_PREVIEW=1` ajoute la
plateforme web à `app.config.ts` pour faire tourner l'app réelle dans Chromium
et la capturer en iPad paysage / portrait / téléphone ; sans cette variable, la
configuration livrée est inchangée (le test de configuration le vérifie).
Mode d'emploi : `docs/visual-qa.md`.
