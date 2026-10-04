<!-- App Store Connect → page de la version → « Informations pour la
     vérification de l'app » (App Review Information) : champ « Notes » et bloc
     de contact. COMPTE RÉEL du bloc à coller : 3 447 caractères sur 4 000
     (espaces et retours compris, vérifié par script). Non publié. -->

# Notes pour l'examen Apple — 3 447 caractères sur 4 000

Le bloc contient la version française puis la version anglaise : l'interface
est entièrement en français, l'examen se conduit le plus souvent en anglais, et
c'est le seul endroit qui dit à l'examinateur comment examiner l'app en mode
avion et comment entrer dans l'espace parent.

## Bloc de contact — à saisir sur le même écran

La console demande ces valeurs **en même temps** que les notes. Elles ne sont
pas publiées : elles servent à joindre l'éditeur pendant l'examen.

| Champ | Valeur |
|---|---|
| Prénom | `Issa Oki` |
| Nom | `ABDRAMANE` |
| Téléphone | 🔴 À FOURNIR par le propriétaire — format international, p. ex. `+33 6 XX XX XX XX` |
| E-mail | `issaokiabderamane@gmail.com` |
| Connexion requise (*Sign-in required*) | **Non** |

L'e-mail est celui de la politique de confidentialité et de la page de
support : une seule adresse pour une app éditée par une seule personne
(`../shared/coordonnees-fiches.md`).

« Connexion requise : **non** » évite un aller-retour : sans elle, un
examinateur cherche un compte de démonstration qui n'existe pas. Aucun
identifiant, aucun code, aucune pièce jointe : tout le parcours est accessible
dès l'installation, en mode avion.

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
ECOLNA 1.0.0 — notes pour l’examen

1. Application éducative en français pour les enfants de 6 à 8 ans (CP1 et CP2), construite d’après le programme de l’enseignement primaire de la République du Tchad (2004). ECOLNA est une publication indépendante, sans lien avec le ministère. Toute l’interface est en français.
2. Aucun compte, aucune connexion, aucun mot de passe. Au premier lancement : trois pages d’accueil, puis « Créer mon profil » (personnage, prénom libre, classe). Le profil reste dans une base de données locale, sur l’appareil.
3. Aucun appel réseau : l’app s’examine entièrement en mode avion, dès le premier lancement. Les 308 leçons, 1 625 exercices et 824 fichiers audio sont embarqués. Le son joue même en mode silencieux.
4. Pour voir un exercice : sur l’Accueil, toucher « Commencer » sur la carte de la leçon du jour. Chaque consigne est dite à voix haute. Sur iPad, l’app tourne dans les deux orientations.
5. Espace parent : onglet « Parents », en bas de l’écran. Une multiplication s’affiche (la première est « 7 × 6 ») : écrire le résultat au clavier numérique, 42, puis toucher « Entrer ». Après une réponse fausse, une autre multiplication s’affiche : en écrire le résultat. Derrière : le tableau de bord, les paramètres (son, confidentialité, diagnostic, réinitialisation) et les deux seuls partages de l’app.
6. Ces deux partages — « Partager » sur le tableau de bord, « Exporter le diagnostic » dans les paramètres — ouvrent la feuille de partage du système, à l’initiative du parent, avec un texte court visible avant l’envoi. L’app n’envoie rien elle-même.
7. Aucune collecte de données, aucun SDK tiers, aucune publicité, aucun achat intégré, aucune mesure d’audience, aucun lien sortant. Politique de confidentialité : https://aboky2.github.io/eduForAll/

ECOLNA 1.0.0 — review notes

1. Educational app in French for children aged 6 to 8 in Chad (first two primary grades, CP1 and CP2), built from the Chadian primary curriculum (2004). ECOLNA is an independent publication, not affiliated with the Ministry of Education. The whole interface is in French, the language of instruction in Chad.
2. No account, no sign-in, no password. On first launch: three welcome pages, then “Créer mon profil” (character, first name typed freely, grade). The profile stays in a local database on the device.
3. No network call: the app can be reviewed entirely in airplane mode, from the first launch. The 308 lessons, 1,625 exercises and 824 audio files ship inside the app. Sound plays even with the silent switch on.
4. To see an exercise: on the home screen (“Accueil”), tap “Commencer” on the lesson card. Every instruction is read aloud. On iPad the app runs in both orientations.
5. Parents area: the “Parents” tab at the bottom of the screen. A multiplication is shown (the first one is “7 × 6”): type the result on the number pad, 42, then tap “Entrer”. After a wrong answer another multiplication is shown: type its result. Behind it: the dashboard, the settings (sound, privacy, diagnostics, reset) and the app’s only two sharing actions.
6. Both — “Partager” on the dashboard and “Exporter le diagnostic” in the settings — open the system share sheet on the parent’s own action, with a short text visible before sending. The app itself sends nothing.
7. No data collection, no third-party SDK, no advertising, no in-app purchase, no analytics, no external link. Privacy policy: https://aboky2.github.io/eduForAll/
<!-- fin du texte à coller -->

## Ne pas copier dans App Store Connect

**Ce que le bloc décrit, et où le vérifier dans le build soumis.**

| Point | Source |
|---|---|
| Portail : multiplication saisie au clavier numérique, aucune réponse proposée, opération changée à chaque échec | `app/(parent)/gate.tsx` |
| La première question est « 7 × 6 » | premier élément de `CHALLENGES` dans `gate.tsx` — à recontrôler si la liste change |
| Onglet « Parents » | `app/(child)/(tabs)/_layout.tsx` → `/(parent)/gate` |
| Deux partages, tous deux derrière le portail | `app/(parent)/dashboard.tsx` (« Partager », résumé : prénom, leçons terminées, classe) et `app/(settings)/diagnostics.tsx` (« Exporter le diagnostic » : version du contenu, compteurs, derniers avertissements, sans prénom) |
| Son en mode silencieux | `learning-audio-service.ts` : `playsInSilentMode: true` |
| Trois pages d'accueil, puis profil en trois étapes | `app/(onboarding)/index.tsx`, `create-profile.tsx` |

Le bloc ne liste **pas** les réponses suivantes du portail ni leur ordre :
l'examinateur n'en a pas besoin (il suffit de calculer), et ce fichier vit dans
le dépôt. Écrire la suite des réponses ici reviendrait à publier le moyen de
franchir le portail sans calculer.

Les deux versions ne disent plus « Partager la progression » ni « c'est la
seule sortie de données » : le bouton s'appelle « Partager », et l'export du
diagnostic est une seconde sortie, elle aussi à l'initiative du parent. Une
note qui contredit le build est un motif de rejet.

**Portail parental — durci, plus de point bloquant.** `gate.tsx` affichait
autrefois trois réponses au choix (une chance sur trois par essai, sans limite).
Le résultat se saisit désormais au clavier numérique, sans réponse affichée, et
l'opération change à chaque échec. Les fiches qui disent l'espace parent
« protégé » sont exactes.

Autres champs de la même section :

- *Sign-in required* : **non**. Aucun compte de démonstration, aucune pièce
  jointe.
- Le bloc de contact est en tête de ce fichier ; seul le téléphone reste
  🔴 À FOURNIR.
