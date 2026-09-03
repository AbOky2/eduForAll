# Validation pédagogique

## Statut

Le contenu (308 leçons, 1 625 exercices) est **construit à partir du programme
national tchadien**, pas d'une progression CP générique :

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale / Centre National des Curricula,
> N'Djaména, septembre 2004, 161 p.

Le référentiel est encodé dans `src/content/curriculum/official-program.ts` :
chaque entrée porte la page du document dont elle est tirée, et chaque leçon
générée cite le contenu officiel auquel elle répond (`officialReference`).
`docs/couverture-programme.md`, régénéré à chaque build, montre que **tous** les
contenus officiels des quatre disciplines instrumentales sont couverts.

Ce qui est **vérifié automatiquement** : la couverture du programme, la
cohérence des références, la justesse des réponses, la répartition par
discipline conforme à la grille horaire, l'unicité des identifiants, la
résolution des prérequis (`npm run validate:content`, `npm test`).

Ce qui **doit être validé par un enseignant** : tout ce qui relève du jugement
professionnel — l'ordre d'introduction des sons, le choix du lexique, la
justesse culturelle, le niveau de difficulté réel.

---

## Ce que dit le programme officiel, et ce que l'app en fait

### Grille horaire du CP1/CP2 (p. 128)

| Discipline | Horaire officiel | Part | Leçons ALIFA | Part |
|---|---|---|---|---|
| Lecture | 7 h 40 | 38 % | 112 | 37 % |
| Langage/Élocution | 6 h 00 | 30 % | 99 | 32 % |
| Mathématiques | 3 h 30 | 18 % | 55 | 18 % |
| Écriture | 2 h 45 | 14 % | 42 | 14 % |

Les disciplines hors périmètre (morale et hygiène, dessin, chant, récitation,
exercices physiques — 8 h 05) relèvent d'une pratique collective encadrée.

### Année scolaire (p. 126)

9 mois, du 1er octobre au 30 juin, 3 trimestres, 28 h/semaine, **séances de
10 à 20 mn au CP**. Chaque leçon porte son trimestre et sa semaine, et dure
10 à 14 minutes.

---

## Les 8 points à trancher avec l'enseignant

Ce sont les décisions que le programme ne prend pas à notre place. Ce sont
**les seules choses inventées** — le reste est cité.

### 1. L'ordre d'introduction des sons — le point le plus important

Le programme donne un **inventaire** (p. 23-24), pas une chronologie. Il liste
les consonnes dans cet ordre : `t, h, p, n, l, d, v, m, r, b, j, f, s, c, g,
k, z, x, ch, w, qu`.

ALIFA les enseigne dans un autre ordre, celui d'un CP sahélien classique :
voyelles d'abord, puis les consonnes **continues** (l, m, r, s — on peut les
faire durer et les fusionner tout de suite), puis les occlusives (p, t, d, b,
n, f, v), puis les graphies plus rares (j, ch, c, g), puis ou et oi.

> **À valider :** cet ordre correspond-il à celui pratiqué en classe au Tchad ?
> Si votre manuel suit un autre ordre, lequel ? (C'est une modification d'une
> seule liste dans `scripts/content/data/reading-cp1.ts`.)

### 2. La répartition CP1 / CP2

Le programme traite CP1 et CP2 d'un seul tenant, sauf pour les nombres
(0-20 au CP1, 20-100 au CP2) et la table de 5 (CP2). ALIFA a réparti le reste :

- **CP1** : voyelles, 15 consonnes, ou, oi.
- **CP2** : consonnes restantes (k, qu, z, x, h, w, y), voyelles nasales,
  groupes consonantiques, syllabes inverses, équivalences graphémiques.

> **À valider :** un enfant de fin de CP1 est-il censé savoir lire « an », « on » ?

### 3. Le lexique

Le vocabulaire est délibérément tchadien : la case, le canari, la calebasse,
le mil, le boubou, le puits, le berger, le zébu, la pirogue, l'harmattan,
le tam-tam, la boule de mil, le table-banc, la daba.

> **À valider :** ces mots sont-ils ceux qu'un enfant de 6 ans entend chez lui ?
> Y en a-t-il qui sont trop régionaux (nord/sud, ville/campagne) ? Lesquels
> manquent ?

### 4. La déchiffrabilité

Un mot ne devrait contenir que des lettres déjà étudiées. En pratique, les
manuels de CP présentent aussi des mots « globaux » avant que toutes leurs
lettres soient connues. ALIFA fait de même : les mots des exercices **oraux**
(image + son) sont libres, les mots des exercices de **déchiffrage** sont
choisis dans les lettres connues, avec les finales muettes usuelles.

> **À valider :** repérer les mots qui arrivent trop tôt (liste complète
> exportable par leçon depuis le manifeste).

### 5. Les 18 thèmes de langage

Repris **intégralement et dans l'ordre** du programme (p. 19). Chaque thème
donne 2 leçons au CP1 (vocabulaire, structures) et 3 au CP2 (+ écoute d'une
histoire).

> **À valider :** les structures langagières (« Le berger conduit son troupeau
> vers le puits. ») sont-elles au bon niveau ? Trop faciles, trop difficiles ?

### 6. Les seuils d'étoiles

3★ si ≥ 85 % de bonnes réponses au premier essai sans indice ; 2★ si ≥ 60 %
résolu en ≤ 2 essais ; 1★ sinon. **Jamais zéro étoile.**

> **À valider :** en classe, ces seuils encouragent-ils ou découragent-ils ?

### 7. Les illustrations

113 pictogrammes vectoriels (voir `docs/pictogrammes.html`, à ouvrir dans un
navigateur). Ils portent tout le vocabulaire.

> **À valider :** l'enfant reconnaît-il l'objet du premier coup ? Lesquels
> prêtent à confusion ?

### 8. La prononciation des sons isolés

`scripts/content/data/pronunciation.ts` impose la prononciation de 24 sons que
la synthèse rendait faux hors d'un mot : elle épelait les groupes de consonnes
(« bl » devenait « bé-elle »), partait en anglais sur « in », donnait le nom
de la lettre pour « z » et « k », et confondait « eu » avec « u ».

Corriger l'erreur ne suffit pas : il a fallu choisir *comment* dire un son
seul. La table retient l'usage courant du CP français — la consonne portée par
un « e » d'appui : /blə/, /tʁə/, /zə/, /kə/ — plutôt que le nom de la lettre.

Les sons isolés sont dits par Piper, les mots et phrases par Kokoro — même
locuteur `siwis` des deux côtés, donc un seul timbre pour l'enfant.

> **À valider :** est-ce ainsi qu'on dit ces sons dans une classe tchadienne ?
> Écouter la planche d'écoute (§ « Voix » de `docs/audio-pipeline.md`).

---

## Protocole d'atelier proposé (une demi-journée)

**Participants :** 2-3 enseignants de CP1/CP2 en exercice, si possible d'écoles
différentes (urbaine / rurale).

| Temps | Activité | Support |
|---|---|---|
| 30 mn | Présentation du projet et du périmètre | ce document, §1-2 |
| 45 mn | Revue de la progression de lecture | §1, §2, `docs/couverture-programme.md` |
| 45 mn | Revue du lexique et des 18 thèmes | §3, §5 |
| 30 mn | Revue des illustrations | `docs/pictogrammes.html` |
| 60 mn | **Essai de l'app sur tablette**, une leçon par discipline | l'appareil |
| 30 mn | Grille de corrections, priorisation | tableau ci-dessous |

### Grille de corrections à remplir

| # | Discipline | Leçon / semaine | Problème constaté | Correction proposée | Priorité |
|---|---|---|---|---|---|
| | | | | | bloquant / important / confort |

Chaque correction se traduit par une modification dans
`scripts/content/data/` puis `npx tsx scripts/generate-content.ts`, et une
nouvelle `contentVersion`. Aucun contenu n'est modifié à la main dans le
manifeste.

---

## Après l'atelier

1. Intégrer les corrections, bump `contentVersion` (2.0.0 → 2.1.0).
2. **Enregistrer les voix définitives** — 821 fichiers, aujourd'hui en TTS de
   synthèse. C'est le dernier verrou avant le pilote
   (`docs/audio-pipeline.md`). Idéalement une voix d'enseignant·e tchadien·ne :
   l'accent et le débit comptent autant que le contenu.
3. Pilote sur 5-10 tablettes, suivi via l'espace parent.
