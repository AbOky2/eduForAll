# Héberger la politique de confidentialité

Les deux stores exigent une **URL publique** avant toute soumission. Le
fichier `index.html` de ce dossier est autonome : aucune dépendance, aucun
build.

## Avant de publier

Compléter la section « Éditeur et contact » dans `index.html` : nom de
l'entité légale, adresse postale, e-mail. Sans cela, la soumission sera
refusée par Google comme par Apple.

## Publier avec GitHub Pages (gratuit)

```bash
# depuis un dépôt GitHub qui contient ce projet
git subtree push --prefix store/shared/privacy-policy origin gh-pages
```

Puis, dans le dépôt : *Settings → Pages → Source : branche `gh-pages`*.

L'URL sera de la forme :
`https://<compte>.github.io/<depot>/`

## Où renseigner l'URL ensuite

| Plateforme | Emplacement |
|---|---|
| Google Play | Play Console → *Contenu de l'application → Politique de confidentialité* |
| App Store | App Store Connect → *Informations sur l'app → URL de politique de confidentialité* |

La même URL sert aux deux.
