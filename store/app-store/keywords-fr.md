# Mots-clés App Store (brouillon, ≤ 100 caractères)

`cp1,cp2,lecture,écriture,syllabe,langage,calcul,alphabet,compter,lire,école,tchad,enfant,hors,ligne`

**99 caractères sur 100** (commas comprises, accents comptés pour un
caractère). À coller tel quel dans App Store Connect, sans retour à la ligne.

## Règles appliquées

- **Aucune espace.** Les mots sont séparés par des virgules seules : une
  espace consomme un caractère payant sans rien indexer de plus. « hors ligne »
  devient donc `hors,ligne` — Apple recombine les mots-clés entre eux, la
  requête « hors ligne » reste couverte.
- **Aucun doublon avec le nom et le sous-titre**, qu'Apple indexe avec les
  mots-clés. Le nom est `ECOLNA`, le sous-titre `Le CP tchadien, sans internet`
  (29 caractères) : « internet » n'est donc pas repris ici, l'idée est portée
  par `hors,ligne`.
- **Les quatre disciplines officielles y sont toutes** : `lecture`, `écriture`,
  `langage`, `calcul`. `écriture` manquait au brouillon précédent.
- **Singulier, minuscules, sans répétition.** Apple fait le reste.

## Décisions à relire

- `cp1` et `cp2` sont conservés malgré le « CP » du sous-titre : ce sont deux
  requêtes distinctes, et ce sont les deux niveaux couverts par l'app.
- `tchad` est conservé par prudence : le sous-titre ne porte que « tchadien ».
  Si le propriétaire préfère libérer les 6 caractères, les candidats suivants
  sont `apprendre` et `tablette` (l'app est pensée pour la tablette).
- `maternelle` est volontairement écarté : ECOLNA couvre le CP1 et le CP2
  (6–8 ans), pas la maternelle. Attirer la mauvaise requête coûte des
  désinstallations.
