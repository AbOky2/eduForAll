# Processus de release

## Gates automatisées

```bash
npm run validate:release
```

Exécute : tsc, ESLint (0 warning), Jest, validation contenu/assets/audio, sons
réellement embarqués dans le bundle, expo-doctor, gate voix provisoire, gate
anti-SDK publicitaire/analytics.

**expo-doctor a besoin du réseau** : il télécharge le schéma de configuration
depuis `api.expo.dev` et interroge `reactnative.directory`. Sans eux, deux de
ses vérifications échouent (« Host not in allowlist », « unexpected server
response ») et la gate est bloquée, à juste titre : l'acceptation Hermes ne
couvre qu'une vérification en échec (`coversFailingChecks: 1`) et refuse d'en
masquer d'autres. C'est le cas dans le conteneur de développement au
4 octobre 2026 ; depuis une machine qui joint ces deux domaines, seul l'échec
accepté doit rester (`docs/deploiement-v1.md` § 2.5).

### Exceptions acceptées

Une gate en échec bloque la release **sauf** si elle figure dans
`release-acceptances.json` : une décision datée, signée, avec la version où
elle doit disparaître. Une exception acceptée s'affiche en 🟡 ACCEPTÉ, jamais
en vert, et doit être reprise dans les notes de version.

Le script échoue aussi si une acceptation ne correspond plus à aucun échec
(exception périmée), si la version courante a atteint son `clearBy`
(exception échue), ou si la commande signale plus de vérifications en échec
que l'acceptation n'en couvre : une exception ne peut donc ni pourrir dans le
dépôt, ni cacher un problème neuf.

Exception en vigueur : régression mémoire d'Hermes V1 (Expo SDK 56), à lever
en 1.1.0.

## Gates manuelles (checklist par release)

Sur l'app **installée par TestFlight et par le test interne Play**, pas sur un
build de développement :

- [ ] Premier lancement **en mode avion** sur un appareil physique Android bas de gamme (3 Go de RAM) : onboarding → profil → leçon complète → fermeture → reprise → parent
- [ ] Audio réactif (moins de 300 ms perçues) et remplacé proprement en cas d'appuis répétés
- [ ] TalkBack + VoiceOver sur : accueil, un exercice de chaque famille, résultat
- [ ] Texte agrandi (1,4×) : aucun texte tronqué, aucun bouton hors écran
- [ ] Réduction des animations : aucune pulsation ni entrée animée
- [ ] **Tablette** : les deux orientations, en portrait et en paysage, sur les écrans accueil / carte / un exercice de chaque famille / résultat
- [ ] `maestro test maestro/` sur appareil réel, y compris `06-tablet-rotation` (`appId` aligné sur le profil installé)
- [ ] **Porte parentale** : deux ouvertures successives ne posent pas la même multiplication ; une erreur en affiche une autre ; un lien profond `ecolna:///dashboard`, app fermée puis rouverte, mène à la porte et non au tableau de bord
- [ ] **Autorisations Android** du build livré : `bundletool dump manifest --bundle <app>.aab` (ou la page « Autorisations » de la Play Console) ne montre que `VIBRATE`, `MODIFY_AUDIO_SETTINGS` et `td.ecolna.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (de niveau signature, ajoutée par androidx.core, invisible pour l'utilisateur) — ni `INTERNET`, ni `ACCESS_NETWORK_STATE`, ni `AD_ID`, ni `FOREGROUND_SERVICE*` (à bloquer dans `app.config.ts` si elle apparaît : l'app ne joue rien en arrière-plan)
- [ ] Comparaison visuelle avec `design/stitch/*.png` (docs/visual-qa.md)
- [ ] **Captures de store comparées à l'app installée** : chacun des écrans de `store/screenshots/plan.json`, dans le même état ; tout écran qui diffère est remplacé par une capture d'appareil (`store/screenshots/README.md`, « La règle d'abord »)
- [ ] Captures refaites si l’UI a changé depuis le dernier tournage (`scripts/tools/capture-store-screenshots.sh --composer`)

## Builds et envoi en test

```bash
scripts/tools/eas-release.sh --dry-run    # vérifications locales, aucun appel réseau
scripts/tools/eas-release.sh              # build production Android + iOS, puis envoi en test
```

Le script vérifie l'identité de release, l'arbre git, l'absence de secret
suivi, la configuration Expo de release, les profils d'`eas.json`,
`EXPO_TOKEN`, les domaines nécessaires, `eas whoami`, `eas project:info`
(`@okimy/alifa`) et `npm run validate:release`. Puis il construit
(`eas build --platform all --profile production --non-interactive`) et envoie
chaque build **par son identifiant** : Android sur la piste de test interne en
brouillon, iOS vers TestFlight. Options : `--android`, `--ios`, `--no-submit`,
`--submit-only <id>`, `--interactive` (premier passage, création des clés).
Mode d'emploi complet et prérequis des consoles : `docs/deploiement-v1.md` § 2.

**Depuis GitHub, sans poste configuré** : *Actions → Release EAS → Run
workflow* (`.github/workflows/release-eas.yml`), entrées *plateforme*
(android, ios, all) et *soumettre* (oui, non). Déclenchement manuel
uniquement ; il exige le secret de dépôt `EXPO_TOKEN` (jeton d'un utilisateur
robot Expo) et lance le même script, avec les mêmes garde-fous
(`docs/deploiement-v1.md` § 2.4).

Identifiants par profil dans `eas.json` : `td.ecolna.app` en production,
`.preview` et `.dev` pour les autres ; le profil de soumission `production`
porte lui aussi `td.ecolna.app` (`applicationId`, `bundleIdentifier`), et
attend l'`ascAppId` de la fiche App Store Connect. Clés de signature et clés de soumission
gérées par EAS, **jamais commitées** ; `EXPO_TOKEN` vit dans l'environnement,
jamais dans un fichier.

⚠️ Ne pas lancer `eas submit --latest` à la main : il peut prendre un autre
build que celui qu'on vient de vérifier. Le script envoie par identifiant de
build. (L'autre piège, `app.config.ts` évalué sans l'environnement du profil
de build, est neutralisé par les identifiants inscrits dans le profil de
soumission d'`eas.json` ; `docs/deploiement-v1.md` § 2.1.)

`npm run build:preview` (APK interne et iOS interne) reste la voie des essais
du développeur ; `npm run build:production` lance le même build que le script,
sans ses garde-fous.

## Soumission en revue

Jamais automatisée. Uniquement quand :

1. toutes les gates automatisées passent (exception acceptée comprise) ;
2. le build envoyé en test a été installé et vérifié sur appareil, et les
   gates manuelles ci-dessus sont cochées ;
3. les fiches sont remplies et les deux URL publiques répondent ;
4. côté Play, l'accès à la production est ouvert : si la console affiche
   « Demander l'accès à la production », le test fermé (12 testeurs, 14 jours
   consécutifs) est terminé et la demande acceptée (`docs/deploiement-v1.md`
   § 0).

Alors : App Store Connect → *Ajouter pour vérification* avec le build
TestFlight vérifié ; Play Console → promouvoir **le même** AAB du test interne
vers la production. Séquence complète : `docs/deploiement-v1.md` § 3.

⚠️ Ne pas installer d'APK sur les tablettes des enfants si elles doivent
ensuite recevoir les mises à jour du Play Store : les signatures diffèrent, la
mise à jour est impossible et la progression est perdue. Passer par la piste
de **test interne** de Play (`docs/deploiement-v1.md` § 5).
