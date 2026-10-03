<!-- Décisions de support : page publique, adresse, délai annoncé.
     Les chaînes exactes à coller dans les consoles sont dans
     store/shared/coordonnees-fiches.md — ce fichier ne les recopie pas.
     Limites de caractères : sans objet (aucun champ de console n'est rédigé ici). -->

# Support d'ECOLNA

App Store Connect exige une **URL** de support, et refuse une adresse e-mail
seule dans ce champ. Play Console exige une **adresse e-mail** de contact.
ECOLNA fournit les deux, et la même page sert aux deux fiches.

## La page de support

`store/shared/privacy-policy/support.html`, publiée à l'adresse
`https://aboky2.github.io/eduForAll/support.html`.

Elle est volontairement rangée **dans le dossier de la politique de
confidentialité**, et non dans un dossier `store/shared/support/` : la
publication passe par un `git subtree push --prefix store/shared/privacy-policy`
(voir le README de ce dossier). Une page posée ailleurs dans `store/` ne
partirait pas sur `gh-pages` et l'URL renverrait un 404 — qu'un examinateur
Apple vérifie.

Comme la politique, la page est autonome : un seul fichier, aucune dépendance,
aucun build, même feuille de style, même en-tête.

## Ce qu'elle contient

Trois questions, choisies parce qu'elles sont les seules prévisibles sur une app
sans compte ni réseau :

1. **Réinitialiser la progression** — espace parent → « Réinitialiser
   progression ». Action définitive : il n'existe aucune sauvegarde ailleurs.
2. **La question de l'espace parent** — c'est une multiplication, pas un mot de
   passe : rien à créer, rien à retenir, rien à récupérer.
3. **L'app ne demande pas de connexion** — c'est normal, tout est embarqué.
   Un problème de leçon n'est jamais un problème de réseau.

Puis : comment écrire utilement (appareil, niveau, écran, résultat attendu), le
délai de réponse, le lien vers la politique de confidentialité, et l'éditeur.

## Le délai annoncé est un engagement

La page annonce une réponse **sous 7 jours**, par e-mail, en français. C'est une
promesse publique : la tenir fait partie de l'exploitation de l'app. Pour
l'allonger ou la raccourcir, modifier la ligne signalée par un commentaire HTML
dans `support.html`, puis republier — la page en ligne est celle du dernier
`subtree push`, pas celle de l'arbre de travail.

## Publier

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
curl -sI https://aboky2.github.io/eduForAll/support.html | head -1   # 200
```

Les deux pages partent ensemble : modifier l'une republie l'autre.
