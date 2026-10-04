# Déploiement de la v1.0.0 : mode d'emploi

Cible : **Google Play et App Store**, identifiant `td.ecolna.app` sur les deux
plateformes (à confirmer définitivement, § 1.1).

Ce document est la marche à suivre, dans l'ordre. Ce qui est marqué
🔴 **à toi** ne peut pas être fait depuis le dépôt. Ce qui est prêt, et ce qui
manque, est tenu à jour dans `docs/store-readiness.md`.

---

## 0. Où on en est (4 octobre 2026)

| Sujet | État |
|---|---|
| Contenu | version **2.1.1** : 308 leçons (147 en CP1, 161 en CP2), 1 625 exercices, 824 sons (`npm run validate:content`) |
| Textes des fiches | prêts, un fichier par champ de console : `store/README.md` |
| Captures | **produites** : 36 images aux formats exacts des deux consoles, dans `store/screenshots/out/`. Rendu du vrai code par le banc web, à vérifier sur l'app installée avant la revue (§ 4) |
| Icône Play, image de mise en avant | produites (`store/google-play/graphics/`) |
| Configuration de release | vérifiée hors ligne (§ 2.5) : identifiants, permissions bloquées, version, tablette, projet EAS |
| Gates automatisées | vertes, sauf `expo-doctor` : 3 échecs, dont 2 dus au réseau bloqué du conteneur de développement et 1 accepté jusqu'à la 1.1.0 (§ 2.5) |
| Builds | **pas encore lancés**. Depuis le conteneur de développement, `expo.dev` est bloqué (réponse 403 « Host not in allowlist ») et aucun `EXPO_TOKEN` n'est configuré. Tout est prêt pour qu'une seule commande les lance (§ 2) |
| Comptes | Play Console et Apple Developer ouverts |

Une application a déjà été publiée depuis ce compte Play : la vérification
d'identité est faite, et la règle des 12 testeurs pendant 14 jours (qui ne vise
que les comptes personnels récents n'ayant jamais publié) ne s'applique pas.

**Format visé : téléphone ET tablette, la tablette en priorité.**

---

## 1. 🔴 À confirmer ou fournir avant le premier build

### 1.1 Les identifiants définitifs

Le profil `production` d'`eas.json` construit sous **`td.ecolna.app`**, sur
Android comme sur iOS (`.dev` et `.preview` pour les autres profils).
`app.config.ts` dit encore, en commentaire, que ces identifiants sont
provisoires « until the product owner provides the final legal identity ».

**À confirmer explicitement, parce que c'est irréversible** : le nom de paquet
Android ne change plus après le premier envoi sur Play, et le bundle iOS reste
attaché à la fiche App Store Connect. Une fois la confirmation donnée, le
commentaire d'`app.config.ts` est à remplacer (tâche de code, § 2.6).

L'identité légale de l'éditeur, elle, est fournie : nom, adresse et contact
figurent dans la politique de confidentialité
(`store/shared/privacy-policy/index.html`, section 9).

### 1.2 Un accès EAS : `EXPO_TOKEN`

Les builds tournent sur les serveurs d'Expo, au nom du compte `okimy`, projet
**@okimy/alifa** (`aa1d821b-49a3-4a56-aad8-9cd2a0b0afa3`, déjà câblé dans
`app.config.ts`). Le projet garde sur expo.dev son nom d'origine, `alifa` : ne
pas renommer le `slug` (le commentaire d'`app.config.ts` explique pourquoi).

- Créer un jeton sur **expo.dev → Settings → Access tokens**. De préférence le
  jeton d'un **utilisateur robot** du compte, avec le rôle le plus restreint
  qui permette de construire et soumettre ; sinon, un jeton d'accès personnel.
- Le fournir dans la variable d'environnement **`EXPO_TOKEN`**, et nulle part
  ailleurs : `export EXPO_TOKEN=…` dans le shell, ou un secret de la CI.
  **Jamais** dans un fichier du dépôt. Le script de release le vérifie
  (`git grep` de la valeur) et s'arrête s'il le trouve.
- En cas de fuite : le révoquer sur la même page, en recréer un.

### 1.3 Les deux fiches et les clés de soumission

Ces clés vivent **dans EAS** (expo.dev → projet → Credentials), jamais dans le
dépôt. `.gitignore` exclut déjà `*.p8`, `*.p12`, `*.jks`, `*.key` ; un JSON de
compte de service, lui, n'est pas exclu par motif. Le garder hors du dossier du
projet (le script refuse aussi tout fichier sensible suivi par git).

**App Store Connect (iOS)**

1. Créer l'app : *Apps → + → Nouvelle app*, plateforme iOS, nom `ECOLNA`,
   langue principale Français, bundle `td.ecolna.app`, SKU de
   `store/app-store/app-information.md`. Si le bundle n'apparaît pas encore
   dans la liste, c'est qu'il n'est pas enregistré chez Apple : le premier
   passage interactif du script (§ 2.2) l'enregistre.
2. Relever l'**Apple ID** numérique de la fiche (*Informations sur l'app →
   Informations générales*) et le reporter dans `eas.json`, sous
   `submit.production.ios.ascAppId`. Sans lui, `eas submit` refuse de tourner
   en mode non interactif : « Set ascAppId in the submit profile (eas.json) or
   re-run this command in interactive mode ».
3. Enregistrer une **clé API App Store Connect** dans EAS :
   `eas credentials -p ios` → profil `production` → *App Store Connect: Manage
   your API Key* → *Set up your project to use an API Key for EAS Submit*.
   EAS s'en sert pour envoyer vers TestFlight, et pour créer ou réparer
   certificat et profil sans connexion Apple interactive.

**Play Console (Android)**

1. Créer l'app : *Créer une application*, nom `ECOLNA`, langue Français,
   application, gratuite.
2. Créer un **compte de service** Google Cloud, activer l'API *Google Play
   Android Developer*, télécharger la clé JSON, puis inviter l'adresse du
   compte de service dans la Play Console (*Utilisateurs et autorisations*)
   avec le droit de publier en test pour ECOLNA. Guide pas à pas :
   `https://expo.fyi/creating-google-service-account`.
3. Enregistrer le JSON dans EAS : `eas credentials -p android` → profil
   `production` → *Google Service Account* → *Upload a Google Service Account
   Key*. Puis le ranger hors du projet.
4. *Tests → Test interne* : créer la liste de testeurs (les comptes Google des
   tablettes du pilote et du téléphone de test).

**Le tout premier envoi Android.** Pendant longtemps, l'API de Google Play
refusait de publier une app dont aucun AAB n'avait encore été téléversé à la
main, et la documentation d'Expo le disait. **Ce n'est plus le cas** : la
documentation à jour d'Expo (dépôt `expo/expo`, `docs/pages/submit/android.mdx`
et `android-manual.mdx`, relus le 4 octobre 2026) dit que `eas submit` crée la
première version, par défaut sur la piste de test interne, dès lors que l'app
existe dans la Play Console et que la clé du compte de service est dans EAS.
L'envoi manuel y est décrit comme facultatif. Le code d'eas-cli 24.10.0 ne
contient d'ailleurs aucun contournement : il crée une soumission côté serveur
avec la piste et le statut d'`eas.json`. **Si la Play Console refuse malgré
tout** (erreur d'application introuvable ou non configurée), télécharger l'AAB
depuis la page du build sur expo.dev, le téléverser à la main (*Test interne →
Créer une version*), puis repasser au script pour les versions suivantes. Il
faut de toute façon remplir d'abord les tâches *Configurer votre application*
que la console exige avant un test, sinon l'envoi échoue sur des informations
manquantes (réponses prêtes dans `store/google-play/`).

### 1.4 Les deux pages publiques

La politique de confidentialité et la page de support doivent répondre avant
la revue, aux URL déjà inscrites dans les fiches :
`https://aboky2.github.io/eduForAll/` et `…/support.html`.

État vérifié le 4 octobre 2026 (clone de la branche `gh-pages`) : `gh-pages`
porte une `index.html` du **5 septembre**, sans la phrase sur la sauvegarde
Android désactivée ni la précision « question de multiplication ». Et
**`support.html` n'y est pas**. Après commit des fichiers actuels :

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
git fetch origin gh-pages
git diff origin/gh-pages:index.html store/shared/privacy-policy/index.html   # doit être vide
curl -sI https://aboky2.github.io/eduForAll/ | head -1                        # 200
curl -sI https://aboky2.github.io/eduForAll/support.html | head -1            # 200
```

Détails : `store/shared/privacy-policy/README.md`.

---

## 2. Lancer les builds : une commande

```bash
scripts/tools/eas-release.sh --dry-run     # vérifications locales, aucun appel réseau
scripts/tools/eas-release.sh               # build Android + iOS, puis envoi EN TEST
```

| Option | Effet |
|---|---|
| *(aucune)* | build de production des deux plateformes, puis Android → test interne (brouillon), iOS → TestFlight |
| `--android` / `--ios` | une seule plateforme |
| `--no-submit` | build seulement ; le script affiche la commande pour envoyer plus tard |
| `--submit-only <id,id>` | envoie des builds déjà faits, par identifiant EAS, sans rebuild |
| `--interactive` | premier passage : laisse EAS poser ses questions (§ 2.2) |
| `--dry-run` | vérifications locales, puis affiche les commandes qui seraient lancées |

`EAS_CLI=eas` utilise un eas-cli installé sur le poste plutôt que
`npx eas-cli@latest`, et `EAS_CLI_VERSION=…` fige une version.

Le script **n'envoie jamais en revue**. La revue reste un geste humain, après
vérification sur appareil (§ 3).

### 2.1 Ce que le script vérifie, dans l'ordre

Le premier contrôle qui échoue arrête tout, avec la marche à suivre.

1. **Identité de release** lue dans `eas.json` (`build.production.env`),
   exportée pour toutes les commandes (voir l'encadré ci-dessous).
2. **Node** 20.18.3+ ou 22+ (exigence d'eas-cli).
3. **Arbre git propre** : un build doit correspondre exactement à un commit.
4. **Aucun secret suivi par git** (`.p8`, `.p12`, `.jks`, `.keystore`,
   `.mobileprovision`, `.pem`, JSON de compte de service, `credentials.json`),
   et la valeur d'`EXPO_TOKEN` absente des fichiers suivis.
5. **Configuration Expo de release** (`npx expo config --type public`, hors
   ligne) : identifiants `td.ecolna.app`, `INTERNET` et `AD_ID` bloquées,
   sauvegarde Android coupée, `supportsTablet`, orientation libre, chiffrement
   déclaré, projet EAS présent, `contentVersion` identique dans
   `app.config.ts`, le manifeste et le générateur.
6. **Profils `eas.json`** : AAB pour Play, piste `internal` en `draft`, et
   `ascAppId` présent si iOS doit être envoyé sans interaction.
7. **`EXPO_TOKEN`** présent (sa valeur n'est jamais affichée).
8. **Domaines joignables** (§ 2.3).
9. **eas-cli** disponible, **`eas whoami`**, **`eas project:info`** égal à
   `@okimy/alifa` avec l'identifiant d'`app.config.ts`.
10. **`npm run validate:release`** vert (exceptions acceptées comprises).

Puis `eas build --platform all --profile production --non-interactive --json`
(15 à 40 minutes), contrôle de chaque build (terminé, profil production,
distribution store, bon identifiant), et `eas submit --id <build> --wait` pour
chaque plateforme. Les réponses JSON des builds restent dans un dossier
temporaire dont le chemin est affiché.

> ⚠️ **Deux pièges d'`eas submit`, vérifiés dans le code d'eas-cli 24.10.0.**
>
> 1. **Il ignore l'environnement du profil de build** quand il évalue
>    `app.config.ts`. Le code le dit en toutes lettres : « this command
>    doesn't make use of env when getting the project config »
>    (`commands/submit.js`). Lancé tel quel, `eas submit -p android` résout
>    donc **`td.ecolna.app.dev`** et cherche la clé Play et la clé Apple… de
>    l'app de développement. Le script exporte `ECOLNA_RELEASE`,
>    `ECOLNA_ANDROID_PACKAGE` et `ECOLNA_IOS_BUNDLE_ID` avant toute commande.
>    À la main : préfixer ces trois variables, ou, mieux, inscrire les
>    identifiants dans le profil de soumission d'`eas.json` (§ 2.6).
> 2. **`--latest` envoie le build « store » le plus récent de la plateforme**,
>    quel que soit son profil (un `production-apk` compris), et même s'il est
>    encore en cours. Le script envoie par identifiant (`--id`), jamais par
>    `--latest`.

### 2.2 Premier passage : `--interactive`

La documentation d'Expo pour la CI le demande : chaque plateforme doit avoir
été construite une fois depuis un terminal, pour qu'EAS puisse poser ses
questions et créer les clés de signature. Depuis le dépôt, on ne peut pas
savoir si c'est déjà fait pour `td.ecolna.app` : `eas credentials` le dit.

- **Android** : eas-cli 24.10.0 sait désormais générer le keystore sans
  interaction, mais une clé de signature engage l'éditeur : mieux vaut la voir
  créer. EAS la conserve ; Play re-signe ensuite l'app avec sa propre clé (Play
  App Signing).
- **iOS** : sans clé API App Store Connect dans EAS, il faut une connexion avec
  l'Apple ID du compte développeur (double authentification). EAS enregistre
  alors le bundle, crée le certificat de distribution et le profil de
  provisionnement.

```bash
scripts/tools/eas-release.sh --interactive     # une fois, sur un poste avec navigateur
```

Ensuite, tous les passages se font sans interaction, y compris depuis une CI.

### 2.3 Depuis un conteneur : les domaines à autoriser

Relevés dans le code d'eas-cli 24.10.0 et d'expo-doctor 1.20.4. Le script les
teste avant de commencer.

| Domaine | Pourquoi | Obligatoire |
|---|---|---|
| `registry.npmjs.org` | télécharger eas-cli et expo-doctor (`npx`) | oui |
| `api.expo.dev` | API d'Expo : authentification, projet, builds, soumissions ; schéma de configuration lu par expo-doctor | oui |
| `expo.dev` | site d'Expo (liens, pages de build) | oui |
| `storage.googleapis.com` | téléversement de l'archive du projet, par URL signée renvoyée par `api.expo.dev` | oui |
| `reactnative.directory` | vérification des paquets par expo-doctor, donc par `validate:release` | oui |
| `logs.expo.dev` | journal du build en direct (WebSocket) | non |
| `api.appstoreconnect.apple.com` | création ou vérification des clés iOS par clé API | recommandé |
| `appstoreconnect.apple.com`, `developer.apple.com`, `idmsa.apple.com`, `appleid.apple.com` | connexion Apple interactive (`--interactive` sans clé API) | seulement dans ce cas |

`*.expo.dev` couvre les trois domaines d'Expo. L'envoi vers Google Play et
vers App Store Connect est fait **par les serveurs d'Expo** (EAS Submit), pas
depuis la machine qui lance la commande : `play.googleapis.com` n'est pas
nécessaire. Les statistiques d'usage d'eas-cli (`cdp.expo.dev`) sont coupées
par le script (`DISABLE_EAS_ANALYTICS=1`) : inutile de les autoriser.

État du conteneur de développement au 4 octobre 2026 : `registry.npmjs.org`
et `storage.googleapis.com` passent ; `api.expo.dev`, `expo.dev`,
`reactnative.directory`, `logs.expo.dev` et `api.appstoreconnect.apple.com`
sont refusés par le proxy.

### 2.4 Les autres chemins

- **Un poste avec Internet** (celui du propriétaire, où eas-cli est déjà
  connecté au compte `okimy`) : `EAS_CLI=eas scripts/tools/eas-release.sh`.
  C'est le plus simple pour le premier passage interactif.
- **GitHub Actions** : les runners de GitHub joignent expo.dev. Il suffit d'un
  secret `EXPO_TOKEN` dans le dépôt et d'un workflow qui appelle le script.
  Celui de `.github/workflows/ci.yml` ne peut pas servir en l'état (§ 2.6).
- **EAS Workflows** (`.eas/workflows/*.yml`) : les builds sont déclenchés par un
  push GitHub, une fois l'app GitHub d'Expo liée au dépôt. Le conteneur n'a
  alors besoin que de pousser sur GitHub. Cela demande un fichier de workflow,
  absent aujourd'hui.

### 2.5 Ce qui a été vérifié sans réseau (4 octobre 2026)

```bash
ECOLNA_RELEASE=1 ECOLNA_ANDROID_PACKAGE=td.ecolna.app ECOLNA_IOS_BUNDLE_ID=td.ecolna.app \
  npx expo config --type public     # et --type prebuild : les deux se résolvent
```

| Contrôle | Valeur résolue |
|---|---|
| Nom, version | `ECOLNA`, `1.0.0` (numéros de build gérés par EAS : `appVersionSource: remote`, `autoIncrement`) |
| Identifiants | Android `td.ecolna.app`, iOS `td.ecolna.app` |
| Permissions Android | `INTERNET`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` et `AD_ID` bloquées ; liste `permissions` vide au prebuild |
| Sauvegarde Android | `allowBackup: false` |
| Orientation, tablette | `default` (les deux sens), `supportsTablet: true` |
| Chiffrement | `ITSAppUsesNonExemptEncryption: false` (pas de question de conformité export à chaque build) |
| Projet EAS | `okimy/alifa`, `aa1d821b-49a3-4a56-aad8-9cd2a0b0afa3` |
| Contenu | `contentVersion` `2.1.1`, identique au manifeste et à `CONTENT_VERSION` du générateur |
| Garde-fou | `ECOLNA_RELEASE=1` sans les deux identifiants : `app.config.ts` refuse de se résoudre |

`npm run validate:release` : tsc, ESLint, Jest, contenu, assets, audio, sons
dans le bundle, aucune voix provisoire, aucun SDK tiers, tout est **vert**.
Seul **Expo Doctor** échoue, sur trois vérifications :

| Vérification d'expo-doctor | Cause | Depuis une machine avec Internet |
|---|---|---|
| *Check Expo config schema* | le schéma est téléchargé depuis `api.expo.dev`, qui répond « Host not in allowlist » | doit passer |
| *Validate packages against React Native Directory* | `reactnative.directory` injoignable (« unexpected server response ») | doit passer |
| *Expo SDK versions affected by Hermes V1 regressions* | régression mémoire d'Hermes dans RN 0.85.3 / SDK 56 | **acceptée** jusqu'à la 1.1.0 (`release-acceptances.json`) |

Ici, la gate est donc bloquée : l'acceptation ne couvre qu'**une**
vérification, et le script refuse à juste titre de la laisser masquer les deux
autres. Depuis un poste, une CI ou un conteneur autorisé à joindre
`api.expo.dev` et `reactnative.directory`, il ne reste que l'échec accepté, et
`validate:release` doit finir sur « Gates automatisables : OK ». Si une
vérification de plus y échoue, c'est un vrai problème à traiter, pas à
accepter.

### 2.6 Modifications recommandées hors de ce document

Ni `eas.json` ni `app.config.ts` n'ont été modifiés. Ce qu'il faudrait y
changer :

| Fichier | Changement | Pourquoi |
|---|---|---|
| `eas.json` | `submit.production.ios.ascAppId` : l'Apple ID numérique de la fiche | indispensable à `eas submit` iOS sans interaction |
| `eas.json` | `submit.production.android.applicationId: "td.ecolna.app"` et `submit.production.ios.bundleIdentifier: "td.ecolna.app"` | rendre `eas submit` juste même lancé à la main, sans les variables (piège 1 du § 2.1) |
| `app.config.ts` | remplacer le commentaire « Store identifiers are placeholders… » par la décision, une fois `td.ecolna.app` confirmé | le commentaire contredit `eas.json` et ce document |
| `.github/workflows/ci.yml` | ajouter `workflow_dispatch:` sous `on:` | le job `preview-build` ne se déclenche que sur `workflow_dispatch`, absent des déclencheurs : il ne peut jamais tourner |
| `.gitignore` | ajouter un motif pour les clés JSON de compte de service (par exemple `*service-account*.json`) | `*.p8` est couvert, un JSON Google ne l'est pas |
| `scripts/tools/capture-ios-screenshots.mjs` | aligner sa liste sur les dix plans de `store/screenshots/plan.json` | il suit encore l'ancien plan de neuf captures |
| `package.json` | `build:production` appelle `eas` sans les garde-fous | préférer `scripts/tools/eas-release.sh` |

---

## 3. La séquence de mise en ligne

Dans cet ordre, sans en sauter une étape.

1. **Préparer.** § 1 terminé ; `scripts/tools/eas-release.sh --dry-run` vert.
2. **Construire et envoyer en test.** `scripts/tools/eas-release.sh`
   (`--interactive` la toute première fois). Résultat : un AAB dans la Play
   Console, piste *Test interne*, en **brouillon** ; un IPA dans App Store
   Connect.
3. **Ouvrir le test interne Play.** *Tests → Test interne* : la version
   attend en brouillon. Coller les notes de version
   (`store/shared/release-notes-1.0.0-fr.md`, balise `<fr-FR>`), puis
   *Vérifier la version* → *Lancer le déploiement*. Le test interne ne passe
   pas par la revue et est disponible en quelques minutes ; partager le lien
   d'inscription aux testeurs.
4. **Ouvrir TestFlight.** Le build apparaît après traitement par Apple (10 à
   30 minutes). La conformité export est déjà réglée par
   `ITSAppUsesNonExemptEncryption: false`. Les testeurs internes (membres de
   l'équipe App Store Connect) n'ont pas besoin de revue.
5. **Vérifier sur appareil.** Installer depuis TestFlight (iPhone, iPad) et
   depuis le lien de test interne (tablette Android du pilote, téléphone
   Android), **jamais par APK** (§ 5). Passer les gates manuelles de
   `docs/release-process.md` : premier lancement en mode avion, une leçon
   de chaque matière, la tablette dans les deux orientations, VoiceOver et
   TalkBack, texte agrandi. **L'app n'a encore jamais tourné sur un
   appareil** : c'est l'étape qui compte le plus.
6. **Comparer les captures.** Afficher chacun des dix écrans de
   `store/screenshots/plan.json` dans le même état, comparer à
   `store/screenshots/out/`, remplacer par une capture d'appareil tout écran
   qui diffère, recomposer, commiter (§ 4).
7. **Remplir les fiches.** Coller les textes de `store/`, téléverser les
   images de `store/screenshots/out/` et de `store/google-play/graphics/`,
   répondre aux questionnaires (§ 6 et § 7). Vérifier que les deux URL
   publiques répondent (§ 1.4).
8. **Soumettre en revue.**
   - Apple : version 1.0 → choisir le build TestFlight vérifié → *Ajouter pour
     vérification* → *Soumettre*. Choisir la **publication manuelle** pour
     garder la main sur la date.
   - Play : *Production → Créer une version* → ajouter **le même AAB** depuis
     la bibliothèque (pas un nouveau build) → *Envoyer pour examen*. La
     revue d'une app du programme Familles peut prendre plusieurs jours.
9. **Après l'accord.** Publier ; les tablettes du pilote, installées depuis le
   test interne, reçoivent la version de production comme une mise à jour, et
   la progression des enfants est conservée.

---

## 4. Captures d'écran

**Produites** : 10 iPhone 6,9" (1320 × 2868), 10 iPad 13" paysage
(2752 × 2064), 8 téléphone Play (1080 × 1920), 8 tablette Play
(1920 × 1200, le même jeu pour les emplacements 7" et 10"), dans
`store/screenshots/out/`. Les plans, leur ordre et leurs légendes vivent
**uniquement** dans `store/screenshots/plan.json`. Ce document ne les recopie
pas, pour qu'ils ne divergent pas.

**Ce qu'elles sont, honnêtement** : le rendu du vrai code de l'app par le banc
web (react-native-web) aux résolutions exactes des appareils, avec le profil
fictif « Amina », sans aucun pixel dessiné ni retouché. Ce ne sont pas des
captures d'appareil : la règle, et ce qu'il faut faire si un écran diffère,
sont dans `store/screenshots/README.md`, section « La règle d'abord ». Les
refaire :

```bash
ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081   # 1er terminal
scripts/tools/capture-store-screenshots.sh --composer                                    # 2e terminal
```

Sans captures tablette, Play affiche la fiche comme une « application
téléphone » sur les tablettes, l'exact contraire du message. Les deux jeux
sont donc renseignés, la tablette en paysage, puisque c'est ainsi que les
enfants tiendront l'appareil et que les écrans passent en deux volets.

---

## 5. ⚠️ Le piège du pilote : ne pas installer d'APK sur les tablettes des enfants

C'est le point à ne pas rater.

Un APK construit par EAS est signé avec **ta** clé. Une app publiée sur Play
est re-signée par **Google** (Play App Signing). Les deux signatures sont
incompatibles : une tablette qui a reçu l'APK **ne pourra jamais recevoir la
mise à jour** venant du Play Store. Il faudra désinstaller, et **toute la
progression des enfants sera effacée**, puisqu'elle vit dans la base locale
de l'app.

Sur un pilote de plusieurs semaines destiné à mesurer la progression, ce
serait perdre les données mêmes que le pilote cherche à produire.

**Le bon chemin pour les 5 à 10 tablettes :**

1. Publier la v1 sur Play en **test interne** (jusqu'à 100 testeurs, sans
   revue, disponible en quelques minutes) : c'est ce que fait le script.
2. Installer sur les tablettes **depuis le Play Store**, via le lien de test.
3. Plus tard, promouvoir la même version en production : l'app se met à jour
   normalement et **la progression est conservée**.

L'APK `preview` reste utile pour tes propres essais et pour l'atelier avec
l'enseignant, pas pour les tablettes des enfants.

---

## 6. Google Play Console

1. **Fiche principale** : `store/google-play/title-fr.md`,
   `short-description-fr.md`, `full-description-fr.md`, les captures de
   `store/screenshots/out/play-telephone/` et `…/play-tablette/` (le même jeu
   dans les emplacements 7" et 10"), l'icône et l'image de mise en avant de
   `store/google-play/graphics/`.
2. **Contenu de l'application** (index : `store/google-play/declarations.md`) :
   - Politique de confidentialité → l'URL du § 1.4.
   - **Public cible** : enfants de moins de 13 ans, donc l'app entre dans le
     **programme Familles**. ECOLNA y est conforme : aucune publicité, aucune
     collecte, aucun SDK tiers, contrôle d'accès adulte
     (`store/google-play/families-checklist.md`).
   - **Sécurité des données** : aucune donnée collectée, aucune donnée
     partagée (`store/google-play/data-safety.md`).
   - **Classification du contenu** : questionnaire IARC
     (`store/google-play/content-rating-iarc.md`).
   - **Publicités** : « Non ». **Identifiant publicitaire** : non utilisé.
3. **Test interne** : la liste de testeurs du § 1.3.
4. **Build et envoi** : `scripts/tools/eas-release.sh --android`. `eas.json`
   envoie sur la piste `internal` en statut `draft` ; la promotion vers la
   production se fait ensuite dans la Play Console (§ 3, étape 8).

## 7. App Store Connect

1. **Fiche** créée au § 1.3, `ascAppId` reporté dans `eas.json`.
2. **Informations sur l'app** : catégorie, URL de confidentialité et de
   support (§ 1.4), **Confidentialité de l'app** : « Données non collectées »
   (`store/app-store/privacy-answers.md`), **Classification par âge**
   (`store/app-store/age-rating.md`).
3. **Catégories** : décidé, **Enfants (6–8 ans)** en catégorie principale et
   Éducation en secondaire (`store/app-store/age-rating.md` § 1). ECOLNA en
   remplit les conditions : pas de lien externe, pas de SDK tiers, contrôle
   d'accès adulte avant tout partage. La revue y est plus stricte.
4. **Notes pour la revue** : `store/app-store/review-notes-fr.md`. Elles
   disent que l'app fonctionne hors connexion et **qu'aucun compte n'est
   nécessaire**, sinon un examinateur cherche un identifiant de test. Le
   téléphone du contact de revue reste à fournir.
5. **Build et envoi** : `scripts/tools/eas-release.sh --ios`. Le build arrive
   dans TestFlight ; la soumission en revue se fait à la main (§ 3, étape 8).

---

## 8. Ce qui part en v1.0.0, et ce qui est assumé

Une exception est explicitement acceptée dans `release-acceptances.json`, et
**figure dans les notes de version** :

1. **Expo SDK 56.** Une régression mémoire d'Hermes est corrigée à partir du
   SDK 57. La montée de version se fera tablette en main, en 1.1.0.

Le script de validation échoue si cette exception traîne au-delà de la 1.1.0 :
elle ne peut pas être oubliée. La voix, elle, n'est pas une exception :
synthèse locale Kokoro et Piper (`docs/audio-pipeline.md`).

---

## 9. Après la mise en ligne

1. Atelier de validation avec l'enseignant (`docs/pedagogical-validation.md`).
2. Relecture de la prononciation des sons isolés par l'enseignant
   (`docs/pedagogical-validation.md` § 8).
3. Montée en Expo SDK 57, avec une tablette pour vérifier.
4. Corrections issues de l'atelier → nouvelle `contentVersion`.
5. → v1.1.0.
