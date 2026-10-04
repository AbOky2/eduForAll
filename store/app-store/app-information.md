<!-- Champs saisis UNE FOIS à la création de la fiche App Store Connect, puis
     rarement revus. Limites de caractères indiquées champ par champ :
     Nom 30, Sous-titre 30, Mots-clés 100, Texte promotionnel 170,
     Description 4 000, Notes pour la revue 4 000, SKU 100.
     Les coordonnées viennent de store/shared/coordonnees-fiches.md. -->

# Informations sur l'app (App Store Connect)

Tout ce que la console demande une fois, dans l'ordre où elle le demande.
Les champs rédigés (description, sous-titre, mots-clés, notes de revue) ont
chacun leur fichier ; ce document ne les recopie pas, il les situe.

## Création de l'app

| Champ | Valeur à saisir |
|---|---|
| Nom (30 car. max) | `ECOLNA : lire, écrire, compter` — **30 caractères sur 30**, espace insécable devant les deux-points |
| Langue principale | Français (France) — `fr-FR`, cohérent avec `eas.json` → `submit.production.ios.language` |
| Bundle ID | `td.ecolna.app` |
| SKU (100 car. max, interne, jamais affiché) | `ECOLNA-1000` |
| Accès utilisateur | Accès complet (compte à un seul détenteur) |

### Pourquoi ce nom, et pas « ECOLNA » seul

Le champ Nom est celui que la recherche App Store pondère le plus. « ECOLNA »
seul occupe 6 caractères sur 30 pour une marque que personne ne connaît
encore : les 24 autres sont perdus. La chaîne retenue ajoute trois verbes que
les parents tapent réellement, sans rien promettre de plus que ce que l'app
fait.

Elle est complémentaire du sous-titre, `Le CP tchadien, sans internet`
(29 caractères, `description-fr.md`), et des mots-clés (`keywords-fr.md`) :
aucun mot n'est indexé deux fois.
Interdits dans ce champ comme dans l'icône : « Gratuit », « N° 1 »,
« meilleur » — toute mention de prix ou de classement.

Repli si le propriétaire préfère la marque nue : `ECOLNA` (6 caractères). La
décision n'engage rien d'autre : le nom affiché **sur l'appareil** reste
« ECOLNA » dans les deux cas, il vient de `app.config.ts` et du
`CFBundleDisplayName` de la locale française — ne pas toucher à ces deux-là
pour suivre le nom de la fiche.

## Informations générales

| Champ | Valeur |
|---|---|
| Copyright | `2026 Issa Oki ABDRAMANE` — 23 caractères |
| Catégorie principale | **Enfants**, tranche **6–8 ans** |
| Catégorie secondaire | **Éducation** |
| Droits sur le contenu | **Oui**, contenu de tiers sous licence → `content-rights.md` |
| Classification par âge | **4+** → `age-rating.md` (questionnaire complet) |
| Politique de confidentialité | `https://aboky2.github.io/eduForAll/` |

Le format du champ Copyright est celui demandé par Apple — l'année suivie du
titulaire des droits, sans le symbole. La forme lisible
« © 2026 Issa Oki ABDRAMANE » (25 caractères) sert partout ailleurs : écran
« À propos », page de support, bannière. Selon les versions de la console, le
champ se trouve sur la page *Informations sur l'app* ou sur celle de la
version — c'est le même champ, saisi une fois.

Le choix « Enfants en principale, Éducation en secondaire » n'est pas un
arbitrage de visibilité : la tranche d'âge Enfants n'apparaît dans la console
que si « Enfants » est la catégorie principale, et c'est elle qui donne un sens
à tout ce qui a été construit pour ce public. La décision, son coût et son
prérequis sont dans `age-rating.md` §1. Le portail parental exigé par la
catégorie Enfants est durci : le résultat d'une multiplication se saisit au
clavier, sans réponse proposée (`review-notes-fr.md`).

## Informations de la version 1.0.0

| Champ | Fichier | Limite |
|---|---|---|
| Texte promotionnel | `promotional-text-fr.md` | 170 car. |
| Description | `description-fr.md` | 4 000 car. |
| Mots-clés | `keywords-fr.md` | 100 car. |
| Sous-titre | `description-fr.md` (en tête) | 30 car. |
| Nouveautés de cette version | `../shared/release-notes-1.0.0-fr.md` | 4 000 car. |
| URL de support | `support-url.md` | — |
| URL marketing | *vide* → `../shared/coordonnees-fiches.md` | — |
| Captures d'écran | `screenshots/README.md` | iPhone 6,9" et iPad 13" |
| Version | `1.0.0` (alignée sur `app.config.ts`) | — |

## App Review Information

Les quatre valeurs que la console exige en même temps que les notes :

| Champ | Valeur |
|---|---|
| Prénom | `Issa Oki` |
| Nom | `ABDRAMANE` |
| Téléphone | 🔴 À FOURNIR — format international, p. ex. `+33 6 XX XX XX XX`. **Non publié** : il ne sert qu'à joindre l'éditeur pendant l'examen |
| E-mail | `issaokiabderamane@gmail.com` |
| Connexion requise | **Non** — aucun compte, aucun identifiant de test à fournir |
| Notes | le bloc de `review-notes-fr.md` (3 447 car. sur 4 000) |

« Connexion requise : non » est le point à ne pas oublier : sans lui, un
examinateur cherche un compte de démonstration qui n'existe pas, et la fiche
revient en *Waiting for Review* pour rien.

## Prix et disponibilité

Gratuit, sans achat intégré. Territoires retenus et déclaration de statut de
professionnel : `../shared/distribution.md` et `../shared/dsa-trader.md`.

## Ce qui reste bloquant côté Apple

- 🔴 Téléphone du contact de revue (ci-dessus).
- 🔴 Captures iPhone 6,9" **et** iPad 13" à téléverser : les brutes sont
  rendues depuis le vrai code (`../screenshots/plan.json`, `screenshot-plan.md`),
  à comparer à un build installé avant l'envoi — l'iPad est obligatoire puisque
  `app.config.ts` déclare `supportsTablet`.
- 🔴 Publication de la page de support sur `gh-pages` (`support-url.md`).
