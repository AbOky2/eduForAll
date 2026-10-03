# Notes pour la review Apple (brouillon)

À coller dans le champ **Notes** de la section *App Review Information*
d'App Store Connect (4 000 caractères maximum). Le bloc contient la version
française puis la version anglaise : l'interface de l'app est intégralement en
français, mais l'examen Apple se conduit en anglais, et c'est le seul endroit
qui explique à l'examinateur le mode avion et l'accès à l'espace parent.

## App Review Information — les quatre valeurs à saisir

La console demande ce bloc de contact **en même temps** que les notes, sur le
même écran. Il n'est pas publié : il sert à joindre l'éditeur pendant l'examen.

| Champ | Valeur |
|---|---|
| Prénom | `Issa Oki` |
| Nom | `ABDRAMANE` |
| Téléphone | 🔴 À FOURNIR — format international, p. ex. `+33 6 XX XX XX XX` |
| E-mail | `issaokiabderamane@gmail.com` |
| Connexion requise (*Sign-in required*) | **Non** |

L'e-mail est celui de la politique de confidentialité (§10) et de la page de
support : une adresse différente ici donnerait deux interlocuteurs pour une app
éditée par une seule personne (`../shared/coordonnees-fiches.md`).

« Connexion requise : **non** » est la ligne qui évite un aller-retour :
sans elle, un examinateur cherche un compte de démonstration, n'en trouve
aucun, et la version repart en attente. Aucun identifiant, aucun code, aucune
pièce jointe — le parcours complet est accessible dès l'installation, en mode
avion.

## Bloc à copier (2 775 caractères, limite 4 000)

```
ECOLNA 1.0.0 — notes pour l'examen

1. Application éducative en français pour les enfants de 6 à 8 ans (CP1 et
   CP2), adossée au programme national de l'enseignement primaire de la
   République du Tchad (Ministère de l'Éducation Nationale / Centre National
   des Curricula, 2004). Toute l'interface est en français ; il n'existe pas
   d'autre langue.
2. Aucun compte, aucune identification, aucun mot de passe. Le profil (prénom
   choisi librement, avatar, niveau) est créé en trois écrans et reste dans
   une base de données locale.
3. Aucun appel réseau à l'exécution : l'application peut être examinée
   intégralement en mode avion, dès le premier lancement. Les 308 leçons, les
   1 625 exercices et les 824 enregistrements de voix sont embarqués.
4. L'espace « Parents » (progression, réglages, réinitialisation) est placé
   derrière une question de multiplication, hors de portée d'un enfant de cet
   âge. Pour entrer : répondre 42 à « 7 × 6 ». Après une réponse incorrecte,
   la question change ; les réponses attendues sont 42, 56, 54, 56, 48.
5. Le bouton « Partager la progression », dans l'espace Parents, ouvre la
   feuille de partage du système, à l'initiative du parent et avec le texte
   visible avant l'envoi. C'est la seule sortie de données de l'application.
6. Aucune collecte de données, aucun SDK tiers, aucune publicité, aucun achat
   intégré, aucune mesure d'audience. Politique de confidentialité :
   https://aboky2.github.io/eduForAll/

ECOLNA 1.0.0 — review notes

1. Educational app for children aged 6 to 8 in Chad (first two primary
   grades), built on the official Chadian primary curriculum (Ministry of
   Education / Centre National des Curricula, 2004). The whole interface is in
   French, the language of instruction in Chad; there is no English version.
2. No account, no sign-in, no password. The profile (first name typed freely,
   avatar, grade) is created in three screens and stays in a local database.
3. The app works fully in airplane mode: there is no network call at runtime,
   from the first launch onwards. The 308 lessons, 1,625 exercises and 824
   voice recordings all ship inside the app.
4. The Parents area (progress, settings, reset) is behind a multiplication
   question a child of that age cannot solve. To get in: answer 42 to
   "7 × 6". After a wrong answer the question changes; the expected answers
   are 42, 56, 54, 56, 48.
5. "Partager la progression" (Share progress), inside the Parents area, opens
   the system share sheet on the parent's own action, with the text visible
   before sending. It is the only way any data leaves the app.
6. No data collection, no third-party SDK, no advertising, no in-app
   purchase, no analytics. Privacy policy:
   https://aboky2.github.io/eduForAll/
```

## Ne pas copier dans App Store Connect

**Portail parental — durci, plus de point bloquant.**
`app/(parent)/gate.tsx` a longtemps affiché trois réponses au choix
(« 7 × 6 » → 36 / 42 / 48), sans limite de tentatives ni délai : une chance
sur trois à chaque essai, en boucle. Un portail parental devinable est un
motif de rejet connu de la catégorie Enfants (App Review Guidelines 1.3).
Le résultat se **saisit** désormais au clavier numérique, sans réponse
affichée, et l'opération change à chaque échec : le hasard ne porte plus.

Les trois fiches qui affirment que l'espace parent est « protégé » —
`store/app-store/description-fr.md`, `store/app-store/privacy-answers.md` et
`store/google-play/families-checklist.md` — sont donc exactes. Le point 4 des
deux versions ci-dessus décrit la saisie : la
question citée et sa réponse doivent correspondre au build soumis.

Autres champs de la même section, hors champ Notes :

- *Sign-in required* : **non**. Aucun compte de démonstration, aucune pièce
  jointe nécessaire — le parcours complet est accessible dès l'installation.
- Le bloc de contact (nom, téléphone, e-mail) est en tête de ce fichier. Seul
  le téléphone reste 🔴 À FOURNIR.
