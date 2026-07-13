# QA visuelle

## Référence

Les 21 maquettes dans `design/stitch/` (`<slug>.png` + `<slug>.html` avec les
valeurs exactes de couleurs/spacing). Matrice écran↔route :
`docs/design-traceability.md`.

## Procédure de comparaison

1. Lancer un dev build avec données déterministes : profil « Amina », CP1,
   leçon `cp1-syllabes-b` en cours, 12 leçons complétées (seed dev à ajouter
   au besoin via l'écran diagnostics).
2. Capturer chaque écran de la matrice (`adb exec-out screencap` /
   simulateur iOS `xcrun simctl io booted screenshot`).
3. Poser côte à côte avec le PNG Stitch ; vérifier dans l'ordre :
   composition → espacements → couleurs (pipette vs HTML Stitch) →
   typographie → états.
4. Consigner chaque écart : conforme / écart accepté (lien vers
   `design-decisions.md`) / à corriger.

## Matrice d'appareils minimale

- Android compact (≤ 5,5", 720p) — cible prioritaire
- Android standard (6,1–6,7")
- iPhone SE (compact)
- iPhone récent (6,1")
- Chaque plateforme : texte agrandi 1,4× et réduction des animations

## Scénarios Maestro de capture

`maestro/` contient les flows de parcours ; les captures (`takeScreenshot`)
peuvent y être ajoutées par écran pour automatiser la collecte
(`scripts/visual-regression/` accueillera le diff d'images quand la baseline
sera stabilisée sur appareil).
