# Héberger la politique de confidentialité

Les deux stores exigent une **URL publique** avant toute soumission. Le
fichier `index.html` de ce dossier est autonome : aucune dépendance, aucun
build.

## État

Le texte est complet : éditeur, adresse, contact, RGPD. L'URL publique
renseignée dans les deux consoles est `https://aboky2.github.io/eduForAll/`.

`gh-pages` ne se met pas à jour tout seul : la page en ligne est celle du
dernier `subtree push`, pas celle de l'arbre de travail. Toute modification de
`index.html` doit donc être commitée, repoussée, puis vérifiée — la date
affichée en bas de la page en ligne est le témoin le plus simple :

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
git fetch origin gh-pages
# doit ne rien afficher :
git diff origin/gh-pages:index.html store/shared/privacy-policy/index.html
curl -s https://aboky2.github.io/eduForAll/ | grep 'Dernière mise à jour'
```

GitHub Pages met jusqu'à une minute à servir la nouvelle version.

## Publier avec GitHub Pages (gratuit)

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
```

Puis, dans le dépôt : *Settings → Pages → Source : branche `gh-pages`*.

Le dépôt `AbOky2/eduForAll` étant public, l'URL sera :
`https://aboky2.github.io/eduForAll/`

GitHub Pages exige un dépôt public sur un compte gratuit. Rendre le dépôt
privé casserait l'URL, et donc les deux fiches store.

## Où renseigner l'URL ensuite

| Plateforme | Emplacement |
|---|---|
| Google Play | Play Console → *Contenu de l'application → Politique de confidentialité* |
| App Store | App Store Connect → *Informations sur l'app → URL de politique de confidentialité* |

La même URL sert aux deux.
