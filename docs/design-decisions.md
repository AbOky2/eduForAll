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
