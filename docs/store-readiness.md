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
- **Orientation libre** et mises en page adaptatives — l'app déclare
  `supportsTablet` et se tient dans les deux sens.
- Permissions : **aucune**. Ni micro, ni caméra, ni position, ni contacts.
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
| Compte Google Play Console (25 $, vérification d'identité) | Play Console | oui |
| Compte Apple Developer (99 $/an) | App Store Connect | oui |
| Identité légale de l'éditeur : nom, adresse, e-mail | politique de confidentialité + fiches | oui |
| URL publique de la politique de confidentialité | les deux fiches | oui |
| Captures d'écran depuis un vrai build (9 plans, formats tablette compris) | les deux fiches | oui |
| `appleId`, `ascAppId`, `appleTeamId` | `eas.json` → `submit.production.ios` | oui, côté iOS |
| URL ou e-mail de support | les deux fiches | oui |
| Voix françaises enregistrées (820 fichiers) | gate release, levée en 1.1.0 | non pour la v1 |

> Le choix compte-particulier / compte-organisation côté Google a une
> conséquence directe : un compte particulier récent doit passer par un test
> fermé de 12 testeurs pendant 14 jours avant la production. Voir
> `docs/deploiement-v1.md` §0.

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
