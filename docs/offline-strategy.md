# Stratégie offline

## Principe

Le parcours complet — premier lancement inclus — fonctionne en mode avion :
création de profil, leçons, audio, progression, espace parent, paramètres.

## Garanties

1. **Aucun appel réseau au runtime.** Polices en assets locaux (plugin
   expo-font), audios bundlés (registre `require()` généré), illustrations en
   SVG compilés, contenu en JSON bundlé. Aucune dépendance analytics/ads.
2. **Premier lancement** : `bootstrapApp()` ouvre SQLite, applique les
   migrations, valide le manifeste (Zod), indexe le contenu en une transaction
   idempotente, puis route vers l'onboarding. Échec → écran de récupération
   avec nouvelle tentative, données existantes préservées.
3. **Interruption/reprise** : progression écrite à chaque étape ; reprise
   exacte après kill (voir `docs/architecture.md`).
4. **Mise à jour d'app** : migrations additives + import conditionné par
   `content_versions` → la progression survit.
5. **Asset manquant/corrompu** : erreur typée `AudioAssetNotFoundError`,
   l'exercice reste utilisable visuellement (`fr.errors.audioUnavailable`).

## Vérification

- `npm run validate:content` — toute référence audio/illustration doit exister.
- `npm run validate:audio` — chaque fichier existe, taille plausible.
- Audit manuel : couper le réseau, installer, dérouler le parcours complet
  (checklist dans `docs/release-process.md`).
