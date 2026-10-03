# Classification d'âge — App Store Connect

Fiche de réponses à recopier dans App Store Connect, section **Classification
par âge**. Le questionnaire d'Apple comporte deux volets — le contenu *et* les
capacités de l'app — et il force un choix sur la catégorie Enfants. Les trois
sont tranchés ici : rien ne peut rester ouvert au moment de soumettre.

Résultat attendu : **4+**, « Conçu pour les enfants », tranche **6–8 ans**.

---

## 1. Décision : « Enfants » en catégorie principale

**Catégorie principale : Enfants (6–8 ans). Catégorie secondaire : Éducation.**

Dans App Store Connect, la tranche d'âge Enfants n'apparaît que si « Enfants »
est la catégorie **principale**. Avec Éducation en principale, l'app n'est pas
une app de la catégorie Enfants, et tout ce qui a été construit pour elle —
contrôle d'accès adulte, zéro SDK tiers, zéro lien sortant — ne compte pour
rien.

ECOLNA n'a pas d'autre public que des enfants de 6 à 8 ans, CP1 et CP2. Côté
Google Play, la candidature au programme Familles est déjà actée avec la même
tranche (`store/google-play/target-audience.md`). Le choix ci-dessus met les
deux fiches d'accord et ne renonce à rien : Éducation reste en secondaire.

Ce que la décision coûte : une revue plus stricte (règles 1.3 et 5.1.4), et
l'URL de politique de confidentialité devient obligatoire au lieu de
recommandée — https://aboky2.github.io/eduForAll/, étape 🔴 1.2 de
`docs/deploiement-v1.md`.

Elle fait aussi examiner le portail parental au titre de la règle 1.3. Celui
de `app/(parent)/gate.tsx` affichait trois réponses au choix, sans limite de
tentatives : devinable en trois essais. Le résultat se saisit désormais au
clavier numérique, sans réponse affichée, et l'opération change à chaque
échec. Le questionnaire ci-dessous est exact, et ce prérequis est levé.

Si le propriétaire préfère la visibilité de la catégorie Éducation, l'inverse
se défend — Éducation en principale, Enfants en secondaire — mais alors l'app
n'est **pas** dans la catégorie Enfants : il faut retirer la mention « Kids
Category » de `store/app-store/privacy-answers.md`, et la section 5 ci-dessous
devient sans objet. Les sections 2, 3 et 4, elles, ne changent pas.

---

## 2. Questions de contenu

Fréquence demandée pour chaque descripteur : *Aucun* / *Peu fréquent ou léger*
/ *Fréquent ou intense*.

| Descripteur | Réponse |
|---|---|
| Violence dessinée ou fantastique | **Aucun** |
| Violence réaliste | **Aucun** |
| Violence réaliste prolongée, graphique ou sadique | **Aucun** |
| Grossièretés ou humour vulgaire | **Aucun** |
| Thèmes pour adultes ou suggestifs | **Aucun** |
| Thèmes d'horreur ou de peur | **Aucun** |
| Informations médicales ou relatives à des traitements | **Aucun** |
| Alcool, tabac ou drogues : usage ou références | **Aucun** |
| Contenu sexuel ou nudité | **Aucun** |
| Contenu sexuel explicite ou nudité | **Aucun** |
| Jeux d'argent simulés | **Aucun** |

308 leçons et 1 625 exercices, tous adossés au programme national tchadien :
langage, lecture, écriture, calcul. Les opérations se dessinent avec des
objets du quotidien — chèvres, mangues, calebasses. Aucun descripteur ne
s'applique, à aucune fréquence.

Les libellés suivent la formulation actuelle d'App Store Connect. Si l'un a
changé, la réponse reste la même : l'app ne contient rien de tout cela.

---

## 3. Questions de capacité

| Question | Réponse | Pourquoi |
|---|---|---|
| L'app contient-elle de la publicité ? | **Non** | Aucun SDK publicitaire embarqué ; absence vérifiée par une gate automatisée |
| L'app permet-elle de créer ou de partager du contenu entre utilisateurs ? | **Non** | Le prénom et l'avatar sont choisis librement mais restent dans la base SQLite locale ; il n'existe aucun autre utilisateur à qui les montrer |
| L'app contient-elle de la messagerie ou un chat ? | **Non** | Aucune fonction de communication |
| L'app donne-t-elle un accès web non restreint ? | **Non** | Aucun `WebView`, aucun `Linking.openURL`, aucun lien sortant dans `app/` ni `src/` |
| L'app contient-elle des achats intégrés ? | **Non** | Gratuite, sans abonnement |
| L'app partage-t-elle la position de l'utilisateur avec d'autres utilisateurs ? | **Non** | L'app ne demande jamais la position |
| L'app propose-t-elle des jeux d'argent réels ? | **Non** | — |
| L'app propose-t-elle des concours ? | **Non** | Aucun tirage au sort, aucun classement entre enfants ; les 14 badges récompensent un progrès personnel |
| L'app intègre-t-elle un contrôle parental ? | **Oui** | `app/(parent)/gate.tsx` : une question de multiplication exigée avant la progression, les réglages, la réinitialisation et tout partage. Le portail existe bien — il doit être durci avant soumission (§5) |

Aucune de ces réponses ne repose sur une intention : chacune est une propriété
du code, vérifiable dans le dépôt.

---

## 4. « Conçu pour les enfants »

| Question | Réponse |
|---|---|
| App conçue pour les enfants ? | **Oui** |
| Tranche d'âge | **6–8 ans** |

CP1 et CP2, 6 à 8 ans : c'est le seul public de l'app, pas un segment parmi
d'autres. Les deux tranches voisines proposées par Apple — « 5 ans et moins »,
« 9–11 ans » — ne correspondent pas au cours préparatoire.

---

## 5. Ce que la catégorie Enfants engage, et où en est le dépôt

| Exigence Apple | État | Preuve dans le dépôt |
|---|---|---|
| 1.3 — aucun lien sortant, achat ou invitation sans contrôle d'accès adulte | Tenu | Aucun lien sortant, nulle part ; les seuls partages passent par la feuille système, derrière `app/(parent)/gate.tsx`, dont le résultat se saisit au clavier numérique sans réponse affichée (`tests/components/parent-gate.test.tsx`) |
| 1.3 — publicité interdite ou strictement contextuelle | Sans objet | Aucune publicité, aucun identifiant publicitaire |
| 5.1.4 — aucune donnée personnelle transmise à un tiers | Tenu | Aucun appel réseau au runtime ; prénom, avatar, niveau et progression en SQLite local ; sauvegarde système Android désactivée (`allowBackup: false`) |
| 5.1.4 — aucun SDK d'analytique ou de publicité tiers | Tenu | Aucun SDK tiers, aucun outil de mesure d'audience |
| 5.1.4 — politique de confidentialité accessible | À publier | https://aboky2.github.io/eduForAll/ (étape 🔴 1.2 de `docs/deploiement-v1.md`) |
| Aucun compte, aucune identification | Tenu | Ni e-mail, ni mot de passe, ni compte ; profil purement local |

Identifiant `td.ecolna.app`, version 1.0.0, langue de l'app et de la fiche :
français uniquement.

---

## 6. À aligner, maintenant que la décision est prise

- `docs/deploiement-v1.md` §6.3 annonce « Catégorie principale : Éducation » et
  §6.4 traite la catégorie Enfants comme « optionnelle ». Les deux reprennent
  l'ancien brouillon et contredisent le §1 ci-dessus.
- `store/app-store/privacy-answers.md` présente « Kids Category » comme une
  hypothèse ; c'est désormais une décision. Sa formule « parent gate présent »
  fait partie des affirmations que `review-notes-fr.md` demande de relire après
  le durcissement du portail.
- Rien dans ce fichier n'alimente un champ à longueur limitée : le sous-titre
  (30 caractères) et les mots-clés (100 caractères) vivent dans
  `description-fr.md` et `keywords-fr.md`.

## 7. Ce qui reste au propriétaire

Les réponses ci-dessus se recopient telles quelles. Seule la signature est
personnelle : le détenteur du compte accepte les conditions de la catégorie
Enfants dans App Store Connect, puis soumet le questionnaire. Éditeur déclaré :
Issa Oki ABDRAMANE, 25 rue Édouard Vaillant, appartement 317, 37000 Tours,
France.
