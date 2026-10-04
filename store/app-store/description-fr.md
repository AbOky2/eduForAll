<!-- App Store Connect → page de la version → « Sous-titre » et « Description ».
     COMPTES RÉELS (caractères, espaces et retours à la ligne compris,
     vérifiés par script) : sous-titre 29 / 30 · description 3 299 / 4 000.
     Le nom (30 / 30) est dans app-information.md. -->

# ECOLNA — Sous-titre et description App Store

## Sous-titre — 29 caractères sur 30

```
Le CP tchadien, sans internet
```

Le sous-titre s'affiche sous le nom dans les résultats de recherche : c'est la
promesse en une ligne. Apple l'indexe : « CP », « tchadien » et « internet »
ne sont donc pas repris dans `keywords-fr.md`.

## Description — 3 299 caractères sur 4 000

App Store Connect ne rend aucune mise en forme dans ce champ : ni Markdown ni
HTML. Les intertitres sont des lignes simples, les puces des caractères « • ».
Coller uniquement le bloc ci-dessous, de la première à la dernière ligne. Il
contient des espaces insécables (devant : ; ! ? », après «, dans « 1 625 ») :
copier depuis le fichier brut, pas depuis un aperçu qui les remplacerait.

Seules les trois premières lignes s'affichent avant « Plus » : elles portent la
promesse entière (les quatre apprentissages, le CP tchadien, sans internet, à
voix haute).

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
Lire, écrire, compter : votre enfant suit les deux années du CP tchadien, à son rythme, dans une application qui fonctionne entièrement sans internet. Chaque consigne est dite à voix haute — pas besoin de savoir lire pour commencer.

308 leçons (147 en CP1, 161 en CP2) et 1 625 exercices, construits d’après le programme officiel de l’enseignement primaire du Tchad et répartis sur l’année scolaire, trimestre après trimestre. Aucune publicité, aucun achat intégré, aucun compte, aucune donnée collectée.

Pour l’enfant
• Des leçons courtes, d’une dizaine de minutes, dans les quatre disciplines du CP : langage, lecture, écriture, calcul
• Écouter un mot et toucher son image, retrouver la syllabe entendue, remettre les mots d’une phrase dans l’ordre, écouter une petite histoire puis répondre
• Tracer ses lettres et ses chiffres du doigt, sur une ardoise aux lignes du cahier : une bille montre le chemin, trait après trait
• Des lettres dessinées comme à l’école : un seul « a », celui du cahier, et des b, d, p, q faciles à distinguer
• Des mots de tous les jours : la case, le puits, le mil, la calebasse, le boubou, le marché, la pirogue
• Le calcul en images : compter, ajouter, retirer et partager des chèvres, des mangues, des poules ; écouter un petit problème et le résoudre ; compter les pièces de 5 à 500 francs CFA
• Une erreur n’est jamais une sanction : l’enfant réécoute, un indice lui est dit à voix haute, et au bout de trois essais il passe à la suite — la notion reviendra plus tard
• Des étoiles à chaque leçon et 14 badges qui récompensent un vrai progrès

Quand une notion résiste — le b confondu avec le d, le son « ou » avec le son « on » —, ECOLNA la repère et la propose de nouveau dans « On revoit ensemble ? ». L’enfant ne voit pas une sanction : il revoit, simplement.

Pour les parents
• Un espace parent protégé par une multiplication à écrire : leçons terminées, minutes d’apprentissage jour après jour, progression par discipline, notions à revoir expliquées en phrases simples
• Aucune publicité, aucun achat intégré, aucun abonnement, aucun outil de mesure d’audience
• Aucun compte, aucune adresse e-mail, aucun mot de passe
• Le prénom, l’avatar et la progression restent sur l’appareil : rien n’est envoyé, sauf le résumé que vous décidez vous-même de partager
• Aucune connexion nécessaire, ni au premier lancement ni ensuite : l’application convient là où internet est rare ou coûteux
• Pensée pour la tablette, en paysage comme en portrait ; elle fonctionne aussi sur téléphone

Pour l’enseignant
Le contenu est tiré des Programmes Réactualisés de l’Enseignement Primaire (Ministère de l’Éducation Nationale — Centre National des Curricula, N’Djaména, septembre 2004). Chaque leçon porte son trimestre, sa semaine et la référence du contenu officiel, page comprise. Le nombre de leçons de chaque discipline suit la grille horaire officielle de la page 128 : la lecture d’abord, puis le langage, le calcul et l’écriture. Les dix-huit thèmes de langage du programme y figurent, comme les voyelles, les consonnes, les sons complexes et les syllabes inverses.

ECOLNA est une publication indépendante. Elle n’est ni éditée ni validée par le Ministère de l’Éducation Nationale du Tchad, auquel elle n’est pas affiliée.

Apprendre partout, même sans internet.
<!-- fin du texte à coller -->

## D'où vient chaque affirmation

Toute phrase du bloc est vérifiable dans le dépôt ; recompter et revérifier
après toute retouche du contenu.

| Affirmation | Source |
|---|---|
| 308 leçons, 147 CP1, 161 CP2, 1 625 exercices | `npm run validate:content` ; `docs/couverture-programme.md` (généré) — totaux CP1 + CP2, jamais « par niveau » |
| Chaque consigne dite à voix haute | les 1 625 étapes du manifeste ont toutes un `instruction.audioId` |
| Leçons « d'une dizaine de minutes » | `estimatedDurationMinutes` : de 10 à 14 min |
| Trimestre, semaine, référence et page | champs `term`, `week`, `officialReference` de chaque leçon |
| Répartition par discipline | grille p. 128 : lecture 38 %, langage 30 %, calcul 18 %, écriture 14 % ; produit : 36 %, 32 %, 18 %, 14 % |
| Dix-huit thèmes, voyelles, consonnes, sons, syllabes inverses | `docs/couverture-programme.md` §§ 3-4, tous ✅ |
| Lettres et chiffres à tracer | `trace_letter` : minuscules, chiffres 1 à 9 et nombres jusqu'à 90 |
| Un seul « a », b/d/p/q distincts | police d'apprentissage de la lecture, `design/direction-v4-epure.md` § 4 |
| Compter, ajouter, retirer, partager ; problèmes écoutés ; chèvres, mangues, poules ; pièces de 5 à 500 F CFA | types `count_objects`, `simple_addition`, `simple_subtraction`, `simple_multiplication` (« Combien cela fait-il en tout ? »), `simple_division` (« Combien chacun en a-t-il ? »), `visual_word_problem` (« Écoute le problème… »), `count_money` ; objets `icon-goat`, `icon-mango`, `icon-hen` ; `CFA_COINS` |
| Indice dit à voix haute, trois essais puis on avance | `step-audio.ts` (`hintAudioSequence`) ; `design/direction-v4-epure.md` § 8 ter |
| b/d, ou/on repris en révision | `revision-engine.ts` (`CONFUSION_PAIRS`) ; les deux paires existent dans le contenu. **Pas p/q** : la notion `skill-lettre-q` n'existe pas |
| 14 badges | `src/features/achievements/domain/achievements.ts` |
| Espace parent, multiplication à écrire | `app/(parent)/gate.tsx` : saisie au clavier numérique, opération changée à chaque échec |
| Ce que montre l'espace parent | `app/(parent)/dashboard.tsx` : leçons terminées, « Cette semaine » (minutes par jour), « Par discipline », recommandation en phrase |
| Rien n'est envoyé, sauf le résumé partagé | aucun appel réseau ; le bouton « Partager » ouvre la feuille de partage du système, à l'initiative du parent |
| Tablette, paysage et portrait, téléphone | `app.config.ts` : `orientation: 'default'`, `supportsTablet` |

## Ce que le texte ne dit volontairement pas

- **Pas de prix**, ni « gratuit » ni « rien à payer » : la catégorie Enfants et
  les règles de métadonnées d'Apple écartent toute mention de prix ; la console
  affiche le prix d'elle-même. « Aucun achat intégré, aucun abonnement » décrit
  une propriété de l'app, pas un tarif.
- **Pas de « personnage qui parle »** ni de « Bravo » dit à voix haute : les
  consignes, les sons, les mots, les histoires et les indices sont dits ; les
  retours (« Bravo ! », « On réessaie, tout doucement. ») sont écrits, avec
  la carte verte ou bleue et le visage de l'enfant qui réagit.
- **Pas de plusieurs enfants** : un seul profil par appareil aujourd'hui
  (`docs/known-limitations.md`, multi-profils non exposés).
- **Pas de changement de classe** : la classe se choisit à la création du
  profil ; aucun écran ne permet encore de passer de CP1 à CP2.
- **Pas d'« autorisation internet »** côté Apple : iOS n'en a pas, la phrase
  n'a de sens que sur Play, où elle figure.
- **Pas de tenue sur tablette d'entrée de gamme** : aucune mesure sur
  l'appareil cible, et la régression mémoire d'Hermes (SDK 56) reste ouverte
  (`docs/known-limitations.md`).
- **Pas de voix humaine** : les 824 fichiers audio sont une synthèse vocale
  locale, accent non tchadien (`../shared/release-notes-1.0.0-fr.md`).
- **Pas de majuscules à tracer** : elles se reconnaissent et s'associent, seules
  les minuscules se tracent.
- **Pas de superlatif** ni de validation pédagogique : sept décisions attendent
  la relecture d'un enseignant (`docs/pedagogical-validation.md`).

Lexique commun aux deux fiches : « sans internet » dans les accroches et le
corps du texte, « hors ligne » réservé aux mots-clés (terme de recherche).
La phrase d'indépendance est celle de `../shared/mentions-programme-officiel.md`,
identique sur Play.
