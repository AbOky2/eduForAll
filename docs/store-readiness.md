# Préparation stores

Cible v1.0.0 : **Google Play et App Store**, identifiant `td.alifa.app`.
La marche à suivre pas à pas est dans **`docs/deploiement-v1.md`** ; ce
document dit seulement ce qui est prêt et ce qui manque.

## Prêt côté technique

- Profils EAS : `preview` (APK interne), `production` (AAB + IPA,
  autoIncrement), `production-apk` (APK signé de production).
- Configuration de soumission : Play sur la piste **test interne** en statut
  brouillon ; iOS à compléter avec les trois identifiants Apple.
- Icônes 1024×1024 (app, adaptive foreground, monochrome) et splash.
- **Téléphone et tablette**, la tablette en priorité : orientation libre,
  mises en page adaptatives, `supportsTablet` côté iOS, et une activité
  Android qui absorbe les changements d'orientation et de taille sans être
  recréée — une rotation en pleine leçon ne perd rien.
- **Aucune permission dans les builds livrés.** React Native déclare par
  défaut `INTERNET` (pour joindre Metro) et `SYSTEM_ALERT_WINDOW` (overlay du
  menu dev) : les deux sont retirées des profils `preview` et `production`,
  avec les permissions de stockage externe. Seule `VIBRATE` subsiste, pour le
  retour haptique de fin d'exercice. Une app pour enfants qui promet de ne
  jamais accéder au réseau ne peut pas afficher « Accès Internet complet »
  dans la liste des autorisations du Play Store.
- **`allowBackup="false"`** : la progression de l'enfant ne part pas dans la
  sauvegarde Google Drive. La politique de confidentialité affirme que les
  données ne quittent jamais l'appareil ; ce serait faux autrement.
- Ni micro, ni caméra, ni position, ni contacts.
- Aucun SDK publicitaire ou analytique (gate automatisée).
- Aucun lien sortant. Les deux seuls partages passent par la feuille système
  et sont derrière le contrôle d'accès adulte — condition des catégories
  Enfants (Apple) et Familles (Google).
- Métadonnées rédigées dans `store/` : descriptions, mots-clés, réponses
  privacy, plans de captures, notes de revue, notes de version 1.0.0.
- Politique de confidentialité **prête à héberger**
  (`store/shared/privacy-policy/`), page autonome, sans dépendance.

## À fournir par le propriétaire

| Élément | Où l'utiliser | Bloquant |
|---|---|---|
| Identité légale de l'éditeur : nom, adresse, e-mail | politique de confidentialité + fiches | oui |
| URL publique de la politique de confidentialité | les deux fiches | oui |
| Captures d'écran depuis un vrai build : **tablette et téléphone**, 9 plans | les deux fiches | oui |
| `appleId`, `ascAppId`, `appleTeamId` | `eas.json` → `submit.production.ios` | oui, côté iOS |
| URL ou e-mail de support | les deux fiches | oui |

> Les comptes Play Console et Apple Developer sont déjà ouverts, et une
> application a déjà été publiée depuis ce compte Play : la règle du test
> fermé de 12 testeurs pendant 14 jours, qui ne vise que les comptes
> particuliers récents n'ayant jamais publié, ne s'applique pas.

## Questionnaires (réponses préparées dans store/)

- **Apple « App Privacy »** : aucune donnée collectée — tout est local.
  (`store/app-store/privacy-answers.md`)
- **Play « Data Safety »** : aucune collecte, aucun partage, suppression avec
  l'app. (`store/google-play/data-safety.md`)
- **Public cible** : 6–8 ans → programme Familles, exigences couvertes.
  (`store/google-play/families-checklist.md`)
- **Classification du contenu** : Éducation, aucun contenu sensible.
  (`store/app-store/age-rating.md`)
- **Publicités** : déclarer « Non » sur les deux plateformes.
