# Limites connues

## Bloquantes pour la production (gates actives)

1. **Voix placeholder TTS** — les 821 audios sont synthétiques.
   Remplacement documenté dans `docs/audio-pipeline.md`. Gate automatique.
2. **Régression mémoire Hermes V1** — `expo-doctor` signale que React Native
   0.85.3 / Expo SDK 56 embarque une version d'Hermes affectée par une
   régression mémoire, corrigée à partir de RN 0.86.2 (Expo SDK 57). Le sujet
   compte pour ce projet : la cible est une tablette d'entrée de gamme à
   faible RAM. Monter en SDK 57 est une décision du propriétaire du projet
   (SDK 56 est aujourd'hui épinglé dans `CLAUDE.md`).
3. **Identifiants stores** — bundle id / package définitifs, comptes Apple et
   Google, identité légale de l'éditeur : à fournir par le propriétaire.

## Non bloquantes, assumées et documentées

- **Validation pédagogique** : le contenu couvre l'intégralité du programme
  officiel tchadien et cite ses pages, mais 7 décisions relèvent du jugement
  d'un enseignant et restent à valider (`docs/pedagogical-validation.md`).
- **Dérive de dépendances** : 12 paquets Expo sont en retard d'un patch ou
  d'une mineure à l'intérieur du SDK 56. Sans effet fonctionnel constaté
  (typecheck, lint, 38 tests et bundle Metro passent) ; à aligner avec
  `npx expo install --check` lors d'une prochaine passe de maintenance.
- **Illustrations** : 113 pictogrammes vectoriels originaux, interprétations
  sobres des maquettes peintes de Stitch. Les scènes riches (fond carte CP2,
  chèvres peintes) sont simplifiées.
- **Double décimètre** : le programme demande « l'utilisation du double
  décimètre » (p. 59). L'app enseigne la lecture des graduations et la
  comparaison de longueurs ; la manipulation d'une vraie règle reste un
  geste de classe qu'un écran ne remplace pas.
- **Majuscules** : le programme demande une « initiation à l'écriture des
  majuscules » (p. 26). L'app fait reconnaître et associer majuscule et
  minuscule, et fait tracer la minuscule — les gabarits de tracé des
  majuscules cursives ne sont pas encore dessinés.
- **Composition par tuiles** : appui-pour-placer plutôt que glisser-déposer
  (plus fiable pour de petites mains) ; le drag pourra être ajouté en polish.
- **« Écoute et répète »** : auto-confirmation, pas d'enregistrement ni de
  score de prononciation (choix de confidentialité assumé).
- **Bouton audio « en lecture »** : l'état visuel de pulsation s'éteint après
  ~2,5 s (pas de suivi précis de fin de lecture).
- **Écran récompenses/badges** : la table `achievements` existe, l'écran
  dédié n'est pas encore construit.
- **Multi-profils** : le schéma le supporte ; l'UI de sélection de profil
  n'est pas encore exposée.
- **Tests E2E Maestro** : flows de base fournis, à étoffer sur appareil réel.
- **Mesures de performance** : le manifeste pèse 1,5 Mo ; il n'est plus validé
  intégralement au lancement (validation par leçon, à l'ouverture — voir
  `curriculum-catalog.ts`). Les mesures on-device restent à faire sur du
  matériel bas de gamme réel.
- **Aucun appareil de test disponible** : la session de développement s'est
  faite sans simulateur iOS ni émulateur Android. La vérification a porté sur
  le typecheck, le lint, 38 tests, les validateurs de contenu et d'assets, et
  des bundles Metro complets pour les deux plateformes livrées (iOS 5,5 Mo,
  Android 5,7 Mo). **L'app n'a pas été vue tourner.**

  `app.config.ts` déclare `platforms: ['ios', 'android']`. Sans cette
  déclaration, `expo export --platform all` partait aussi sur le web —
  absent du projet — et échouait sans rien produire **tout en sortant en
  code 0** : une vérification qui passe en ne vérifiant rien.
