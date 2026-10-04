<!-- Questionnaire IARC — Play Console → « Classification du contenu ».
     Obligatoire pour publier : sans certificat IARC, aucune version ne part,
     même en test interne. Questionnaire à choix fermés : aucune limite de
     caractères. Toute évolution du contenu impose de le repasser. -->

# Classification du contenu (IARC)

Feuille de réponses à recopier telle quelle. Chaque réponse est une propriété
du contenu livré, vérifiable dans le dépôt — aucune n'est une intention.

## 1. Avant les questions

| Champ | Valeur |
|---|---|
| Adresse e-mail (reçoit le certificat IARC) | `issaokiabderamane@gmail.com` |
| Catégorie de l'application | **Référence, actualités ou éducation** |

L'adresse est **la même** que le contact de la fiche
(`contact-details.md`) et que celle de la politique de confidentialité : le
certificat IARC et les éventuelles demandes de révision arrivent là où l'on
regarde. Elle n'est pas affichée sur la fiche au titre de ce questionnaire.

La catégorie est celle d'une app éducative : 308 leçons et 1 625 exercices
adossés au programme national tchadien, quatre disciplines — langage, lecture,
écriture, calcul. Ce n'est **pas** un jeu : il n'y a ni score, ni classement,
ni adversaire, ni progression de personnage. Les 14 badges récompensent un
progrès personnel.

## 2. Questions de contenu — « Non » partout

| Section IARC | Réponse | Motif |
|---|---|---|
| Violence | **Non** | Aucune violence, d'aucune sorte, ni dessinée ni réaliste |
| Langage grossier | **Non** | Vocabulaire scolaire du CP ; les 824 énoncés sont ceux du programme |
| Humour grossier | **Non** | Aucune blague, aucune moquerie : petites histoires et phrases du programme du CP |
| Sexualité, nudité | **Non** | Aucun contenu de cette nature |
| Substances contrôlées (alcool, tabac, drogues) | **Non** | Aucune mention, aucune image |
| Jeux d'argent | **Non** | Aucun jeu d'argent, aucune simulation, aucune monnaie virtuelle. L'exercice `count_money` fait **compter** des pièces en francs CFA dessinées (5, 10, 25, 50, 100, 500) : c'est du calcul, pas une mise |
| Peur, horreur | **Non** | Aucun élément effrayant ; les illustrations sont des pictogrammes du quotidien tchadien — chèvres, mangues, calebasses |
| Discrimination, haine | **Non** | — |

## 3. Questions « divers » — celles qui décident vraiment de la note

C'est cette section qui fait basculer une app éducative hors de la note la plus
basse. Les huit réponses :

| Question | Réponse | Preuve dans le dépôt |
|---|---|---|
| Achat de biens numériques | **Non** | Aucun achat intégré, aucune dépendance de paiement (`package.json`), aucun écran de paiement |
| Publicités | **Non** | Aucun SDK publicitaire ; absence vérifiée par une gate automatisée de `npm run validate:release` |
| Partage de la position de l'utilisateur | **Non** | L'app ne demande jamais la position ; aucune permission de géolocalisation |
| Interaction entre utilisateurs | **Non** | Aucun réseau, aucun compte, aucun autre utilisateur : il n'existe personne avec qui interagir |
| Contenu généré par les utilisateurs, partagé | **Non** | Le prénom et l'avatar sont choisis librement mais restent dans la base SQLite locale et ne sont jamais publiés |
| Navigateur web ou moteur de recherche | **Non** | ECOLNA n'est ni l'un ni l'autre : aucun `WebView`, aucun champ de recherche, aucune page web |
| Accès à des liens externes | **Non** | Aucun `Linking.openURL` dans `app/` ni `src/` — vérifiable par un `grep` ; les adresses affichées dans les paramètres (politique, licences) sont du texte simple, non cliquable |
| Échange d'informations personnelles | **Non** | Aucun appel réseau au runtime ; sauvegarde système Android désactivée (`allowBackup: false`) |

Le seul partage possible est manuel : depuis l'espace parent, donc **après** le
contrôle d'accès adulte, un adulte peut ouvrir la feuille de partage du système
avec un texte visible avant envoi (`app/(parent)/dashboard.tsx`,
`app/(settings)/diagnostics.tsx`). Ce n'est ni une interaction entre
utilisateurs ni du contenu publié : rien ne part sans le geste de l'adulte, et
rien ne va vers un service d'ECOLNA — il n'en existe aucun.

## 4. Notes attendues

| Territoire / organisme | Note attendue |
|---|---|
| Europe — PEGI | **3** |
| Amérique du Nord — ESRB | **Everyone** |
| Allemagne — USK | **0** |
| Brésil — ClassInd | **L** (libre) |
| Autres territoires — IARC générique | **3+** |

Ces notes sont la conséquence arithmétique des réponses ci-dessus : un « Oui »
quelque part, et elles changent. Si la console en renvoie une autre, c'est
qu'une réponse a été mal saisie — relire cette feuille avant d'accepter le
certificat.

## 5. Quand repasser le questionnaire

À toute modification du contenu livré : nouvelle `CONTENT_VERSION`, nouveau
type d'exercice, ajout d'un lien sortant, d'une publicité ou d'un achat. Play
exige un nouveau certificat et peut retirer l'app si les réponses ne décrivent
plus la version publiée. La déclaration « aucune publicité » est par ailleurs
tenue côté code : `com.google.android.gms.permission.AD_ID` est bloquée dans
les builds livrés (`advertising-id.md`).
