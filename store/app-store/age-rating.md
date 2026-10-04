<!-- App Store Connect → Informations sur l'app → « Classification par âge »
     (Age Ratings → Set Up Age Ratings). Choix fermés : aucune limite de
     caractères. Définitions relevées le 4 octobre 2026 sur la page d'Apple
     « Age ratings values and definitions » (questionnaire en vigueur depuis
     2025, classes 4+, 9+, 13+, 16+, 18+). -->

# Classification d'âge — App Store Connect

Fiche de réponses à recopier dans App Store Connect : *Informations sur
l'app → Classification par âge → Set Up Age Ratings*. Le questionnaire se
déroule en trois temps : les **contrôles intégrés et capacités** de l'app,
puis les **descripteurs de contenu** section par section, enfin **Age
Categories and Override**, où se choisit « Made for Kids ». Tout est tranché
ici : rien ne peut rester ouvert au moment de soumettre.

Les intitulés en anglais sont ceux de la documentation d'Apple, recopiés le
4 octobre 2026 ; la console française peut les traduire autrement, la réponse
ne change pas.

Résultat attendu : **4+**, « Made for Kids », tranche **6–8 ans**.

---

## 1. Décision : « Enfants » en catégorie principale

**Catégorie principale : Enfants (6–8 ans). Catégorie secondaire : Éducation.**

Dans App Store Connect, la tranche d'âge Enfants n'apparaît que si « Enfants »
est la catégorie **principale**. Avec Éducation en principale, l'app n'est pas
une app de la catégorie Enfants, et tout ce qui a été construit pour elle —
contrôle d'accès adulte, zéro SDK tiers, zéro lien sortant — ne compte pour
rien.

ECOLNA n'a pas d'autre public que des enfants de 6 à 8 ans, CP1 et CP2. Côté
Google Play, la même tranche, 6-8 ans, est déclarée seule, et la politique
Familles s'applique d'office (`store/google-play/target-audience.md`). Le
choix ci-dessus met les deux fiches d'accord et ne renonce à rien : Éducation
reste en secondaire.

Ce que la décision coûte : une revue plus stricte (règles 1.3 et 5.1.4), et
l'URL de politique de confidentialité devient obligatoire au lieu de
recommandée — https://aboky2.github.io/eduForAll/, étape 🔴 1.4 de
`docs/deploiement-v1.md`.

Elle fait aussi examiner la porte parentale au titre de la règle 1.3. Celle de
`app/(parent)/gate.tsx` pose une **multiplication tirée au hasard** à chaque
ouverture (deux facteurs de 6 à 9), dont le résultat s'écrit au clavier
numérique, sans réponse proposée ; une autre opération, d'un autre résultat,
s'affiche après chaque erreur. Les écrans de l'espace parent et des paramètres
renvoient à la porte tant qu'elle n'est pas franchie, lien profond compris, et
la session se referme dès que l'app passe en arrière-plan
(`parent-session-store.ts`).

Si le propriétaire préfère la visibilité de la catégorie Éducation, l'inverse
se défend — Éducation en principale, Enfants en secondaire — mais alors l'app
n'est **pas** dans la catégorie Enfants : il faut retirer la mention
« catégorie Enfants » de `store/app-store/privacy-answers.md`, et la section 6
ci-dessous devient sans objet. Les sections 2 à 4, elles, ne changent pas.

---

## 2. Contrôles intégrés (In-App Controls) et capacités (Capabilities)

Premier écran du questionnaire : cocher ce que l'app contient.

| Question | Réponse | Pourquoi |
|---|---|---|
| **Parental Controls** (contrôles parentaux) | **Oui** | Définition d'Apple : « Settings or tools that allow parents/guardians to monitor, manage, or restrict a child's access to in-app content or features that may not be suitable. » L'espace parent fait les trois : **suivre** (tableau de bord : leçons, minutes, progression par discipline), **gérer** (rubrique « Classe » : CP1 ou CP2, donc les leçons proposées), **restreindre** (partage du résumé, export du diagnostic et réinitialisation, réservés à l'adulte derrière la porte). Sans effet sur la note : 4+ |
| **Age Assurance** (vérification de l'âge) | **Non** | Définition d'Apple : un mécanisme qui confirme l'âge (API *Declared Age Range*, estimation de l'âge, pièce d'identité). La porte parentale est une porte de la règle 1.3, pas une vérification d'âge, et l'app n'appelle aucune API d'âge |
| **Unrestricted Web Access** (accès web non restreint) | **Non** | Aucun `WebView`, aucun `Linking.openURL`, aucun lien sortant dans `app/` ni `src/` |
| **User-Generated Content** (contenu créé par les utilisateurs) | **Non** | Le prénom et l'avatar sont choisis librement mais restent dans la base SQLite locale ; personne d'autre ne les voit |
| **Social Media** (réseau social) | **Non** | Aucun fil, aucun compte, aucun autre utilisateur |
| **Messaging and Chat** (messagerie) | **Non** | Aucune fonction de communication |
| **Advertising** (publicité) | **Non** | Aucun SDK publicitaire ; absence vérifiée par une gate automatisée |

« Parental Controls : Oui » est un choix, et il se défend mot pour mot avec la
définition d'Apple. « Non » donnerait aussi 4+ : à garder si l'on veut réserver
le terme à des outils de filtrage ou de limite de temps, qu'ECOLNA n'a pas.
Les deux réponses sont sans conséquence sur la note ; « Oui » décrit mieux
l'espace parent tel qu'il est.

---

## 3. Descripteurs de contenu

Fréquence demandée : *Aucun* / *Peu fréquent* / *Fréquent* ; certaines lignes
se répondent par oui ou non.

### Thèmes pour adultes (Mature Themes)

| Descripteur | Réponse |
|---|---|
| Profanity or Crude Humor (grossièretés ou humour vulgaire) | **Aucun** |
| Horror/Fear Themes (horreur ou peur) | **Aucun** |
| Alcohol, Tobacco, or Drug Use or References (alcool, tabac, drogues) | **Aucun** |

### Médical ou bien-être (Medical or Wellness)

| Descripteur | Réponse |
|---|---|
| Medical or Treatment Information (informations médicales ou de traitement) | **Aucun** |
| Health or Wellness Topics (sujets de santé ou de bien-être) | **Non** |

Ce que contient l'app, dit sans détour : le thème de langage « Quand on est
malade », tiré du programme (« les maladies », p. 19), en **5 leçons sur 308**
(2 en CP1, 3 en CP2). On y trouve des mots (malade, fièvre, moustique,
médicament, hôpital, paludisme, docteur, moustiquaire, savon, santé,
infirmier), deux phrases d'hygiène à répéter (« Je me lave les mains. », « Je
me lave les mains avec du savon avant de manger. »), la phrase « Le moustique
donne le paludisme. » et une histoire de quatre phrases (Moussa a de la
fièvre ; sa maman l'emmène à l'hôpital ; le docteur l'examine et donne un
médicament ; le soir, il dort sous la moustiquaire). Le savon et la dent
reviennent aussi comme mots de lecture.

- **Medical or Treatment Information — Aucun.** Définition d'Apple :
  « Content that provides diagnoses or guidance around the management of
  medical conditions or health and wellness » (conseils sur un médicament,
  soins d'urgence, traitement). L'app ne pose aucun diagnostic, ne nomme aucun
  médicament, ne donne aucune posologie ni aucun conseil de soin : un docteur
  et « un médicament » apparaissent dans une histoire de vocabulaire. (Même
  « peu fréquent », ce descripteur classerait l'app en 13+, hors de la
  catégorie Enfants.)
- **Health or Wellness Topics — Non.** Définition d'Apple : « Content that
  provides self-care or lifestyle recommendations. May include: calorie
  tracking, dieting advice, or exercise recommendations. » ECOLNA n'offre
  aucun contenu de ce type : ni suivi, ni régime, ni programme d'exercice, ni
  recommandation de mode de vie. Les phrases d'hygiène sont du vocabulaire de
  classe, au programme du CP. C'est la ligne la plus discutable du
  questionnaire, et la réponse est retenue en connaissance de cause : si un
  examinateur lit « Je me lave les mains avant de manger » comme une
  recommandation de soin de soi, la réponse devient « Oui ». La note passe
  alors à **9+** ; l'app reste admissible dans la catégorie Enfants (« Made for
  Kids » est proposé jusqu'à 9+), mais elle est masquée sur les appareils où
  Temps d'écran limite les apps à 4+. Le thème est au programme officiel : ne
  pas le retirer pour autant.

### Sexualité ou nudité (Sexuality or Nudity)

| Descripteur | Réponse |
|---|---|
| Mature or Suggestive Themes (thèmes pour adultes ou suggestifs) | **Aucun** |
| Sexual Content or Nudity (contenu sexuel ou nudité) | **Aucun** |
| Graphic Sexual Content and Nudity (contenu sexuel explicite) | **Aucun** |

### Violence

| Descripteur | Réponse |
|---|---|
| Cartoon or Fantasy Violence (violence dessinée ou fantastique) | **Aucun** |
| Realistic Violence (violence réaliste) | **Aucun** |
| Prolonged Graphic or Sadistic Realistic Violence | **Aucun** |
| Guns or Other Weapons (armes) | **Aucun** — aucune arme, aucun couteau, ni dans les mots ni dans les 112 illustrations (recherche faite sur le manifeste le 4 octobre 2026) |

### Hasard (Chance-Based Activities)

| Descripteur | Réponse |
|---|---|
| Gambling (jeux d'argent réels) | **Non** |
| Simulated Gambling (jeux d'argent simulés) | **Aucun** — `count_money` fait **compter** des pièces dessinées : c'est du calcul, pas une mise |
| Contests (concours) | **Aucun** — aucune compétition entre utilisateurs, aucun classement ; les 14 badges récompensent un progrès personnel |
| Loot Boxes (coffres à butin) | **Non** |

308 leçons et 1 625 exercices, tous adossés au programme national tchadien :
langage, lecture, écriture, calcul. Les opérations se dessinent avec des
objets du quotidien — chèvres, mangues, poules, calebasses.

---

## 4. Age Categories and Override : « Made for Kids »

| Question | Réponse |
|---|---|
| Age Categories and Override | **Made for Kids** |
| Tranche d'âge | **6–8 ans** |

Apple ne propose « Made for Kids » que si la note calculée est 4+ ou 9+, et ce
choix **ne peut plus être modifié** une fois l'app approuvée : l'app et toutes
ses mises à jour devront suivre les règles de la catégorie Enfants.

CP1 et CP2, 6 à 8 ans : c'est le seul public de l'app, pas un segment parmi
d'autres. Les deux tranches voisines proposées par Apple — « 5 ans et moins »,
« 9–11 ans » — ne correspondent pas au cours préparatoire.

Aucune surclassification (*Override to Higher Age Rating*) : rien ne la
justifie.

---

## 5. Ce que la note engage

Aucune réponse ne repose sur une intention : chacune est une propriété du code
ou du contenu, vérifiable dans le dépôt. Toute nouvelle `CONTENT_VERSION`
impose de relire la section 3, en particulier les lignes « Medical or
Wellness ».

---

## 6. Ce que la catégorie Enfants engage, et où en est le dépôt

| Exigence Apple | État | Preuve dans le dépôt |
|---|---|---|
| 1.3 — aucun lien sortant, achat ou invitation sans contrôle d'accès adulte | Tenu | Aucun lien sortant, nulle part ; les seuls partages passent par la feuille système, derrière la porte de `app/(parent)/gate.tsx` (multiplication tirée au hasard, saisie au clavier numérique) ; garde des routes `(parent)` et `(settings)` (`parent-session-guard.tsx`) ; tests `tests/integration/parent-gate-screen.test.tsx` et `parent-routes-guard.test.tsx` |
| 1.3 — publicité interdite ou strictement contextuelle | Sans objet | Aucune publicité, aucun identifiant publicitaire |
| 5.1.4 — aucune donnée personnelle transmise à un tiers | Tenu | Aucun appel réseau au runtime ; prénom, avatar, classe et progression en SQLite local ; sauvegarde système Android désactivée (`allowBackup: false`). Sur iOS, une sauvegarde iCloud de l'appareil peut contenir ces données, sans qu'ECOLNA y ait accès : dit dans la politique de confidentialité |
| 5.1.4 — aucun SDK d'analytique ou de publicité tiers | Tenu | Aucun SDK tiers, aucun outil de mesure d'audience |
| 5.1.4 — politique de confidentialité accessible | À publier | https://aboky2.github.io/eduForAll/ (étape 🔴 1.4 de `docs/deploiement-v1.md`) ; rappel de l'adresse dans l'app, Paramètres → Confidentialité |
| Aucun compte, aucune identification | Tenu | Ni e-mail, ni mot de passe, ni compte ; profil purement local |

Identifiant `td.ecolna.app`, version 1.0.0, langue de l'app et de la fiche :
français uniquement.

Cohérence vérifiée avec `privacy-answers.md` (« Data Not Collected »,
catégorie Enfants décidée), `review-notes-fr.md` (porte tirée au hasard) et
`docs/deploiement-v1.md` § 7 (Enfants en principale). Rien dans ce fichier
n'alimente un champ à longueur limitée : le sous-titre (30 caractères) et les
mots-clés (100 caractères) vivent dans `description-fr.md` et
`keywords-fr.md`.

## 7. Ce qui reste au propriétaire

Les réponses ci-dessus se recopient telles quelles. Seule la signature est
personnelle : le détenteur du compte accepte les conditions de la catégorie
Enfants dans App Store Connect, puis soumet le questionnaire. Éditeur déclaré :
Issa Oki ABDRAMANE, 25 rue Édouard Vaillant, appartement 317, 37000 Tours,
France.
