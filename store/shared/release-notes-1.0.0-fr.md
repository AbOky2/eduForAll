# Notes de version — ALIFA 1.0.0

## Texte pour les stores (≤ 500 caractères)

Première version d'ALIFA. L'année scolaire complète du CP1 et du CP2, calquée
sur le programme officiel de l'enseignement primaire tchadien : langage,
lecture, écriture et calcul. 308 leçons, 1 625 exercices, tout hors connexion.
Optimisée pour tablette. Aucune publicité, aucun compte, aucune donnée
collectée.

Les consignes sont pour l'instant lues par une voix de synthèse ; des
enregistrements réalisés par un enseignant les remplaceront dans la prochaine
mise à jour.

## Ce qui est assumé dans cette version

Repris de `release-acceptances.json` — à relire avant chaque soumission.

1. **Voix de synthèse** — les 820 consignes sont générées en TTS. Elles sont
   compréhensibles, mais ce n'est pas une voix humaine, et l'accent n'est pas
   tchadien. Remplacement prévu en 1.1.0.
2. **Expo SDK 56** — une régression mémoire d'Hermes est corrigée à partir du
   SDK 57. La montée de version se fera avec une tablette en main, en 1.1.0.

## Ce qui n'est pas encore dans l'app

- Écran de récompenses et badges (la progression reste visible partout)
- Sélection entre plusieurs profils enfants sur un même appareil
- Tracé des majuscules cursives (reconnaissance et association seulement)
- Interface en arabe tchadien

## À dire au premier utilisateur

- L'app fonctionne dès la première ouverture, sans réseau, sans compte.
- L'espace parent est protégé par une question de multiplication.
- « Réinitialiser progression » efface tout, définitivement.
