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
résolution des prérequis, et dans chaque question « Touche l'image » l'absence
de deux cartes au même dessin (`npm run validate:content`, `npm test`).

Ce qui **doit être validé par un enseignant** : tout ce qui relève du jugement
professionnel — l'ordre d'introduction des sons, le choix du lexique, la
justesse culturelle, le niveau de difficulté réel.

---

## Ce que dit le programme officiel, et ce que l'app en fait

### Grille horaire du CP1/CP2 (p. 128)

| Discipline | Horaire officiel | Part | Leçons ECOLNA | Part |
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

## Les 9 points à trancher avec l'enseignant

Ce sont les décisions que le programme ne prend pas à notre place. Ce sont
**les seules choses inventées** — le reste est cité.

### 1. L'ordre d'introduction des sons — le point le plus important

Le programme donne un **inventaire** (p. 23-24), pas une chronologie. Il liste
les consonnes dans cet ordre : `t, h, p, n, l, d, v, m, r, b, j, f, s, c, g,
k, z, x, ch, w, qu`.

ECOLNA les enseigne dans un autre ordre, celui d'un CP sahélien classique :
voyelles d'abord, puis les consonnes **continues** (l, m, r, s — on peut les
faire durer et les fusionner tout de suite), puis les occlusives (p, t, d, b,
n, f, v), puis les graphies plus rares (j, ch, c, g), puis ou et oi.

> **À valider :** cet ordre correspond-il à celui pratiqué en classe au Tchad ?
> Si votre manuel suit un autre ordre, lequel ? (C'est une modification d'une
> seule liste dans `scripts/content/data/reading-cp1.ts`.)

### 2. La répartition CP1 / CP2

Le programme traite CP1 et CP2 d'un seul tenant, sauf pour les nombres
(0-20 au CP1, 20-100 au CP2) et la table de 5 (CP2). ECOLNA a réparti le reste :

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
lettres soient connues. ECOLNA fait de même : les mots des exercices **oraux**
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

### 9. Les pictogrammes qui servent de bonne réponse à plusieurs mots

Dans une question « Touche l'image », l'enfant entend un mot et touche son
dessin. Aujourd'hui, **41 pictogrammes sont la bonne réponse de plusieurs mots
différents** : 96 mots cibles en tout, dont 55 ne sont pas ce que le dessin
montre, sur 66 étapes. Le même pantalon vaut « pantalon », « jupe » et
« poche » ; la même maman vaut « maman », « grand-mère », « tante » et
« mariage ». Pour un enfant qui apprend le français à l'école, l'association
mot-image est tout l'exercice : il retient que ce pantalon s'appelle « jupe ».

C'est un autre défaut que celui corrigé dans le contenu 2.1.1 — deux cartes au
même dessin dans une même question (16 questions, dont « fête » et « tambour »
toutes deux en tambour). Celui-là ne demandait pas de jugement : chaque
distracteur fautif a été remplacé par un mot du thème ou du même monde qui a
son propre dessin, et le générateur comme `npm run validate:content` refusent
désormais tout cas de ce genre.

Ici, il faut choisir, mot par mot, entre deux voies :

- **Dessiner un pictogramme dédié** (`src/design-system/illustrations/`), quand
  le mot désigne un objet, une personne ou un lieu qu'un dessin montre sans
  hésitation : jupe, poche, robe, sandale, roue, racine, chauffeur, docteur,
  grand-mère…
- **Basculer l'étape en choix audio ou en écoute** (`audio_multiple_choice`,
  `listen`), quand le mot est une notion qu'aucun dessin ne désigne seul :
  fête, cérémonie, courage, saison, chaleur, prix, voyage, quartier… ou un lien
  de parenté — un dessin d'oncle est un dessin de papa.

Reste un cas à juger : la **même notion**, où le dessin vaut honnêtement pour
les deux mots (« fâché » et « colère », « triste » et « tristesse », « content »
et « joie », « éleveur » et « berger », « vache » et « zébu », « valise » et
« bagage »). Le partage peut alors être conservé, ou un dessin plus précis
servir les deux (un zébu, avec sa bosse).

La colonne de droite porte une **proposition ECOLNA, pas une décision** :
29 dessins dédiés, 20 bascules en audio, 6 « même notion ».

> **À valider :** pour chaque mot, dessin dédié, bascule en audio ou partage
> accepté ? Faut-il plutôt retirer certains mots des questions d'image ?

| Pictogramme | Ce que montre le dessin (étapes) | Autres mots cibles → proposition (étapes) |
|---|---|---|
| `icon-angry` | « fâché » (`cp1-langage-sentiments-1-s226`) | « colère » → même notion (`cp2-langage-sentiments-1-s1053`) |
| `icon-baby` | « bébé » (`cp1-langage-famille-1-s44`, `cp1-lecture-é-1-s274`, `cp1-lecture-b-1-s393`, `cp1-lecture-revision-4-s453`, `cp2-lecture-equiv-e-1-s1354`) | « enfant » → dessin (`cp2-lecture-an-1-s1115`, `cp2-lecture-revision-2-s1163`) |
| `icon-ball` | « ballon » (`cp1-langage-jeux-1-s172`) | « jeu » → audio (`cp2-langage-jeux-1-s992`) |
| `icon-bed` | « lit » (`cp1-lecture-i-1-s247`, `cp1-lecture-l-1-s285`, `cp1-lecture-revision-2-s340`, `cp1-lecture-phrases-1-s557`) | « moustiquaire » → dessin (`cp2-langage-maladies-1-s1024`) |
| `icon-bicycle` | « vélo » (`cp1-langage-transport-1-s184`, `cp1-lecture-v-1-s442`) | « roue » → dessin (`cp2-langage-transport-1-s1010`) |
| `icon-boubou` | « boubou » (`cp1-langage-habits-1-s27`, `cp1-langage-fetes-1-s211`) | « robe » → dessin (`cp2-langage-habits-1-s827`) |
| `icon-bus` | « car » (`cp1-langage-voyages-1-s158`) | « gare » → audio (`cp2-langage-voyages-1-s978`)<br>« chauffeur » → dessin (`cp2-langage-transport-1-s1009`) |
| `icon-car` | « voiture » (`cp1-langage-transport-1-s185`) | « taxi » → dessin (`cp2-lecture-phrases-6-s1412`) |
| `icon-cow` | « vache » (`cp2-langage-animaux-1-s902`) | « zébu » → même notion (`cp2-lecture-z-x-1-s1084`, `cp2-lecture-phrases-4-s1402`) |
| `icon-desk` | « table-banc » (`cp2-langage-ecole-1-s798`) | « classe » → audio (`cp2-langage-ecole-1-s799`, `cp2-lecture-bl-cl-fl-pl-gl-1-s1171`, `cp2-lecture-revision-3-s1218`) |
| `icon-drum` | « tambour » (`cp1-langage-jeux-1-s175`, `cp1-langage-fetes-1-s210`) | « fête » → audio (`cp1-langage-fetes-1-s209`)<br>« danse » → dessin (`cp2-langage-jeux-1-s995`, `cp2-langage-fetes-1-s1039`)<br>« cérémonie » → audio (`cp2-langage-fetes-1-s1037`) |
| `icon-father` | « papa » (`cp1-langage-famille-1-s42`, `cp1-lecture-p-1-s349`, `cp1-lecture-revision-3-s404`) | « oncle » → audio (`cp2-langage-famille-1-s844`) |
| `icon-foot` | « pied » (`cp1-langage-corps-humain-1-s18`) | « jambe » → dessin (`cp2-langage-corps-humain-1-s815`) |
| `icon-friends` | « ami » (`cp1-langage-famille-1-s45`, `cp1-langage-fetes-1-s212`, `cp1-lecture-phrases-7-s587`) | « équipe » → dessin (`cp2-langage-jeux-1-s993`)<br>« invité » → audio (`cp2-langage-fetes-1-s1040`) |
| `icon-hand` | « main » (`cp1-langage-corps-humain-1-s17`) | « bras » → dessin (`cp2-langage-corps-humain-1-s814`, `cp2-lecture-br-cr-dr-1-s1184`) |
| `icon-happy` | « content » (`cp1-langage-sentiments-1-s224`) | « joie » → même notion (`cp2-langage-sentiments-1-s1052`)<br>« courage » → audio (`cp2-langage-sentiments-1-s1054`) |
| `icon-herder` | « éleveur » (`cp1-langage-metiers-1-s80`) | « berger » → même notion (`cp2-langage-metiers-1-s889`) |
| `icon-hut` | « case » (`cp1-langage-maison-1-s53`, `cp1-lecture-c-1-s492`, `cp1-lecture-revision-6-s551`) | « village » → dessin (`cp1-langage-village-1-s68`)<br>« toit » → dessin (`cp2-langage-maison-1-s860`)<br>« quartier » → audio (`cp2-langage-village-1-s874`) |
| `icon-lightning` | « orage » (`cp2-langage-phenomenes-naturels-1-s932`) | « feu » → dessin (`cp2-lecture-eu-1-s1226`, `cp2-lecture-revision-4-s1260`) |
| `icon-market` | « marché » (`cp1-langage-village-1-s71`, `cp1-langage-marche-1-s146`) | « commerçant » → dessin (`cp2-langage-metiers-1-s890`, `cp2-langage-marche-1-s963`) |
| `icon-medicine` | « médicament » (`cp1-langage-maladies-1-s201`) | « docteur » → dessin (`cp2-langage-maladies-1-s1023`) |
| `icon-money` | « argent » (`cp1-langage-marche-1-s148`) | « prix » → audio (`cp2-langage-marche-1-s964`)<br>« monnaie » → audio (`cp2-langage-marche-1-s965`) |
| `icon-moon` | « lune » (`cp1-lecture-u-1-s261`, `cp1-lecture-phrases-2-s562`) | « soir » → audio (`cp2-lecture-oir-air-1-s1330`) |
| `icon-mosquito` | « moustique » (`cp1-langage-maladies-1-s200`, `cp2-lecture-phrases-2-s1392`) | « paludisme » → audio (`cp2-langage-maladies-1-s1022`) |
| `icon-mother` | « maman » (`cp1-langage-famille-1-s43`, `cp1-lecture-m-1-s300`, `cp1-lecture-phrases-5-s577`) | « grand-mère » → dessin (`cp2-langage-famille-1-s843`)<br>« tante » → audio (`cp2-langage-famille-1-s845`)<br>« mariage » → dessin (`cp2-langage-fetes-1-s1038`) |
| `icon-peanut` | « arachide » (`cp2-langage-aliments-1-s949`) | « graine » → dessin (`cp2-langage-plantes-1-s920`) |
| `icon-pot` | « marmite » (`cp1-langage-maison-1-s56`) | « tasse » → dessin (`cp2-lecture-as-es-er-1-s1305`) |
| `icon-rain` | « pluie » (`cp1-langage-phenomenes-naturels-1-s120`) | « saison » → audio (`cp2-langage-phenomenes-naturels-1-s933`) |
| `icon-road` | « route » (`cp1-langage-village-1-s70`, `cp1-langage-voyages-1-s157`) | « course » → dessin (`cp2-langage-jeux-1-s994`) |
| `icon-sad` | « triste » (`cp1-langage-sentiments-1-s225`) | « malade » → dessin (`cp1-langage-maladies-1-s198`)<br>« tristesse » → même notion (`cp2-langage-sentiments-1-s1055`) |
| `icon-satchel` | « cartable » (`cp2-langage-ecole-1-s797`) | « sac » → dessin (`cp2-lecture-ac-ec-oc-ic-1-s1292`) |
| `icon-scale` | « balance » (`cp2-langage-marche-1-s962`) | « kilo » → audio (`cp2-lecture-k-qu-1-s1071`, `cp2-lecture-revision-1-s1107`, `cp2-lecture-phrases-1-s1387`) |
| `icon-school` | « école » (`cp1-langage-ecole-1-s1`, `cp1-lecture-phrases-3-s567`) | « ville » → dessin (`cp2-langage-village-1-s875`)<br>« cinéma » → audio (`cp2-lecture-equiv-s-1-s1364`) |
| `icon-shirt` | « chemise » (`cp1-langage-habits-1-s28`) | « bouton » → dessin (`cp2-langage-habits-1-s830`) |
| `icon-shoe` | « chaussure » (`cp1-langage-habits-1-s30`) | « sandale » → dessin (`cp2-langage-habits-1-s828`) |
| `icon-suitcase` | « valise » (`cp1-langage-voyages-1-s159`) | « voyage » → audio (`cp2-langage-voyages-1-s977`)<br>« bagage » → même notion (`cp2-langage-voyages-1-s979`) |
| `icon-sun` | « soleil » (`cp1-langage-phenomenes-naturels-1-s122`) | « chaleur » → audio (`cp2-langage-phenomenes-naturels-1-s934`) |
| `icon-tree` | « arbre » (`cp1-langage-plantes-1-s105`, `cp1-lecture-a-1-s240`) | « racine » → dessin (`cp2-langage-plantes-1-s919`) |
| `icon-trousers` | « pantalon » (`cp1-langage-habits-1-s29`) | « jupe » → dessin (`cp1-lecture-j-1-s462`, `cp1-lecture-revision-5-s517`)<br>« poche » → dessin (`cp2-langage-habits-1-s829`) |
| `icon-water` | « eau » (`cp1-langage-aliments-1-s134`, `cp2-lecture-au-eau-1-s1237`) | « fleuve » → dessin (`cp2-langage-voyages-1-s980`) |
| `icon-wind` | « vent » (`cp1-langage-phenomenes-naturels-1-s121`) | « poussière » → audio (`cp2-langage-phenomenes-naturels-1-s935`) |

Garde-fou : le générateur imprime cette liste à chaque génération
(AVERTISSEMENT, pas une erreur) et échoue si l'un des deux compteurs dépasse
son plafond — 41 pictogrammes partagés, 55 mots « en trop »
(`SHARED_TARGET_CEILING`, dans `scripts/content/image-checks.ts`) ;
`npm run validate:content` et `npm test` appliquent les mêmes plafonds. Ces
nombres ne peuvent donc que baisser : chaque décision appliquée les fait
descendre, et le générateur indique alors les nouveaux plafonds à inscrire.
Liste établie sur le contenu 2.1.1 — si l'ordre des leçons change, les
identifiants d'étape changent, et la liste à jour est celle qu'imprime
`npx tsx scripts/generate-content.ts`.

---

## Protocole d'atelier proposé (une demi-journée)

**Participants :** 2-3 enseignants de CP1/CP2 en exercice, si possible d'écoles
différentes (urbaine / rurale).

| Temps | Activité | Support |
|---|---|---|
| 30 mn | Présentation du projet et du périmètre | ce document, §1-2 |
| 45 mn | Revue de la progression de lecture | §1, §2, `docs/couverture-programme.md` |
| 45 mn | Revue du lexique et des 18 thèmes | §3, §5 |
| 30 mn | Revue des illustrations et des pictogrammes partagés | §7, §9, `docs/pictogrammes.html` |
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

1. Intégrer les corrections, incrémenter `contentVersion` (aujourd'hui 2.1.1).
2. **Enregistrer les voix définitives** — 824 fichiers, aujourd'hui en TTS de
   synthèse. C'est le dernier verrou avant le pilote
   (`docs/audio-pipeline.md`). Idéalement une voix d'enseignant·e tchadien·ne :
   l'accent et le débit comptent autant que le contenu.
3. Pilote sur 5-10 tablettes, suivi via l'espace parent.
