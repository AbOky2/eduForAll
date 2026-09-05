# Héberger la politique de confidentialité

Les deux stores exigent une **URL publique** avant toute soumission. Le
fichier `index.html` de ce dossier est autonome : aucune dépendance, aucun
build.

## État

La page est complète : éditeur, adresse, contact, RGPD. Elle est publiée sur
`https://aboky2.github.io/eduForAll/`.

Toute modification de `index.html` doit être repoussée sur `gh-pages` :

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
```

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
