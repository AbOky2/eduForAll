# Pipeline audio

## État actuel : placeholders TTS (⚠️ bloquant release)

Les 156 fichiers de `assets/audio/fr/` sont générés par synthèse vocale
macOS (voix française, script reproductible) et marqués `placeholder: true`
dans `assets/audio/manifest.json`. **`npm run validate:release` bloque la
production tant qu'ils ne sont pas remplacés par de vraies voix.** Les
placeholders permettent de développer et tester l'app complète dès aujourd'hui.

## Chaîne reproductible

1. `scripts/generate-content.ts` produit :
   - `assets/audio/tts-map.json` — `audioId → texte français à dire` ;
   - `assets/audio/manifest.json` — liste canonique des fichiers attendus ;
   - `src/content/audio-registry.generated.ts` — `require()` statiques pour Metro.
2. `scripts/generate-placeholder-audio.sh [voix]` — `say` → `afconvert`
   (AAC mono 48 kbps, ~11 Ko/fichier, 1,7 Mo au total).
3. `npm run validate:audio` — présence, taille, orphelins.

## Remplacer par les voix définitives

1. Faire enregistrer chaque entrée de `tts-map.json` par un(e) enseignant(e)
   francophone (déjà trié par id ; textes courts, ~15 min de studio).
2. Exporter en m4a mono 48 kbps sous `assets/audio/fr/<audioId>.m4a`
   (mêmes noms de fichiers — rien d'autre à changer).
3. Passer `placeholder` à `false` dans `manifest.json` (script à venir ou
   sed) puis `npm run validate:audio && npm run validate:release`.

## Service audio

`createLearningAudioService` (expo-audio) : lecture avec remplacement (un
deuxième appui relance le son), preload validant les références en début de
leçon, `playsInSilentMode: true` (l'audio pédagogique est le cœur de l'écran),
libération à la fermeture de la session.
