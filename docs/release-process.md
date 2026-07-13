# Processus de release

## Gates automatisées

```bash
npm run validate:release
```

Exécute : tsc, ESLint (0 warning), Jest, validation contenu/assets/audio,
expo-doctor, **gate voix placeholder** (bloquante), gate anti-SDK
publicitaire/analytics.

## Gates manuelles (checklist par release)

- [ ] Premier lancement **en mode avion** sur un appareil physique Android bas de gamme (3 Go RAM) : onboarding → profil → leçon complète → fermeture → reprise → parent
- [ ] Audio réactif (< 300 ms perçu) et remplacé proprement en cas d'appuis répétés
- [ ] TalkBack + VoiceOver sur : accueil, un exercice de chaque famille, résultat
- [ ] Texte agrandi (1,4×) : aucun texte tronqué, aucun bouton hors écran
- [ ] Réduction des animations : aucune pulsation/entrée animée
- [ ] Comparaison visuelle avec `design/stitch/*.png` (docs/visual-qa.md)
- [ ] `eas build --profile preview --platform android` installe et démarre
- [ ] Captures stores régénérées si l'UI a changé (store/*/screenshot-plan.md)

## Builds

```bash
npm run build:preview      # APK interne + iOS interne
npm run build:production   # AAB + IPA (autoIncrement)
```

Identifiants par profil dans `eas.json` (`td.alifa.app[.dev|.preview]`) —
placeholders : le propriétaire fournit les identifiants légaux définitifs
avant soumission (docs/store-readiness.md). Credentials gérés par EAS,
**jamais commités**.

## Soumission

`eas submit -p android --latest` / `eas submit -p ios --latest` — uniquement
quand toutes les gates (automatisées **et** manuelles) sont vertes et que
`assets/audio/manifest.json` ne contient plus aucun placeholder.
