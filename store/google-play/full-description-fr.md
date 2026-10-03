# Description complète Google Play

Google Play ne rend qu'un petit sous-ensemble HTML dans ce champ :
`<b>`, `<i>`, `<u>`, `<em>`, `<strong>`, `<br>`, `<p>`, `<ul>`, `<ol>`, `<li>`.
Le Markdown n'est pas interprété : des `**astérisques**` s'afficheraient tels
quels dans la fiche publiée. Les sauts de ligne simples étant recollés, chaque
ligne de liste se termine par un `<br>` et les paragraphes sont séparés par une
ligne vide.

Coller uniquement le bloc « TEXTE EXACT À COLLER », de la première à la
dernière ligne, sans y ajouter de retour à la ligne : une ligne du bloc est une
ligne de la fiche. Puis relire l'aperçu de Play Console : s'il montre une ligne
vide entre chaque puce, c'est que le champ a conservé les retours à la ligne —
supprimer alors les `<br>`.

## TEXTE EXACT À COLLER

<!-- début du texte à coller -->
<b>ECOLNA — Apprendre partout, même sans internet.</b>

ECOLNA accompagne les enfants de CP1 et CP2 dans l'apprentissage du langage, de la lecture, de l'écriture et du calcul. Tout est dans l'application : les 308 leçons, les 824 enregistrements, les images. Aucune connexion n'est nécessaire, ni au premier lancement ni ensuite.

Le contenu suit le programme officiel de l'enseignement primaire tchadien. Les quatre disciplines du CP y tiennent la même place que dans la grille horaire du ministère, et les leçons se répartissent sur les trois trimestres de l'année.

<b>Pour l'enfant</b><br>
• Les deux années du CP : 147 leçons en CP1, 161 en CP2 — 308 leçons et 1 625 exercices en tout<br>
• Les quatre disciplines du CP : langage, lecture, écriture, calcul<br>
• Toutes les consignes sont lues à voix haute : pas besoin de savoir lire pour commencer<br>
• 27 types d'activités : écouter, toucher, tracer, composer des syllabes, compter, compter la monnaie, résoudre de petits problèmes de la vie courante<br>
• Le calcul se fait en images, avec des objets du quotidien : chèvres, mangues, calebasses<br>
• Un vocabulaire familier : la case, le puits, le mil, la calebasse, le marché, le berger, la pirogue<br>
• 14 badges qui récompensent un vrai progrès, réunis dans l'écran « Mon profil »<br>
• Étoiles, parcours illustré et progression visible

Quand une notion résiste — le b confondu avec le d, le p avec le q — l'application la repère et la ramène dans les révisions des jours suivants. L'enfant ne voit pas une sanction : il revoit, simplement.

<b>Pour les parents</b><br>
• Espace parent protégé : progression, notions à revoir, temps d'apprentissage, en phrases simples plutôt qu'en pourcentages<br>
• Aucune publicité, aucun achat intégré, aucun abonnement<br>
• Aucun compte, aucune adresse email, aucun mot de passe<br>
• Aucune donnée collectée : le prénom, l'avatar et la progression restent sur l'appareil<br>
• Pensée d'abord pour la tablette, elle fonctionne aussi sur téléphone, à la verticale comme à l'horizontale<br>
• Fonctionne sans carte SIM et sans forfait : l'application ne consomme aucune donnée mobile

<b>Pour l'enseignant</b><br>
Le contenu est tiré des Programmes Réactualisés de l'Enseignement Primaire, Ministère de l'Éducation Nationale — Centre National des Curricula, N'Djaména, septembre 2004. Chaque leçon cite le contenu officiel et sa page, et porte son trimestre et sa semaine. Les quatre disciplines respectent le poids horaire de la grille de la page 128. ECOLNA est une publication indépendante : elle n'est ni éditée ni validée par le ministère.

Gratuit, sans compte, sans internet. L'école qui accompagne votre enfant, partout.
<!-- fin du texte à coller -->

## Notes de rédaction

- Longueur du bloc : 2 681 caractères, balises comprises, pour une limite Play
  de 4 000. Recompter après toute retouche.
- Les chiffres sont ceux de `docs/couverture-programme.md` (artefact généré) :
  308 leçons pour les deux niveaux réunis, 147 en CP1 et 161 en CP2. Ne jamais
  écrire « une année scolaire complète par niveau » : ce sont des totaux CP1 + CP2.
- Les 14 badges viennent de `src/features/achievements/domain/achievements.ts`,
  l'écran « Mon profil » de `app/(child)/profile.tsx`.
- La tenue sur tablette d'entrée de gamme n'est volontairement pas revendiquée :
  `docs/known-limitations.md` classe comme bloquante la régression mémoire
  d'Hermes V1 (RN 0.85.3 / SDK 56, corrigée en SDK 57) et aucune mesure n'a été
  faite sur l'appareil cible. La mention ne revient qu'après une mesure réelle
  ou la montée en SDK 57 prévue en 1.1.0.
- La phrase d'indépendance vis-à-vis du ministère est obligatoire : elle évite
  de laisser croire à une publication officielle, côté Play comme côté Apple.
