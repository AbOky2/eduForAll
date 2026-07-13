# Ajouter une leçon

Le contenu vit dans le générateur `scripts/generate-content.ts` — jamais
édité directement dans le JSON généré.

## Étapes

1. **Localiser le monde** dans `buildCp1()` ou `buildCp2()`.
2. **Écrire la leçon** avec les builders existants :

```ts
lesson({
  id: 'cp1-mots-animaux',              // stable, jamais réutilisé
  title: 'Les animaux',
  shortDescription: 'Lire les noms des animaux du village.',
  learningObjectives: ['Lire chat, chèvre, mouton'],
  skills: [skillReading('mots-animaux')],
  estimatedDurationMinutes: 6,
  prerequisiteLessonIds: ['cp1-mots-revision'],
  steps: [
    imageMcqStep('cp1-mots-animaux', [skillReading('mots-animaux')], 'chat', ['mouton', 'moto']),
    composeWordStep('cp1-mots-animaux', [skillReading('mots-animaux')], 'chat', ['cha', 't'], ['ma']),
    // 3 à 10 étapes (schéma Zod)
  ],
}),
```

3. **Ajouter la leçon au monde** (tableau `world3`, etc.) — l'ordre du tableau
   est l'ordre pédagogique.
4. **Régénérer** :

```bash
npx tsx scripts/generate-content.ts        # manifeste + registre audio + tts-map
./scripts/generate-placeholder-audio.sh    # nouveaux sons (placeholders)
npm run validate:content && npm test
```

## Règles

- Les ids (`lesson`, `step`, `skill`, `audio`) sont stables : ne jamais les
  renommer après livraison (la progression des enfants y est attachée).
- Chaque mot d'un `imageMcqStep` doit avoir un pictogramme dans
  `WORD_ICONS` (générateur) **et** dans `object-icons.tsx` (`validate:assets`
  vérifie la correspondance).
- Texte enfant : français simple, bienveillant, sans anglicisme.
- Un nouveau son = une entrée `tts-map.json` automatique → prévoir son
  enregistrement réel avant release (docs/audio-pipeline.md).
