<!-- App Store Connect → page de la version → « Informations pour la
     vérification de l'app » (App Review Information) : champ « Notes » et bloc
     de contact. COMPTE RÉEL du bloc à coller : 3 600 caractères sur 4 000
     (espaces et retours compris, vérifié par script). Non publié. -->

# Notes pour l'examen Apple — 3 600 caractères sur 4 000

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
5. Espace parent : onglet « Parents », en bas de l’écran. Une multiplication tirée au hasard s’affiche (par exemple 7 × 6 : écrire 42) : écrire le résultat au clavier numérique, puis toucher « Entrer ». Après une réponse fausse, une autre multiplication s’affiche. Derrière : le tableau de bord, les paramètres (son, classe CP1 ou CP2, confidentialité, diagnostic, réinitialisation) et les deux seuls partages de l’app. L’espace parent se referme quand l’app passe en arrière-plan.
6. Ces deux partages — « Partager » sur le tableau de bord, « Exporter le diagnostic » dans les paramètres — ouvrent la feuille de partage du système, à l’initiative du parent, avec un texte court visible avant l’envoi. L’app n’envoie rien elle-même.
7. Aucune collecte de données, aucun SDK tiers, aucune publicité, aucun achat intégré, aucune mesure d’audience, aucun lien sortant. Politique de confidentialité : https://aboky2.github.io/eduForAll/

ECOLNA 1.0.0 — review notes

1. Educational app in French for children aged 6 to 8 in Chad (first two primary grades, CP1 and CP2), built from the Chadian primary curriculum (2004). ECOLNA is an independent publication, not affiliated with the Ministry of Education. The whole interface is in French, the language of instruction in Chad.
2. No account, no sign-in, no password. On first launch: three welcome pages, then “Créer mon profil” (character, first name typed freely, grade). The profile stays in a local database on the device.
3. No network call: the app can be reviewed entirely in airplane mode, from the first launch. The 308 lessons, 1,625 exercises and 824 audio files ship inside the app. Sound plays even with the silent switch on.
4. To see an exercise: on the home screen (“Accueil”), tap “Commencer” on the lesson card. Every instruction is read aloud. On iPad the app runs in both orientations.
5. Parents area: the “Parents” tab at the bottom of the screen. A randomly drawn multiplication is shown (for example 7 × 6: type 42): type the result on the number pad, then tap “Entrer”. After a wrong answer another multiplication is shown. Behind it: the dashboard, the settings (sound, grade CP1 or CP2, privacy, diagnostics, reset) and the app’s only two sharing actions. The parents area locks again when the app goes to the background.
6. Both — “Partager” on the dashboard and “Exporter le diagnostic” in the settings — open the system share sheet on the parent’s own action, with a short text visible before sending. The app itself sends nothing.
7. No data collection, no third-party SDK, no advertising, no in-app purchase, no analytics, no external link. Privacy policy: https://aboky2.github.io/eduForAll/
<!-- fin du texte à coller -->

## Ne pas copier dans App Store Connect

**Ce que le bloc décrit, et où le vérifier dans le build soumis.**

| Point | Source |
|---|---|
| Porte : multiplication tirée au hasard (deux facteurs de 6 à 9), saisie au clavier numérique, aucune réponse proposée, une autre opération après chaque erreur | `app/(parent)/gate.tsx`, `src/features/parent-space/domain/parent-gate-challenge.ts` |
| « 7 × 6 » n'est qu'un exemple | l'opération affichée à l'examinateur sera presque toujours une autre : il lui suffit de calculer |
| Espace parent refermé en arrière-plan ; liens profonds renvoyés à la porte | `parent-session-store.ts`, `parent-session-guard.tsx` (layouts `(parent)` et `(settings)`) |
| Rubrique « Classe » des paramètres (CP1 ou CP2, progression gardée) | `app/(settings)/index.tsx` |
| Onglet « Parents » | `app/(child)/(tabs)/_layout.tsx` → `/(parent)/gate` |
| Deux partages, tous deux derrière le portail | `app/(parent)/dashboard.tsx` (« Partager », résumé : prénom, leçons terminées, classe) et `app/(settings)/diagnostics.tsx` (« Exporter le diagnostic » : version du contenu, compteurs, derniers avertissements, sans prénom) |
| Son en mode silencieux | `learning-audio-service.ts` : `playsInSilentMode: true` |
| Trois pages d'accueil, puis profil en trois étapes | `app/(onboarding)/index.tsx`, `create-profile.tsx` |

Le bloc ne donne **pas** de réponse à retenir : « 7 × 6 : écrire 42 » est un
exemple, et la porte tire une autre opération à chaque ouverture et après
chaque erreur. Ce fichier vit dans un dépôt public : y écrire une suite de
réponses fixes reviendrait à publier le moyen de franchir la porte sans
calculer — il n'en existe d'ailleurs plus.

Les deux versions ne disent plus « Partager la progression » ni « c'est la
seule sortie de données » : le bouton s'appelle « Partager », et l'export du
diagnostic est une seconde sortie, elle aussi à l'initiative du parent. Une
note qui contredit le build est un motif de rejet.

**Porte parentale — durcie, plus de point bloquant.** `gate.tsx` affichait
autrefois trois réponses au choix (une chance sur trois par essai, sans
limite), puis une liste fixe qui posait toujours « 7 × 6 » en premier. Le
résultat se saisit désormais au clavier numérique, sans réponse affichée ;
l'opération est tirée au hasard à chaque ouverture et change après chaque
erreur ; les écrans de l'espace parent et des paramètres renvoient à la porte
tant qu'elle n'est pas franchie. Les fiches qui disent l'espace parent
« protégé » sont exactes.

L'option de langue « Arabe tchadien — Bientôt disponible » a été retirée des
paramètres (règle 2.1 : rien d'inachevé) : les notes n'en parlent pas, et ne
doivent pas en parler.

Autres champs de la même section :

- *Sign-in required* : **non**. Aucun compte de démonstration, aucune pièce
  jointe.
- Le bloc de contact est en tête de ce fichier ; seul le téléphone reste
  🔴 À FOURNIR.
