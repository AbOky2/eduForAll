<!-- Play Console → Fiche Play Store → « Description complète ».
     COMPTE RÉEL (vérifié par script le 4 octobre 2026) : 3 488 caractères
     sur 4 000, balises comprises (3 467 sans les balises). -->

# Description complète Google Play — 3 488 caractères sur 4 000

| Champ | Compte réel | Limite |
|---|---|---|
| Description complète, balises `<b>` comprises | 3 488 | 4 000 |
| Même texte, sans les balises | 3 467 | — |

Google Play ne rend qu'un petit sous-ensemble HTML dans ce champ (`<b>`,
`<i>`, `<u>`, `<em>`, `<strong>`, `<br>`…) et **conserve les retours à la
ligne** tels qu'ils sont collés. Le bloc n'utilise donc que `<b>`, pour les
trois intertitres : chaque puce est sur sa propre ligne, et les paragraphes
sont séparés par une ligne vide. Aucun `<br>` : ajouté à un vrai retour à la
ligne, il produirait une ligne vide entre chaque puce. Le Markdown n'est pas
interprété.

Coller uniquement le bloc ci-dessous, de la première à la dernière ligne, sans
y ajouter de retour à la ligne. Il contient des espaces insécables (devant
: ; ! ? », après «, dans « 1 625 ») : copier depuis le fichier brut. La console
n'affiche pas d'aperçu fidèle de ce champ : contrôler le rendu sur la fiche de
**test interne**, telle que la voient les testeurs (liste à puces sans ligne
vide entre les puces, intertitres en gras).

Play montre la description courte en tête de fiche et le début de ce texte
dans « À propos de cette appli » : le premier paragraphe porte donc toute la
promesse.

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
Lire, écrire, compter : votre enfant suit les deux années du CP tchadien, à son rythme, dans une application qui fonctionne entièrement sans internet. Chaque consigne est dite à voix haute — pas besoin de savoir lire pour commencer.

308 leçons (147 en CP1, 161 en CP2) et 1 625 exercices, construits d’après le programme officiel de l’enseignement primaire du Tchad et répartis sur l’année scolaire, trimestre après trimestre. Aucune publicité, aucun achat intégré, aucun compte, aucune donnée collectée.

<b>Pour l’enfant</b>
• Des leçons courtes, d’une dizaine de minutes, dans les quatre disciplines du CP : langage, lecture, écriture, calcul
• Écouter un mot et toucher son image, retrouver la syllabe entendue, remettre les mots d’une phrase dans l’ordre, écouter une petite histoire puis répondre
• Tracer ses lettres et ses chiffres du doigt, sur une ardoise aux lignes du cahier : une bille montre le chemin, trait après trait
• Des lettres dessinées comme à l’école : un seul « a », celui du cahier, et des b, d, p, q faciles à distinguer
• Des mots de tous les jours : la case, le puits, le mil, la calebasse, le boubou, le marché, la pirogue
• Le calcul en images : compter, ajouter, retirer et partager des chèvres, des mangues, des poules ; écouter un petit problème et le résoudre ; compter les pièces de 5 à 500 francs CFA
• Une erreur n’est jamais une sanction : l’enfant réécoute, le plus souvent avec un indice dit à voix haute, et au bout de trois essais il passe à la suite — la notion reviendra plus tard
• Des étoiles à chaque leçon et 14 badges qui récompensent un vrai progrès

Quand une notion résiste — le b confondu avec le d, le son « ou » avec le son « on » —, ECOLNA la repère et la propose de nouveau dans « On revoit ensemble ? ». L’enfant ne voit pas une sanction : il revoit, simplement.

<b>Pour les parents</b>
• Un espace parent protégé par une multiplication à écrire : leçons terminées, minutes d’apprentissage jour après jour, progression par discipline, notions à revoir expliquées en phrases simples
• Le passage du CP1 au CP2 se fait dans les paramètres, sans rien perdre : leçons, étoiles et badges sont gardés
• Aucun abonnement, aucun outil de mesure d’audience, ni adresse e-mail ni mot de passe à donner
• Le prénom, l’avatar et la progression sont enregistrés sur l’appareil : rien ne sort de la tablette, sauf ce que vous décidez vous-même de partager (résumé de progression, diagnostic technique)
• L’application ne demande même pas l’autorisation d’accéder à internet : elle fonctionne sans carte SIM, sans wifi, et ne consomme aucune donnée mobile
• Pensée pour la tablette, en paysage comme en portrait ; elle fonctionne aussi sur téléphone

<b>Pour l’enseignant</b>
Le contenu est tiré des Programmes Réactualisés de l’Enseignement Primaire (Ministère de l’Éducation Nationale — Centre National des Curricula, N’Djaména, septembre 2004). Derrière chaque leçon, un trimestre, une semaine et un passage précis du programme officiel, page comprise : c’est ce qui fixe l’ordre des leçons. Le nombre de leçons de chaque discipline suit la grille horaire officielle de la page 128 : la lecture d’abord, puis le langage, le calcul et l’écriture. Les dix-huit thèmes de langage du programme y figurent, comme les voyelles, les consonnes, les sons complexes et les syllabes inverses.

ECOLNA est une publication indépendante. Elle n’est ni éditée ni validée par le Ministère de l’Éducation Nationale du Tchad, auquel elle n’est pas affiliée.
<!-- fin du texte à coller -->

## Notes de rédaction

- Le texte est celui de la fiche App Store (`../app-store/description-fr.md`),
  à deux différences près : les intertitres en `<b>`, et la puce sur
  l'autorisation internet, propre à Android, à la place de la puce « Aucune
  connexion nécessaire ». Les deux fiches disent la même chose : toute retouche
  se fait des deux côtés. Le tableau « D'où vient chaque affirmation » de la
  fiche App Store vaut aussi pour celle-ci.
- « Sans internet » n'apparaît qu'une fois dans le texte (premier paragraphe),
  en plus de la description courte et de l'image de mise en avant ; « Aucune
  publicité, aucun achat intégré » une seule fois (deuxième paragraphe). Le
  texte se termine sur la phrase d'indépendance, sans formule de conclusion.
- « L'application ne demande même pas l'autorisation d'accéder à internet » :
  vrai des builds livrés, où `app.config.ts` bloque
  `android.permission.INTERNET` (`ECOLNA_RELEASE=1`, profils preview et
  production d'`eas.json`), ainsi que `android.permission.ACCESS_NETWORK_STATE`
  (« afficher les connexions réseau », que déclarait Glide via `expo-image`, dépendance inutilisée retirée depuis) : la
  liste des autorisations affichée par Play ne parle donc pas de réseau. Il ne
  doit rester que `VIBRATE`, `MODIFY_AUDIO_SETTINGS` et la permission de signature `…DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` dans le manifeste de
  l'AAB (à contrôler au premier build : `bundletool dump manifest`). Un build
  de développement garde ces deux autorisations réseau : ne jamais vérifier
  cette phrase sur un build de développement.
- « Rien ne sort de la tablette » : vrai sur Android, où la sauvegarde système
  est coupée (`allowBackup: false`) et où l'app n'effectue aucun appel réseau.
  Les deux seules sorties sont les partages déclenchés par le parent, nommés
  entre parenthèses.
- Ni prix ni « gratuit » : la console affiche le prix ; le programme Familles
  et les règles de métadonnées de Play écartent les mentions de prix et de
  promotion. « Aucun achat intégré, aucun abonnement » décrit l'app.
- Aucun lien sortant, aucune adresse web dans le texte (programme Familles).
- La phrase d'indépendance est celle de
  `../shared/mentions-programme-officiel.md`, identique sur les deux fiches.
- La tenue sur tablette d'entrée de gamme n'est pas revendiquée : aucune mesure
  sur l'appareil cible, régression mémoire d'Hermes ouverte
  (`docs/known-limitations.md`).
