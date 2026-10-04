# Préparation stores

Cible v1.0.0 : **Google Play et App Store**, identifiant `td.ecolna.app`
(à confirmer définitivement par le propriétaire : c'est irréversible). La
marche à suivre pas à pas est dans **`docs/deploiement-v1.md`** ; ce document
dit seulement ce qui est prêt et ce qui manque. État au **4 octobre 2026**.

## En bref

Tout ce qui se prépare depuis le dépôt est prêt : contenu 2.1.1, textes des
fiches, 36 captures aux formats exacts (deuxième série), configuration de
release vérifiée, et une commande unique pour construire et envoyer en test
(`scripts/tools/eas-release.sh`), lançable aussi depuis GitHub par le workflow
manuel « Release EAS ». Les builds n'ont pas été lancés : depuis le conteneur
de développement, `expo.dev` est bloqué par la politique réseau, et aucun
`EXPO_TOKEN` n'est configuré — ni en local, ni comme secret GitHub. Il reste
les accès et les fiches côté
consoles, puis la vérification sur appareil, que personne n'a encore faite.

## Prêt côté technique

- Profils EAS : `preview` (APK interne), `production` (AAB + IPA,
  autoIncrement, numéros de build tenus par EAS), `production-apk` (APK signé
  de production).
- Configuration de soumission : Play sur la piste **test interne** en statut
  brouillon ; iOS vers TestFlight. Les identifiants de soumission
  (`applicationId`, `bundleIdentifier` = `td.ecolna.app`) sont dans
  `eas.json` ; reste l'`ascAppId` de la fiche App Store Connect, que seul le
  propriétaire peut relever (`docs/deploiement-v1.md` § 1.3).
- **Workflow GitHub « Release EAS »** (`.github/workflows/release-eas.yml`) :
  déclenchement manuel uniquement, entrées *plateforme* (android, ios, all) et
  *soumettre* (oui, non), secret `EXPO_TOKEN` ; il lance le script ci-dessous
  depuis un runner GitHub, qui joint expo.dev (`docs/deploiement-v1.md`
  § 2.4). Le job `preview-build` de `ci.yml` peut enfin tourner
  (`workflow_dispatch`).
- **Build et envoi en test en une commande** : `scripts/tools/eas-release.sh`
  vérifie l'identité de release, l'arbre git, l'absence de secret suivi, la
  configuration Expo, les profils, le jeton, les domaines, le projet
  `@okimy/alifa` et `validate:release`, puis construit et envoie **par
  identifiant de build**, jamais en revue. Il contourne deux pièges d'`eas
  submit` relevés dans le code d'eas-cli 24.10.0 (`docs/deploiement-v1.md`
  § 2.1). `--dry-run` testé ici ; parcours complet testé avec un eas-cli
  simulé.
- **Configuration de release vérifiée hors ligne** (`npx expo config`, types
  public et prebuild) : identifiants, permissions bloquées, sauvegarde coupée,
  tablette, orientation, projet EAS, `contentVersion` 2.1.1 identique partout
  (`docs/deploiement-v1.md` § 2.5).
- **Contenu 2.1.1** : 308 leçons (147 en CP1, 161 en CP2), 1 625 exercices,
  824 sons, aucune voix provisoire (`npm run validate:content`).
- Icônes 1024×1024 (app, adaptive foreground, monochrome) et splash.
- **Téléphone et tablette**, la tablette en priorité : orientation libre,
  mises en page adaptatives, `supportsTablet` côté iOS, et une activité
  Android qui absorbe les changements d'orientation et de taille sans être
  recréée — une rotation en pleine leçon ne perd rien.
- **Aucune autorisation réseau dans les builds livrés.** React Native déclare
  par défaut `INTERNET` (pour joindre Metro) et `SYSTEM_ALERT_WINDOW` (overlay
  du menu dev), Glide (via expo-image) `ACCESS_NETWORK_STATE` : les trois sont
  retirées des profils `preview` et `production`, avec les permissions de
  stockage externe et `AD_ID`. Restent `VIBRATE` (retour haptique de fin
  d'exercice) et `MODIFY_AUDIO_SETTINGS` (lecture audio), à confirmer sur le
  manifeste du premier AAB. Une app pour enfants qui promet de ne jamais
  accéder au réseau ne peut pas afficher « Accès Internet complet » ni
  « afficher les connexions réseau » dans la liste des autorisations du Play
  Store. Verrouillé par `tests/unit/app-config.test.ts` et par le script de
  release.
- **`allowBackup="false"`** : la progression de l'enfant ne part pas dans la
  sauvegarde Google Drive, et la politique de confidentialité peut dire que,
  sur Android, elle ne quitte pas l'appareil. Sur iPhone et iPad, la politique
  dit honnêtement que la sauvegarde iCloud de l'appareil, si elle est activée,
  peut inclure les données de l'app, sans qu'ECOLNA y ait accès (§ 2 et § 7).
- Ni micro, ni caméra, ni position, ni contacts.
- Aucun SDK publicitaire ou analytique (gate automatisée).
- Aucun lien sortant. Les deux seuls partages passent par la feuille système
  et sont derrière le contrôle d'accès adulte — condition des catégories
  Enfants (Apple) et Familles (Google).
- **Porte parentale durcie** : une multiplication tirée au hasard (deux
  facteurs de 6 à 9), saisie au clavier numérique, une autre après chaque
  erreur ; les écrans de l'espace parent et des paramètres renvoient à la
  porte tant qu'elle n'est pas franchie, lien profond `ecolna:///dashboard`
  compris, et la session se referme en arrière-plan
  (`app/(parent)/gate.tsx`, `parent-session-store.ts`,
  `parent-session-guard.tsx`).
- **Rubrique « Classe »** dans les paramètres : passer du CP1 au CP2 (ou
  l'inverse) garde leçons, étoiles et badges ; derrière la porte.
- **Carte « À propos »** : « Construit d'après » le programme, jamais
  « conforme », avec la phrase d'indépendance des fiches et l'adresse des
  licences (`support.html#licences`) en texte simple. L'option de langue
  « bientôt disponible » est retirée (règle Apple 2.1).
- Métadonnées rédigées dans `store/` : descriptions, mots-clés, réponses
  privacy, plans de captures, notes de revue, notes de version 1.0.0.
  L'index `store/README.md` dit quel fichier remplit quel champ de quelle
  console, et ce qui reste à produire.
- **Captures produites, deuxième série** : 10 iPhone 6,9" (1320 × 2868),
  10 iPad 13" paysage (2752 × 2064), 8 téléphone Play (1080 × 1920),
  8 tablette Play (1920 × 1080, 16:9, depuis une capture de tablette Android
  10"), dans `store/screenshots/out/`. Badges du profil calculés par les règles
  de l'app, écran de réussite d'une leçon réellement terminée, espace parent
  photographié après la porte. Ce sont des rendus du **vrai
  code** de l'app par le banc web (react-native-web) aux résolutions exactes
  des appareils, profil fictif « Amina », sans pixel dessiné ni retouché.
  `scripts/tools/capture-store-screenshots.sh` les reproduit octet pour octet.
  Ce ne sont **pas** des captures d'appareil : elles sont à comparer à l'app
  installée par TestFlight et par le test interne avant la revue, et tout
  écran qui diffère est à remplacer par une capture d'appareil
  (`store/screenshots/README.md`, « La règle d'abord »).
- Politique de confidentialité **prête à héberger**
  (`store/shared/privacy-policy/`), page autonome, sans dépendance : 6 à 8 ans,
  porte tirée au hasard, sauvegarde Android coupée, sauvegarde iCloud dite,
  « Réinitialiser la progression ».
- **Page de support prête à héberger** : `support.html`, dans le même dossier,
  donc publiée par le même `git subtree push`, avec une section « Licences »
  (polices OFL, Phosphor MIT, voix, SIWIS à vérifier) à laquelle renvoie la
  carte « À propos » de l'app. URL attendue :
  `https://aboky2.github.io/eduForAll/support.html`
  (`store/app-store/support-url.md`, `store/shared/contact-support.md`).
- **Déclarations de store écrites, une par fichier** : questionnaire IARC,
  accès à l'application, identifiant publicitaire, actualités / gouvernement /
  finance / santé / COVID, droits sur le contenu, licences tierces, titre et
  nom de fiche, coordonnées, territoires et prix. Index :
  `store/google-play/declarations.md` et `store/README.md`.
- `com.google.android.gms.permission.AD_ID` **bloquée** dans les builds livrés,
  pour que la déclaration « aucun identifiant publicitaire » reste vraie après
  une montée de version de dépendance — assertion dans
  `tests/unit/app-config.test.ts`.
- `.gitignore` exclut les clés de compte de service Google (JSON), les
  keystores, `credentials.json` et les fichiers de jeton.

## À fournir par le propriétaire

Par ordre d'exécution. La même liste, rattachée aux fichiers de `store/`, est
dans `store/README.md`.

| # | Élément | Où l'utiliser | Bloque |
|---|---|---|---|
| 1 | Confirmation de `td.ecolna.app` comme identifiant définitif (Android et iOS) | `eas.json`, `app.config.ts`, les deux consoles | tout |
| 2 | `EXPO_TOKEN` (jeton d'un utilisateur robot Expo de préférence), enregistré comme **secret `EXPO_TOKEN` du dépôt GitHub** pour le workflow « Release EAS » — ou un poste qui joint `api.expo.dev`, `expo.dev`, `storage.googleapis.com`, `reactnative.directory` | *Actions → Release EAS → Run workflow*, ou `scripts/tools/eas-release.sh` | les builds |
| 3 | Fiche App Store Connect créée, son `ascAppId` reporté dans `eas.json` (`submit.production.ios.ascAppId`, seule valeur du fichier qui reste à fournir), clé API App Store Connect enregistrée dans EAS (ou un premier passage `--interactive` avec l'Apple ID et la 2FA) | `eas.json`, EAS | l'envoi iOS |
| 4 | App créée dans la Play Console, compte de service Google enregistré dans EAS, liste de testeurs internes | EAS, Play Console | l'envoi Android |
| 4 bis | Regarder si le tableau de bord de l'app affiche « Demander l'accès à la production » ; si oui, test fermé d'au moins 12 testeurs pendant 14 jours consécutifs | Play Console | la production Play (pas le test interne) |
| 5 | Republication de `gh-pages` : `index.html` y date du 5 septembre, `support.html` n'y est pas ; vérifier les deux URL en 200 | les deux fiches | la revue |
| 6 | Vérification sur appareil (TestFlight, test interne) et gates manuelles : **l'app n'a encore jamais tourné sur un appareil** | `docs/release-process.md` | la revue |
| 7 | Comparaison des captures avec l'app installée ; remplacement de celles qui diffèrent | `store/screenshots/README.md` | la revue |
| 8 | Téléphone du contact de revue, format international, **non publié** | App Store Connect → *App Review Information* | la revue iOS |
| 9 | Déclaration DSA (non-professionnel) saisie dans les deux consoles | `store/shared/dsa-trader.md` | la diffusion UE |
| 10 | Attribution exacte du jeu de données SIWIS | `store/shared/licences-tierces.md` | non (obligation de licence) |

L'identité légale de l'éditeur (nom, adresse, e-mail) est fournie : elle figure
dans la politique de confidentialité.

Le support, lui, n'est plus à fournir :

| Élément | Valeur | Où la saisir |
|---|---|---|
| URL de support | `https://aboky2.github.io/eduForAll/support.html` | App Store Connect → *URL de support* |
| E-mail de contact | `issaokiabderamane@gmail.com` | Play Console → *Paramètres de la fiche → Coordonnées* |

La page existe (`store/shared/privacy-policy/support.html`) et part sur
`gh-pages` avec la politique de confidentialité ; il reste à la publier et à
vérifier que l'URL répond en 200. Les chaînes exactes des deux fiches sont
regroupées dans `store/shared/coordonnees-fiches.md` — un seul fichier, pour
qu'elles ne divergent pas entre les consoles et la politique.

> Les comptes Play Console et Apple Developer sont déjà ouverts. La règle du
> **test fermé** de Play (au moins 12 testeurs inscrits pendant 14 jours
> consécutifs avant l'accès à la production) vise les comptes **personnels**
> créés après le 13 novembre 2023, et peut s'appliquer à chaque nouvelle app,
> même sur un compte qui a déjà publié. Ne pas l'écarter : la vérifier dans la
> console, où elle apparaît comme la tâche « Demander l'accès à la
> production » (`docs/deploiement-v1.md` § 0). Elle ne retarde pas le test
> interne, seulement la production.

## Questionnaires (réponses préparées dans store/)

- **Apple « App Privacy »** : aucune donnée collectée — tout est local.
  (`store/app-store/privacy-answers.md`)
- **Play « Data Safety »** : « Non » à la question de collecte ou de partage ;
  le formulaire s'arrête là. (`store/google-play/data-safety.md`)
- **Public cible** : 6-8 ans seulement → la politique Familles s'applique
  d'office, exigences couvertes. (`store/google-play/target-audience.md`,
  `store/google-play/families-checklist.md`)
- **Classification par âge (Apple)** : questionnaire 2025 complet (contrôles
  parentaux, vérification de l'âge, santé et bien-être tranchés et justifiés),
  résultat attendu 4+, « Made for Kids » 6–8 ans.
  (`store/app-store/age-rating.md`)
- **Classification du contenu (Play, IARC)** : catégorie « Référence,
  actualités ou éducation », « Non » à toutes les questions de contenu (humour
  grossier compris) et aux huit questions « divers » (navigateur ou moteur de
  recherche, achat de biens numériques compris) ; PEGI 3, ESRB Everyone,
  USK 0, ClassInd L, IARC générique 3+ attendus. (`store/google-play/content-rating-iarc.md`)
- **Accès à l'application (Play)** : « toutes les fonctionnalités sont
  disponibles sans accès spécial » — à écrire noir sur blanc, sinon un
  examinateur cherche un compte de test qui n'existe pas.
  (`store/google-play/app-access.md`)
- **Publicités** : déclarer « Non » sur les deux plateformes.
  (`store/google-play/app-content-declarations.md`)
- **Identifiant publicitaire (Play)** : « non utilisé », tenu par la
  configuration et non par la vigilance.
  (`store/google-play/advertising-id.md`)
- **Actualités, gouvernement, finance, santé, COVID-19 (Play)** : « Non » aux
  cinq, chacun avec son motif.
  (`store/google-play/app-content-declarations.md`)
- **Droits sur le contenu (Apple)** : « Oui », contenu de tiers sous licence —
  programme officiel cité, polices, pictogrammes Phosphor, voix de synthèse ;
  attributions publiées sur `support.html#licences`.
  (`store/app-store/content-rights.md`, `store/shared/licences-tierces.md`)

## Statut de professionnel au titre du DSA — décidé

Réponse retenue : **non-professionnel**. L'éditeur est une personne physique,
l'app est gratuite, sans achat intégré, sans publicité et sans collecte : aucune
activité commerciale n'y est attachée.

Ce que la décision évite : déclarer « professionnel » fait **publier sur chaque
fiche** le nom, l'adresse postale et le téléphone de l'éditeur — l'adresse
personnelle du 25 rue Édouard Vaillant serait affichée sur les deux stores.

Ce qu'il reste à faire, console en main : lire l'écran de déclaration tel qu'il
s'affiche au moment de soumettre, parce que les deux plateformes conditionnent
la diffusion dans l'UE à cette réponse et que leurs règles ont changé plusieurs
fois. Si une console réserve la diffusion UE aux professionnels vérifiés, la
décision déjà prise est de retirer les territoires de l'UE plutôt que de publier
un domicile, et de garder le Tchad — cible du pilote. Détail, conséquences et
coordonnées concernées : `store/shared/dsa-trader.md` ; territoires et prix :
`store/shared/distribution.md`.
