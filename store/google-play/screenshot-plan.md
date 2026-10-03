# Plan de captures Google Play

Les plans, leur ordre et leurs légendes vivent dans
`store/screenshots/plan.json` : **9 plans**, mis en scène sur le profil fictif
« Amina », CP1, une douzaine de leçons terminées. Aucune donnée réelle, aucun
écran de développement.

Ce fichier ne recopie pas la liste. `plan.json` en est la seule source, et
c'est lui que lit `npm run store:screenshots`. Les mêmes plans servent à
l'App Store, dans le même ordre ; seuls les formats changent
(`store/app-store/screenshot-plan.md`).

## Fabrication

Les pixels de l'application viennent d'un appareil, le cadre et la légende du
script :

```bash
# captures brutes attendues dans store/screenshots/raw/
#   <id>.png            → téléphone      (ex. 01-accueil.png)
#   <id>@tablette.png   → tablette
npm run store:screenshots -- --format play-telephone
npm run store:screenshots -- --format play-tablette
```

Les identifiants attendus sont ceux de `plan.json` ; le script liste les
fichiers manquants. Dessiner, simuler ou retoucher une capture est un motif de
rejet déclaré chez Google comme chez Apple (App Review 2.3.3).

🔴 À FOURNIR : les captures brutes des 9 plans, prises depuis un build
installé, sur une vraie tablette Android **et** sur un vrai téléphone Android.

## Formats exigés

| Cible | Dimensions | Nombre |
|---|---|---|
| Téléphone | 16:9 ou 9:16, côté 320–3840 px — produites en 1080 × 1920 | 2 min, 8 max |
| Tablette 7" | idem — produites en 1920 × 1200, paysage | 8 max — nécessaire pour la fiche tablette |
| Tablette 10" | idem — même rendu que la tablette 7" | 8 max — nécessaire pour la fiche tablette |
| Image de mise en avant | **1024 × 500**, sans transparence | 1, obligatoire |
| Icône | 512 × 512 PNG | 1 |

ECOLNA vise la tablette : renseigner les deux formats tablette, sinon la
fiche s'affiche en « application téléphone » sur les tablettes. Les captures
tablette se prennent en paysage, puisque c'est ainsi que l'enfant tient
l'appareil et que les mises en page passent en deux volets.

## Image de mise en avant

Livrée : `graphics/feature-graphic-1024x500.png`, rendue depuis
`graphics/feature-graphic-src.svg` par `npm run brand:assets`. Fond bleu
pétrole **#1f5473**, le livre ouvert aux deux pages jointes, le mot-symbole
ECOLNA en sable (#fbf3e4) et deux lignes en #e0b184 :

```text
Le programme officiel du CP.
Entièrement hors connexion.
```

Tout le contenu tient dans les 80 % centraux : Google rogne les bords et
superpose un bouton de lecture au centre. La police Quicksand est injectée au
rendu, pas embarquée dans le SVG.

### Le bleu de la marque est #1f5473

Tranché : **#1f5473**. C'est la valeur de l'icône
(`assets/icons/ecolna-logo-source.svg`), de l'écran de lancement, de l'icône
adaptative Android, de cette bannière et de la page de confidentialité.

Le jeton `secondary` de `src/design-system/tokens/colors.ts` vaut encore
#2b6485 et reste le bleu de l'interface : 23 fichiers s'appuient sur lui, le
changer déplacerait la palette de toute l'app et sort du périmètre de la
v1.0.0. Les assets de store, eux, n'utilisent que #1f5473 — ne plus décrire
#2b6485 comme « la couleur de l'icône », ce n'est plus vrai.
