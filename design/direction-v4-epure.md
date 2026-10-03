# ECOLNA — Direction v4 « Épure »

> Remplace la direction v3 « Galets en relief » (`design/direction-ecrans-v3.md`),
> à la demande du propriétaire : « quelque chose de visuellement beau, épuré,
> qui corresponde à l'état de l'art » — l'app doit convaincre des cadres du
> ministère et, demain, des investisseurs. Les jetons (`src/design-system/tokens/`)
> font foi ; ce document dit pourquoi.

## 1. Diagnostic de la v3 (captures du 3 octobre 2026)

Un panel indépendant (direction artistique produit, veille de l'état de l'art
2024-2026) a nommé ce qui faisait « ringard », dans l'ordre où un investisseur
le voit :

1. **Des tranches partout** : chaque bouton, carte, tuile posé sur une bande
   plus foncée — le motif le plus copié de l'edtech 2016-2019.
2. **Un lavis beige** : toile ivoire, dunes sable, pistes sable, gris taupe ;
   le seul jaune portait à la fois l'action, les étoiles et une discipline.
3. **Des reflets « bonbon »** sur les barres, les étoiles, les médailles, les
   cheveux : le vocabulaire des jeux de 2012.
4. **Du décor collé** : la même dune et le même acacia sur sept écrans, un
   brin dans chaque coin d'exercice, des rayons de soleil clip-art.
5. **Des avatars de banque d'images**, un seul visage recoloré, des
   accessoires rognés (une ardoise lue « 0 »).
6. **Des barres de progression bâclées** : pistes invisibles (1,2:1),
   fractions « 0/53 » sous les yeux d'un enfant de cinq ans.
7. **Deux formes de « a »** dans l'interface d'une app d'apprentissage de la
   lecture (Quicksand et Plus Jakarta) — un inspecteur le relèverait.

## 2. Principes

1. **Le contenu est le héros.** Une lettre, un nombre, un mot, sur une page
   claire. L'illustration sert les trois grands moments (la carte du jour, le
   chemin, la célébration), jamais de papier peint.
2. **Une couleur par rôle.** Soleil = agir et récompenser ; bleu = choisir ;
   nuit = les grands moments ; une teinte par discipline ; vert = réussi.
   Rien d'autre n'est coloré.
3. **Plat, précis, doux.** Pas de tranche, pas de reflet, pas de texture. La
   profondeur vient d'ombres en couches, douces et froides (`boxShadow`).
4. **Ce qui se touche le dit par le mouvement** : ressort à 0,96 à l'appui,
   retour haptique léger ; jamais par une épaisseur dessinée.
5. **Une seule forme de « a »** dans tout ce que voit l'enfant : celle de
   l'école.
6. **Le lieu par les personnes et les choses**, pas par le décor : les douze
   enfants, les objets de leur quotidien, les noms des couleurs.

## 3. Couleur

| Rôle | Jeton | Valeur | Contraste |
|---|---|---|---|
| Toile (navigation) | `canvas` | `#F6F7F9` | — |
| Page d'exercice, cartes | `white` | `#FFFFFF` | — |
| Encre | `ink` | `#1B2130` | 16:1 |
| Encre secondaire | `inkSecondary` | `#4F5869` | 6,7:1 sur la toile |
| Soleil — action, récompense | `reward` | `#FFB81C` | texte `#2B1B00` à 9,6:1 |
| Bleu — choix, focus, « on réessaie » | `brand` | `#2F5BDB` | blanc 5,8:1 |
| Nuit du Sahel — grands moments | `night` | `#1C2554` | blanc 14,6:1, soleil 8,4:1 |
| Réussi | `success` / `successInk` | `#1F9D55` / `#15703C` | 6,2:1 (texte) |

Les quatre disciplines (plein ≥ 3:1 pour le graphisme, profond ≥ 4,9:1 sous
du texte blanc, encre ≥ 6:1 sur la teinte) :

| Discipline | Nom | Plein | Profond | Teinte | Encre |
|---|---|---|---|---|---|
| Langage | lac Tchad | `#0F9AA8` | `#0B7A86` | `#E2F5F6` | `#075E67` |
| Lecture | terre cuite | `#E0592A` | `#C2481F` | `#FDEDE6` | `#9A3815` |
| Écriture | encre violette (celle de l'école) | `#7A5AF5` | `#5B3CD8` | `#F0EDFF` | `#4F33C2` |
| Calcul | bissap | `#C9407E` | `#A8306A` | `#FBE8F1` | `#8E2457` |

Jamais de rouge pour l'enfant : une réponse à revoir prend le bleu calme de
la marque, avec une flèche de reprise.

## 4. Typographie

- **Ecolna Sans** — Figtree (OFL) dont le « a » à un seul étage (jeu `ss01`)
  est figé par défaut, renommée (`assets/fonts/FONTLOG-EcolnaSans.txt`).
  Toute l'interface ; titres serrés (−0,7 à −0,15), graisses 400 à 800.
- **Andika** (SIL International, OFL) — ce que l'enfant apprend à lire :
  lettres, syllabes, mots, nombres. Dessinée pour l'alphabétisation : « a » et
  « g » de l'écriture scolaire, b/d/p/q non symétriques, I/l/1 distincts.
- Aucune autre famille. Quicksand et Plus Jakarta Sans sont retirées.
- Les polices sont lues depuis le bundle au démarrage (`useFonts`), aucun réseau.

## 5. Forme et profondeur

- Rayons : 6 · 10 · 12 · 16 · **20 (cartes, réponses)** · 28 (grands panneaux)
  · pilule (boutons, puces, pistes). Coins continus sur iOS.
- Ombres (`tokens/shadows.ts`) : posé (`card`), levé (`raised`), flottant
  (`floating`), et deux halos colorés (`glowReward`, `glowBrand`) pour les
  actions pleines. Une ombre `boxShadow` ne change pas l'empilement Android.
- Filets : 1 dp sur une carte posée, 2 dp sur ce qui se touche.

## 6. Icônes

Une seule famille : **Phosphor** (MIT), embarquée comme données
(`icons/phosphor.generated.ts`, régénérée par `scripts/icons/build-icons.mjs`).
Trait « bold » au repos, plein à l'actif ou pour la récompense, duotone pour
l'objet d'une illustration. La coche de réussite est une pastille verte au
trait blanc, partout la même.

## 7. Progression

- **Leçon** : une barre segmentée, un segment par exercice, dans la couleur de
  la discipline ; le segment en cours se remplit à demi sur un ressort.
- **Discipline** : un anneau autour de son emblème ; plein, il passe au soleil.
- **Parcours** (`level-map.tsx`) : un fil net de 8 dp relie les mondes en
  courbes tendues — gris ce qui reste, vert ce qui est parcouru. Monde fini :
  disque vert, coche blanche, ses étoiles sous son nom. Monde du jour : disque
  à la couleur de la discipline, emblème blanc, cerclé de l'anneau de ses
  leçons faites, et le bouton soleil « Commencer » sous son nom. Fermé :
  disque blanc, anneau pâle de sa discipline, grand cadenas à trou de serrure
  (0,40 × le disque) à l'encre de la discipline — la même grammaire pour les
  leçons à venir du volet, qui répondent à l'appui (la leçon du jour se
  balance). Couché, le chemin est resserré (noms à droite, sans sous-titre)
  pour montrer quatre à cinq mondes ; toute liste qui défile finit dans un
  fondu, jamais sur une rangée tranchée.
- **Étoiles** : gagnées pleines au liseré ambre, à gagner en contour — la
  forme sépare 1 étoile de 3, même au soleil.
- **Aucune fraction sous les yeux de l'enfant** : les nombres restent à
  l'espace parent (qui gagne une ligne par discipline).
- Plus de reflet, plus de piste invisible : la piste neutre `track`
  (#CDD3DD), lisible sur blanc comme sur la toile (`fill` y était invisible).

## 8. Les douze enfants

Redessinés sur une construction mesurée (`avatars/portrait.tsx`, repère
120) : tête ovale 54 × 58, oreilles, cou et buste ; coiffures construites par
des fonctions (festons, nattes en chaîne, natte relevée effilée), calculées
une fois au chargement. Yeux pleins avec un point de lumière, sourcils de la
couleur des cheveux, nez par personnage, joues prémélangées (aucune
opacité), bouche d'un trait (calme) ou ouverte avec la langue (joie, yeux
plissés, sourcils levés). Aucun contour, aucun reflet, aucun accessoire
d'écolier ; disques de fond clairs, attribués pour que deux voisins de la
grille ne partagent jamais le leur. Sous 64 dp, détail réduit (budget de
40 éléments SVG, une seule découpe). La distribution (six peaux, deux aides
techniques, aucun marqueur religieux) et ses tests sont inchangés. Les
planches de bibliothèques d'avatars consultées pendant la recherche n'ont
servi que de références de proportions : aucun tracé n'en provient.

## 8 bis. Médailles, illustrations, marque

- **Médailles** (`illustrations/badge-art.tsx`) : un médaillon plat en deux
  disques — couronne claire, cœur plein — cerclé d'un filet blanc, et un
  pictogramme Phosphor ; les jalons de leçons portent 1 à 4 points, liserés
  de blanc. À gagner : la même forme dans la version pâle de sa famille
  (couronne tint, cœur tintStrong, pictogramme atténué) avec une pastille
  cadenas — jamais une grille grise ; les gagnées d'abord sur l'étagère.
- **Illustrations « orbite »** (`illustrations/orbit.tsx`) : deux cercles
  concentriques (la vannerie de la carte du jour et de la célébration), un
  sujet au centre, des satellites — les personnages de l'app, ou des
  pastilles de pictogrammes. Réservées à l'onboarding : les satellites de
  l'anneau intérieur ne mordent jamais le sujet (rayon ≥ sujet + demi-
  satellite + 8 dp). Ailleurs, une composition propre : la carte du jour
  montre l'image de la leçon seule sur son disque blanc ; la création de
  profil s'ouvre sur une invitation (disque cerclé d'un pointillé bleu, une
  main qui salue) que le personnage choisi remplace ; l'écran hors connexion
  montre la tablette, ses quatre disciplines à l'écran.
- **Célébration** : la nuit, l'enfant en joie cerclé de la vannerie, ses
  trois étoiles qui éclosent au-dessus de lui, une pluie de confettis unique
  (aucune en mouvement réduit) ; à droite, sur le même axe, la discipline et
  le titre de la leçon, « Bravo ! », les médailles gagnées, la suite.
- **Marque** : le livre ouvert de l'icône passe aux couleurs v4 — fond bleu
  marque, page blanche, page soleil (`assets/icons/*.svg`, `npm run
  brand:assets`) ; `brand/ecolna-mark.tsx` en est la même géométrie dans
  l'interface. La finale du logo (ardoise ou éléphanteau, brief v2 § 11)
  reste à trancher par le propriétaire : ce recoloriage ne la préjuge pas.

## 8 ter. L'exercice

- **Regarder ≠ toucher** : le stimulus (ce qu'on regarde ou écoute) est une
  surface plate dans la teinte de la discipline, sans filet ni ombre
  (`EcolnaStimulus`) ; les réponses sont blanches, filetées, ombrées. Côte à
  côte, le stimulus prend la hauteur du bloc de réponses : bords communs —
  sauf quand les réponses sont des glyphes courts (compter) : on aligne alors
  les axes, et les cartes gardent les proportions d'une carte (≈ 1,2).
- **Rien ne déborde** : une image tient dans 76 % de l'intérieur de sa carte,
  mesurée (`illustration-fit.ts`).
- **Le verdict sur la carte** : pendant la feuille de retour, la carte choisie
  devient verte et cochée (juste) ou bleue avec la flèche de reprise (à
  revoir) ; les autres restent blanches, inertes — jamais grisées
  (`AnswerVerdictContext`).
- **La consigne est dite d'elle-même** à chaque exercice, puis le son de
  l'exercice (`playSequence`) ; le bouton de consigne porte une bulle de
  parole, le haut-parleur est réservé au son à trouver.
- **Tracer** : l'ardoise est de nuit ; la lettre modèle dans une pastille en
  haut à gauche ; le modèle à la craie (`slateChalk`, bouts francs posés sur
  les lignes) porte une ligne médiane tiretée ; une bille soleil court le
  long du trait à écrire (flèche fixe en mouvement réduit) ; les traits sont
  numérotés ; seul le prochain jalon est gros. La lettre se dit à
  l'ouverture et à la fin, où elle passe au soleil (1,4 s, une vibration).
- **Relier** : un point d'accroche à cheval sur le filet de chaque carte
  (blanc au repos, bleu au choix, teinte de la paire une fois reliée) ; on
  commence d'un côté ou de l'autre ; chaque carte dit son son ou son mot
  quand il existe ; à « à revoir », seules les paires fausses le montrent et
  seules elles s'effacent.
- **Le personnage réagit** : dans la feuille de retour, l'enfant (joie si
  c'est juste, calme sinon) porte la pastille du verdict.
- **L'aide monte d'elle-même** : au deuxième essai manqué, l'indice s'ouvre et
  se dit ; au troisième, « On reverra ça ensemble. » et l'on avance — l'étape
  part en révision. Un enfant ne tourne jamais en rond.
- **Rien à juger, pas de « Bravo »** : écouter, répéter et tracer enchaînent
  sans feuille de retour ; le tracé se valide seul, la lettre brille au soleil.
- **Les lignes du cahier** : sur l'ardoise, la ligne de base (pleine), la
  hauteur d'x et les hampes (tiretées) ; les lettres courtes sont posées sur
  la même hauteur d'x.
- **Plus grand sur grande tablette** : au-delà de 780 dp de haut, réponses et
  images grandissent ; le contenu s'ancre sous la consigne (un tiers de l'air
  au-dessus, deux tiers au-dessous).

## 8 quater. Mise en page

- Une seule gouttière (`screenPadding`) : la marge de la classe de fenêtre,
  élargie pour que le contenu ne dépasse jamais la colonne lisible. Le bord
  gauche et le bouton retour tombent au même endroit sur tous les écrans.
- Couché, deux volets : le parcours montre à droite les leçons du monde du
  jour ; le profil, son identité à gauche et sa collection à droite.
- Une couleur par rôle, tenue partout : la révision (« on revoit ») est
  bleue, la série de jours est un soleil. « Sans internet » n'est plus une
  puce sur l'accueil de l'enfant (un adulte y lisait une alerte) : la
  promesse vit dans l'onboarding, l'écran hors connexion et les réglages.
- L'accueil remplit sa hauteur : la carte du jour grandit sur grand écran et
  les tuiles des matières prennent la place jusqu'à la barre d'onglets
  (mesurée, `fitSubjectTile`) ; « Apprendre » s'ancre en haut au même rythme.
- L'espace parent : un en-tête sur une rangée, des chiffres de même hauteur,
  « Cette semaine » (minutes par jour, du lundi au dimanche).

## 9. Mouvement

Ressort d'appui (0,96, vif ; relâché souple) ; barres et anneaux sur ressort ;
haptique : sélection sur un choix, léger sur une action pleine. Tout se plie
au mouvement réduit du système.

## 10. Ce qu'on ne fait plus

Tranches, reflets, dunes et acacias d'écran, rayons de soleil, motifs dans
les disques d'avatar, accessoires rognés, fractions pour l'enfant, deux formes
de « a », titres colorés par discipline, pastilles « Nouveau ! » en série,
festons et biseaux de médaille, cadres de bois, papier crème, pistes de sable.
