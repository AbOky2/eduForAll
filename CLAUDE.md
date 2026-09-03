# ALIFA — Guide agent

App éducative CP1–CP2 offline-first (Tchad), **conçue pour tablette**.
Expo SDK 56, RN 0.85, TS 6 strict, expo-router, SQLite.

## Règles non négociables
- **Offline-first** : aucun appel réseau au runtime. Tout est embarqué.
- **Tablette d'abord** : toute mise en page passe par
  `src/design-system/responsive` (classes de fenêtre compact/medium/expanded,
  colonne centrée de largeur lisible, typographie mise à l'échelle,
  deux volets en paysage). Jamais de dimension en dur pensée pour un
  téléphone. L'app tourne dans les deux orientations.
- **Pas de** : Firebase/Supabase, analytics, ads, react-navigation direct
  (passer par expo-router), AsyncStorage pour la progression, `any` non
  justifié, mélange FR/EN dans l'UI (UI 100 % français).
- SQLite = source de vérité (progression) ; Zustand = état de session éphémère.
- Migrations : append-only dans `src/database/migrations/`, jamais éditer une
  migration livrée.
- Design : maquettes Stitch dans `design/stitch/` (PNG + HTML avec les valeurs
  exactes). Tokens dans `src/design-system/tokens/` — jamais de couleurs en dur.
- Textes UI : `src/localization/fr/strings.ts` uniquement.

## Contenu pédagogique — le programme officiel fait loi
La source de vérité est le programme national tchadien, encodé avec ses pages
dans `src/content/curriculum/official-program.ts` :

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> MEN / Centre National des Curricula, N'Djaména, septembre 2004.

- Les **quatre disciplines** sont celles de la grille horaire officielle
  (p. 128) : `reading`, `language`, `writing`, `math`. La dictée n'est pas une
  discipline du CP — c'est une famille d'exercices d'écriture.
- Le nombre de leçons par discipline suit le poids horaire officiel (un test
  le vérifie, tolérance ±6 points).
- Chaque leçon porte son `term`, sa `week` et un `officialReference` citant le
  contenu et sa page.
- Ne rien inventer dans `official-program.ts` : les champs `official` sont des
  citations. Les seules décisions ALIFA sont les `teachingOrder`, isolées
  exprès pour être soumises à un enseignant
  (`docs/pedagogical-validation.md`).

Généré, pas édité à la main : modifier `scripts/content/data/` puis
```bash
npx tsx scripts/generate-content.ts      # manifeste + audio + carte TTS + couverture
./scripts/generate-placeholder-audio.sh  # nouveaux sons (voix système, dev)
npm run audio:voice -- --dry-run         # voix IA définitive (docs/audio-pipeline.md)
```
Toucher au contenu = incrémenter `CONTENT_VERSION` dans
`scripts/generate-content.ts`, sinon un appareil ayant déjà importé la version
précédente ne réimportera jamais.
`src/content/manifests/curriculum-v1.json`, `audio-registry.generated.ts` et
`docs/couverture-programme.md` sont des artefacts générés.

## Vérifications avant tout commit
```bash
npm run typecheck && npm run lint && npm test && npm run validate:content
```
Release gates complètes : `npm run validate:release` (dont
`validate:bundle`, qui exporte le bundle iOS et vérifie que les 824 sons y
sont réellement — `validate:audio` ne regarde que le disque).

Parcours end-to-end : `npm run test:e2e` (Maestro, sur un build installé —
`appId` à aligner sur le profil de build utilisé).

## Pièges connus
- Zod v4 : `.default({})` ne remplit pas les défauts internes → `.prefault({})`.
- `react-test-renderer` et `react-dom` restent pinnés à la version exacte de
  `react` (19.2.3). `jest-expo@~56` (pas latest). `eslint-config-expo@~56.0.4`.
- Lint React Compiler : pas de `useRef(new Animated.Value())` →
  `useState(() => …)` ; resets d'état par remontage `key`, pas par effet.
- Le shell `say` mange stdin dans les boucles — les scripts audio passent par
  Python.
- Le manifeste pèse 1,5 Mo : il n'est **pas** validé intégralement au
  lancement. `curriculum-catalog` indexe le JSON brut et ne valide une leçon
  qu'à son ouverture ; la validation complète a lieu au build et à l'import.
- Les identifiants audio encodent les accents (`é` → `e1`) : sans cela
  « le son é » et « le son e » partageraient un enregistrement. Le générateur
  échoue sur toute collision.
