<!-- Où sont les captures Play, ce qu'elles sont, et ce qu'il reste à vérifier
     avant de les soumettre. Aucune limite de caractères ; les contraintes sont
     des DIMENSIONS et des NOMBRES minimaux, tous deux bloquants pour
     enregistrer la fiche. -->

# Captures Play : où elles vivent

Ce dossier **ne contient pas** d'images : la chaîne de composition est commune
aux deux stores et écrit ailleurs. Dupliquer les fichiers ici garantirait deux
versions différentes de la même capture.

| Étape | Emplacement |
|---|---|
| Captures brutes (rendu du vrai code, voir plus bas) | `../../screenshots/raw/` |
| Plans, ordre et légendes (source unique) | `../../screenshots/plan.json` |
| **À téléverser : téléphone** | `../../screenshots/out/play-telephone/` |
| **À téléverser : tablette 7" ET tablette 10"** | `../../screenshots/out/play-tablette/` |
| Règle, formats, mode d'emploi complet | `../../screenshots/README.md` |

## État au 4 octobre 2026

**Produites :** huit captures téléphone (1080 × 1920, 9:16) et huit captures
tablette (**1920 × 1080, 16:9**, paysage). Le même jeu tablette va dans les
**deux** emplacements de la console, 7" et 10". Play en accepte huit au plus
par type d'appareil : `08-matieres` et `09-badges` sont écartés (`"play": false`
dans `plan.json`). Téléverser dans l'ordre des noms.

**Ce qu'elles sont :** le rendu du vrai code de l'app par le banc web
(react-native-web), avec le profil fictif « Amina », dont les badges sont
calculés par les règles de l'app et non choisis à la main. Le jeu téléphone
vient de la capture iPhone 6,9" ; le jeu tablette a **sa propre capture**, une
tablette Android 10" en paysage (1280 × 800 points ×2 = 2560 × 1600, 16:10),
encadrée à 75 % au moins de la largeur, et non plus la capture de l'iPad (4:3).
Chaque image est mise à l'échelle dans un cadre générique sans marque, puisque
Google refuse les cadres d'appareils reconnaissables. Rien n'est dessiné ni
retouché, mais ce ne sont **pas** des captures d'un appareil Android.

Le 16:9 est le format qu'annonce la Play Console pour les tablettes, et celui
qu'il faut pour la mise en avant sur grand écran (au moins quatre captures
paysage) : le compositeur le vérifie (`"contraintes"` de `plan.json`).

🔴 **Reste à faire, et c'est bloquant pour la promotion en production :**
installer le build par le **test interne Play** sur une tablette et un
téléphone Android (jamais par APK, voir `docs/deploiement-v1.md` § 5).
Afficher les huit écrans dans le même état, puis comparer. Tout écran qui
diffère visiblement est remplacé par la capture de l'appareil, déposée sous le
même nom dans `raw/` (`<id>@tablette-android.png` pour la tablette), puis la
série est recomposée. Règle complète : `../../screenshots/README.md`, « La
règle d'abord ».

## Formats exigés par Play Console

| Emplacement de la fiche | Dimensions produites | Nombre |
|---|---|---|
| Téléphone | **1080 × 1920** | **2 minimum**, 8 maximum (8 fournies) |
| Tablette 7" | **1920 × 1080** (paysage, 16:9) | 8 maximum (8 fournies) |
| Tablette 10" | le même jeu que la 7" | 8 maximum (8 fournies) |
| Image de mise en avant | 1024 × 500, sans transparence | livrée : `../graphics/feature-graphic-1024x500.png` |
| Icône de la fiche | 512 × 512 | livrée : `../graphics/icon-512.png` |

Fichiers : PNG RVB 8 bits sans transparence, comme Play l'exige.

Sans les deux jeux tablette, Play présente ECOLNA comme une « application
téléphone » sur les tablettes, l'inverse exact du positionnement d'une app
pensée pour la tablette.

## Refaire les captures

Après toute modification d'interface :

```bash
# 1. le banc web, dans un premier terminal (docs/visual-qa.md)
ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081
# 2. les captures brutes, puis la composition des quatre formats
scripts/tools/capture-store-screenshots.sh --composer
# la seule capture brute de la tablette Android, puis les formats Play :
scripts/tools/capture-store-screenshots.sh --appareil android
npm run store:screenshots -- --format play-telephone
npm run store:screenshots -- --format play-tablette
```

Les deux images de marque sont produites à part, depuis leurs sources
vectorielles, par `npm run brand:assets` : elles ne dépendent d'aucun écran.

**Ne pas dessiner, simuler ni retoucher une capture** : c'est une métadonnée
trompeuse chez Google, et un motif de rejet (règle 2.3.3) chez Apple. Deux
captures téléphone sont le minimum pour simplement **enregistrer** la fiche.
