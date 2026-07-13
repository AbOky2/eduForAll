# Architecture ALIFA

## Vue d'ensemble

Feature-first, dépendances orientées vers le domaine :

```
app/ (routes)  →  features/<f>/presentation  →  application  →  domain
                                     ↘  infrastructure (SQLite, expo-audio)
```

- **domain** : logique pure, testée sans React ni natif (machine d'état de leçon,
  évaluation des réponses, scoring, moteur de révision).
- **application** : cas d'usage et read models (bootstrap, home-summary,
  record-lesson-completion, parent-dashboard) ; orchestrent domain + infrastructure.
- **infrastructure** : repositories SQLite, import de contenu, service audio.
- **presentation** : renderers d'exercices et composants d'écran.

## Données

| Donnée | Où | Pourquoi |
|---|---|---|
| Contenu pédagogique (leçons, étapes) | Manifeste JSON bundlé (`src/content/manifests/`) validé Zod au chargement | Offline, versionné, jamais muté |
| Index du contenu (titres, ordre, prérequis) | SQLite (`lessons`, `curriculum_*`) | Jointures avec la progression |
| Progression, tentatives, maîtrise, révision | SQLite | Source de vérité durable |
| Profil actif, préférences de session | Zustand | Éphémère, rechargé au bootstrap |
| Audio | Assets m4a bundlés + registre `require()` généré | Aucun fetch réseau |

L'import de contenu (`curriculum-import.ts`) est **transactionnel, idempotent**
(versionné par `content_versions`) et **non destructif** : les tables de
progression ne sont jamais touchées par une mise à jour de contenu.

## Machine d'état de leçon

Reducer pur (`lesson-machine.ts`) : `presenting → awaiting_answer →
showing_feedback → (advance | retry) → completed`, avec `showing_hint` en
détour. Les transitions illégales (double tap, réponse pendant le feedback)
sont ignorées par construction. L'écran de session ne fait que dispatcher et
persister.

## Résilience

- Interruption : l'étape atteinte est sauvegardée à chaque transition
  (`saveStepReached`) ; la reprise relit `lesson_progress.current_step_index`.
- Erreurs : hiérarchie typée (`src/core/errors`), messages enfant en français,
  détails techniques dans le logger local (export diagnostic parent).
- Contenu invalide : Zod refuse au bootstrap → écran de récupération, jamais
  d'écran blanc.
- Type d'exercice inconnu : le registry renvoie `null` → fallback explicite
  avec passage à l'étape suivante possible.

## Points d'extension

- `LearningRecommendationEngine` (révision) : implémentation V1 locale et
  déterministe (`revision-engine.ts`), interface prête pour un futur moteur
  plus riche — sans jamais bloquer l'apprentissage.
- Packs de contenu téléchargeables : le manifeste versionné et l'import
  idempotent sont la fondation ; aucun téléchargement n'existe en V1.
