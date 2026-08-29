# Déploiement de la v1.0.0 — mode d'emploi

Cible décidée : **Google Play et App Store**, identifiant `td.alifa.app`.

Ce document est la marche à suivre, dans l'ordre. Ce qui est marqué
🔴 **à toi** ne peut pas être fait depuis le dépôt.

---

## 0. Ce qu'il faut ouvrir avant tout

| Compte | Coût | Délai | Pour quoi |
|---|---|---|---|
| Expo / EAS | gratuit pour commencer | immédiat | construire les binaires ✅ (tu l'as) |
| Google Play Console | 25 $ une fois | vérification d'identité : **quelques jours** | publier sur Android |
| Apple Developer Program | 99 $/an | vérification : **1 à 2 jours**, parfois plus | publier sur iOS |

> 🔴 **Ouvre les deux comptes maintenant.** La vérification d'identité est le
> plus long délai du projet, et elle tourne pendant que tu fais le reste.
> Depuis 2024, Google exige une vérification renforcée pour les comptes
> particuliers, et impose à un compte particulier créé récemment **un test
> fermé de 12 testeurs pendant 14 jours** avant de pouvoir passer en
> production. Un compte **organisation** (association, ONG) échappe à cette
> règle — si le projet doit être porté par une structure, c'est le moment de
> le décider, pas après.

---

## 1. Les trois trous à combler

### 🔴 1.1 Identité légale de l'éditeur

Les deux stores exigent un nom d'éditeur, une adresse et un e-mail de
contact, publiquement affichés. À renseigner dans
`store/shared/privacy-policy/index.html` (section 9).

### 🔴 1.2 Politique de confidentialité en ligne

Le fichier est prêt et autonome. Il faut juste une URL publique :

```bash
git subtree push --prefix store/shared/privacy-policy origin gh-pages
# puis Settings → Pages → Source : branche gh-pages
```

Détails dans `store/shared/privacy-policy/README.md`.

### 🔴 1.3 Captures d'écran

Elles doivent montrer l'app réelle — les fabriquer est un motif de refus.
Il faut donc un build installé. Voir §3, la liste de plans est en §4.

---

## 2. Premier build de test

```bash
npm ci
npm run validate:release      # doit finir sur « Gates automatisables : OK »
npx eas login
npx eas build:configure       # une seule fois : crée le projet côté EAS
```

Puis le build de test :

```bash
npx eas build --profile preview --platform android
```

Un APK, un lien, un QR code. Installable directement sur une tablette
Android (autoriser les sources inconnues).

Pour iOS, un build de test passe par TestFlight et exige déjà le compte
Apple :

```bash
npx eas build --profile production --platform ios
npx eas submit -p ios --latest      # → TestFlight
```

---

## 3. ⚠️ Le piège du pilote : ne pas installer d'APK sur les tablettes des enfants

C'est le point à ne pas rater.

Un APK construit par EAS est signé avec **ta** clé. Une app publiée sur Play
est resignée par **Google** (Play App Signing). Les deux signatures sont
incompatibles : une tablette qui a reçu l'APK **ne pourra jamais recevoir la
mise à jour** venant du Play Store. Il faudra désinstaller — et
**toute la progression des enfants est effacée**, puisqu'elle vit dans la
base locale de l'app.

Sur un pilote de plusieurs semaines destiné à mesurer la progression, c'est
la perte des données mêmes que le pilote cherche à produire.

**Le bon chemin pour les 5-10 tablettes :**

1. Publier la v1 sur Play en **test interne** (jusqu'à 100 testeurs, pas de
   validation, disponible en quelques minutes).
2. Installer sur les tablettes **depuis le Play Store**, via le lien de test.
3. Plus tard, promouvoir la même build en production : l'app se met à jour
   normalement et **la progression est conservée**.

L'APK `preview` reste utile pour tes propres essais et pour l'atelier avec
l'enseignant — pas pour les tablettes des enfants.

---

## 4. Captures d'écran

Contenu à mettre en scène : profil « Amina », CP1, une douzaine de leçons
terminées. Aucune donnée réelle, aucun écran de développement.

| # | Écran | Légende |
|---|---|---|
| 1 | Accueil enfant | *Le programme officiel du CP, sans internet.* |
| 2 | Choix du module (les 4 disciplines) | *Langage, lecture, écriture, calcul.* |
| 3 | Carte de progression CP1 | *Une année scolaire complète, semaine après semaine.* |
| 4 | Exercice d'écoute (« Que viens-tu d'entendre ? ») | *Des consignes lues à voix haute.* |
| 5 | Langage — toucher l'image du mot | *Le vocabulaire du quotidien tchadien.* |
| 6 | Calcul — compter les chèvres | *Compter avec des objets familiers.* |
| 7 | Écran de réussite (3 étoiles) | *Des encouragements, jamais de pression.* |
| 8 | Espace parent | *Suivez ses progrès, simplement.* |

**Formats exigés**

| Store | Format | Nombre |
|---|---|---|
| Play — téléphone | 16:9 ou 9:16, côté 320–3840 px | 2 min, 8 max |
| Play — tablette 7" et 10" | idem | 8 max chacun, nécessaires pour la fiche tablette |
| Play — image de mise en avant | **1024 × 500**, sans transparence | 1, obligatoire |
| Play — icône | 512 × 512 PNG | 1 |
| App Store — iPhone 6,9" | 1320 × 2868 (ou paysage) | 1 min, 10 max |
| App Store — iPad 13" | 2064 × 2752 (ou paysage) | 1 min — **obligatoire**, l'app déclare `supportsTablet` |

Comme ALIFA vise la tablette, mets les captures tablette en premier : c'est
ce que verront les bailleurs et les ONG.

---

## 5. Google Play Console

1. **Créer l'app** — nom `ALIFA`, français, gratuite.
2. **Fiche principale** : reprendre `store/google-play/short-description-fr.md`
   et `full-description-fr.md`, les captures, l'image de mise en avant.
3. **Contenu de l'application** :
   - Politique de confidentialité → l'URL du §1.2
   - **Public cible** : « Enfants de moins de 13 ans » → l'app entre dans le
     **programme Familles**. ALIFA est conforme : aucune publicité, aucune
     collecte, aucun SDK tiers, contrôle d'accès adulte
     (`store/google-play/families-checklist.md`).
   - **Data Safety** : « aucune donnée collectée, aucune donnée partagée » —
     réponses détaillées dans `store/google-play/data-safety.md`.
   - **Classification du contenu** : questionnaire IARC, catégorie
     « Éducation », aucun contenu sensible.
   - **Publicités** : déclarer **« Non »**.
4. **Test interne** : créer la liste de testeurs, y mettre les comptes Google
   des tablettes.
5. Build et envoi :

```bash
npm run build:production                 # AAB + IPA
npx eas submit -p android --latest       # → piste de test interne
```

> `eas.json` envoie sur la piste `internal` en statut `draft`. La promotion
> vers la production se fait ensuite depuis la Play Console.

---

## 6. App Store Connect

1. **Créer l'app** — bundle `td.alifa.app`, français comme langue principale.
2. Renseigner dans `eas.json` → `submit.production.ios` : `appleId`,
   `ascAppId`, `appleTeamId` (les trois `REMPLACER_PAR_…`).
3. **Informations sur l'app** :
   - Catégorie principale : Éducation
   - URL de politique de confidentialité → celle du §1.2
   - **Confidentialité de l'app** : « Données non collectées »
     (`store/app-store/privacy-answers.md`)
   - **Classification par âge** : questionnaire, aucun contenu sensible
     (`store/app-store/age-rating.md`)
4. **Catégorie Enfants (« Kids »)** : optionnelle. ALIFA en remplit les
   conditions — pas de lien externe, pas de SDK tiers, contrôle d'accès
   adulte avant tout partage. Elle apporte de la visibilité auprès des
   familles, au prix d'une revue plus stricte.
5. **Notes pour la revue** : `store/app-store/review-notes-fr.md`. Y signaler
   que l'app fonctionne hors connexion et **qu'aucun compte n'est
   nécessaire** — sinon un examinateur peut chercher un identifiant de test.

```bash
npx eas submit -p ios --latest           # → TestFlight, puis soumission
```

---

## 7. Ce qui part en v1.0.0, et ce qui est assumé

Deux exceptions sont explicitement acceptées dans `release-acceptances.json`,
et **doivent figurer dans les notes de version** :

1. **Voix de synthèse.** Les 820 consignes sont en TTS. Compréhensibles, mais
   ce n'est pas une voix humaine. À remplacer en 1.1.0.
2. **Expo SDK 56.** Une régression mémoire d'Hermes est corrigée en SDK 57.
   La montée de version se fera tablette en main, en 1.1.0.

Le script de release échoue si l'une de ces exceptions traîne au-delà de la
1.1.0 — elles ne peuvent pas être oubliées.

---

## 8. Après la mise en ligne

1. Atelier de validation avec l'enseignant (`docs/pedagogical-validation.md`).
2. Enregistrement des voix définitives (`docs/audio-pipeline.md`).
3. Montée en Expo SDK 57, avec une tablette pour vérifier.
4. Corrections issues de l'atelier → nouvelle `contentVersion`.
5. → v1.1.0.
