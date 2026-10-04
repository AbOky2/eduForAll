<!-- Champ « URL de support » d'App Store Connect — obligatoire, sans lequel la
     soumission est refusée. Le champ n'accepte qu'une URL : une adresse e-mail
     seule est rejetée. Aucune limite de caractères, mais l'URL doit répondre
     en 200 au moment de l'examen. -->

# URL de support (App Store Connect)

## La valeur

```
https://aboky2.github.io/eduForAll/support.html
```

À saisir dans App Store Connect → *la version → Informations de la version →
URL de support*. La même adresse sert de page de support côté Play, dont le
champ obligatoire est en revanche un **e-mail**
(`store/google-play/contact-details.md`).

## Ce qu'il y a derrière

La page est `store/shared/privacy-policy/support.html` : un fichier autonome,
publié sur la même branche `gh-pages` que la politique de confidentialité, par
le même `git subtree push`. Elle répond aux questions prévisibles sur une app
sans compte ni réseau — réinitialiser la progression, ouvrir l'espace parent
(la multiplication tirée au hasard), passer du CP1 au CP2, l'absence de
connexion —, donne l'adresse e-mail de l'éditeur, le délai de réponse annoncé
et le lien vers la politique de confidentialité. Sa section « Licences »
(`#licences`) porte les attributions des polices, des pictogrammes et des
voix ; la carte « À propos » de l'app y renvoie. Détail et raisons dans
`store/shared/contact-support.md`.

## À faire avant de soumettre

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
curl -sI https://aboky2.github.io/eduForAll/support.html | head -1   # HTTP/2 200
```

Une URL de support qui renvoie 404 est un refus immédiat : c'est l'un des
premiers liens qu'un examinateur ouvre. Et `gh-pages` ne se met pas à jour
toute seule — la page en ligne est celle du dernier `subtree push`.
