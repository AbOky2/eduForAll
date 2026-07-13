# ALIFA — Audit des maquettes Stitch

> Source de vérité visuelle : projet Stitch **« ALIFA : L'École du Désert »**
> (`projects/15951466424347515721`, 21 écrans, mobile 412×917 de référence).
> Fichiers locaux : `design/stitch/*.png` (captures) + `design/stitch/*.html` (code Stitch exact) + `design/stitch/index.json` (correspondance id ↔ fichier).

## 1. Langage visuel global (extrait du code Stitch, pas interprété)

### Palette « Premium Sahelian » (Material 3, mode clair uniquement)

| Token | Valeur | Usage observé |
|---|---|---|
| `primary` | `#7d562d` | Brun terre — texte de marque « ALIFA », icônes actives, boutons texte |
| `primary-container` | `#d4a373` | Sable — boutons principaux (« Commencer », « Vérifier », « C'est parti ! ») |
| `on-primary-container` | `#5b3912` | Texte sur bouton sable |
| `secondary` | `#2b6485` | Bleu pétrole — accents Dictée/Calcul, bouton audio bordé |
| `secondary-container` | `#a3d8fe` | Bleu ciel — pastilles, fonds d'icônes |
| `on-secondary-container` | `#255f80` | Texte sur bleu ciel |
| `tertiary` | `#785a00` / container `#d1a741` | Or — étoiles, soleil, badge « Mode hors-connexion actif » |
| `tertiary-fixed` | `#ffdf9b` / dim `#edc157` | Jaune doux — pastille révision, feuille |
| `surface` | `#fbf8ff` | Fond lavande très clair (accueil, cartes de progression) |
| `on-surface` | `#161a32` | Encre bleu nuit — texte principal |
| `on-surface-variant` | `#50453b` | Texte secondaire brun-gris |
| `outline` | `#82756a` | Bordures moyennes |
| `outline-variant` | `#d4c4b7` | Bordures claires, points du motif de fond |
| `error` | `#ba1a1a` / container `#ffdad6` | Rouge réservé au bouton « Réinitialiser progression » |
| `surface-container-lowest` | `#ffffff` | Cartes blanches |
| `inverse-surface` | `#2b2e48` | Barre de nav sombre (variante Calcul CP2) |
| **Fond exercices** | **`#F4F1DE`** | Ivoire chaud + texture de bruit SVG subtile (fractalNoise 0.85) |

Deux traitements de fond distincts, tous deux présents dans le code Stitch :
- **Écrans d'apprentissage** (dictée, choix multiple, leçon, calcul) : ivoire `#F4F1DE` + bruit.
- **Écrans de navigation** (accueil) : `#fbf8ff` + motif pointillé `radial-gradient(#d4c4b7 1px)` pas de 20 px.
- **Splash** : `#fbf8ff` + texture de bruit (`.texture-bg`).

### Typographie

| Rôle | Police | Graisses |
|---|---|---|
| Display / headline / body / glyphes pédagogiques | **Quicksand** | 400, 500, 600, 700 |
| Labels (boutons, nav, badges) | **Plus Jakarta Sans** | 600 |

Les lettres/syllabes pédagogiques (« ba », « ma », « 3 5 7 », « 12 + 5 = ? ») sont en Quicksand bold très grand (32–64 px) — arrondie, très lisible, adaptée aux apprentis lecteurs.

### Formes et rythme

- Radius Stitch : `DEFAULT 4px`, `lg 8px`, `xl 12px`, `2xl 16px`, `3xl 24px`, `full`.
  Observé : cartes réponses ~16 px, grandes cartes/dialogues ~24 px, boutons pill (full), tuiles lettres ~12 px.
- Ombres très douces (élévation faible, jamais de drop-shadow dure).
- Marges latérales ~16–24 px, généreuses respirations verticales.
- Zones tactiles larges : cartes réponses pleine largeur ~64 px de haut, bouton audio Ø ~72 px.
- Bottom nav 3 onglets : **Accueil / Apprendre / Parents**, actif = pill sable ou icône brune.

### Iconographie

Material Symbols Outlined (poids léger, FILL variable) + illustrations picturales sahéliennes (dunes, baobab/acacia, chèvres, soleil, enfant lisant). Pas d'emojis.

## 2. Audit écran par écran

Réf. = fichier dans `design/stitch/`. Dimensions de référence : 412×917 sauf mention.

### S01 — Splash (`splash-screen`)
- **Objectif** : démarrage, affirmer l'identité et la promesse offline.
- Fond `#fbf8ff` texturé ; carte-logo centrée (icône : soleil doré + triangle-dune bleu + vague sable, sur carte ivoire arrondie 3xl) ; nom « ALIFA » (label PJS 600) ; illustration sahélienne (enfant lisant sous un acacia au couchant, carte arrondie) ; signature bleu pétrole « Apprendre partout, même sans internet » en bas.
- États : statique (V1) ; animation d'apparition douce possible, respectant réduction de mouvement.

### S02–S04 — Onboarding 1/2/3 (`onboarding-1/2/3`)
- **O1** : soleil ligne en haut, illustration enfant + livre (carte crème 3xl), « Ton école t'accompagne partout. » (headline Quicksand, « partout » en bleu), bouton sable pill « Commencer », 3 points de pagination (actif sable allongé).
- **O2** : « ALIFA » en haut-gauche, lien « Passer » en haut-droite, badge rond bleu ciel avec étincelle, titre « Lecture, dictée, écriture et calcul. », sous-titre gris, grille 2×2 de cartes matières (Lecture bleu ciel, Écriture jaune, Dictée brun-sable, Calcul bleu pétrole — icônes sur tuile colorée arrondie), bouton « Suivant ».
- **O3** : illustration téléphone + coche verte + galet souriant, « Fonctionne sans connexion. », « Apprends partout, tout le temps. », bouton « Créer mon profil ». Pagination : dernier point actif.
- États : pagination, skip. Swipe horizontal attendu + boutons.

### S05 — Création profil (`creation-profil-enfant`)
- Fond ivoire `#F4F1DE` (explicite dans le code) ; grande carte blanche 3xl centrale : titre « Crée ton profil », sous-titre « Choisis ton avatar et ton niveau ».
- Section « Ton avatar » : 4 portraits ronds d'enfants tchadiens (sélection = anneau sable + coche).
- « Ton prénom » : champ arrondi bordure sable, placeholder « Écris ton prénom ici ».
- « Ton niveau » : 2 cartes toggle CP1 (icône chapeau étudiant, sélectionnée : bordure bleu pétrole + coche) / CP2 (icône livre).
- Bouton « C'est parti ! » sable pleine largeur ; note rassurante : « Pas d'email, pas de mot de passe. Tes données restent sur ce téléphone. »
- États : avatar sélectionné/non, champ vide/rempli/focus, niveau sélectionné, bouton désactivé tant que prénom+avatar absents (à confirmer — adaptation : garder actif avec aide vocale plutôt que bloquer un non-lecteur → décision documentée).

### S06 — Accueil enfant (`accueil-enfant`)
- Header : avatar rond (haut-gauche), « ALIFA » centré (Quicksand 700 brun), icône cloche-barrée/offline (haut-droite).
- « Bonjour Amina ! » headline + « Prête à apprendre ? » + bouton audio rond bleu ciel à droite.
- **Carte « Continuer ma leçon »** : grande carte brune `#7d562d` → dégradé, badge « EN COURS », titre blanc « Continuer ma leçon », sous-titre « Les syllabes avec A », bouton play rond blanc, étoile filigrane.
- Section « ⭐ Tes activités » : grille 2×2 de cartes blanches : Lecture (tuile sable, barre de progression brune), Dictée (tuile bleu pétrole, barre bleue), Écriture (tuile mauve clair, barre), Calcul (verrouillée : cadenas, tuile grisée, opacité réduite).
- Bottom nav : Accueil (actif pill sable), Apprendre, Parents.
- Fond `#fbf8ff` + points `#d4c4b7`.
- États : leçon en cours présente/absente, module verrouillé, mode offline (icône).

### S07 — Sélection de module (`selection-de-module`)
- Titre « Choisis ton module », sous-titre « Prêt à apprendre aujourd'hui ? ».
- 4 grandes cartes empilées pleine largeur (Lecture, Écriture, Dictée, Calcul) : icône sur pastille colorée, gros titre, badge pilule « 12 leçons terminées » / « Nouveau ! », chevron, décor cercle coloré en coin.
- Bottom nav : Apprendre actif (pill sable).
- États : badge progression variable, module nouveau, verrouillé (à prévoir).

### S08 — Carte de progression CP1 (`carte-de-progression-cp1`)
- « Niveau CP1 » + « Continue ton aventure ! » ; chemin vertical serpentant (ligne pointillée sable) reliant des nœuds-mondes.
- Nœud actif : grand cercle blanc bordure or, icône étincelle, étoiles au-dessus (2/3), étiquette « Monde 1 — Les lettres ».
- Nœuds verrouillés : cercles lavande pâle avec cadenas, « Monde 2/3/4… ».
- Feuilles décoratives en marge. Fond `#fbf8ff`.
- États : terminé (coche/étoiles), courant, verrouillé.

### S09 — Carte de progression CP2 (`carte-de-progression-cp2`)
- Variante riche : fond illustration désert (dunes, oued bleu, acacias) plein écran ; chemin pointillé brun ; nœuds : cercles bleu ciel cochés (terminés), étoile dorée (courant, « Monde 3 : Petites phrases »), cadenas lavande (verrouillés : « Monde 4 : Dictées courtes », « Monde 5 : Nombres jusqu'à 100 »).
- « Niveau CP2 » + « En route vers l'oasis des savoirs ! ».
- Adaptation : l'illustration de fond doit être un asset local optimisé ; fallback couleur si asset manquant.

### S10 — Leçon Écoute (`lecon-ecoute`)
- Épuré : X (fermer) haut-gauche, fine barre de progression en haut.
- « Écoute le son » ; immense carte crème arrondie avec le glyphe « ba » centré (filigrane feuille) ; bouton audio rond blanc bordure bleue en bas de carte ; « Suivant » discret en bas.
- États : audio en lecture (pulsation), replay, désactivé pendant transition.

### S11 — Exercice choix multiple audio (`exercice-choix-multiple`)
- X + pagination points (2 sable pleins, 3 bleus) en haut.
- Question « Que viens-tu d'entendre ? » (headline centré).
- Gros bouton audio rond sable Ø~96 avec icône haut-parleur brune.
- 3 cartes réponses pleine largeur (« ba » brun, « ma » encre, « ta » encre — Quicksand 700 ~28 px), blanches, arrondies 16, ombre douce.
- Demi-cercle décoratif sable en bas. Fond ivoire + bruit.
- États réponse : default / pressée / correcte / incorrecte / désactivée.

### S12 — Écran dictée (`ecran-dictee`)
- Header complet : avatar, « ALIFA », icône offline.
- X + barre de progression bicolore (segment sable sur piste bleu clair) + étoile.
- « Écoute et choisis le bon mot. » ; bouton audio rond sable ; grille 2×2 de cartes mots (« papa », « mama », « baba », « tata ») ; filigrane « S » sable en bas.
- États identiques à S11.

### S13 — Exercice « Forme la syllabe » (`exercice-former-une-syllabe`)
- X + pagination (barres) + ampoule (indice) en haut.
- Carte consigne blanche : icône « voix » brun, « Forme la syllabe » (headline), cible « ba » à droite + étoile-badge.
- Zone de dépôt : cadre pointillé brun sur fond pointillé, 2 emplacements lavande vides, « ✋ Glisse les lettres ici ».
- Rangée de tuiles lettres en bas (« b » brun, « m » bleu pétrole, « a » sable…) — grosses tuiles blanches arrondies avec lettre Quicksand 700.
- Bouton « Vérifier » sable pill pleine largeur (coche).
- États : emplacement vide/rempli, tuile posée/restante, vérification correcte/incorrecte, indice.

### S14 — Calcul CP1 (`calcul-cp1`)
- Header ALIFA ; retour ← ; « Exercice 1 sur 5 » + barre sable ; étoile.
- Carte consigne : haut-parleur + « Compte les chèvres. »
- Illustration : 4 chèvres blanches dans paysage sahélien (carte arrondie 16).
- 3 cartes réponses chiffres « 3 5 7 » (Quicksand 700 ~40 px brun).
- Bouton « Vérifier ✓ » sable pill.
- États : sélection chiffre, vérification, audio consigne.

### S15 — Calcul CP2 (`calcul-cp2`)
- Fond lavande `#dfe0ff`-ish ; « Exercice 3 sur 10 » + barre.
- Grande carte blanche : « Combien font 12 et 5 ? » ; 2 cartes quantités (12 points or groupés en dizaine+2, 5 points bleu pétrole) reliées par « + » ; équation géante « 12 + 5 = ? » (brun) ; 3 réponses « 15 / 17 / 18 » (17 sélectionnée : bordure sable + coche).
- Bouton « Vérifier » ; bottom nav sombre `#2b2e48` (Accueil/Apprendre/Parents) — variante à harmoniser (décision design).

### S16 — Écran réussite (`ecran-reussite`)
- Fond clair dégradé ; 3 étoiles or (2 grandes pleines, 1 contour) + soleil filigrane.
- Avatar rond de l'enfant avec badge coche bleu ; « Bravo ! Tu as terminé la leçon. » (headline 2 lignes).
- Boutons : « Continuer » (sable pill) + « Rejouer » (blanc bordé, icône replay, texte bleu pétrole).
- États : 1/2/3 étoiles (jamais zéro étoile humiliant).

### S17 — Écran révision (`ecran-revision`)
- Header ALIFA ; pastille ronde jaune `#ffdf9b` avec feuille ; « On va revoir ce qui est difficile. » ; sous-titre bienveillant « Pas de stress, on prend notre temps pour bien comprendre. »
- Grille 2×2 de cartes notions : « ba / ma », « ou / on », « ta / da », « ch / j » (Quicksand 700, petit trait de couleur sous chaque paire : sable/bleu/rose).
- Bouton « Commencer la révision ▶ » sable pill.
- Bottom nav : Apprendre actif.

### S18 — Espace parent (`espace-parent`)
- Référence 320×~700 (colonne étroite dans la capture — adapter pleine largeur).
- « Tableau de bord d'Amina » + « Suivez sa progression et ses accomplissements récents ».
- Cartes empilées : Niveau actuel (CP1), « Leçons Complétées 12/20 » (barre), « Temps Aujourd'hui 15 min ».
- Carte « Analyse de Progression » (icône étincelle bleue) : texte humain « Amina progresse bien en lecture… » + encadré « RECOMMANDATION : Revoyez l'exercice “Les sons Ma et Ba” ».
- Carte « Fier des résultats ? » avec bouton « Partager la progression » (partage local, image générée — aucune donnée envoyée).
- Bottom nav : Parents actif.
- **Adaptation** : l'accès doit passer par un parent gate (non montré dans Stitch → écran complémentaire à concevoir dans le même langage).

### S19 — Paramètres (`parametres`)
- ← « Paramètres » ; carte blanche : ligne « Son » (switch sable), « Langue » (radios : Français actif, Arabe tchadien désactivé V1), « Informations offline » (statut « Tout est téléchargé » + coche bleue), « À propos du projet » (chevron).
- Bouton danger « Réinitialiser progression » (fond `#ffdad6`, texte `#93000a`, icône corbeille) — confirmation renforcée requise.
- Filigrane arbres en bas.

### S20 — État hors-connexion (`etat-hors-connexion`)
- Header ALIFA + icône « pas de cloud » ; illustration soleil souriant + nuage sur dune (carte arrondie) ; badge pill or « Mode hors-connexion actif » ; « Tu peux continuer à apprendre sans internet. » ; « Tes leçons favorites sont toujours là. » ; bouton « C'est compris ».

### S21 — Logo (`alifa-logo`)
- Icône app : carte ivoire arrondie, cercle soleil jaune `#ffd166`-ish, triangle dune bleu pétrole, vague sable, « ALIFA » encre. Base pour icône adaptative Android + iOS.

## 3. Écarts et compléments nécessaires (non couverts par Stitch)

À concevoir dans le même langage visuel (documentés dans `design-decisions.md`) :
1. **Parent gate** (avant Espace parent) — obligation stores enfants.
2. **Sélection/changement de profil** (multi-enfants).
3. **Écran pause / reprise de leçon**.
4. **Exercice tracé de lettre** (trace_letter) — non maquetté : gabarit lettre + chemin pointillé + doigt.
5. **États d'erreur récupérable / contenu indisponible / confirmation réinitialisation** (dialogues).
6. **Feedback correct/incorrect** en overlay bas (non maquetté explicitement).
7. **Écran récompenses/badges**.
8. Harmonisation de la bottom nav (S15 sombre vs claire ailleurs → claire retenue partout).

## 4. Contraintes d'accessibilité relevées

- Contraste : texte encre `#161a32` sur ivoire = OK ; vérifier `#82756a` sur ivoire pour petits textes (≥ 4.5:1 à mesurer) ; blanc sur `#d4a373` insuffisant pour petit texte → utiliser `on-primary-container #5b3912` sur les boutons sable (déjà le cas dans Stitch).
- Cibles tactiles ≥ 48 dp : respecté par le design (cartes larges).
- Le feedback correct/incorrect ne doit pas reposer que sur la couleur : ajouter icône + audio + forme.
- Police Quicksand : garder ≥ 16 px pour les consignes, glyphes pédagogiques très grands.
