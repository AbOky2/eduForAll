# ALIFA — Guide agent

App éducative CP1–CP2 offline-first (Tchad). Expo SDK 56, RN 0.85, TS 6 strict, expo-router, SQLite.

## Règles non négociables
- **Offline-first** : aucun appel réseau au runtime. Tout est embarqué.
- **Pas de** : Firebase/Supabase, analytics, ads, react-navigation direct (passer par expo-router), AsyncStorage pour la progression, `any` non justifié, mélange FR/EN dans l'UI (UI 100 % français).
- SQLite = source de vérité (progression) ; Zustand = état de session éphémère uniquement.
- Migrations : append-only dans `src/database/migrations/`, jamais éditer une migration livrée.
- Design : maquettes Stitch dans `design/stitch/` (PNG + HTML avec les valeurs exactes). Tokens dans `src/design-system/tokens/` — jamais de couleurs en dur dans les écrans.
- Textes UI : `src/localization/fr/strings.ts` uniquement.

## Contenu pédagogique
Généré, pas édité à la main : modifier `scripts/generate-content.ts` puis
`npx tsx scripts/generate-content.ts` (régénère manifeste + registre audio + carte TTS),
puis `./scripts/generate-placeholder-audio.sh` pour les nouveaux sons.
`src/content/manifests/curriculum-v1.json` et `audio-registry.generated.ts` sont des artefacts générés.

## Vérifications avant tout commit
```bash
npm run typecheck && npm run lint && npm test && npm run validate:content
```
Release gates complètes : `npm run validate:release` (bloquée tant que les 156 audios sont des placeholders TTS).

## Pièges connus
- Zod v4 : `.default({})` ne remplit pas les défauts internes → utiliser `.prefault({})`.
- `react-test-renderer` et `react-dom` doivent rester pinnés à la version exacte de `react` (19.2.3).
- `jest-expo@~56` (pas latest). `eslint-config-expo@~56.0.4`.
- Lint React Compiler : pas de `useRef(new Animated.Value())`→ `useState(() => …)` ; resets d'état par remontage `key`, pas par effet.
- Le shell `say` mange stdin dans les boucles — les scripts audio passent par Python.
