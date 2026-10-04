<!-- Où sont les captures App Store, ce qu'elles sont, et ce qu'il reste à
     vérifier avant de les soumettre. Aucune limite de caractères ; des limites
     de DIMENSIONS, elles, sont impératives : App Store Connect refuse un pixel
     d'écart. -->

# Captures App Store : où elles vivent

Ce dossier **ne contient pas** d'images, et n'en contiendra pas : une seule
chaîne produit les captures des deux stores, et une deuxième copie des mêmes
fichiers divergerait au premier recadrage.

| Étape | Emplacement |
|---|---|
| Captures brutes (rendu du vrai code, voir plus bas) | `../../screenshots/raw/` |
| Plans, ordre et légendes (source unique) | `../../screenshots/plan.json` |
| **À téléverser : iPhone 6,9"** | `../../screenshots/out/app-store-iphone/` |
| **À téléverser : iPad 13"** | `../../screenshots/out/app-store-ipad/` |
| Règle, formats, mode d'emploi complet | `../../screenshots/README.md` |

## État au 4 octobre 2026

**Produites :** dix captures iPhone 6,9" (1320 × 2868, portrait) et dix
captures iPad 13" (2752 × 2064, paysage), de `01-accueil` à `10-parent`. Les
téléverser **dans l'ordre des noms** : Apple montre les premières dans les
résultats de recherche, et la série a été ordonnée pour cela (accueil, puis
une activité par matière).

**Ce qu'elles sont :** le rendu du vrai code de l'app par le banc web
(react-native-web), aux résolutions exactes de ces deux appareils, avec le
profil fictif « Amina ». Rien n'est dessiné ni retouché. Ce ne sont pas pour
autant des captures d'appareil.

🔴 **Reste à faire, et c'est bloquant pour la soumission en revue :** installer
le build par TestFlight sur un iPhone et un iPad, afficher les dix écrans dans
le même état, et comparer. Tout écran qui diffère est remplacé par la capture
de l'appareil. Un iPhone 6,9" (16 Pro Max, 17 Pro Max) capture en
1320 × 2868 et un iPad Pro 13" (M4 ou plus récent) en 2752 × 2064 : les
dimensions exactes de `raw/`. Il suffit de déposer le fichier sous le même nom,
puis de recomposer. Attention : un iPad Air 13" capture en 2732 × 2048, et la
composition exige des dimensions identiques pour toute la série tablette.
Règle complète : `../../screenshots/README.md`, « La règle d'abord ».

## Formats exigés par App Store Connect

| Cible | Dimensions produites | Nombre |
|---|---|---|
| iPhone 6,9" | **1320 × 2868** (portrait) | 1 minimum, 10 maximum (10 fournies) |
| iPad 13" | **2752 × 2064** (paysage) | 1 minimum, **obligatoire** (10 fournies) |

L'iPad n'est pas optionnel : `app.config.ts` déclare `supportsTablet: true`,
et Apple exige alors le jeu iPad. Apple accepte l'iPad 13" en portrait
(2064 × 2752) comme en paysage. **Le paysage est retenu**, parce que c'est
ainsi que l'enfant tient la tablette et que les écrans y passent en deux
volets.

Fichiers : PNG RVB 8 bits sans transparence, ce qu'App Store Connect accepte.

## Refaire les captures

Après toute modification d'interface :

```bash
# 1. le banc web, dans un premier terminal (docs/visual-qa.md)
ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081
# 2. les captures brutes (iPhone, iPad, tablette Android), puis la composition
scripts/tools/capture-store-screenshots.sh --composer
# ou un seul format :
npm run store:screenshots -- --format app-store-iphone
npm run store:screenshots -- --format app-store-ipad
```

Pour une capture native sans appareil, il existe un chemin par simulateur iOS
(macOS et Xcode requis) : `scripts/tools/seed-demo-profile.mjs` (il affiche
les badges que chaque leçon a débloqués), puis
`scripts/tools/capture-ios-screenshots.mjs [--suffixe @tablette]`. Ce second
script suit les dix plans de `plan.json` et refuse de tourner si un plan lui
est inconnu ; la porte parentale (`10-parent`) et les défilements iPhone se
font à la main, le script attend Entrée.

**Ne pas dessiner, simuler ni retoucher une capture** : c'est un motif de
rejet déclaré (règle 2.3.3 d'App Review). Le banc web et le simulateur
exécutent le code de l'app : leurs images ne sont pas fabriquées. Une image
composée ou retouchée à la main le serait, et la chaîne refuse d'en produire :
elle encadre des pixels venus de l'app, elle n'en invente aucun.
