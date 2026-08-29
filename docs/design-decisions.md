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

**1. Colonne centrée de largeur lisible.** `AlifaScreen` borne le contenu à
560 / 720 / 1000 dp selon la classe. Une ligne de texte étirée sur toute la
largeur d'un écran de 10 pouces est illisible pour un enfant qui déchiffre
encore lettre à lettre ; le fond, lui, occupe tout l'écran.

**2. Typographie mise à l'échelle, pas étirée.** ×1 / ×1,15 / ×1,3 sur toute
l'échelle typographique, glyphes pédagogiques compris. Une tablette se tient à
bout de bras : il faut des lettres plus grandes, pas les mêmes lettres plus
espacées. Les tailles sont arrondies au dp entier — les dalles bon marché sont
souvent en 1x ou 1,5x et un demi-pixel s'y voit.

**3. Deux volets en paysage.** `AlifaExerciseLayout` place le stimulus et les
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
