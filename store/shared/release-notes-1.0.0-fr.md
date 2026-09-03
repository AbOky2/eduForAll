# Notes de version — ALIFA 1.0.0

## Texte pour les stores (≤ 500 caractères)

Première version d'ALIFA. L'année scolaire complète du CP1 et du CP2, calquée
sur le programme officiel de l'enseignement primaire tchadien : langage,
lecture, écriture et calcul. 308 leçons, 1 625 exercices, tout hors connexion.
Optimisée pour tablette. Aucune publicité, aucun compte, aucune donnée
collectée. Toutes les consignes sont lues à voix haute, et le calcul se fait
avec des objets familiers — chèvres, mangues, calebasses.

## Ce qui est assumé dans cette version

Repris de `release-acceptances.json` — à relire avant chaque soumission.

1. **Expo SDK 56** — une régression mémoire d'Hermes est corrigée à partir du
   SDK 57. La montée de version se fera avec une tablette en main, en 1.1.0.

La voix est une synthèse locale (Kokoro et Piper, même locutrice française),
validée à l'oreille par le propriétaire ; la prononciation des sons isolés est
un point à faire relire par un enseignant (`docs/pedagogical-validation.md`
§ 8). L'accent n'est pas tchadien.

## Ce qui n'est pas encore dans l'app

- Sélection entre plusieurs profils enfants sur un même appareil
- Tracé des majuscules cursives (reconnaissance et association seulement)
- Interface en arabe tchadien

## À dire au premier utilisateur

- L'app fonctionne dès la première ouverture, sans réseau, sans compte.
- L'espace parent est protégé par une question de multiplication.
- « Réinitialiser progression » efface tout, définitivement.
