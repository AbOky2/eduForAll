# Sécurité

## Surface d'attaque

Volontairement minimale : aucune communication réseau, aucun compte, aucun
secret distant, aucune donnée sensible.

## Mesures

- **Données locales** : SQLite dans le sandbox de l'app ; pas de stockage en
  clair de secrets (aucun secret n'existe en V1 ; un futur PIN parent passera
  par expo-secure-store + expo-crypto, jamais en clair).
- **Parent gate** : les actions destructives (reset), le partage et les
  écrans d'information sont inaccessibles depuis le parcours enfant.
- **Validation d'entrée** : tout contenu (même bundlé) passe par Zod ; le
  prénom est borné (1–40) et contraint par CHECK SQL.
- **Logs** : ring buffer mémoire, jamais de données personnelles dans les
  messages ; l'export diagnostic est expurgé et déclenché par le parent.
- **Dépendances** : lockfile commité, `npx expo install` uniquement pour les
  natifs, gate anti-SDK tiers dans `validate:release`, `npm audit` en CI.
- **Repo** : aucun credential ; `eas.json` ne contient que des identifiants
  d'app placeholders ; credentials de signature gérés côté EAS.

## Revue périodique

À chaque release : relire les permissions générées (`npx expo prebuild` puis
AndroidManifest/Info.plist), vérifier qu'aucune permission n'est apparue via
une dépendance transitive.
