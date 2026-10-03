# ECOLNA — Direction des écrans (v3, « Galets en relief »)

> Suite du brief d'identité v2 (`design/brief-identite-v2.md`), qui a dessiné
> les **objets** (icônes, avatars, médailles, scènes). Ce document dessine les
> **écrans** : matière, profondeur, composition, mouvement. Il remplace la
> garde « on ne redessine pas les écrans » du brief v2 § 3.1, à la demande du
> propriétaire (« une vraie app AAA, pas un gabarit »).

## 1. Diagnostic (captures du 3 octobre 2026, banc web)

| Constat | Pourquoi ça fait « gabarit » |
|---|---|
| Surfaces lavande (`#fbf8ff`, `#edecff`) sous une palette terre | Héritées d'un générateur Material : deux températures de couleur qui se battent |
| Fond à pois partout | Motif de remplissage, sans lieu ni lumière |
| Cartes blanches plates, toutes au même poids | Aucune hiérarchie : l'œil de l'enfant ne sait pas où aller |
| Icônes au trait fin dans des carrés pastel | Le langage de Lucide, pas celui d'ECOLNA |
| Tablette = téléphone centré | Grands vides en paysage, cibles minuscules, rien n'est composé pour 10 pouces |
| Réponses d'exercice de 60 dp sur un écran de 1180 dp | L'enfant vise au lieu de jouer |
| Dessins v2 jamais branchés | Avatars 5 à 12 rendus avec l'ancien visage recoloré |

## 2. La matière : des galets en relief

Tout ce qui se touche est un **galet** : une forme arrondie posée sur sa propre
**tranche** — une bande plus foncée de 4 à 6 dp sous la face, comme l'épaisseur
d'un objet. Appuyer **enfonce** le galet (la face descend de la hauteur de la
tranche) : l'enfant sent qu'il a agi, sans son ni vibration.

- Face = couleur pleine ; tranche = ton `shade` de la même famille (jamais du
  gris, jamais une ombre floue seule).
- Ombre portée chaude et courte en plus, seulement sur ce qui flotte (barre
  d'onglets, carte héros, feuille de réponse).
- Ce qui ne se touche pas (titres, chiffres, décors) n'a **pas** de tranche :
  la tranche dit « touche-moi ».

| Galet | Face | Tranche | Texte |
|---|---|---|---|
| Action principale (« soleil ») | `sun` `#F6B73C` | `sunShade` `#CF8B17` | `onSun` `#47290A` (7,4:1) |
| Action pétrole | `secondary` `#2B6485` | `secondaryShade` `#1D4A64` | blanc (6,4:1) |
| Carte / bouton blanc | `card` `#FFFFFF` | `cardEdge` `#EADCC6` | encre |
| Verrouillé | `lockedContainer` | `lockedEdge` | `locked` |

## 3. La lumière et les fonds

- Fond d'app : **ivoire de cahier** `#FCF8F1`, plus jamais lavande. Les
  contenants montent vers le sable (`#F8F1E5` → `#E3D2B6`).
- Les écrans de l'enfant ont un **lieu** : un ciel chaud en haut, des dunes
  ton sur ton en bas (`ScenicBackdrop`), jamais derrière un texte long.
- Les écrans d'exercice restent calmes : ivoire, un seul motif ton sur ton
  dans un coin, rien qui bouge.
- L'espace parent est sobre : ivoire, cartes blanches à tranche fine,
  glyphes du palier S. L'adulte doit sentir « sérieux », pas « jouet ».

## 4. Couleurs des disciplines (une famille chacune, partout)

| Discipline | Famille | Face claire | Tranche |
|---|---|---|---|
| Langage | pétrole | `#D7ECFB` | `#A9CFEA` |
| Lecture | terre cuite | `#FBE1CF` | `#EDBE9C` |
| Écriture | or | `#FFF0C2` | `#F0D17C` |
| Calcul | acacia | `#DDF0D2` | `#B4D69F` |

Une discipline se reconnaît à sa famille sur l'accueil, la sélection de
module, la carte, l'en-tête de leçon et la médaille.

## 5. Typographie

Quicksand partout où l'enfant lit, **y compris les boutons** (Bold) : la
rondeur des lettres répond à celle des galets. Plus Jakarta Sans reste aux
petites étiquettes d'information (pastilles, espace parent). Sur tablette, la
voix principale d'un écran (salutation, consigne, glyphe) est grande :
`displayHero` 40 sp × 1,3.

## 6. Composition tablette d'abord

- **Paysage** (`splitPanes`) : deux volets ou quatre colonnes, jamais une
  colonne de téléphone centrée avec du vide autour.
- **Portrait** : une colonne large (`contentMaxWidth`), grilles de 2.
- **Téléphone** : la même hiérarchie, compactée ; rien n'est retiré.
- Cibles enfant ≥ 96 dp sur tablette (choix de réponse, tuiles), ≥ 64 dp au
  téléphone ; boutons d'action ≥ 64 dp de haut.

## 7. Mouvement

Ressorts courts (≤ 300 ms) sur l'appui et l'apparition ; rien ne boucle sauf
l'onde du bouton d'écoute pendant la lecture ; tout est désactivé par
`useReducedMotion()`.

## 8. Ce qu'on ne fait pas

Pas de rouge côté enfant, pas de bouton grisé sans explication côté enfant,
pas de dégradé sur les personnages et les icônes, pas de couleur en dur hors
des jetons, pas de bitmap, pas de nouvelle dépendance native.
