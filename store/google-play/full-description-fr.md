<!-- Play Console → Fiche Play Store → « Description complète ».
     COMPTE RÉEL : 3 407 caractères sur 4 000, balises comprises
     (3 326 sans les balises) — vérifié par script. -->

# Description complète Google Play — 3 407 caractères sur 4 000

Google Play ne rend qu'un petit sous-ensemble HTML dans ce champ : `<b>`,
`<i>`, `<u>`, `<em>`, `<strong>`, `<br>`, `<p>`, `<ul>`, `<ol>`, `<li>`. Le
Markdown n'est pas interprété. Chaque ligne de liste se termine par `<br>` et
les paragraphes sont séparés par une ligne vide.

Coller uniquement le bloc ci-dessous, de la première à la dernière ligne, sans
y ajouter de retour à la ligne. Il contient des espaces insécables (devant
: ; ! ? », après «, dans « 1 625 ») : copier depuis le fichier brut. Puis
relire l'aperçu de Play Console : s'il montre une ligne vide entre chaque
puce, le champ a conservé les retours — supprimer alors les `<br>`.

Play montre la description courte en tête de fiche et le début de ce texte
dans « À propos de cette appli » : le premier paragraphe porte donc toute la
promesse.

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
Lire, écrire, compter : votre enfant suit les deux années du CP tchadien, à son rythme, dans une application qui fonctionne entièrement sans internet. Chaque consigne est dite à voix haute — pas besoin de savoir lire pour commencer.

308 leçons (147 en CP1, 161 en CP2) et 1 625 exercices, construits d’après le programme officiel de l’enseignement primaire du Tchad et répartis sur l’année scolaire, trimestre après trimestre. Aucune publicité, aucun achat intégré, aucun compte, aucune donnée collectée.

<b>Pour l’enfant</b><br>
• Des leçons courtes, d’une dizaine de minutes, dans les quatre disciplines du CP : langage, lecture, écriture, calcul<br>
• Écouter un mot et toucher son image, retrouver la syllabe entendue, remettre les mots d’une phrase dans l’ordre, écouter une petite histoire puis répondre<br>
• Tracer ses lettres et ses chiffres du doigt, sur une ardoise aux lignes du cahier : une bille montre le chemin, trait après trait<br>
• Des lettres dessinées comme à l’école : un seul « a », celui du cahier, et des b, d, p, q faciles à distinguer<br>
• Des mots de tous les jours : la case, le puits, le mil, la calebasse, le boubou, le marché, la pirogue<br>
• Le calcul en images : compter, ajouter, retirer et partager des chèvres, des mangues, des poules ; écouter un petit problème et le résoudre ; compter les pièces de 5 à 500 francs CFA<br>
• Une erreur n’est jamais une sanction : l’enfant réécoute, un indice lui est dit à voix haute, et au bout de trois essais il passe à la suite — la notion reviendra plus tard<br>
• Des étoiles à chaque leçon et 14 badges qui récompensent un vrai progrès

Quand une notion résiste — le b confondu avec le d, le son « ou » avec le son « on » —, ECOLNA la repère et la propose de nouveau dans « On revoit ensemble ? ». L’enfant ne voit pas une sanction : il revoit, simplement.

<b>Pour les parents</b><br>
• Un espace parent protégé par une multiplication à écrire : leçons terminées, minutes d’apprentissage jour après jour, progression par discipline, notions à revoir expliquées en phrases simples<br>
• Aucune publicité, aucun achat intégré, aucun abonnement, aucun outil de mesure d’audience<br>
• Aucun compte, aucune adresse e-mail, aucun mot de passe<br>
• Le prénom, l’avatar et la progression restent sur l’appareil : rien n’est envoyé, sauf le résumé que vous décidez vous-même de partager<br>
• L’application ne demande même pas l’autorisation d’accéder à internet : elle fonctionne sans carte SIM, sans wifi, et ne consomme aucune donnée mobile<br>
• Pensée pour la tablette, en paysage comme en portrait ; elle fonctionne aussi sur téléphone

<b>Pour l’enseignant</b><br>
Le contenu est tiré des Programmes Réactualisés de l’Enseignement Primaire (Ministère de l’Éducation Nationale — Centre National des Curricula, N’Djaména, septembre 2004). Chaque leçon porte son trimestre, sa semaine et la référence du contenu officiel, page comprise. Le nombre de leçons de chaque discipline suit la grille horaire officielle de la page 128 : la lecture d’abord, puis le langage, le calcul et l’écriture. Les dix-huit thèmes de langage du programme y figurent, comme les voyelles, les consonnes, les sons complexes et les syllabes inverses.

ECOLNA est une publication indépendante. Elle n’est ni éditée ni validée par le Ministère de l’Éducation Nationale du Tchad, auquel elle n’est pas affiliée.

Apprendre partout, même sans internet.
<!-- fin du texte à coller -->

## Notes de rédaction

- Le texte est celui de la fiche App Store (`../app-store/description-fr.md`),
  à deux différences près : les intertitres en `<b>` et les fins de ligne en
  `<br>`, et la puce sur l'autorisation internet, propre à Android. Les deux
  fiches disent la même chose : toute retouche se fait des deux côtés. Le
  tableau « D'où vient chaque affirmation » de la fiche App Store vaut aussi
  pour celle-ci.
- « L'application ne demande même pas l'autorisation d'accéder à internet » :
  vrai des builds livrés, où `app.config.ts` bloque
  `android.permission.INTERNET` (`ECOLNA_RELEASE=1`, profils preview et
  production d'`eas.json`). Un build de développement la garde : ne jamais
  vérifier cette phrase sur un build de développement.
- Ni prix ni « gratuit » : la console affiche le prix ; le programme Familles
  et les règles de métadonnées de Play écartent les mentions de prix et de
  promotion. « Aucun achat intégré, aucun abonnement » décrit l'app.
- Aucun lien sortant, aucune adresse web dans le texte (programme Familles).
- La phrase d'indépendance est celle de
  `../shared/mentions-programme-officiel.md`, identique sur les deux fiches.
- La tenue sur tablette d'entrée de gamme n'est pas revendiquée : aucune mesure
  sur l'appareil cible, régression mémoire d'Hermes ouverte
  (`docs/known-limitations.md`).
