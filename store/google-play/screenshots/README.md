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

**Produites :** huit captures téléphone (1080 × 1920) et huit captures
tablette (1920 × 1200, paysage). Le même jeu tablette va dans les **deux**
emplacements de la console, 7" et 10". Play en accepte huit au plus par type
d'appareil : `08-matieres` et `09-badges` sont écartés (`"play": false` dans
`plan.json`). Téléverser dans l'ordre des noms.

**Ce qu'elles sont :** le rendu du vrai code de l'app par le banc web
(react-native-web). Le jeu téléphone vient de la capture iPhone 6,9", le jeu
tablette de la capture iPad 13" paysage, et chacun est mis à l'échelle dans un
cadre générique sans marque, puisque Google refuse les cadres d'appareils
reconnaissables. Rien n'est dessiné ni retouché, mais ce ne sont **pas** des
captures d'un appareil Android.

🔴 **Reste à faire, et c'est bloquant pour la promotion en production :**
installer le build par le **test interne Play** sur une tablette et un
téléphone Android (jamais par APK, voir `docs/deploiement-v1.md` § 5).
Afficher les huit écrans dans le même état, puis comparer. Si un écran Android
diffère visiblement, le signaler avant de soumettre : la chaîne ne connaît pas
encore de capture brute propre à Android, puisque les fiches Play réutilisent
les fichiers de l'iPhone et de l'iPad. Règle complète :
`../../screenshots/README.md`, « La règle d'abord ».

À vérifier au téléversement : 1920 × 1200 est un format **16:10**. Il respecte
la règle générale de Play (côtés de 320 à 3 840 px, le grand au plus double du
petit), mais des guides tiers indiquent que la **mise en avant** sur grands
écrans demande au moins quatre captures en 16:9. Si la console le signale, il
faut un rendu tablette en 1920 × 1080 (tâche du compositeur, pas des captures
brutes).

## Formats exigés par Play Console

| Emplacement de la fiche | Dimensions produites | Nombre |
|---|---|---|
| Téléphone | **1080 × 1920** | **2 minimum**, 8 maximum (8 fournies) |
| Tablette 7" | **1920 × 1200** (paysage) | 8 maximum (8 fournies) |
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
# ou seulement les formats Play :
npm run store:screenshots -- --format play-telephone
npm run store:screenshots -- --format play-tablette
```

Les deux images de marque sont produites à part, depuis leurs sources
vectorielles, par `npm run brand:assets` : elles ne dépendent d'aucun écran.

**Ne pas dessiner, simuler ni retoucher une capture** : c'est une métadonnée
trompeuse chez Google, et un motif de rejet (règle 2.3.3) chez Apple. Deux
captures téléphone sont le minimum pour simplement **enregistrer** la fiche.
