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
- **Aucune fraction sous les yeux de l'enfant** : les nombres restent à
  l'espace parent.
- Plus de reflet, plus de piste invisible : la piste neutre `fill` (#EEF0F3).

## 8. Les douze enfants

Redessinés sur une grille stricte (`avatars/portrait.tsx`) : tête 52 × 55,
yeux pleins avec un point de lumière, sourcils de la couleur des cheveux,
joues corail à faible opacité, bouche d'un trait (calme) ou ouverte (joie,
yeux plissés). Aucun contour, aucun reflet, aucun accessoire d'écolier. La
coiffure et le vêtement font le personnage. La distribution (six peaux, deux
aides techniques, aucun marqueur religieux) et ses tests sont inchangés.

## 9. Mouvement

Ressort d'appui (0,96, vif ; relâché souple) ; barres et anneaux sur ressort ;
haptique : sélection sur un choix, léger sur une action pleine. Tout se plie
au mouvement réduit du système.

## 10. Ce qu'on ne fait plus

Tranches, reflets, dunes et acacias d'écran, rayons de soleil, motifs dans
les disques d'avatar, accessoires rognés, fractions pour l'enfant, deux formes
de « a », titres colorés par discipline, pastilles « Nouveau ! » en série.
