<!-- Où sont les captures App Store, et pourquoi ce dossier ne les contient
     pas. Aucune limite de caractères ; des limites de DIMENSIONS, elles,
     sont impératives : App Store Connect refuse un pixel d'écart. -->

# Captures App Store — où elles vivent

Ce dossier **ne contient pas** d'images, et n'en contiendra pas : une seule
chaîne produit les captures des deux stores, et une deuxième copie des mêmes
fichiers divergerait au premier recadrage.

| Étape | Emplacement |
|---|---|
| Captures brutes, prises sur un appareil réel | `../../screenshots/raw/` |
| Plans, ordre et légendes (source unique) | `../../screenshots/plan.json` |
| Fichiers prêts à téléverser — iPhone 6,9" | `../../screenshots/out/app-store-iphone/` |
| Fichiers prêts à téléverser — iPad 13" | `../../screenshots/out/app-store-ipad/` |
| Mode d'emploi complet | `../../screenshots/README.md` |

```bash
npm run store:screenshots -- --format app-store-iphone
npm run store:screenshots -- --format app-store-ipad
```

## Formats exigés par App Store Connect

| Cible | Dimensions produites | Nombre |
|---|---|---|
| iPhone 6,9" | **1320 × 2868** (portrait) | 1 minimum, 10 maximum |
| iPad 13" | **2752 × 2064** (paysage) | 1 minimum — **obligatoire** |

L'iPad n'est pas optionnel : `app.config.ts` déclare `supportsTablet: true`,
et Apple exige alors le jeu iPad. Apple accepte l'iPad 13" en portrait
(2064 × 2752) comme en paysage ; **le paysage est retenu**, parce que c'est
ainsi que l'enfant tient la tablette et que les mises en page passent en deux
volets. Les captures tablette se prennent donc d'abord.

## Ce qui manque

🔴 À FOURNIR : les 9 captures brutes, en portrait iPhone **et** en paysage iPad.
Deux chemins, le même résultat.

**Chemin automatisé, sur simulateur iOS** — l'app tourne vraiment, affiche ses
propres données, et `xcrun simctl io booted screenshot` enregistre ce que
l'écran montre :

```bash
node scripts/tools/seed-demo-profile.mjs        # profil « Amina », CP1, leçons terminées
node scripts/tools/capture-ios-screenshots.mjs  # iPhone amorcé
node scripts/tools/capture-ios-screenshots.mjs --suffixe @tablette   # iPad amorcé
```

**Chemin appareil en main** — un iPhone et un iPad réels, un build
`eas build --profile preview` installé, l'app mise dans l'état décrit par
`../../screenshots/README.md` (profil fictif « Amina », CP1, une douzaine de
leçons terminées, quelques badges, aucune donnée réelle d'enfant, aucun écran de
développement), puis les 9 plans de `plan.json` déposés dans
`../../screenshots/raw/` aux noms attendus (`01-accueil.png`,
`01-accueil@tablette.png`, …).

Dans les deux cas, finir par les commandes de composition ci-dessus.

**Ne pas dessiner, simuler ni retoucher une capture** : c'est un motif de rejet
déclaré (App Review 2.3.3). Un simulateur qui exécute l'app n'est pas une
capture fabriquée — une image composée à la main en est une, et la chaîne refuse
de la produire : elle encadre des pixels venus de l'app, elle n'en invente
aucun.

Tant que ces fichiers n'existent pas, la soumission est incomplète : une
capture iPhone 6,9" et une capture iPad 13" sont le minimum absolu.
