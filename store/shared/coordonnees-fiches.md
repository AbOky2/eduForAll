<!-- Source unique des coordonnées à coller dans les deux consoles.
     Limites de caractères : aucune sur ces champs, sauf indication contraire.
     Une URL doit être une URL : App Store Connect refuse une adresse e-mail
     dans le champ « URL de support ».
     Toute autre valeur dans le dépôt doit correspondre à celles de ce fichier —
     une incohérence entre la fiche, la politique de confidentialité et la page
     de support se voit en revue. -->

# Coordonnées des fiches — chaînes exactes à coller

Un seul fichier porte ces valeurs. Les autres fichiers de `store/` y renvoient
au lieu de les recopier.

## Les chaînes

| Champ | Valeur exacte |
|---|---|
| URL de support | `https://aboky2.github.io/eduForAll/support.html` |
| URL de la politique de confidentialité | `https://aboky2.github.io/eduForAll/` |
| E-mail de support / de contact | `issaokiabderamane@gmail.com` |
| Site web de la fiche (Play, optionnel) | `https://aboky2.github.io/eduForAll/` |
| URL marketing (Apple, optionnel) | *aucune* — laisser vide |
| Téléphone de la fiche (Play, optionnel) | *vide* — voir ci-dessous |
| Téléphone du contact de revue (Apple, obligatoire) | 🔴 À FOURNIR : numéro joignable au format international, p. ex. `+33 6 XX XX XX XX` |
| Nom du contact de revue (Apple) | Prénom `Issa Oki` · Nom `ABDRAMANE` |
| Éditeur (identité légale) | `Issa Oki ABDRAMANE` |
| Adresse postale de l'éditeur | `25 rue Édouard Vaillant, appartement 317, 37000 Tours, France` |

## Où chacune se saisit

| Champ | Console et emplacement | Obligatoire |
|---|---|---|
| URL de support | App Store Connect → *Informations de la version → URL de support* | oui |
| URL marketing | App Store Connect → *Informations de la version → URL marketing* | non |
| Politique de confidentialité | App Store Connect → *Informations sur l'app* · Play Console → *Contenu de l'application → Politique de confidentialité* | oui (les deux) |
| E-mail de contact | Play Console → *Fiche Play Store → Paramètres de la fiche → Coordonnées* | oui |
| Site web, téléphone | même écran que l'e-mail | non |
| Nom, téléphone, e-mail du contact de revue | App Store Connect → *App Review Information* | oui |

## Le téléphone, et pourquoi il reste vide côté Play

Play **publie** les coordonnées saisies dans la fiche. Le téléphone y étant
optionnel, il reste vide : un numéro personnel affiché publiquement n'apporte
rien à une app sans service après-vente, et le support se fait par e-mail
(`store/shared/contact-support.md`).

Apple, à l'inverse, exige un téléphone dans *App Review Information* — mais il
n'est **pas publié** : il sert à joindre l'éditeur pendant la revue. C'est le
seul endroit où un numéro est nécessaire, et c'est la raison du 🔴 ci-dessus.

Si le statut de professionnel au titre du DSA est déclaré, le téléphone et
l'adresse postale deviennent publics sur les deux fiches : la décision et ses
conséquences sont dans `store/shared/dsa-trader.md`.

## Pourquoi la même adresse e-mail partout

`issaokiabderamane@gmail.com` est déjà l'adresse publiée dans la politique de
confidentialité (§10) et sur la page de support. Une adresse différente dans la
fiche donnerait deux interlocuteurs pour une app éditée par une seule personne,
et c'est le genre d'écart qu'une revue relève.
