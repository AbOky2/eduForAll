# Pipeline audio

824 sons, ~23 minutes de parole, 17 000 caractères de texte français. Tout est
gravé dans le bundle : **l'app ne parle à aucun service au runtime**. La
synthèse a lieu sur la machine de build, jamais sur la tablette de l'enfant.

## État actuel : deux moteurs, un locuteur

| sons | moteur | pourquoi |
| --- | --- | --- |
| mots, consignes, indices, phrases, histoires (665) | **Kokoro** `ff_siwis` (Apache-2.0) | la voix la plus naturelle sur une phrase |
| sons isolés, syllabes, lettres, nombres (159) | **Piper** `fr_FR-siwis` (MIT) | VITS déterministe : décode exactement les phonèmes donnés, sans attaque inventée |

La voix système macOS a servi d'étape intermédiaire pour les voyelles seules ;
à l'écoute, Piper l'a emportée aussi. Elle reste disponible
(`--provider system`) mais n'est plus routée — ce qui règle au passage la
question de licence des voix Apple.

Kokoro est structurellement instable sur un énoncé d'un à trois phonèmes : il
**prépose du bruit phonémique** — « a » reconnu `iznaː`, « bai » `ʁɑ̃bɛ`,
« bou » `isdruː` (mesuré par `scripts/tools/check-phonemes.py`). Aucune
réparation n'a suffi. Piper, lui, rend `aː`, `braː` : rien devant. Le locuteur
`siwis` est le même dans les deux modèles — l'enfant n'entend qu'un timbre.

Le routage est automatique, sur la **nature** de chaque son (`kind` dans
`tts-map.json`, posée par `say.*` à la génération du contenu — jamais déduite
de l'identifiant) ; `--no-routing` envoie tout au fournisseur principal.

`assets/audio/voice-provenance.json` note quelle voix a enregistré quel son ;
c'est lui qui fait tomber le drapeau `placeholder` du manifeste, et donc la
gate `validate:release`.

La voix système macOS (`./scripts/generate-placeholder-audio.sh`) reste
disponible pour du dépannage rapide, mais elle repose le drapeau placeholder.

### Installation de la chaîne locale

```bash
python3 -m venv .venv-audio
.venv-audio/bin/pip install kokoro-onnx piper-tts soundfile
mkdir -p .cache/kokoro && cd .cache/kokoro
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd ../.. && .venv-audio/bin/python -m piper.download_voices fr_FR-siwis-medium --download-dir .cache/piper
```

### Contrôle sans oreilles

```bash
.venv-audio/bin/pip install torch transformers          # 1,3 Go, une fois
.venv-audio/bin/python scripts/tools/check-phonemes.py --only syllabe-
```

Transcrit chaque fichier en phonèmes et les met en regard des phonèmes
attendus. Imparfait sur des clips d'une demi-seconde (il confond des voyelles
proches), mais il ne rate pas du bruit ajouté devant un son, une lettre épelée
ou un mot lu à la place d'une syllabe. Outil de diagnostic, pas gate.

`.venv-audio/` et `.cache/` sont ignorés par git : ce sont des outils de build
(~510 Mo), pas du contenu livré. Comptez ~6 minutes pour les 824 sons.

## Chaîne reproductible

1. `npx tsx scripts/generate-content.ts` produit :
   - `assets/audio/tts-map.json` — `audioId → { texte à dire, nature, phonèmes imposés }` ;
   - `assets/audio/manifest.json` — liste canonique + provenance de chaque voix ;
   - `src/content/audio-registry.generated.ts` — `require()` statiques pour Metro.
2. Enregistrement (au choix) :
   - `./scripts/generate-placeholder-audio.sh` — voix système, pour développer ;
   - `npm run audio:voice` — voix IA définitive (ci-dessous) ;
   - studio — déposer les `.m4a` à la main et remplir `voice-provenance.json`.
3. `npm run validate:audio` — présence, taille, orphelins, placeholders.
4. `npm run validate:bundle` — que Metro les embarque **vraiment**. C'est une
   vérification différente : si `audio-registry.generated.ts` prend du retard
   sur le contenu, les fichiers sont toujours sur le disque, `validate:audio`
   passe, et l'app est muette sur les exercices concernés. La comparaison se
   fait par empreinte du contenu, Metro renommant chaque asset.

## Voix IA définitive

`scripts/generate-voice-audio.ts` lit `tts-map.json`, appelle le fournisseur et
écrit `assets/audio/fr/<audioId>.m4a` en AAC mono 48 kbps — même format que les
placeholders, donc rien d'autre à changer dans l'app.

```bash
npm run audio:voice -- --dry-run            # ce qui serait généré
npm run audio:voice                         # Kokoro local (défaut)
npm run audio:voice -- --only son- --force  # régénérer une famille
npx tsx scripts/generate-content.ts         # rafraîchir le manifeste
```

Deux fournisseurs hébergés restent câblés si la voix locale ne suffisait pas —
ils demandent une clé et facturent, mais le corpus ne pèse que 17 000
caractères :

```bash
ELEVENLABS_API_KEY=… npm run audio:voice -- --provider elevenlabs --voice <id>
GEMINI_API_KEY=…     npm run audio:voice -- --provider gemini --voice Kore
```

Le script **reprend où il s'est arrêté** : un son déjà enregistré n'est pas
repayé. `assets/audio/voice-provenance.json` garde `audioId → fournisseur:voix`
et c'est lui qui fait tomber le drapeau `placeholder` du manifeste.

### Profils de diction

La nature du son (`kind`) décide de la diction, parce qu'un son isolé ne se
dit pas comme une histoire :

| Préfixes | Diction |
| --- | --- |
| `son`, `syllabe`, `lettre`, `nombre`, `monnaie` | très lente, articulée — c'est le modèle que l'enfant répète |
| `mot` | lente et claire |
| `instr`, `hint`, `question`, `graphisme` | chaleureuse, encourageante, posée |
| `phrase`, `histoire` | narrative, intonation vivante |

### Les sons isolés : deux réparations automatiques

C'est le point faible de toute synthèse, et le cœur de l'apprentissage de la
lecture. Deux défauts distincts sont corrigés à la génération.

**1. La phonétisation.** espeak-ng se trompe sur un son présenté seul : il
épelle les groupes (« bl » → « bé-elle », « tr » → « té-erre »), part en
anglais sur « in » (/ɪn/), donne le nom de la lettre pour « z » (« zède ») et
confond « eu » avec « u ». 24 sons passent donc par des phonèmes imposés,
listés et justifiés dans `scripts/content/data/pronunciation.ts` — c'est du
contenu pédagogique, relu comme tel (`docs/pedagogical-validation.md` § 8), et
non un correctif enfoui dans un script.

**2. L'attaque parasite.** Sur un énoncé d'un seul phonème, Kokoro produit une
fricative avant la voyelle : « a » s'entend « za ». Le générateur mesure la
part d'énergie au-dessus de 4 kHz sur l'attaque (une voyelle propre est vers
0,005), et si elle est anormale, resynthétise le son répété — le modèle, mieux
contextualisé, ne dérape plus — pour n'en garder que la première occurrence.
La réparation n'est retenue que si elle améliore la mesure, et n'est jamais
tentée sur un son qui commence légitimement par une fricative.

Le générateur affiche son bilan : `phonèmes imposés : 14 · attaques réparées :
21 · pire attaque restante : son-un (0.355)`. Trois sons résistent (`son-un`,
`lettre-1`, `syllabe-al`) : toutes les variantes y donnent la même mesure,
c'est-à-dire que c'est le rendu du modèle et non un artefact de bord.

`--only son- --force` régénère une famille sans toucher au reste.
- Les identifiants encodent les accents (`é` → `e1`) : « le son é » et « le son
  e » sont deux enregistrements distincts, et le générateur échoue sur toute
  collision.
- Garder la même voix pour tout le corpus. Changer de voix en cours de route
  s'entend immédiatement d'un exercice à l'autre. Kokoro n'a de toute façon
  qu'une seule voix française, ce qui règle la question.
- Le texte affiché et le texte dit peuvent diverger : le programme note les
  équivalences « o = au = eau » (p. 24), ce qui est juste à l'écran mais se
  dirait « o égale au égale eau ». `say.instruction` et `say.sound` énumèrent
  à la place.

## Service audio

`createLearningAudioService` (expo-audio) : lecture avec remplacement (un
deuxième appui relance le son), preload validant les références en début de
leçon, `playsInSilentMode: true` (l'audio pédagogique est le cœur de l'écran),
libération à la fermeture de la session.
