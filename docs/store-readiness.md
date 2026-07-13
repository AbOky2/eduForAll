# Préparation stores

## Ce qui est prêt (technique)

- Builds production configurés (`eas.json` : AAB Android, iOS, autoIncrement).
- Icônes (app, adaptive foreground/monochrome), splash, orientation portrait,
  UI claire uniquement, français.
- Permissions : **aucune** permission sensible demandée.
- Aucun SDK publicitaire/analytics (gate automatisée).
- Métadonnées rédigées dans `store/` (descriptions, mots-clés, réponses
  privacy, plan de captures, notes de review).
- Politique de confidentialité et CGU **en brouillon** (`store/shared/`) —
  à faire valider juridiquement et à héberger sur une URL publique.

## Ce que le propriétaire doit fournir (non inventable)

| Élément | Où l'utiliser |
|---|---|
| Compte Apple Developer (+ identité légale, D-U-N-S le cas échéant) | App Store Connect |
| Compte Google Play Console (+ frais uniques) | Play Console |
| Identifiants définitifs (`ALIFA_ANDROID_PACKAGE`, `ALIFA_IOS_BUNDLE_ID`) | variables EAS / `eas.json` |
| URL publique de la politique de confidentialité | fiches stores |
| URL/email de support | fiches stores |
| **Voix françaises enregistrées** (156 fichiers, cf. docs/audio-pipeline.md) | gate release |
| Décision programme « Familles » (Play) / catégorie Enfants (Apple) | questionnaires stores |

## Questionnaires (préparés dans store/)

- Apple « App Privacy » : **aucune donnée collectée** (tout est local).
- Play « Data Safety » : aucune collecte, aucun partage, données supprimées
  avec l'app.
- Public cible : 6–8 ans → exigences familles (pas de liens sortants non
  protégés : couvert par le parent gate).
