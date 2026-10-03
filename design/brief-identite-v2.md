# ECOLNA — Brief de refonte de l'identité illustrée (v2)

> **Statut : brief de production, à suivre à la lettre.** Il s'adresse à une
> équipe complète — direction artistique, illustration, design d'icônes,
> marque, UX, développement React Native, QA — et sert de *prompt* à chaque
> membre. Toute règle est obligatoire sauf mention « (conseil) ». En cas de
> doute, la règle la plus protectrice pour l'enfant l'emporte.
>
> Le **pourquoi** de chaque décision, et les 157 sources, sont dans
> `design/recherche-design-v2.md`. À lire avant de dessiner.

## 0. En une minute

- Direction **« Galets & craie »** : tout est construit avec trois formes
  arrondies (galets), éclairé d'une seule lumière (en haut à gauche), en
  aplats à trois tons, sans contour noir ; un seul geste fait main, le **trait
  de craie**.
- **Icônes** : deux familles — glyphes d'interface (24 u) et pictogrammes
  enfant (48 u, pleins, colorés). Plus jamais d'étincelle, de flamme,
  d'engrenage côté enfant. Une icône = un sens.
- **Avatars** : 12 enfants du Tchad, nord et sud, 6 peaux × (une fille + un
  garçon), construits pour être reconnus en silhouette à 40 px.
- **Badges** : 14 médailles, 14 objets, verrouillées mais jamais cachées.
- **Logo** : finale entre **l'ardoise à la boucle** et **l'éléphanteau-livre**,
  tranchée par un jury ; mot-symbole « ecolna » dessiné.
- **Création de profil** : une scène persistante — le personnage choisi et son
  **ardoise où s'écrit son prénom à la craie** — et une décision par étape.

## 1. Mission

Donner aux enfants du Tchad — CP1 et CP2, cinq à sept ans, dans les villages,
les campements nomades et l'extrême sud — une app qui a l'air **faite pour
eux, avec soin, par des gens du métier**. Beaucoup tiennent une tablette pour
la première fois, ne lisent pas encore, la partagent avec un frère ou une
sœur, la chargent au soleil et l'utilisent dehors, en plein jour.

Ce que l'enfant doit ressentir en ouvrant l'app : *« c'est à moi, c'est beau,
je me reconnais, j'ai envie d'y retourner »*. Ce que le parent ou le maître
doit ressentir : *« c'est sérieux, c'est respectueux, c'est de chez nous »*.

## 2. Diagnostic — ce qui ne va pas aujourd'hui

Constaté sur les captures du 3 octobre 2026 et sur la planche « avant »
(`.cache/design-renders/00-avant.png`).

| Zone | Problème | Conséquence |
|---|---|---|
| Icônes | Traits fins 1,8 u à décimales, façon Lucide/Feather, posés dans des carrés pastel | Générique, « template » ; illisible au soleil sur dalle 1x |
| Icônes | Métaphores fausses : l'étincelle sert à 6 sens (niveau, notions, badges, CP1, onboarding, analyse) ; l'**étoile** veut dire « Temps aujourd'hui » ; le nuage barré **rouge** présente une qualité (hors connexion) comme une panne ; calculatrice et flamme sont des objets d'adulte | L'enfant et le parent ne comprennent pas ce qu'ils voient |
| Avatars | Tête = cercle, corps = demi-disque, yeux = points, un seul brun, cheveux = un cercle derrière la tête, 4 choix recoloriés | Aucun enfant ne s'y reconnaît ; aspect clip-art |
| Badges | Une icône générique dans un disque ; verrouillé = un cadenas qui **cache** l'objectif | Aucun désir de collection |
| Scènes | Feuillages en ellipses, dunes en ovales, proportions fausses, aucune lumière | Amateur |
| Logo | Livre ouvert sur carré pétrole ; reliure de 1,1 px à 29 px | Rien d'appropriable, ni l'enfance ni le Tchad |
| Création de profil | Carte de téléphone centrée sur tablette ; avatars de 56 px ; coches de 12 px ; CP1 = étincelle, CP2 = livre ; bouton grisé sans explication ; « ce téléphone » sur une tablette ; aucune mise en page paysage | Premier contact raté, au moment le plus émotionnel |
| Barre d'onglets | Icônes 24 px, libellés 12 sp, état actif signalé par la couleur seule | Petit et ambigu pour un enfant |
| Exercice « zéro » | « Compte les chèvres » avec 0 chèvre = cadre vide | On croit à un bug |
| Exercice « répète » | La consigne s'affiche deux fois (l'écran de leçon + le composant) | Négligé |

## 3. Ce qui ne change pas (garde-fous)

1. **Les mises en page des écrans** (accueil, apprendre, carte, leçon,
   réussite, parents) sont validées par le propriétaire. On remplace icônes et
   illustrations *dans* les composants ; on ne redessine pas les écrans —
   **sauf l'écran « Crée ton profil »** (§ 12), refait entièrement, et la
   **barre d'onglets** (§ 6.6).
2. **Palette UI** (`src/design-system/tokens/colors.ts`), typographies
   (Quicksand + Plus Jakarta Sans), espacements, rayons : inchangés. Les
   dessins ont leurs propres jetons (`src/design-system/tokens/illustration.ts`,
   § 5). **Aucune couleur en dur** ailleurs que dans les fichiers de jetons.
3. **Hors ligne** : tout est dessiné en SVG dans le code (react-native-svg).
   Aucune image bitmap dans l'app. Les seuls PNG produits sont les icônes
   plateforme et visuels de store, *générés* depuis des sources SVG par
   `npm run brand:assets`.
4. **Tablette d'abord** : toute dimension passe par
   `src/design-system/responsive` (classes compact / medium / expanded,
   `scaled()`, colonne lisible, deux volets en paysage).
5. **UI 100 % français**, textes uniquement dans
   `src/localization/fr/strings.ts`.
6. **Le travail non commité du propriétaire est sacré** : ne jamais lancer
   `git checkout`, `git restore`, `git stash`, `git reset`, ni réécrire un
   fichier depuis HEAD. On édite en place, après avoir relu le fichier.
7. **Aucune migration** : `avatar_id` n'a pas de contrainte CHECK. Les
   identifiants `avatar-1` … `avatar-4` restent valides et gardent un enfant
   proche de l'ancien (même genre, même couleur de vêtement dominante).
8. **Contenu pédagogique intouché** : ni manifeste, ni programme, ni
   `CONTENT_VERSION`. Les 113 pictogrammes de vocabulaire
   (`curriculum-icons.tsx`, `object-icons.tsx`) sont hors périmètre de cette
   passe, sauf la scène « zéro » (§ 10).
9. **Pas de nouvelle dépendance native** (le client de développement installé
   ne serait plus à jour).

## 4. Direction artistique — « Galets & craie »

### 4.1 Le langage de formes

- **Trois primitives seulement** : rectangle arrondi, cercle/ellipse,
  triangle arrondi. Les membres, mèches, nattes, rubans sont des **pilules**
  (rayon = moitié de l'épaisseur).
- **Coins galets** : rayon extérieur ≈ 12,5 % de la grille (3 u sur 24, 6 u
  sur 48), intérieur 1 u / 2 u. **Aucune pointe**, aucune jonction en
  onglet : `strokeLinejoin` et `strokeLinecap` toujours `round`. Pointes
  d'étoile arrondies (≥ 1,5 u sur 24, ≥ 3 u sur 48).
- Triangles et étoiles arrondis par l'**astuce du trait** : polygone rentré
  de r, plus un trait de la même couleur de largeur 2r, jointure ronde.
- Vue **de face ou de profil**, perspective plate ; jamais d'isométrie.
- **Rythme des tailles** : une masse dominante (≥ 45 % de la largeur), 2 à 4
  formes moyennes (12–25 %), 3 à 6 accents (≤ 6 %). Jamais trois formes
  voisines de même taille.

### 4.2 La lumière

- Une seule source, **en haut à gauche**, pour toute l'app.
- **Trois tons par matière** (`light` / `base` / `shade` des jetons) + blanc.
  Ombre = forme nette posée en bas à droite (croissant), jamais un dégradé.
- **Ombre portée en pilule** (`rx = h/2`, 60–75 % de la largeur de l'objet),
  couleur = ombre du fond, jamais grise ni noire, jamais un ovale.
- Pas de contour noir. Si un objet clair touche un fond clair : contour de
  4 u (sur 96) dans **son propre** ton le plus foncé.
- Interdits : filtres, flou, masque (sauf `ClipPath` de disque), opacité sur
  des calques qui se chevauchent (on **prémélange** les teintes), plus d'un
  dégradé par dessin (ciel ou fond seulement ; aucun sur personnages et
  icônes).

### 4.3 Les trois signatures (partout : icônes, badges, logo, avatars, scènes)

1. **Le reflet** : un tiret blanc à bouts ronds qui longe le contour vers
   10–11 h, rentré de 2 u (grille 24) / 4 u (grille 48), couvrant 45–70° de
   l'arc ; épaisseur 2 u / 4 u. Uniquement en mode couleur (ce qui est
   allumé, actif, gagné). Exemple sur un disque Ø40 centré (24,24) :
   `M10 22A14 14 0 0 1 19 11`, trait `illustration.white`, largeur 4.
2. **Les coins galets** (§ 4.1).
3. **La pastille-ombre** sous les objets des scènes et des médailles.

### 4.4 Le geste humain : la craie

Un seul élément fait main dans tout le système : le **trait de craie**
(boucle du logo, coche de validation de l'ardoise, soulignement du prénom).
Il est dessiné comme une **forme pleine** dont l'épaisseur varie de ±10–15 %
(plus épais en descendant), légèrement incliné (2–6°), couleur
`illustration.school.chalk`. Pas de texture, pas de grain.

### 4.5 Décor ton sur ton (transposition des inspirations)

Des inspirations du propriétaire on garde l'idée, pas l'objet : motifs
végétaux **du Sahel** (brin d'acacia, éventail de palmier doum, épi de mil,
fruit du baobab), en aplat à **≈ 1,1:1** de contraste avec la carte (la
teinte de la carte mélangée de 6–10 % vers son ombre), coupés par le bord de
la carte dans un coin, jamais derrière un texte ou un chiffre. Un motif par
famille de carte. (conseil : à utiliser avec parcimonie sur les grandes
cartes de l'accueil et de l'onboarding.)

## 5. Jetons d'illustration

Fichier : `src/design-system/tokens/illustration.ts`, réexporté par
`src/design-system/tokens/index.ts` (`illustration`, `skinTones`, types
`Ramp`, `SkinTone`, `FabricName`, `BackdropName`).

- `skinTones` : six rampes — `ebene`, `cacao`, `acajou`, `cannelle`, `miel`,
  `sable` — chacune `light / base / shade / lip / bounce / blush`.
- `illustration.hair`, `illustration.face` (œil, reflet, bouche, langue,
  dents), `illustration.fabric` (rampes de tissus), `illustration.backdrop`
  (disques d'avatar), `illustration.nature`, `illustration.school` (bois,
  ardoise, craie, papier, terre cuite), `illustration.metal`,
  `illustration.white`, `illustration.ink`.
- **Règle** : un dessin n'utilise que ces jetons et ceux de `colors`. Une
  équipe qui a besoin d'une teinte absente l'**ajoute au fichier de jetons**
  (rampe complète, commentée), jamais en dur dans le dessin.
- Par dessin : avatar ≤ 3 rampes (peau, cheveux, vêtement) + blanc + encre ;
  pictogramme ≤ 2 rampes + encre ; scène ≤ 4 rampes.

## 6. Icônes

### 6.1 Deux familles, deux grilles

| Famille | Grille | Pour | Taille d'affichage |
|---|---|---|---|
| **Glyphes d'interface** (palier S) | 24 × 24, zone vive 20 × 20 | chrome et espace parent : retour, fermer, chevron, coche, réglages, corbeille, partager, cadenas, bouclier, horloge, niveau, cible, courbe, actualiser, boussole, crayon de champ, plus | 20–32 dp |
| **Pictogrammes enfant** (palier M) | 48 × 48, silhouettes dans 40 × 40 | tout ce qu'un enfant touche ou lit comme du sens : onglets, écouter, rejouer, jouer, étoile, soleil, pousse, maison, cartable, parents, indice, coche de réussite, cadenas de progression | 32–96 dp |

`EcolnaIcon` choisit **automatiquement** le dessin du palier M quand
`size ≥ 32` et que l'icône existe dans ce palier, sinon le palier S
(optique, pas homothétie : on ne met jamais un dessin 24 à l'échelle 64).

### 6.2 Palier S — spécification (grille 24)

- Formes clés (bord extérieur, trait compris) : cercle Ø20 ; carré 18 × 18
  r 3 ; portrait 16 × 20 ; paysage 20 × 16.
- **Trait 2 u**, centré, bouts et jointures ronds. Rayons : extérieur 3,
  intérieur 1. Écarts ≥ 2, contre-formes ≥ 2, plus petit point Ø3. Au plus 2
  détails intérieurs. Angles 0 / 45 / 90°.
- **Netteté** : extrémités des segments droits sur des unités entières ; au
  plus une décimale où que ce soit. Lignes horizontales/verticales de 2 u
  centrées sur des unités **impaires** (les bords tombent sur des pixels
  entiers en 1x, 1,5x, 2x, 3x).
- Corrections optiques dans la viewBox : le triangle « jouer » décalé de
  1 u vers la droite ; formes rondes jusqu'à Ø20, carrées jusqu'à 18.
- **Jumeau plein** (`filled`) : même silhouette remplie, détails intérieurs
  en évidement de 2 u couleur `colors.card`.

### 6.3 Palier M — spécification (grille 48)

- Formes clés sur unités paires : cercle Ø40 (4 → 44) ; carré 36 × 36 r 6 ;
  portrait 32 × 40 ; paysage 40 × 32. Zone vive 44 × 44 réservée au
  débordement (reflet, pointes rondes).
- **Trait 4 u** pour tout le dessin au trait, bouts et jointures ronds.
  Rayons : extérieur 6, intérieur 2, pointes 3. Écarts ≥ 4, contre-formes
  ≥ 4, plus petit point Ø6. Au plus 3 détails intérieurs, **6 chemins**,
  3 tons + blanc. Texte : un seul glyphe ≥ 16 u de haut (« a », « 1 »).
- Exemple de référence, *écouter* : corps = rectangle arrondi x 6–14,
  y 18–30, r 2 ; pavillon = polygone (14,18) (24,9) (24,39) (14,30) arrondi
  par le trait ; ondes = arcs de 4 u centrés (24,24), r 8 et r 16, sur ±45°
  (`M29.7 18.3A8 8 0 0 1 29.7 29.7`, `M35.3 12.7A16 16 0 0 1 35.3 35.3`).

### 6.4 Trois modes de rendu (palier M ; le palier S n'a que `mono`)

| Mode | Rendu | Usage |
|---|---|---|
| `mono` | trait de la silhouette + détails, une couleur (`color`) | inactif, espace parent, désactivé |
| `duo` | silhouette remplie de la **teinte** de sa famille + détails dans le ton foncé de la famille | contenu par défaut sur fond clair |
| `color` | tons de la palette + **reflet** | actif, sélectionné, gagné, récompense |

Familles et paires vérifiées (détail sur teinte ≥ 4,5:1) :
`brown` `#5b3912` sur `#f0bd8b` (6,06) ; `blue` `#255f80` sur `#a3d8fe`
(4,56) ; `gold` `#533d00` sur `#ffd166` (7,16) ; `green` `#3e6837` sur
`#bff0b0` (5,03) ; `neutral` `#50453b` (mono, 9,31:1 sur blanc). Les teintes
sont des couleurs **pleines** (jamais `fillOpacity`). Changer d'état ne change
jamais la silhouette ni la métaphore.

### 6.5 Métaphores — liste complète (une icône = un sens)

| Nom | Palier | Sens | Dessin |
|---|---|---|---|
| `home` | M (+S) | Accueil | maison au toit arrondi, une porte |
| `learn` | M | Apprendre (onglet) | **le cartable** (le livre est réservé à Lecture) |
| `parents` | M (+S) | Espace parents | un adulte et un enfant côte à côte ; en onglet : mono + petit cadenas en modificateur bas-droite |
| `speaker` | M (+S) | Écouter | haut-parleur à deux ondes (spec § 6.3) |
| `replay` | M (+S) | Réécouter / rejouer | flèche circulaire épaisse, pointe arrondie |
| `play` | M (+S) | Commencer, leçon suivante | triangle arrondi décalé de 1/2 u à droite |
| `pause` | M (+S) | Pause | deux pilules |
| `star` / `star-outline` | M (+S) | Étoiles gagnées / à gagner | étoile dodue à pointes rondes |
| `sun` | M | Série de jours (remplace `flame`) | soleil à 8 rayons-pilules |
| `sprout` | M (+S) | Révision (on fait grandir ce qui est fragile) | pousse à deux feuilles sortant de terre |
| `lightbulb` | M (+S) | Indice | ampoule ronde, culot en deux pilules |
| `check` | M + S | Réussi / validé | coche épaisse ; en palier M, posée dans un disque vert |
| `close` | S | Fermer | croix à bouts ronds |
| `lock` | M + S | Pas encore ouvert | cadenas rond (en modificateur de progression, jamais seul sur un badge) |
| `arrow-back` / `chevron-right` | S | Retour / aller vers | flèche / chevron 2,5 u |
| `book` | M + S | Lecture, leçons | livre ouvert, « a » sur la page de gauche en palier M |
| `pencil` | S | Champ de saisie, écriture | crayon à pointe arrondie |
| `gear` | S | Réglages (**parent seulement**) | roue dentée à 6 dents arrondies |
| `trash` | S | Supprimer (parent) | corbeille |
| `share` | S | Partager (parent) | trois nœuds reliés |
| `shield` | S | Protégé, confidentialité, porte parentale | écu arrondi + coche |
| `clock` | S | Temps | horloge, aiguilles à 10 h 10 |
| `level` | S | Niveau | trois marches montantes |
| `target` | S | Notion maîtrisée | cible à trois anneaux |
| `insight` | S | Analyse de progression | courbe qui monte, point final plein |
| `refresh` | S | Réessayer | deux flèches circulaires |
| `compass` | S | Page introuvable | boussole |
| `offline-ok` | S | Marche sans internet | tablette + coche (sens **positif**) |
| `plus` | S | Ajouter | plus à bouts ronds |
| `ear`, `speech`, `calculator`, `leaf`, `sparkle`, `cloud-off`, `trophy`, `flame`, `medal` | — | **retirés de l'UI enfant** | gardés seulement si un usage parent le justifie ; sinon supprimés après intégration (`IconName` reste exhaustif) |

### 6.6 Barre d'onglets (`app/(child)/(tabs)/_layout.tsx`)

Transposition de la pilule flottante des inspirations, en clair :

- **Pilule flottante** : fond `colors.card`, `shadows.raised`, rayon
  `radius.pill`, marges 16 dp côtés et bas (+ zone sûre), largeur ≤ 600 dp
  centrée sur tablette ; hauteur 88 dp tablette / 76 dp compact. Reste dans
  le flux (pas en absolu).
- Trois emplacements ≥ 120 dp (96 compact), zone tactile pleine hauteur.
- Icônes palier M : **48 dp** tablette, 40 dp compact.
- **Inactif** : `mono` 4 u en `colors.onSurfaceVariant`, libellé `labelMd`
  normal. **Actif** : galet `colors.primaryFixedDim` de 64 dp (56 compact)
  derrière l'icône, mode `color` avec reflet, libellé en gras
  `colors.onPrimaryContainer`. **Quatre indices changent ensemble** : forme,
  contenant, couleur, graisse. Ressort ~240 ms sur le galet (0,6 → 1),
  instantané si `useReducedMotion()`.
- « Parents » : toujours `mono`, cadenas en modificateur, séparé par un
  espace de 8 dp (ce n'est pas un vrai onglet : il ouvre la porte parentale).
- Libellés **toujours visibles** : Accueil / Apprendre / Parents (Maestro).

## 7. Illustrations de discipline — `SubjectArt`

Pictogrammes palier M en mode couleur, une famille de couleur par discipline,
utilisée partout où la discipline apparaît (carte d'accueil, carte
« Apprendre », onboarding page 2, nœud courant de la carte, badge de
discipline).

| Discipline | Famille | Dessin |
|---|---|---|
| `language` (Langage) | bleu pétrole | une grande bulle de parole avec une **bouche qui sourit**, une petite bulle qui répond |
| `reading` (Lecture) | sable / terre | un **livre ouvert**, un grand « a » sur la page de gauche, un signet terre cuite |
| `writing` (Écriture) | or | un **crayon posé sur une ardoise** en cadre de bois, un « a » à la craie |
| `math` (Calcul) | vert acacia | **trois cailloux** de couleur alignés et le chiffre « 3 » |

`muted` (discipline verrouillée) : même dessin, rampes remplacées par
`colors.locked` / `colors.lockedContainer`, toujours reconnaissable.
Les carrés pastel actuels derrière les icônes disparaissent : le
pictogramme **est** la tuile (il peut garder un disque doux de sa famille).

## 8. Avatars — douze enfants du Tchad

### 8.1 Construction commune (viewBox 0 0 120 120, disque r 60 détouré)

Ordre de dessin : disque de fond + motif → cheveux arrière → buste et
vêtement → cou → oreilles → tête → bounce et joues → reflets → sourcils,
yeux, nez, bouche → cheveux avant → accessoires.

- **Tête** (identique pour les douze, 0 u d'écart) :
  `M60 20 C77 20 89 32 89 50 C89 58 88.5 64 86.5 70 C83 80 73 86 60 86 C47 86 37 80 33.5 70 C31.5 64 31 58 31 50 C31 32 43 20 60 20 Z`
  (58 × 66 u, menton large et rond, jamais pointu).
- **Yeux** sur la ligne y ≈ 58, centres x 48 et 72 ; ellipse rx 5,5 ry 6,5
  `illustration.face.eye` ; reflet r 1,9 décalé (−1,8 ; −2,2), **identique sur
  tous les yeux** ; sur `ebene` / `cacao` / `acajou`, un croissant de
  paupière inférieure de 1 u en `light`. Pas de blanc d'œil cerclé, pas de
  cils genrés : arc de paupière supérieure 1,8 u couleur cheveux pour tous.
- **Sourcils** : arcs 10–12 u, trait 2,8 u (3,2 en petit), bouts ronds, 7–8 u
  au-dessus des yeux — le premier levier d'émotion.
- **Nez** : base à y 66–70, **13–15 u de large** (jamais plus étroit), 3,5–6 u
  de haut, sans arête ; ton `shade` avec reflet de bout de nez (ellipse
  rx 2,6 ry 1,4 en `light`).
- **Bouche** 14–16 u, centrée y ≈ 76–77. *Calme* : croissant plein en `lip`
  (`M52.5 75 C55 80.5 65 80.5 67.5 75 C64 77 56 77 52.5 75 Z`) + couture 1,4 u
  en `shade`. *Joie* : bouche en D `face.mouth`, bande de dents ≤ 2,5 u,
  langue dans les 40 % du bas, sourcils montés de 2 u. Jamais de rouge, jamais
  de rose, jamais plus large que 30 % du visage.
- **Oreilles** : ellipses rx 5 ry 7 en x 30,5 et 89,5, y 60, intérieur en C
  de 1,6 u `shade`. **Cou** 18 u, tout en `shade`. **Épaules** ≈ 80 u à
  y ≈ 96, le buste sort du disque par le bas.
- **Lumière de la peau** : croissant de front ≈ 16 × 4 u le long de la
  racine des cheveux côté lumière ; tiret de pommette ≈ 6 × 2 u ; ces reflets
  couvrent ≤ 6 % du visage ; ombres ≤ 15 %. Joues : ellipses `blush`
  (prémélangé, pas d'opacité). Pas de contour sur la peau.
- **Racine des cheveux** : sur `ebene`, `cacao`, `acajou`, **pas de bande
  d'ombre** sous les cheveux (contraste 1,3–2:1, illisible) : c'est le reflet
  du front qui dessine la limite. Sur `cannelle`, `miel`, `sable`, une bande
  d'ombre de 3–4 u est permise.
- **Cheveux = architecture** : `hairBack` (avant la tête : volume afro,
  boules, nattes pendantes) et `hairFront` (après le visage : ligne de
  racine, bords, nattes avant, perles), ancrés au crâne. Teinte
  `illustration.hair`, un croissant de reflet `hair.light` par masse côté
  lumière. Contours d'afro = chaînes d'arcs r 6–9 u à bosses de 1,5–2,5 u
  (doux, jamais hérissés). Au plus 9 marques de texture, en détail complet
  seulement.
- **Vêtement** : une forme principale, une forme d'ombre, une bordure ; au
  plus 3 teintes non-peau par avatar ; au plus un motif répété 3–4 fois,
  chaque occurrence ≥ 6 u. Chaque enfant porte **un seul marqueur d'écolier** :
  bretelle de cartable or de 4 u, coin d'ardoise, ou crayon derrière l'oreille.
- **Disque de fond** : `illustration.backdrop.*`, avec un motif ton sur ton
  (10–14 %, prémélangé) en bas derrière l'épaule : vague du lac, ligne de
  dune, brin d'acacia, éventail de rônier, soleil levant. Jamais une peau
  claire + coiffe claire + disque clair.

### 8.2 Niveaux de détail et expressions

- `lod` automatique : `small` sous 64 dp (pas de texture, de cils, de second
  reflet, de tiret de pommette, de broderie < 2,2 u ; sourcils 3,2 u, reflet
  d'œil 2,4 u), `full` à partir de 64 dp.
- `expression` : `calm` (défaut) et `joy` (écran de réussite, sélection dans
  le profil). Seuls sourcils, paupières et bouche changent.
- ≤ 40 éléments SVG par avatar ; uniquement `Path`, `Circle`, `Ellipse`,
  `Rect`, `G`, `ClipPath` ; `React.memo` ; chaînes `d` précalculées ; id de
  `ClipPath` unique par instance (`useId`).

### 8.3 La distribution (6 filles, 6 garçons, chaque peau deux fois)

Aucun avatar n'a de marqueur religieux. Les quatre premiers descendent des
anciens (même genre, même couleur dominante).

| Id | Enfant | Peau | Cheveux / coiffe | Vêtement | Disque | Marqueur |
|---|---|---|---|---|---|---|
| `avatar-1` | garçon | `cacao` | coupe courte, raie de côté de 1,4 u | chemise d'écolier **pétrole**, col rond | `sky` | bretelle de cartable or |
| `avatar-2` | fille | `acajou` | deux boules afro r ≈ 16, élastiques or, raie au milieu | robe en pagne **terre cuite**, brin d'acacia ton sur ton ×3 ; clous d'oreilles or | `sun` | coin d'ardoise |
| `avatar-3` | garçon | `miel` | mini-afro court, ≤ 7 boucles | **jalabiya vert sauge**, col rond, 5 points de broderie or | `sand` | bretelle de cartable |
| `avatar-4` | fille | `miel` | tresses plaquées → 3 nattes perlées sur l'épaule (perles or, ciel, terre cuite) | haut **prune**, bandeau prune clair | `lavender` | crayon derrière l'oreille |
| `avatar-5` | fille | `sable` | **foulard noué** pétrole (racine, oreilles et cou visibles), nœud à deux pétales, vague blanche ×3 ; petites créoles or | robe sable, col Claudine | `sun` | coin d'ardoise |
| `avatar-6` | garçon | `ebene` | mini-afro arrondi, un reflet | polo **jaune soleil** ; **lunettes rondes** bleu ciel (monture 2,2 u, un éclat par verre) | `sky` | bretelle de cartable |
| `avatar-7` | fille | `cacao` | afro court naturel | robe d'écolière **bleu ciel** col Claudine ; collier de perles | `lavender` | crayon derrière l'oreille |
| `avatar-8` | garçon | `acajou` | **bob** pétrole à bord surpiqué | t-shirt rayé ivoire / ciel (rayures ≥ 4 u) | `sun` | coin d'ardoise |
| `avatar-9` | fille | `ebene` | deux nattes latérales relevées en anses + fine natte centrale, reflet or | robe **latérite** (terre cuite), encolure brodée | `sand` | bretelle de cartable |
| `avatar-10` | garçon | `cannelle` | coupe courte, une ligne rasée | chemise à **carreaux** terre cuite / crème (cases ≥ 5 u) ; **appareil auditif** contour d'oreille bleu ciel, côté lumière | `mint` | crayon derrière l'oreille |
| `avatar-11` | fille | `cannelle` | tresses remontées en **chignon couronne**, bandeau or | haut **boubou indigo**, encolure brodée de points or | `sky` | bretelle de cartable |
| `avatar-12` | garçon | `sable` | boucles souples (calotte arrondie, 5–6 boucles en C) | t-shirt **vert sauge** à poche | `mint` | crayon derrière l'oreille |

Tests de distribution (unitaire) : 12 ids ; 6 filles, 6 garçons ; chaque
peau exactement deux fois (une fille, un garçon) ; 2 aides techniques
(lunettes, appareil auditif) ; aucun accessoire religieux ; tuples
(peau, cheveux, vêtement) uniques. Planches : silhouettes noires à 40 px
(toutes distinctes), niveaux de gris (six peaux distinctes), 40 / 56 / 96 /
160 px.

### 8.4 Libellés

Chaque avatar a une description française dans `strings.ts`
(`fr.avatars.descriptions['avatar-3']` = « Garçon en jalabiya verte », etc.),
qui décrit le style, jamais une infirmité en premier (« Garçon aux lunettes
rondes, polo jaune »). Libellé d'accessibilité d'une tuile :
« Avatar 3 : garçon en jalabiya verte » — le préfixe « Avatar N » reste pour
les flux Maestro.

## 9. Badges — une collection qu'on a envie de compléter

Composant `BadgeArt` (`src/design-system/illustrations/badge-art.tsx`),
dessiné par `BadgeTile` à la place de l'icône.

### 9.1 Une seule famille de médailles (viewBox 0 0 96 96)

- **Bord** : rosette de 12 festons r ≈ 44 dans le ton `shade` du palier ;
  **face** : disque r 37 en `base` ; **biseau** : arc de 2 u en `light` en
  haut à gauche ; **reflet** signature ; **pastille-ombre** 56 × 6 dessous.
- **Emblème** dans une boîte de 44 × 44, 8–14 formes, mêmes règles que les
  pictogrammes (aplats trois tons, pas de contour).
- **Rubans** : deux languettes arrondies 14 × 22 (rx 5) sous la médaille,
  pour les jalons de leçons seulement.
- **Paliers** (rampes de `illustration.metal` et des tissus) : jalons de
  leçons 1 / 5 / 20 / 50 = bronze → terre cuite → pétrole → or ; perfection =
  or ; disciplines = la famille de leur `SubjectArt` ; régularité = safran ;
  collection d'étoiles = or. Le palier se lit aussi à la **forme** : 1, 2 ou
  3 petites encoches sous la médaille pour 5 / 20 / 50 leçons.

### 9.2 Les quatorze emblèmes

| Id | Nom affiché | Emblème |
|---|---|---|
| `first-lesson` | Premiers pas | deux petites empreintes de pieds nus qui avancent |
| `five-lessons` | On continue ! | un chemin de cinq pierres qui mène à un fanion |
| `twenty-lessons` | Élève appliqué | le cartable, boucle en étoile |
| `fifty-lessons` | Grand travailleur | une pile de trois cahiers surmontée d'une étoile |
| `first-perfect` | Sans faute | une grande étoile dodue, une coche de craie dedans |
| `five-perfect` | Cinq sans faute | cinq étoiles en arc, la centrale plus grande |
| `first-world` | Monde terminé | un fanion planté au sommet d'une dune |
| `reader` | Bon lecteur | un livre ouvert, un soleil qui se lève derrière |
| `speaker` | Belle parole | deux bulles de parole qui se répondent |
| `writer` | Belle écriture | l'ardoise et sa craie, un « a » cursif |
| `counter` | Roi du calcul | une couronne dont les trois pointes sont des cailloux 1, 2, 3 |
| `streak-three` | Trois jours de suite | trois soleils levants alignés (un jour = un soleil) |
| `streak-seven` | Une semaine entière | un soleil entouré de sept points-jours |
| `star-collector` | Cinquante étoiles | une calebasse débordante d'étoiles |

### 9.3 Verrouillé ≠ caché

Un badge non gagné montre **sa silhouette** : médaille et emblème en un seul
ton (`colors.lockedContainer` pour la face, `colors.locked` pour l'emblème),
pleine opacité, sans reflet ; plus une pastille cadenas (palier S, 12 u sur
la grille 48) en bas à droite. *« Un badge est un objectif, jamais une boîte
mystère »* (règle existante, conservée).

## 10. Scènes et petites illustrations

Mêmes exports qu'aujourd'hui (les écrans n'ont rien à changer), nouveau
dessin, **mêmes enfants que les avatars** (pièces partagées de
`src/design-system/avatars/avatar-parts.tsx` ; en pied, 3,5–4 têtes de haut —
2–2,5 têtes ferait bébé). Collines et dunes en **bandes arrondies à base
horizontale**, plus jamais d'ellipses empilées. ≤ 60 éléments, ≤ 2 dégradés
(ciel).

| Composant | Où | Ce qu'on voit |
|---|---|---|
| `ReadingChildScene` | Onboarding 1 « Ton école t'accompagne partout » | fin d'après-midi sous un **acacia** (couronne plate en éventail de feuilles-pilules) ; deux enfants de la distribution (une fille, un garçon, deux peaux) lisent un livre assis sur une natte ; une chèvre dort à l'ombre |
| `OfflineReadyScene` | Onboarding 3 « Fonctionne sans connexion » | une tablette posée sur une natte, un petit panneau solaire, l'écran montre une coche verte ; ciel du soir, première étoile. Aucun nuage barré : on dit « ça marche ici » |
| `SunCloudScene` | Écran « hors connexion » | soleil souriant derrière un nuage doux au-dessus d'une dune, repris dans le style trois tons |
| `ProfileStageScene` | Fond du héros de création de profil | paysage calme et lumineux, peu contrasté : ciel chaud, deux bandes de dunes, acacia à gauche, soleil bas à droite. Aucun personnage |
| `ClassLevelArt` | Cartes CP1 / CP2 | **la même pousse qui grandit** dans un petit pot en terre cuite : CP1 = deux feuilles ; CP2 = plus haute, quatre feuilles et un bouton de fleur. `selected` : pot plus saturé + reflet |
| `EmptyQuantityScene` | Comptage quand la quantité vaut **zéro** | un **enclos vide** : barrière de bois en arc, herbe rase, une gamelle vide. On lit « il n'y a rien dedans », pas « l'image n'a pas chargé » |

## 11. Logo et icône d'app

### 11.1 La finale

Deux pistes sont dessinées sérieusement puis départagées par un jury (marque,
enfant/culture, plateformes/lisibilité) sur une **maquette d'écran d'accueil**
réelle (au milieu de WhatsApp, YouTube, Facebook, Duolingo…) à 29, 40, 60 et
180 px, en monochrome et en niveaux de gris.

**A — « L'ardoise à la boucle »** (piste recommandée par la recherche).
L'ardoise d'écolier du CP (programme officiel, p. 26 : « traçage des
boucles vers le haut ») porte le premier geste de graphisme, une boucle
montante — qui est aussi le **« e » cursif** d'ecolna. Une phrase qu'un maître
dirait à un enfant : *« C'est l'ardoise de notre école. »*
Construction (canevas 1024) : fond dégradé vertical **or**
`#FFD978 → #F2B13F` (plus clair en haut, ≤ 12 % de L*) ; groupe ardoise
incliné de **−6°** ; cadre de bois 752 × 564 (4:3), r 120, `#9A5D2A` ; face
rentrée de 68 px, r 60, `#1D3A4C` ; **une seule** boucle de craie continue,
trait 92 px (9 %), bouts et jointures ronds, entrée par la ligne de base à
gauche, ouverture de la boucle ≥ 1,2 × le trait, sortie vers le haut à droite,
`#FBF3E4`, dessinée en **forme pleine modulée** (±10–15 %). Risques à
désamorcer : lu comme une tablette ou une télévision (l'inclinaison, la
couleur bois et la boucle à la main sont **obligatoires** ; jamais de point
de caméra ni de trou de ficelle), jaune citron (Snapchat) à éviter.

**B — « L'éléphanteau-livre »** (finaliste, et piste de mascotte future).
Un éléphanteau de face dont les deux **oreilles sont les deux pages** d'un livre
ouvert (crème `#FBF3E4` / sable `#E0B184`, continuité avec le logo actuel), la
trompe en signet ; tête ≈ 40 % taupe chaud ; yeux blancs Ø ≈ 13 % avec
pupilles 7 % tournées vers le haut et l'intérieur, reflet 2 % ; pas de
défenses (ivoire, braconnage). Les éléphants de Zakouma reviennent depuis
2013 : une histoire de « grandir ». Risques : Evernote, PHP, Ollo de Khan
Kids ; peu familier dans le nord nomade.

Écartées par la recherche (justification dans le dossier) : livre ouvert,
« e » à visage, case au soleil, acacia-livre — ce dernier est **réutilisé**
comme décor de l'onboarding.

### 11.2 Livrables de la piste gagnante

- **Mot-symbole** « ecolna » en bas-de-casse, squelette Quicksand Bold
  (contours extraits avec fontTools, `.cache/venv-design/bin/python`),
  **épaissi** de 0,22 à ≈ 0,30 de rapport fût / hauteur d'x, approche −2 %,
  terminaisons rondes, et **un seul glyphe signature** (si A gagne : le « e »
  est la boucle de craie). Couleur encre brune `#3D2A17` ou `colors.onSurface`.
  Livré en **chemins**, jamais en texte vivant. Sous ≈ 96 dp de large, le
  symbole seul.
- **Composants** (`src/design-system/brand/ecolna-logo.tsx`) : `EcolnaMark`,
  `EcolnaWordmark`, `EcolnaLogo` — mêmes chaînes `d` que les sources
  plateforme (une seule géométrie).
- **Sources plateforme** (`assets/icons/`) : `ecolna-logo-source.svg` (plein
  cadre opaque, aucun coin arrondi, aucune transparence), 
  `adaptive-foreground.svg` (silhouette dans le cercle central de 626 px sur
  1024, convention `scale(0.64)` existante), `adaptive-monochrome.svg`
  (**dessiné à la main** : cadre en anneau plein + boucle pleine, face vide —
  séparations ≥ 32 px, jamais par la couleur seule), `splash-icon-src.svg`
  (**symbole seul**, dans les deux tiers centraux — le texte actuel en
  y = 902 sort du cercle qu'Android 12+ conserve). Fond adaptatif
  (`android.adaptiveIcon.backgroundColor` dans `app.config.ts`) aligné sur le
  fond du logo ; `tests/unit/app-config.test.ts` ajusté s'il le fige.
- **Store** : `store/google-play/graphics/icon-512.png` (régénéré),
  `feature-graphic-src.svg` remis à la nouvelle marque.
- `npm run brand:assets`, puis relecture de chaque PNG à 1024 / 180 / 60 /
  29 px, sous masques cercle, écusson et carré arrondi (Play : rayon 30 %).
- Jetons de marque (or, bois, ardoise, craie) dans
  `src/design-system/tokens/illustration.ts` (bloc `brand`).
- (conseil, hors périmètre de cette passe) une icône **Liquid Glass**
  `assets/ecolna.icon` faite dans Icon Composer, avec `ios.icon` dans
  `app.config.ts` — demande un build natif pour être vérifiée.

## 12. Écran « Crée ton profil » — l'écran le plus important de l'app

### 12.1 Intention

C'est la première fois que l'enfant se voit dans l'app. L'écran est une
**petite cérémonie d'entrée à l'école** : il choisit qui il est, un adulte
écrit son prénom pendant qu'il le **voit s'écrire à la craie sur son
ardoise**, il dit dans quelle classe il est — et l'école l'accueille.

### 12.2 La scène (persistante, ne se démonte jamais)

`ProfileStage` (`src/features/onboarding/presentation/profile-stage.tsx`) :

- Fond `ProfileStageScene`.
- **Le personnage** choisi, grand (300–320 dp volet gauche en paysage ;
  240–260 dp tablette portrait ; 140–160 dp téléphone ; 120–160 dp quand le
  clavier est ouvert), expression `joy` dès qu'il est choisi. Avant tout
  choix : une silhouette neutre douce (forme de tête et d'épaules en
  `colors.surfaceContainerHigh`), jamais de « ? » agressif.
- **L'ardoise** sous le personnage (comme un écolier qui montre son ardoise) :
  cadre bois, face `illustration.school.slate`, texte craie
  `illustration.school.chalk` : petite ligne « Je m'appelle » puis **le
  prénom** en Quicksand Bold mis à l'échelle (34–56 sp, une ligne,
  `adjustsFontSizeToFit`, `minimumFontScale` 0,5), **première lettre en or**
  (`illustration.metal.gold.light`). Ardoise vide : une ligne de base
  pointillée à la craie et un petit crayon, jamais de texte.
- **La pastille de classe** « CP1 » / « CP2 » qui apparaît sur l'ardoise
  quand la classe est choisie.
- Accessible comme un tout : « Ta carte : {prénom}, {classe} ».

### 12.3 Les étapes (une décision par écran)

Une seule route, un état d'étape interne : `personnage` → `prenom` →
`classe` → `bienvenue`. Seul le panneau d'étape change (fondu enchaîné
220 ms ; 120 ms de fondu simple si mouvement réduit). Progression : 3 points
de 12 dp, l'actif en pilule 32 × 12, libellé « Étape 2 sur 3 ». Bouton retour
64 × 64 dp en haut à gauche (et retour Android) = étape précédente.

1. **« Choisis ton personnage »** — grille des 12 avatars, tuiles ≥ 120 dp
   sur tablette (5 × 2 + 2 en paysage volet droit, 4 × 3 en portrait), 96 dp
   sur téléphone (3 colonnes), écarts 16–24 dp, rayon `radius.xl`, chaque
   tuile dans son disque de couleur, **aucune tuile grisée**. Sélection =
   anneau 4 dp `colors.secondary` **+** coche ronde 28 dp **+** ressort
   ×1,06 ; le personnage saute sur la scène (0,85 → 1, ~300 ms). **Rien de
   présélectionné.** Bouton : « C'est moi ! ».
2. **« Comment tu t'appelles ? »** — ligne pour l'adulte au-dessus du champ,
   petite (`labelMd`, `textSecondary`, icône `parents`) : « Parent ou
   enseignant : écrivez le prénom de l'enfant (ou un surnom). » Libellé
   persistant « Prénom (ou surnom) ». Champ **72 dp** (64 téléphone), texte
   28 / 24 sp Quicksand SemiBold, rayon 16, bord 2 dp
   `colors.primaryContainer` → 3 dp `colors.secondary` au focus, bouton
   d'effacement 48 dp. Props : `autoCapitalize="words"`, `autoCorrect={false}`,
   `spellCheck={false}`, `autoComplete="off"`, `textContentType="none"`,
   `importantForAutofill="no"`, `maxLength={30}`, `returnKeyType="next"`,
   `onSubmitEditing` → étape suivante. Placeholder « Écris ton prénom ici »
   conservé (Maestro). Sous le champ, avec l'icône `shield` : « Le prénom
   reste sur cet appareil. Pas de compte, pas d'e-mail, rien n'est envoyé. »
   Bouton : « C'est mon prénom ! ».
3. **« Tu es dans quelle classe ? »** — deux grandes cartes côte à côte
   (≥ 200 × 220 dp tablette portrait, 280 × 260 dp volet droit en paysage,
   150 × 176 dp téléphone) : grand chiffre « 1 » / « 2 » (`displayGlyph`
   mis à l'échelle), `ClassLevelArt`, « CP1 » / « CP2 » (`headlineSm`), glose
   adulte « 1re année » / « 2e année » (`labelMd`). Sélection = anneau 4 dp
   + coche 28 dp + ombre `raised`. **Rien de présélectionné.** Pied pour
   l'adulte : « Vous pourrez changer la classe plus tard dans l'espace
   parents. » Bouton : **« C'est parti ! »** (Maestro).
4. **Bienvenue** — on **enregistre d'abord** (profil, `active_profile_id`,
   `onboarding_done`), puis ≤ 2 s : le personnage en `joy`, la pastille de
   classe qui se pose, 6–8 étoiles or qui éclosent dans un rayon de 120 dp
   puis s'effacent (600 ms) ; « Bienvenue, {prénom} ! » en `headlineLg` ;
   bouton « On y va ! » visible dès 600 ms ; un appui n'importe où passe. Avec
   mouvement réduit : pas d'éclosion ni d'échelle, fondu de 200 ms d'étoiles
   fixes. Puis `router.replace('/(child)/(tabs)')`.

**Jamais de bouton grisé** : un appui trop tôt rejoue la consigne visuelle —
l'élément manquant s'entoure d'un anneau or qui pulse deux fois (2 × 600 ms ;
anneau fixe 2 s si mouvement réduit) et une aide douce s'affiche (« Touche le
personnage qui te ressemble. » / « Il manque ton prénom : demande à un adulte
de t'aider. » / « Touche ta classe. »). **Aucun rouge, aucune erreur.**

Sélection tactile : `onPressIn` **et** `onPress` (les lecteurs d'écran
déclenchent `onPress`), idempotente ; `hitSlop` 8–12 dp sans chevauchement ;
retour visuel < 100 ms (échelle 0,96) ; garde de 400 ms contre les doubles
appuis ; cibles principales ≥ 32 dp au-dessus de la zone sûre basse.

### 12.4 Mises en page

- **Tablette paysage** (`splitPanes`) : scène à gauche (≈ 44 %), étape à
  droite (≈ 56 %). Clavier ouvert : champ dans les 40 % hauts du volet
  droit, bouton juste à côté, jamais épinglé en bas.
- **Tablette portrait** : scène en haut (≈ 38 % de la hauteur), étape dessous
  dans une colonne `contentMaxWidth`.
- **Téléphone** : scène compacte (≈ 180 dp) puis l'étape ; la grille défile
  verticalement — **jamais de carrousel horizontal**.
- **Mode clavier** (hauteur de fenêtre utile < 480 dp, ou clavier ouvert) :
  on masque points de progression et ligne adulte, la scène rétrécit (le
  personnage à 120 dp, l'ardoise reste lisible).
- Clavier : événements `Keyboard` de React Native + `KeyboardAvoidingView`
  (iOS `padding`) ; hauteur 0 (clavier flottant iPad) = fermé ;
  `disableFullscreenUI` sur Android. Ne pas autofocaliser le champ si un
  lecteur d'écran est actif ; sinon focus ~250 ms après l'arrivée sur
  l'étape.

### 12.5 Accessibilité spécifique

Grille `radiogroup` « Choisis ton personnage », tuiles `radio` avec état
`checked` et libellé « Avatar N : description » ; cartes de classe « CP1,
première année » ; titres d'étape `header`, focus d'accessibilité déplacé sur
le titre à chaque changement ; « Étape n sur 3 » ;
`announceForAccessibility('Bienvenue, Amina')` une fois ;
`maxFontSizeMultiplier` ≈ 1,4 sur les grands textes.

### 12.6 Ce qu'on ne fait pas

Ni nom de famille, ni âge, ni école, ni photo, ni voix : prénom (ou surnom) +
personnage + classe, rien d'autre. Pas de carrousel. Pas de rouge. Pas de
synthèse vocale du prénom. Pas d'animation qui boucle.
(Hors périmètre de cette passe, à proposer ensuite : consignes vocales
enregistrées pour chaque étape, et le sélecteur « Qui apprend aujourd'hui ? »
quand il y a plusieurs profils.)

## 13. Intégration écran par écran

| Écran / composant | Avant | Après |
|---|---|---|
| Barre d'onglets | `home`, `book`, `parents` 24 px, pilule couleur seule | § 6.6 : `home`, `learn` (cartable), `parents` ; palier M 48 dp ; pilule flottante |
| Accueil — en-tête | texte « ECOLNA » | `EcolnaWordmark` (ou `EcolnaMark` en compact si la place manque) |
| Accueil — en-tête | avatar 40 px | `EcolnaAvatar` 44 dp ×`scale` |
| Accueil — hors connexion | `cloud-off` + barre rouge | `offline-ok` (sens positif) |
| Accueil — série | `flame` | `sun` (mode couleur) |
| Accueil — héro leçon | `play` | `play` palier M |
| Accueil — atelier révision | `leaf` | `sprout` |
| Accueil — titre « Tes activités » | `star-outline` | `star` palier S mono (ou rien) |
| Accueil, Apprendre, Onboarding p. 2 — disciplines | `speech`, `book`, `pencil`, `calculator` dans des carrés | `SubjectArt` |
| Apprendre — flèche | `chevron-right` | `chevron-right` v2 |
| Carte de niveau — nœud en cours | `sparkle` | `SubjectArt` de la discipline de la carte |
| Carte de niveau — terminé / verrouillé | `check` / `lock` | `check` / `lock` palier M |
| Création de profil | — | § 12 |
| Réussite | avatar + coche | `EcolnaAvatar` `expression="joy"` + `check` |
| Mon profil — avatar et choix | `AvatarFace` | `EcolnaAvatar` ; grille des 12 (mêmes tuiles que § 12.3) |
| Mon profil — chiffres | `book`, `star`, `flame` | `book`, `star`, `sun` en mode `duo` |
| Mon profil — badges | `BadgeTile` + icône | `BadgeArt` |
| Parents — « Niveau actuel » | `sparkle` | `level` |
| Parents — « Leçons complétées » | `book` | `book` |
| Parents — « Notions maîtrisées » | `sparkle` | `target` |
| Parents — « Temps aujourd'hui » | **`star`** | `clock` |
| Parents — « Analyse de progression » | `sparkle` | `insight` |
| Porte parentale | `parents` | `shield` |
| Réglages | `speaker`, `book`, `check`, `lock`, `gear`, `trash` | mêmes sens, v2 ; `lock` → `shield` pour la confidentialité |
| Démarrage en échec | `cloud-off` | `refresh` |
| Page introuvable, erreur | `leaf` | `compass` |
| Leçon — fermer / indice | `close` / `lightbulb` | v2 |
| Exercice « écoute » — filigrane | `leaf` 180 px | brin d'acacia ton sur ton (§ 4.5) ou rien |
| Exercice « répète » | consigne en double | supprimer le titre du composant (l'écran de leçon l'affiche déjà) |
| Exercice de comptage, quantité 0 | cadre vide | `EmptyQuantityScene` |
| Bouton audio | `speaker` | `speaker` palier M |
| Retour | `arrow-back` | v2 |
| Fonds de cartes en dur (`#faf7ec`, `#f9ecd8`) | couleurs en dur dans les renderers | jetons dans `colors.ts` |

## 14. Contrats de code, fichiers et propriétaires

Les équipes travaillent **en parallèle dans le même arbre**. Chaque fichier a
un seul propriétaire ; on n'édite pas le fichier d'un autre. Les contrats
sont figés : on peut les étendre (props optionnelles), jamais les casser.

### 14.1 Jetons — direction artistique
`src/design-system/tokens/illustration.ts` (les équipes peuvent **ajouter**
une rampe commentée ; l'équipe marque possède le bloc `brand`).

### 14.2 Icônes — équipe icônes
`src/design-system/icons/ecolna-icon.tsx` (+ sous-fichiers
`src/design-system/icons/glyphs-s.tsx`, `glyphs-m.tsx` si besoin) et
`src/design-system/icons/subject-art.tsx`.

```ts
export type IconName = /* tous les noms existants (rétrocompatibles) + § 6.5 */;
export type IconMode = 'mono' | 'duo' | 'color';
export function EcolnaIcon(props: {
  name: IconName;
  size?: number;     // défaut 24 ; ≥ 32 → dessin palier M s'il existe
  color?: string;    // couleur du mode mono (défaut colors.onSurfaceVariant)
  filled?: boolean;  // rétrocompatible : équivaut à mode 'color' (M) / jumeau plein (S)
  mode?: IconMode;   // défaut : filled ? 'color' : 'mono'
}): React.JSX.Element;

export type SubjectArtId = 'language' | 'reading' | 'writing' | 'math';
export function SubjectArt(props: { subject: SubjectArtId; size?: number; muted?: boolean }): React.JSX.Element;
```

### 14.3 Avatars — équipe personnages
`src/design-system/avatars/` : `avatar-parts.tsx` (tête, yeux, bouches,
oreilles, cheveux, vêtements — réutilisables par les scènes), `avatar-cast.ts`
(la distribution), `ecolna-avatar.tsx`, `index.ts`, test
`avatar-cast.test.ts`.

```ts
export const AVATAR_ART_IDS: readonly string[];   // 'avatar-1' … 'avatar-12'
export type AvatarExpression = 'calm' | 'joy';
export function EcolnaAvatar(props: {
  avatarId: string;              // id inconnu → avatar-1, jamais de crash
  size: number;                  // diamètre en dp
  expression?: AvatarExpression; // défaut 'calm'
  backdrop?: boolean;            // disque de fond, défaut true
}): React.JSX.Element;
export function AvatarSilhouette(props: { size: number }): React.JSX.Element; // place vide du profil
```

`src/features/child-profile/domain/child-profile.ts` : `AVATAR_IDS` étendu à
12 (les quatre premiers inchangés) ; `avatarVariant` supprimé à
l'intégration. Descriptions dans `strings.ts` (`fr.avatars`).

### 14.4 Badges et scènes — équipe décors
`src/design-system/illustrations/badge-art.tsx` et
`src/design-system/illustrations/scenes.tsx`.

```ts
export type BadgeArtId = /* les 14 AchievementId */;
export function BadgeArt(props: { id: BadgeArtId; earned: boolean; size: number }): React.JSX.Element;

// scenes.tsx — exports existants conservés (props { width?, height? }) + :
export function ClassLevelArt(props: { level: 'CP1' | 'CP2'; size: number; selected?: boolean }): React.JSX.Element;
export function EmptyQuantityScene(props: { size: number }): React.JSX.Element;
export function ProfileStageScene(props: { width: number; height: number }): React.JSX.Element;
```

### 14.5 Marque — équipe marque
`src/design-system/brand/ecolna-logo.tsx`, `assets/icons/*.svg`,
`store/google-play/graphics/feature-graphic-src.svg`, PNG régénérés,
`app.config.ts` (fond adaptatif seulement), bloc `brand` des jetons.

```ts
export function EcolnaMark(props: { size: number; tone?: 'color' | 'mono'; monoColor?: string }): React.JSX.Element;
export function EcolnaWordmark(props: { height: number; color?: string }): React.JSX.Element;
export function EcolnaLogo(props: { height: number; layout?: 'horizontal' | 'stacked' }): React.JSX.Element;
```

### 14.6 Création de profil — équipe UX + dev
`app/(onboarding)/create-profile.tsx`, `src/features/onboarding/presentation/*`,
blocs `profile` et `avatars` de `strings.ts`, `maestro/01-onboarding-first-launch.yaml`.

### 14.7 Intégration — équipe dev
Tous les autres écrans et composants de la table § 13, la barre d'onglets,
`app/(dev)/design-system.tsx`, `count-objects-exercise.tsx`,
`listen-repeat-exercise.tsx`, `listen-exercise.tsx`, les flux Maestro dont un
libellé change, `docs/design-decisions.md`.

### 14.8 Planches de contact
Chaque équipe livre sa planche dans `scripts/design-sheets/<nom>.sheet.tsx`
(**première ligne obligatoire : `/** @jsxRuntime automatic */`**), rendue par :

```bash
npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/<nom>.sheet.tsx .cache/design-renders/<nom>.png --dpr 2
```

Sections obligatoires : tailles réelles (24 / 32 / 40 / 48 / 64 / 96 / 160
selon le livrable) en `--dpr 1` **et** 2, fonds `#ffffff`, `#F4F1DE`,
`#d4a373`, niveaux de gris (`grayscale: true`), silhouettes noires pour les
avatars. Les composants d'art n'importent **que** `react`,
`react-native-svg` et les jetons — jamais `react-native` — pour rester
rendables hors appareil. Transformations : seulement `transform="…"` en
chaîne (pas `rotation`/`origin`/`scale`). Identifiants de `ClipPath` et de
dégradés : `useId()`.

## 15. Budgets de performance (tablettes d'entrée de gamme)

| Élément | Budget d'éléments SVG | Autres règles |
|---|---|---|
| Glyphe palier S | ≤ 6 | trait 2, pas de dégradé, pas de masque |
| Pictogramme palier M / `SubjectArt` | ≤ 6 chemins (+ reflet) / ≤ 15 éléments | aucun dégradé |
| Avatar | ≤ 40 | 1 `ClipPath` (le disque), aucun dégradé |
| Badge | ≤ 25 + médaille | aucun dégradé |
| Scène | ≤ 60 | ≤ 2 dégradés (ciel) |
| Logo (app) | ≤ 3 formes sur le fond | 1 dégradé (le fond) |

Composants d'art en `React.memo`, props primitives ; pas d'allocation de
tableau d'éléments à chaque rendu quand la liste est statique ; défilement
de la grille de 14 badges à 60 i/s sur tablette 2 Go.

## 16. Accessibilité

- Cibles tactiles enfant : ≥ 96 dp pour les choix principaux de l'enfant
  (≈ 1,5 cm), 120 dp quand la tablette le permet ; parent ≥ 48 dp.
- Jamais la couleur seule : sélection = anneau **et** coche **et**
  agrandissement ; onglet actif = forme **et** contenant **et** couleur **et**
  graisse ; verrouillé = ton unique **et** cadenas.
- Illustrations décoratives : `accessible={false}` ; avatars et classes :
  libellés français descriptifs (§ 8.4, § 12.5).
- Contraste : texte sur illustration ≥ 4,5:1 ; icônes d'action ≥ 3:1 sur leur
  fond ; détail sur teinte ≥ 4,5:1 (§ 6.4).
- Mouvement : tout est conditionné à `useReducedMotion()` ; rien ne boucle ;
  ≤ 400 ms (hors bienvenue ≤ 2 s, passable).
- Lisibilité au soleil : chaque dessin est vérifié **en niveaux de gris** et à
  **taille réelle 1x**.

## 17. Processus : une vraie équipe, de vraies critiques

1. **Esquisse** — chaque équipe livre une première version + sa planche, et
   s'auto-critique au moins trois fois (dessiner → rendre → regarder →
   corriger) avant de rendre.
2. **Critique n° 1** — la direction artistique regarde la planche (PNG, 1x et
   2x) et note selon la grille § 17.1 ; liste de corrections précises
   (élément, défaut, correction : coordonnées, proportions, jeton).
3. **Reprise** — corrections appliquées, planche régénérée.
4. **Critique n° 2** — mêmes critères + revue *culturelle* (un regard
   tchadien : chaque enfant du nord au sud se reconnaît-il ? un stéréotype ?)
   et revue *enfant* (un enfant de 5 ans comprend-il sans lire ?).
5. **Intégration** — puis captures réelles sur simulateur iPad 13" (paysage
   **et** portrait) et iPhone, relues une par une.
6. **Revue finale adversariale** — design, UX enfant, accessibilité,
   ingénierie : chacun cherche ce qui ne va pas, pas ce qui va.

### 17.1 Grille de critique (chaque critère /5, seuil 4 partout)

1. **Une seule main** : mêmes primitives, rayons, épaisseurs, lumière sur
   toute la famille.
2. **Lisibilité** : compris à 24 px (glyphes), 40 px (pictogrammes, avatars,
   badges) en 1x et en niveaux de gris ; silhouettes distinctes.
3. **Âme** : un détail qu'aucun template n'aurait ; on sent un regard humain.
4. **Justesse culturelle** : de chez nous, sans cliché, sans symbole
   religieux par défaut, nord et sud également représentés, aucun marqueur
   de caricature.
5. **Charme enfant** : un enfant de 5 ans a envie de toucher ; pas « bébé ».
6. **Sobriété technique** : budgets § 15, jetons § 5, géométrie propre (pas
   de points parasites, de chevauchements accidentels, de décimales
   inutiles ; courbes tendues).

## 18. Définition de « terminé »

- [ ] Toutes les planches rendues, relues, critères § 17.1 ≥ 4.
- [ ] `npm run typecheck && npm run lint && npm test && npm run validate:content` verts.
- [ ] `npm run brand:assets` relancé ; icône d'app, adaptative, monochrome,
      splash, icône 512 et bannière Play régénérées et relues.
- [ ] Bundle iOS exporté sans erreur (`npx expo export --platform ios`).
- [ ] Captures simulateur (iPad paysage + portrait, iPhone) : création de
      profil (chaque étape, vide et rempli, clavier ouvert), accueil,
      apprendre, carte, réussite, mon profil, parents, porte parentale,
      exercice « zéro », exercice « répète ».
- [ ] Flux Maestro alignés sur tout libellé ou parcours modifié.
- [ ] `docs/design-decisions.md` complété (décision v2 et pourquoi).
