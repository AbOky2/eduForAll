# Rapport de performance

## Mesures build (12–13 juillet 2026, machine de dev)

- `expo export --platform android` : **7,8 Mo** au total, dont bundle Hermes
  **5,0 Mo** et ~2 Mo d'assets (audio + polices + icônes). Budget respecté.
- Audio : 156 fichiers, **1,7 Mo** (AAC mono 48 kbps, validate:audio).
- Suite Jest complète : ~1,2 s (domaine pur, sans natif).

## Mesures on-device

**À réaliser** sur Android 3 Go RAM réel — procédure et budget dans
`docs/performance-budget.md`. Les gates manuelles de release
(`docs/release-process.md`) exigent ces mesures avant toute production.

## Observations d'architecture

- L'import de contenu s'exécute une seule fois par `contentVersion`
  (idempotent) ; les démarrages suivants ne paient que l'ouverture SQLite et
  la validation Zod du manifeste (~milliers de nœuds, à mesurer sur device —
  si > 150 ms, memoïser via un hash du manifeste).
- Aucune image réseau, aucun spinner d'attente réseau : le chemin critique
  est purement local.
