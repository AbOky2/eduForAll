<!-- Où sont les captures Play, et pourquoi ce dossier ne les contient pas.
     Aucune limite de caractères ; les contraintes sont des DIMENSIONS et des
     NOMBRES minimaux, tous deux bloquants pour enregistrer la fiche. -->

# Captures Play — où elles vivent

Ce dossier **ne contient pas** d'images : la chaîne de composition est commune
aux deux stores et écrit ailleurs. Dupliquer les fichiers ici garantirait deux
versions différentes de la même capture.

| Étape | Emplacement |
|---|---|
| Captures brutes, prises sur un appareil réel | `../../screenshots/raw/` |
| Plans, ordre et légendes (source unique) | `../../screenshots/plan.json` |
| Fichiers prêts à téléverser — téléphone | `../../screenshots/out/play-telephone/` |
| Fichiers prêts à téléverser — tablette 7" et 10" | `../../screenshots/out/play-tablette/` |
| Mode d'emploi complet | `../../screenshots/README.md` |

```bash
npm run store:screenshots -- --format play-telephone
npm run store:screenshots -- --format play-tablette
```

## Formats exigés par Play Console

| Emplacement de la fiche | Dimensions produites | Nombre |
|---|---|---|
| Téléphone | **1080 × 1920** | **2 minimum**, 8 maximum |
| Tablette 7" | **1920 × 1200** (paysage) | 8 maximum |
| Tablette 10" | même rendu que la 7" | 8 maximum |
| Image de mise en avant | 1024 × 500, sans transparence | livrée : `../graphics/feature-graphic-1024x500.png` |
| Icône de la fiche | 512 × 512 | livrée : `../graphics/icon-512.png` |

Les deux images de marque sont déjà produites depuis leurs sources vectorielles
par `npm run brand:assets` : elles ne dépendent d'aucun appareil. Les captures,
elles, en dépendent entièrement.

Sans les deux jeux tablette, Play présente ECOLNA comme une « application
téléphone » sur les tablettes — l'inverse exact du positionnement, alors que
l'app est pensée tablette d'abord.

## Ce qui manque

🔴 À FOURNIR, appareil en main — tâche du propriétaire. Il n'existe pas
d'équivalent Android du script de capture sur simulateur iOS
(`scripts/tools/capture-ios-screenshots.mjs`) : côté Play, les captures se
prennent sur un vrai appareil, ce qui est de toute façon le bon test pour une
app pensée pour des tablettes modestes.

1. installer le build `preview` sur une tablette Android **et** sur un
   téléphone Android ;
2. mettre l'app dans l'état décrit par `../../screenshots/README.md` : profil
   fictif « Amina », CP1, une douzaine de leçons terminées, aucune donnée
   réelle, aucun écran de développement ;
3. prendre les 9 plans de `plan.json`, les captures tablette **en paysage** ;
4. déposer les fichiers dans `../../screenshots/raw/`
   (`01-accueil.png` pour le téléphone, `01-accueil@tablette.png` pour la
   tablette) ;
5. lancer les deux commandes ci-dessus.

**Ne pas dessiner, simuler ou retoucher une capture** : métadonnée trompeuse
chez Google, motif de rejet 2.3.3 chez Apple. Deux captures téléphone sont le
minimum pour simplement **enregistrer** la fiche.
