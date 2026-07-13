# Limites connues (V1 en l'état)

## Bloquantes pour la production (gates actives)

1. **Voix placeholder TTS** — les 156 audios sont synthétiques.
   Remplacement documenté dans `docs/audio-pipeline.md`. Gate automatique.
2. **Identifiants stores** — bundle id / package définitifs, comptes Apple et
   Google, identité légale de l'éditeur : à fournir par le propriétaire.

## Non bloquantes, assumées et documentées

- **Validation pédagogique** : contenu original cohérent avec la progression
  CP1/CP2 francophone, mais non validé par des enseignants tchadiens
  (`docs/pedagogical-validation.md`).
- **Illustrations** : interprétations vectorielles sobres des maquettes
  peintes de Stitch (`docs/design-decisions.md` §2). Les scènes riches
  (fond carte CP2, chèvres peintes) sont simplifiées.
- **Composition par tuiles** : appui-pour-placer plutôt que glisser-déposer
  (plus fiable pour de petites mains) ; le drag pourra être ajouté en polish.
- **« Écoute et répète »** : auto-confirmation, pas d'enregistrement ni de
  score de prononciation (choix de confidentialité assumé, brief §11.3).
- **Bouton audio « en lecture »** : l'état visuel de pulsation s'éteint après
  ~2,5 s (pas de suivi précis de fin de lecture) — amélioration possible via
  les événements de statut expo-audio.
- **Tracé de lettres** : squelettes définis pour a, b, d, e, é, i, l, m, o,
  p, q, s, t, u (toutes les lettres du contenu V1) ; lettre inconnue →
  fallback explicite non bloquant.
- **Écran récompenses/badges** : la table `achievements` existe, l'écran
  dédié n'est pas encore construit (étoiles et progression visibles partout).
- **Multi-profils** : le schéma le supporte (plusieurs `child_profiles`) ;
  l'UI de sélection de profil n'est pas encore exposée.
- **Tests E2E Maestro** : flows de base fournis, à étoffer sur appareil réel.
- **Mesures de performance** : budget défini (`docs/performance-budget.md`),
  mesures on-device à réaliser sur matériel bas de gamme réel.
