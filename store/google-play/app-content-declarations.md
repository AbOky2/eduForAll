<!-- Déclarations à choix fermé de Play Console → « Contenu de l'application ».
     Chacune est obligatoire avant publication. Aucune limite de caractères :
     ce sont des boutons radio, parfois accompagnés d'un champ de précision.
     L'index complet de la section est dans declarations.md. -->

# Déclarations de contenu — les six « Non »

Six questions que Play pose à toute application, et dont aucune ne s'applique à
ECOLNA. Elles sont regroupées ici pour que la section se vérifie d'un coup
d'œil, et chacune porte son motif : une réponse sans motif ne se relit pas.

| Déclaration | Réponse | Motif |
|---|---|---|
| **Publicités** | « Non, cette application ne contient pas de publicité » | Aucun SDK publicitaire, aucune régie, aucun format publicitaire, aucun identifiant publicitaire — `advertising-id.md` ; absence vérifiée par une gate de `npm run validate:release` |
| **Applications d'actualités** | Non | Aucun contenu d'actualité : 308 leçons et 1 625 exercices figés dans le bundle, adossés à un programme de 2004. L'app ne reçoit rien, elle n'effectue aucun appel réseau |
| **Applications gouvernementales** | Non | L'éditeur est un particulier, Issa Oki ABDRAMANE, sans mandat ni délégation d'une autorité publique. ECOLNA **cite** le programme national tchadien mais n'est ni éditée ni validée par le ministère — `../shared/mentions-programme-officiel.md` |
| **Fonctionnalités financières** | Non | Aucun paiement, aucun prêt, aucune cryptomonnaie, aucune dépendance de paiement (`package.json`). L'exercice `count_money` fait compter des pièces en francs CFA **dessinées** : c'est du calcul au programme du CP, pas une fonctionnalité financière |
| **Applications de santé** | Non | Aucune fonctionnalité de santé, aucune donnée de santé, aucun conseil médical, aucune recherche clinique |
| **Recherche de contacts et informations COVID-19** | Non | Sans objet : aucune fonction de traçage, aucune information sanitaire |

## Le piège de ce tableau

Deux lignes se trompent facilement.

**Gouvernementales.** Une app qui porte un programme national ressemble à une
app d'État. Répondre « Oui » déclencherait une vérification d'affiliation
officielle qu'ECOLNA ne peut pas produire — elle n'en a aucune. Le programme est
cité, page par page ; il n'est pas édité par l'app. C'est exactement ce que dit
la mention d'indépendance sur les deux fiches.

**Financières.** « Compter l'argent » apparaît dans la description, et c'est au
programme du CP tchadien : pièces de 5, 10, 25, 50, 100 et 500 francs CFA,
dessinées à l'écran. Aucune transaction, aucun solde, aucun moyen de paiement.

## Ce que ces réponses engagent

Elles décrivent la version livrée. Toute version future qui ajouterait une
publicité, un paiement, un flux d'actualité ou une fonction de santé doit
reprendre cette déclaration **avant** publication : une déclaration périmée est
un motif de suspension, pas un simple avertissement.
