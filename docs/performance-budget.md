# Budget de performance

Cible : Android 3 Go RAM, CPU modeste, stockage lent, écran compact.

| Métrique | Budget | Mesuré (à compléter on-device) |
|---|---|---|
| Démarrage à froid → écran interactif | < 3,5 s | — |
| Bootstrap (DB + migrations + import déjà fait) | < 400 ms | — |
| Premier import de contenu (308 leçons) | < 4 s | — |
| Ouverture d'une leçon | < 500 ms | — |
| Latence bouton audio → son | < 300 ms perçu | — |
| Mémoire au repos (accueil) | < 220 Mo | — |
| Mémoire pendant une leçon | < 260 Mo | — |
| Bundle JS (Hermes .hbc) | < 6 Mo | **5,0 Mo** (expo export) |
| Audio embarqué | < 6 Mo | **1,7 Mo** (156 fichiers AAC mono 48k) |
| Export total (JS + assets) | < 15 Mo | **7,8 Mo** |
| APK preview | < 45 Mo | — |

## Leviers déjà appliqués

- Audio AAC mono 48 kbps ; illustrations = SVG compilés (pas de rasters) ;
- pas d'animations permanentes ; pulsation audio uniquement pendant lecture,
  désactivée en réduction de mouvement ;
- SQLite WAL + transactions groupées + index sur les requêtes fréquentes ;
- pas de chargement réseau ; polices locales ; listes courtes (pas besoin de
  virtualisation au-delà des ScrollView actuels).

## Procédure de mesure (à exécuter sur appareil réel)

1. Build preview (`npm run build:preview`), installer sur l'appareil cible.
2. Démarrage : `adb shell am start -W td.alifa.app.preview/.MainActivity`
   (TotalTime), 5 mesures à froid, médiane.
3. Mémoire : `adb shell dumpsys meminfo td.alifa.app.preview` au repos puis en
   leçon.
4. Reporter dans `docs/performance-report.md` et ajuster le budget si un écart
   est justifié.
