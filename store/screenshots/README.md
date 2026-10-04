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
démonstration « Amina » — CP1, douze leçons, cinq badges, aucune donnée réelle
d'enfant — aux résolutions exactes des appareils : iPhone 6,9" (440 × 956
×3 = 1320 × 2868) et iPad 13" **en paysage** (1376 × 1032 ×2 = 2752 × 2064),
l'orientation où l'enfant tient la tablette et où les écrans passent en deux
volets.

```bash
ECOLNA_WEB_PREVIEW=1 npx expo start --web     # le banc, sur localhost:8081
SEED=1 DPR=3 node scripts/web-preview/capture.cjs / 01-accueil iphone69
SEED=1 DPR=2 node scripts/web-preview/capture.cjs / 01-accueil ipad13-l
```

| plan | route | variables en plus de `SEED=1` |
| --- | --- | --- |
| `01-accueil` | `/` | — |
| `02-image` | `/(child)/lesson/cp1-langage-fetes-1` | `STEP=cp1-langage-fetes-1:0 WAIT=2600` |
| `03-ecriture` | `/(child)/lesson/cp1-ecriture-lettres-3` | `STEP=cp1-ecriture-lettres-3:2 WAIT=2300` |
| `04-parcours` | `/level-map` | `WAIT=2200` |
| `05-lecture` | `/(child)/lesson/cp1-lecture-l-2` | `STEP=cp1-lecture-l-2:3 WAIT=2600` |
| `06-calcul` | `/(child)/lesson/cp1-calcul-nombres-11-15` | `STEP=cp1-calcul-nombres-11-15:1 WAIT=2600` |
| `07-reussite` | `/(child)/lesson/result?stars=3&lessonId=cp1-langage-ecole-2&badges=first-lesson,reader` | `WAIT=3200` |
| `08-matieres` | `/learn` | — |
| `09-badges` | `/profile` | — |
| `10-parent` | `/dashboard` | — |

**2. Déposer les fichiers bruts dans `raw/`**, sans les toucher :
`<id>-iphone69.png` devient `raw/<id>.png`, `<id>-ipad13-l.png` devient
`raw/<id>@tablette.png`.

**3. Composer.**

```bash
export PLAYWRIGHT_MODULE=<chemin>/node_modules/playwright   # hors du dépôt
npm run store:screenshots                                   # les 36 images
npm run store:screenshots -- --only 07-reussite             # un plan, tous les formats
npm run store:screenshots -- --format play-telephone        # un format
npm run store:screenshots -- --planche /tmp/planche.png     # + planche de contrôle
```

Playwright n'est pas une dépendance du dépôt : `PLAYWRIGHT_MODULE` désigne un
paquet installé ailleurs, `CHROME_PATH` un autre Chromium au besoin. La
planche montre chaque sortie en vignette de 300 px de haut, la taille d'une
fiche de store : la légende doit s'y lire. `--plan <fichier>` et
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
lignes, une capture brute manquante ou de mauvaise taille, un nombre de
captures hors des limites d'une console, un `fond` inconnu. Il **avertit**
quand un accent ne figure plus dans sa légende (elle est alors rendue sans
accent), quand un contraste passe sous 4,5:1, ou quand un coin arrondi
masquerait autre chose que le fond. Une série complète retire de `out/` les
fichiers qui ne sont plus au plan.

## Formats produits

| dossier | dimensions | captures | console |
| --- | --- | --- | --- |
| `app-store-iphone` | 1320 × 2868 | 10 (`01` à `10`) | App Store, iPhone 6,9" — 1 minimum, 10 maximum |
| `app-store-ipad` | 2752 × 2064 | 10 (`01` à `10`) | App Store, iPad 13" paysage — **obligatoire**, l'app déclare `supportsTablet` |
| `play-telephone` | 1080 × 1920 | 8 (sans `08` ni `09`) | Play, téléphone — 2 minimum, 8 maximum |
| `play-tablette` | 1920 × 1200 | 8 (sans `08` ni `09`) | Play, tablettes 7" et 10" paysage — 8 maximum |

La capture iPhone sert aux deux formats téléphone, la capture iPad aux deux
formats tablette. Toutes les sorties sont des PNG RVB 24 bits, sans
transparence (exigé par Play, sûr pour Apple), de 0,1 à 1,1 Mo pour une
limite de 8 Mo. `"play": false` dans `plan.json` écarte un plan des fiches
Play.

Sans captures tablette, Play présente la fiche comme une « application
téléphone » sur les tablettes — exactement le contraire du message.

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
