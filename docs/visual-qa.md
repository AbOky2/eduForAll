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
   composition → espacements → couleurs (pipette vs jetons de
   `src/design-system/tokens/colors.ts` : depuis la direction v3, les neutres
   ivoire et les rôles des galets s'écartent volontairement du HTML Stitch) →
   typographie → états. Sur Android, vérifier aussi l'empilement : rien de ce
   qui chevauche une carte ombrée ne doit passer dessous.
4. Consigner chaque écart : conforme / écart accepté (lien vers
   `design-decisions.md`) / à corriger.

## Matrice d'appareils minimale

- Tablette Android 7" (1024 × 600 dp), paysage **et** portrait — le matériel
  du pilote, cible prioritaire
- Tablette Android 10" (1280 × 800 dp), paysage et portrait
- iPad (paysage et portrait)
- Android compact (≤ 5,5", 720p)
- Android standard (6,1–6,7")
- iPhone SE (compact)
- iPhone récent (6,1")
- Chaque plateforme : texte agrandi 1,4× et réduction des animations

## Scénarios Maestro de capture

`maestro/` contient les flows de parcours ; les captures (`takeScreenshot`)
peuvent y être ajoutées par écran pour automatiser la collecte
(`scripts/visual-regression/` accueillera le diff d'images quand la baseline
sera stabilisée sur appareil).

## Banc de rendu web (sans simulateur)

Pour regarder l'app **réelle** écran par écran — iPad paysage et portrait,
tablettes Android du pilote (`tab7-l`, `tab7-p`, `tab10-l`), téléphone droit et
couché (`phone`, `phone-l`) — sans Xcode ni émulateur. C'est le banc qui
a servi à la refonte v3 (`design/direction-ecrans-v3.md`). Il ne remplace pas
la relecture sur appareil (audio, clavier, gestes réels), il la prépare.

Rien de livré n'en dépend : la plateforme web n'existe que sous
`ECOLNA_WEB_PREVIEW=1` (`app.config.ts`, `metro.config.js`), et les paquets
web s'installent sans toucher `package.json` ni le verrou.

```bash
# 1. Paquets web, une fois (non enregistrés)
npm i --no-save react-native-web@~0.21.0 @expo/metro-runtime@~56.0.21

# 2. L'app dans le navigateur
ECOLNA_WEB_PREVIEW=1 npx expo start --web

# 3. Captures (Playwright ; CHROME_PATH si le Chromium n'est pas le sien)
SEED=1 node scripts/web-preview/capture.cjs / accueil ipad-l ipad-p phone
node scripts/web-preview/capture.cjs /learn apprendre ipad-l
node scripts/web-preview/capture.cjs "/level-map?subject=reading" carte ipad-l
STEP=cp1-ecriture-lettres-1:0 node scripts/web-preview/capture.cjs /lesson/cp1-ecriture-lettres-1 trace ipad-l
FRESH=1 node scripts/web-preview/capture.cjs /create-profile profil ipad-l
```

`SEED=1` sème le profil de démonstration « Amina » (le même que
`scripts/tools/seed-demo-profile.mjs`) ; `STEP=leçon:n` ouvre une leçon à
l'étape n ; `CLICK="texte|label:Avatar 2|fill:Écris ton prénom ici=Amina"`
joue un parcours avant la capture (un texte avec « ! » ou « : » s'écrit avec
l'espace insécable) ; `REDUCED=1` capture en mouvement réduit (l'anneau
d'aide reste alors fixe deux secondes). Les images vont dans `.cache/screens/`.

Deux cales, web seulement : `expo-sqlite` web n'a pas de transaction
exclusive (`scripts/web-preview/expo-sqlite-web.js`), et le banc navigue par
le routeur impératif (`scripts/web-preview/expo-router-web.js`).
