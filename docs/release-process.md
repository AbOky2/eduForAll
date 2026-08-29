# Processus de release

## Gates automatisées

```bash
npm run validate:release
```

Exécute : tsc, ESLint (0 warning), Jest, validation contenu/assets/audio,
expo-doctor, gate voix placeholder, gate anti-SDK publicitaire/analytics.

### Exceptions acceptées

Une gate en échec bloque la release **sauf** si elle figure dans
`release-acceptances.json` : une décision datée, signée, avec la version où
elle doit disparaître. Une exception acceptée s'affiche en 🟡 ACCEPTÉ, jamais
en vert, et doit être reprise dans les notes de version.

Le script échoue aussi si une acceptation ne correspond plus à aucun échec
(exception périmée) ou si la version courante a atteint son `clearBy`
(exception échue) — une exception ne peut donc pas pourrir dans le dépôt.

## Gates manuelles (checklist par release)

- [ ] Premier lancement **en mode avion** sur un appareil physique Android bas de gamme (3 Go RAM) : onboarding → profil → leçon complète → fermeture → reprise → parent
- [ ] Audio réactif (< 300 ms perçu) et remplacé proprement en cas d'appuis répétés
- [ ] TalkBack + VoiceOver sur : accueil, un exercice de chaque famille, résultat
- [ ] Texte agrandi (1,4×) : aucun texte tronqué, aucun bouton hors écran
- [ ] Réduction des animations : aucune pulsation/entrée animée
- [ ] Comparaison visuelle avec `design/stitch/*.png` (docs/visual-qa.md)
- [ ] `eas build --profile preview --platform android` installe et démarre
- [ ] **Tablette** : les deux orientations, en portrait et en paysage, sur les écrans accueil / carte / un exercice de chaque famille / résultat
- [ ] `maestro test maestro/` sur appareil réel, y compris `06-tablet-rotation`
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
quand toutes les gates automatisées passent (exceptions acceptées comprises)
et que les gates manuelles sont cochées.

La marche à suivre complète de la première mise en ligne — comptes, fiches,
captures, pièges — est dans **`docs/deploiement-v1.md`**.

⚠️ Ne pas installer d'APK sur les tablettes des enfants si elles doivent
ensuite recevoir les mises à jour du Play Store : les signatures diffèrent,
la mise à jour est impossible et la progression est perdue. Passer par la
piste de **test interne** de Play (voir `docs/deploiement-v1.md` §3).
