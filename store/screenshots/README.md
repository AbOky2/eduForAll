# Captures d'écran des stores

## La règle d'abord

**Les captures doivent montrer l'app réelle, prise sur un vrai appareil.**
Les fabriquer — les dessiner, les simuler, les retoucher — est un motif de
rejet déclaré : App Review 2.3.3 chez Apple, et les règles de métadonnées
trompeuses chez Google.

Ce dossier ne contient donc aucune capture d'application. Il contient de quoi
les **encadrer** une fois qu'elles existent : le plan des plans à prendre, les
légendes, et un outil qui compose aux dimensions exactes des deux consoles.

## Comment faire

1. Installer un build sur un vrai appareil (`eas build --profile preview`).
2. Préparer l'état de l'app : profil « Amina », CP1, une douzaine de leçons
   terminées, quelques badges gagnés. Aucune donnée réelle d'enfant, aucun
   écran de développement.
3. Prendre les 9 captures de `plan.json`, **sur téléphone et sur tablette**.
   Les captures tablette se prennent **en paysage** : c'est ainsi que les
   enfants tiennent l'appareil, et les mises en page y passent en deux volets.
4. Déposer les fichiers bruts dans `raw/` :
   - `01-accueil.png` … `09-parent.png` pour le téléphone
   - `01-accueil@tablette.png` … pour la tablette
5. Composer :

```bash
node scripts/tools/compose-store-screenshots.mjs
```

Les images prêtes à téléverser apparaissent dans `out/<format>/`.

## Formats produits

| dossier | dimensions | console |
| --- | --- | --- |
| `app-store-iphone` | 1320 × 2868 | App Store, iPhone 6,9" — 1 minimum, 10 max |
| `app-store-ipad` | 2752 × 2064 | App Store, iPad 13" paysage — **obligatoire**, l'app déclare `supportsTablet` |
| `play-telephone` | 1080 × 1920 | Play, téléphone — 2 minimum, 8 max |
| `play-tablette` | 1920 × 1200 | Play, tablette 7" et 10" paysage |

Sans captures tablette, Play présente la fiche comme une « application
téléphone » sur les tablettes — exactement le contraire du message.

## Les autres images de fiche

Déjà produites, depuis leurs sources vectorielles, par
`node scripts/tools/render-brand-assets.mjs` :

- `../google-play/graphics/icon-512.png` — icône Play, 512 × 512
- `../google-play/graphics/feature-graphic-1024x500.png` — bannière Play
- `../../assets/icons/app-icon.png` — icône App Store, 1024 × 1024, opaque

## Changer une légende

Les légendes vivent dans `plan.json`, pas dans l'outil. Les modifier et
relancer la composition suffit.
