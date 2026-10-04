# Captures d'écran des stores

## La règle d'abord

**Une capture de store montre l'app telle qu'elle est : rien de dessiné, rien
de retouché.** Une capture fabriquée est un motif de rejet déclaré : règle
2.3.3 d'App Review chez Apple, règles sur les métadonnées trompeuses chez
Google.

**Ce que contient `raw/`, dit sans détour.** C'est le rendu du **vrai code**
de l'app : mêmes écrans, mêmes composants, mêmes jetons, même base SQLite,
même contenu (version 2.1.1). Le banc web l'exécute (react-native-web dans
Chromium, `scripts/web-preview/capture.cjs`) aux résolutions exactes des
appareils, avec le profil fictif « Amina ». Aucun pixel n'y est dessiné ni
retouché. La composition (`out/`) se contente de mettre chaque capture à
l'échelle dans un cadre neutre, sous une légende. Le tournage se rejoue à
l'identique avec `scripts/tools/capture-store-screenshots.sh` : ce script
reproduit les fichiers de `raw/` octet pour octet (vérifié le 4 octobre 2026).

**Ce n'est pas pour autant une capture d'appareil.** Le moteur de rendu n'est
pas le même : un navigateur, et non les vues natives d'iOS ou d'Android. Le
lissage des polices, les ombres et certaines animations peuvent différer. Les
zones sûres aussi : le rendu web n'a ni barre d'état ni encoche. D'où trois
règles, non négociables :

1. **Avant toute soumission en revue**, installer le build par TestFlight
   (iPhone, iPad) et par le test interne Play (téléphone, tablette). Afficher
   chacun des écrans de `plan.json` dans le même état, puis les comparer à
   `out/`.
2. **Un écran qui diffère** (mise en page, texte, illustration, couleur) **est
   remplacé** par la capture de l'appareil, jamais l'inverse : on ne retouche
   pas une capture pour qu'elle ressemble à l'app. Côté Apple, c'est simple :
   un iPhone 6,9" capture en 1320 × 2868 et un iPad Pro 13" en 2752 × 2064,
   les dimensions mêmes de `raw/` (un iPad Air 13" donne 2732 × 2048, qui ne
   convient pas). On dépose le fichier sous le même nom, puis on recompose.
   Côté Play, les fiches sont composées à partir des mêmes fichiers bruts :
   si seul l'écran Android diffère, le signaler, car la chaîne ne connaît pas
   encore de capture brute propre à Android.
3. **Toute modification d'interface après le tournage impose de le refaire**
   (`docs/release-process.md`, gates manuelles).

## Comment faire

**1. Tourner les captures brutes.** Le banc de rendu web exécute le vrai code
de l'app (react-native-web, `docs/visual-qa.md`) avec le profil de
démonstration « Amina » — CP1, douze leçons, aucune donnée réelle d'enfant —
aux résolutions exactes de trois appareils :

| appareil | points × densité | fichier brut | sert à |
| --- | --- | --- | --- |
| iPhone 6,9" (`iphone69`) | 440 × 956 ×3 = 1320 × 2868 | `raw/<id>.png` | App Store iPhone, Play téléphone |
| iPad 13" paysage (`ipad13-l`) | 1376 × 1032 ×2 = 2752 × 2064 | `raw/<id>@tablette.png` | App Store iPad |
| tablette Android 10" paysage (`tab10-l`) | 1280 × 800 ×2 = 2560 × 1600 | `raw/<id>@tablette-android.png` | Play tablette (plans `"play": true` seulement) |

Les tablettes en **paysage** : c'est ainsi que l'enfant les tient, et les
écrans y passent en deux volets. La fiche Play tablette a sa propre capture,
aux proportions d'une tablette Android (16:10), et non plus celle de l'iPad
(4:3).

**Les badges du profil ne sont pas choisis à la main.** Après chaque leçon
semée, `capture.cjs` et `scripts/tools/seed-demo-profile.mjs` rejouent le
calcul de l'app (mêmes requêtes que `achievements-repository.ts`, règles lues
dans `achievements.ts`) : Amina a 7 badges (`first-lesson`, `five-lessons`,
`first-perfect`, `five-perfect`, `first-world`, `speaker`, `streak-three`),
datés du jour de la leçon qui les a débloqués, et chaque écran les montre
tels que l'app les compterait. L'écran de réussite (`07`) est celui de la
10ᵉ leçon, « Ma famille : je parle », qui ferme le monde « Moi et mon école »
et fait dix leçons de langage : « Monde terminé » et « Belle parole », trois
étoiles. Avec `SEED=1`, `capture.cjs` **refuse** un écran de réussite que le
profil n'a pas vécu (leçon non terminée, étoiles ou badges différents).

Tout le tournage, depuis le serveur du banc :

```bash
ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081
scripts/tools/capture-store-screenshots.sh                       # 28 captures → raw/
scripts/tools/capture-store-screenshots.sh --only 07-reussite    # un plan, trois appareils
scripts/tools/capture-store-screenshots.sh --appareil android    # la tablette Play seule
scripts/tools/capture-store-screenshots.sh --liste               # plans et réglages, sans tourner
scripts/tools/capture-store-screenshots.sh --sortie /tmp/essai   # essai hors de raw/
```

Une capture isolée, à la main :

```bash
SEED=1 DPR=3 node scripts/web-preview/capture.cjs / 01-accueil iphone69
SEED=1 DPR=2 node scripts/web-preview/capture.cjs / 01-accueil ipad13-l
SEED=1 DPR=2 node scripts/web-preview/capture.cjs / 01-accueil tab10-l
SEED=1 CLICK=gate SCROLL=fin DPR=3 node scripts/web-preview/capture.cjs /gate 10-parent iphone69
```

| plan | route | variables en plus de `SEED=1` |
| --- | --- | --- |
| `01-accueil` | `/` | iPhone : `SCROLL=fin` |
| `02-image` | `/(child)/lesson/cp1-langage-fetes-1` | `STEP=cp1-langage-fetes-1:0 WAIT=2600` |
| `03-ecriture` | `/(child)/lesson/cp1-ecriture-lettres-3` | `STEP=cp1-ecriture-lettres-3:2 WAIT=2300` |
| `04-parcours` | `/level-map` | `WAIT=2200` |
| `05-lecture` | `/(child)/lesson/cp1-lecture-l-2` | `STEP=cp1-lecture-l-2:3 WAIT=2600` |
| `06-calcul` | `/(child)/lesson/cp1-calcul-nombres-11-15` | `STEP=cp1-calcul-nombres-11-15:1 WAIT=2600` |
| `07-reussite` | `/(child)/lesson/result?stars=3&lessonId=cp1-langage-famille-2&badges=first-world,speaker` | `WAIT=3200` |
| `08-matieres` | `/learn` | — |
| `09-badges` | `/profile` | iPhone : `SCROLL="bas:Belle lecture@52"` |
| `10-parent` | `/gate` | `CLICK=gate` ; iPhone : `SCROLL=fin` |

- `CLICK=gate` franchit la **porte parentale** comme un parent : le banc lit
  l'opération affichée (« a × b = ? », tirée au hasard), écrit le produit et
  valide. L'espace parent ne s'ouvre que par là.
- `SCROLL` fait défiler le contenu avant la photo : `n` pixels, `fin`,
  `haut:texte@m` (le haut de ce texte à m px du haut de son conteneur) ou
  `bas:texte@m` (le bas de ce texte à m px du bas). Sur iPhone, `01` finit
  sur la rangée Écriture · Calcul entière au-dessus de la barre d'onglets,
  `09` sur une rangée de badges entière au-dessus du fondu, `10` montre « Par
  discipline », « Cette semaine » et « Analyse de progression ».

Sur simulateur iOS, la même mise en scène :
`node scripts/tools/seed-demo-profile.mjs` (il affiche les badges que chaque
leçon a débloqués), puis `node scripts/tools/capture-ios-screenshots.mjs`
(iPhone) ou `… --suffixe @tablette` (iPad) : mêmes routes, par liens
profonds ; la porte parentale et les défilements iPhone se font à la main,
le script attend Entrée.

**2. Déposer les fichiers bruts dans `raw/`**, sans les toucher (le script
de tournage le fait) : `<id>-iphone69.png` devient `raw/<id>.png`,
`<id>-ipad13-l.png` devient `raw/<id>@tablette.png`, `<id>-tab10-l.png`
devient `raw/<id>@tablette-android.png`.

**3. Composer.**

```bash
export PLAYWRIGHT_MODULE=<chemin>/node_modules/playwright   # hors du dépôt
npm run store:screenshots                                   # les 36 images
npm run store:screenshots -- --only 07-reussite             # un plan, tous les formats
npm run store:screenshots -- --format play-tablette         # un format
npm run store:screenshots -- --planche /tmp/planche.png     # + planche de contrôle
```

Playwright n'est pas une dépendance du dépôt : `PLAYWRIGHT_MODULE` désigne un
paquet installé ailleurs, `CHROME_PATH` un autre Chromium au besoin. La
planche montre chaque sortie en vignette de 300 px de haut, la taille d'une
fiche de store : la légende doit s'y lire. `--plan <fichier>` et
`--sortie <dossier>` servent aux essais de mise en page, hors de la série
livrée.

Ce que fait le compositeur (`scripts/tools/compose-store-screenshots.mjs`) :

- **La capture est posée telle quelle**, mise à l'échelle, dans un cadre
  d'appareil générique : rectangle aux coins arrondis, fin liseré nuit, ombre
  douce. Jamais un iPhone ni un iPad reconnaissable (Google refuse les cadres
  de marque, Apple ceux d'une autre plateforme). Rien n'est retouché, recadré
  ni posé sur la capture ; seuls ses quatre coins sont arrondis, et le script
  vérifie sur les pixels bruts que ces coins ne portent que le fond de
  l'écran.
- **La légende** : Ecolna Sans ExtraBold, deux lignes au plus, équilibrées,
  en typographie française appliquée au rendu (apostrophe typographique,
  espaces insécables, mots courts liés au suivant). Une seule taille par
  format : la plus grande où toutes ses légendes tiennent en deux lignes, si
  bien qu'une recomposition partielle (`--only`) reste identique à la série.
- **Les couleurs** viennent des jetons (`src/design-system/tokens/colors.ts`),
  jamais du script. Chaque plan nomme son `fond` et, s'il le veut, son
  `accent` (un groupe de mots de la légende, ou une liste) :

| `fond` | fond | légende | accent |
| --- | --- | --- | --- |
| `nuit` | `night`, halo `nightSoft` | blanc | soleil (`reward`) |
| `toile` | `canvas` | encre | bleu (`brand`) |
| `bleu` | `brandTint` | encre | `brandInk` |
| `soleil` | `rewardTint` | encre | `rewardInk` |
| `langage`, `lecture`, `ecriture`, `calcul` | teinte de la discipline | encre | encre de la discipline |

La série retenue : `01` nuit — la plus forte, c'est elle que montrent les
résultats de recherche ; `02` à `06` dans la teinte de la discipline de
l'exercice ; `07` soleil — l'écran de réussite est déjà de nuit, la
récompense passe au soleil ; `08` toile, chaque discipline nommée à sa
couleur (`accentCouleurs`) ; `09` nuit ; `10` toile, sobre, pour l'adulte.

Le script **échoue** (code 1) sur une dimension fausse, un PNG qui n'est pas
RVB 8 bits sans alpha, un fichier de plus de 8 Mo, une légende de plus de deux
lignes (d'une ligne pour `tablette-large`), une capture brute manquante ou qui
n'a pas les dimensions exactes déclarées dans `plan.json` (`"capture"`), un
format qui viole ses `"contraintes"` de console (rapport 16:9 ou 9:16, côtés
minimal et maximal, rapport long/court), une capture à moins de 75 % de la
largeur en `tablette-large`, un nombre de captures hors des limites d'une
console, un `fond` ou un `gabarit` inconnu. Il **avertit**
quand un accent ne figure plus dans sa légende (elle est alors rendue sans
accent), quand un contraste passe sous 4,5:1, ou quand un coin arrondi
masquerait autre chose que le fond. Une série complète retire de `out/` les
fichiers qui ne sont plus au plan.

## Formats produits

| dossier | dimensions | capture encadrée | captures | console |
| --- | --- | --- | --- | --- |
| `app-store-iphone` | 1320 × 2868 | iPhone 6,9" | 10 (`01` à `10`) | App Store, iPhone 6,9" — 1 minimum, 10 maximum |
| `app-store-ipad` | 2752 × 2064 | iPad 13" paysage | 10 (`01` à `10`) | App Store, iPad 13" paysage — **obligatoire**, l'app déclare `supportsTablet` |
| `play-telephone` | 1080 × 1920 (9:16) | iPhone 6,9" | 8 (sans `08` ni `09`) | Play, téléphone — 2 minimum, 8 maximum |
| `play-tablette` | 1920 × 1080 (16:9) | tablette Android 10" paysage, à 75 % de la largeur | 8 (sans `08` ni `09`) | Play, tablettes 7" et 10" (même jeu dans les deux emplacements) — 8 maximum |

Chaque format déclare dans `plan.json` sa capture brute (`"capture"` :
suffixe et dimensions exactes), son gabarit et, pour Play, ses contraintes
de console (`"contraintes"` : 9:16 ou 16:9, côtés de 320 à 3 840 px pour le
téléphone, de 1 080 à 7 680 px pour la tablette 10", rapport long/court ≤ 2).
Le 16:9 de la tablette est celui qu'annonce la Play Console, et celui qu'il
faut pour la mise en avant sur grand écran (au moins 4 captures paysage).
Toutes les sorties sont des PNG RVB 24 bits, sans transparence (exigé par
Play, sûr pour Apple), loin sous la limite de 8 Mo. `"play": false` dans
`plan.json` écarte un plan des fiches Play.

Sans captures tablette, Play présente la fiche comme une « application
téléphone » sur les tablettes — exactement le contraire du message.

## Les autres images de fiche

Rendues depuis leurs sources vectorielles par `npm run brand:assets`
(`scripts/tools/render-brand-assets.mjs`, Playwright lui aussi ;
`-- --only google-play` ne rend que les deux images Play). Chaque couleur d'un
SVG source doit être un jeton : sinon, le rendu s'arrête.

- `../google-play/graphics/icon-512.png` — icône Play, 512 × 512, opaque, même
  source que l'icône d'app.
- `../google-play/graphics/feature-graphic-1024x500.png` — image de mise en
  avant, source `feature-graphic-src.svg`. Même langue que la série : la nuit,
  le symbole et le nom ECOLNA, la légende de la première capture (« sans
  internet » au soleil), la vannerie en pointillé et les quatre emblèmes de
  discipline. Tout l'essentiel tient dans les 80 % centraux ; ni prix, ni
  classement, et jamais « officiel », que la bannière ne peut pas accompagner
  de la phrase d'indépendance (`../shared/mentions-programme-officiel.md`).
- `../../assets/icons/app-icon.png` — icône App Store, 1024 × 1024, opaque.

## Changer une légende

Les légendes vivent dans `plan.json`, pas dans l'outil. Les modifier et
relancer la composition suffit.
