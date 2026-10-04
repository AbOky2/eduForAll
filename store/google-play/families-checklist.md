<!-- Exigences de la politique Familles de Google Play, et où chacune est
     tenue. Pas un champ de console : la liste à relire avant chaque envoi en
     revue. Aucune limite de caractères. -->

# Politique Familles — checklist

ECOLNA déclare la tranche 6-8 ans (`target-audience.md`) : la politique
Familles s'applique d'office. Chaque ligne cochée est une propriété du code ou
d'un fichier du dépôt, pas une intention.

## Publicité, achats, SDK

- [x] **Aucune publicité**, aucun SDK publicitaire embarqué — gate anti-SDK de
  `npm run validate:release`.
- [x] **Aucun achat intégré**, aucun abonnement, aucune dépendance de paiement
  (`package.json`).
- [x] **Aucun SDK tiers** de mesure d'audience, de publicité ou de rapport de
  plantage (même gate).

## Données et identifiants

- [x] **Aucune collecte** : « Non » à la question de collecte ou de partage du
  formulaire Sécurité des données (`data-safety.md`).
- [x] **Aucun identifiant transmis** : ni identifiant publicitaire
  (`com.google.android.gms.permission.AD_ID` bloquée, `advertising-id.md`), ni
  identifiant d'appareil, ni adresse e-mail. L'app n'effectue aucun appel
  réseau : aucun identifiant ne peut partir.
- [x] **Sauvegarde système coupée** (`allowBackup: false`) : la progression ne
  part pas vers Google Drive.

## Autorisations Android

- [x] **Aucune autorisation de localisation, de micro ni de caméra** : la
  liste `permissions` d'`app.config.ts` est vide au prebuild, aucun plugin ne
  déclare `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `RECORD_AUDIO` ni
  `CAMERA`. L'exercice « écoute et répète » n'enregistre rien.
- [x] **Aucune autorisation réseau dans les builds livrés** : `INTERNET` et
  `ACCESS_NETWORK_STATE` sont bloquées (`BLOCKED_PERMISSIONS` d'`app.config.ts`,
  verrouillé par `tests/unit/app-config.test.ts` et par
  `scripts/tools/eas-release.sh`), comme `SYSTEM_ALERT_WINDOW` et le stockage
  externe.
- [ ] **À contrôler sur le premier AAB** : il ne doit rester que `VIBRATE`
  (retour haptique), `MODIFY_AUDIO_SETTINGS` (lecture audio, aucun
  enregistrement) et `td.ecolna.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`
  (niveau signature, ajoutée par androidx.core, invisible pour l'utilisateur).
  Une `FOREGROUND_SERVICE` ou `FOREGROUND_SERVICE_MEDIA_PLAYBACK` venue des
  bibliothèques media3 d'expo-audio est à bloquer dans `app.config.ts` (l'app
  ne joue rien en arrière-plan) plutôt qu'à déclarer — `bundletool dump manifest --bundle app.aab`, ou la page
  « Autorisations » de l'app dans la Play Console.

## Confidentialité, visible et accessible

- [x] **Texte de confidentialité dans l'app** : Paramètres → Confidentialité
  (derrière la porte parentale) donne les engagements en français simple,
  l'adresse de la politique complète et le contact de l'éditeur, en texte
  simple, sans lien sortant (`app/(settings)/privacy.tsx`).
- [x] **Politique de confidentialité rédigée** : éditeur, contact, RGPD, âge du
  public (6 à 8 ans), sauvegarde iCloud sur iPhone et iPad
  (`../shared/privacy-policy/index.html`).
- [ ] **Politique publiée à une URL publique** : republier `gh-pages` et
  vérifier `https://aboky2.github.io/eduForAll/` en 200 (propriétaire,
  `../shared/privacy-policy/README.md`).
- [x] **Conformité COPPA et RGPD** : aucune donnée personnelle n'est collectée
  ni transmise ; prénom et progression restent sous le contrôle de la personne
  qui détient l'appareil, qui peut tout effacer (« Réinitialiser la
  progression »).

## Ce que voit l'enfant

- [x] **Aucun lien externe**, nulle part dans l'app : aucun `WebView`, aucun
  `Linking.openURL` dans `app/` ni `src/`.
- [x] **Actions d'adulte derrière une porte parentale** : partage du résumé,
  export du diagnostic, réinitialisation, changement de classe. La porte pose
  une multiplication tirée au hasard (facteurs de 6 à 9), à écrire au clavier
  numérique, une autre après chaque erreur (`app/(parent)/gate.tsx`). Les
  écrans `(parent)` et `(settings)` renvoient à la porte tant qu'elle n'est pas
  franchie, lien profond compris, et la session se referme en arrière-plan ou
  au bout de cinq minutes (`parent-session-store.ts`).
- [x] **Contenu adapté** : éducatif, sans violence ni arme ; classification
  IARC « Non » partout (`content-rating-iarc.md`).
- [x] **Pas de fonction sociale** : ni compte, ni chat, ni contenu publié par
  d'autres utilisateurs.

## Reste au propriétaire

- [ ] Publier la politique de confidentialité et la page de support
  (`gh-pages`).
- [ ] Contrôler les autorisations du premier AAB (ci-dessus).
- [ ] Signer les déclarations dans la Play Console (titulaire du compte).
