<!-- Notes de version 1.0.0. COMPTE RÉEL du texte à coller : 477 caractères
     (espaces comprises, vérifié par script). Limites : Play « Notes de
     version » 500 par langue ; App Store « Nouveautés de cette version »
     4 000. Le texte tient sous la plus stricte des deux. -->

# Notes de version — ECOLNA 1.0.0

## Texte pour les stores — 477 caractères (Play 500, App Store 4 000)

<!-- début du texte à coller -->
Première version d’ECOLNA. Les deux années du CP en une seule application : 308 leçons (147 en CP1, 161 en CP2) et 1 625 exercices de langage, de lecture, d’écriture et de calcul, construits d’après le programme de l’enseignement primaire du Tchad. Chaque consigne est dite à voix haute. Tout fonctionne sans internet, dès le premier lancement. Aucune publicité, aucun achat intégré, aucun compte, aucune donnée collectée. Pensée pour la tablette, en paysage comme en portrait.
<!-- fin du texte à coller -->

Où le coller :

- **Play Console** → *Version* → *Notes de version*, balise `<fr-FR>` : 477
  caractères pour une limite de 500.
- **App Store Connect** → *Nouveautés de cette version* : pour une première
  version, la console n'affiche généralement pas ce champ ; s'il apparaît, le
  même texte convient.

Le texte ne dit ni « officiel » ni « ministère » : un champ de 500 caractères
ne porte pas la phrase d'indépendance, qui vit dans les descriptions
(`mentions-programme-officiel.md`). Ni prix ni « gratuit ».

## Ce qui est assumé dans cette version

Repris de `release-acceptances.json` — à relire avant chaque soumission.

1. **Expo SDK 56** — une régression mémoire d'Hermes est corrigée à partir du
   SDK 57. La montée de version se fera avec une tablette en main, en 1.1.0.

La voix est une synthèse locale (Kokoro et Piper, même locutrice française),
validée à l'oreille par le propriétaire ; la prononciation des sons isolés est
un point à faire relire par un enseignant (`docs/pedagogical-validation.md`
§ 8). L'accent n'est pas tchadien. Les fiches disent « dite à voix haute »,
jamais « voix humaine » ni « enregistrée par ».

## Ce qui n'est pas encore dans l'app

Rien de ceci n'est promis par les fiches ; à ne pas annoncer avant que ce soit
livré.

- **Plusieurs enfants sur un même appareil** : le schéma le permet, mais l'écran
  de choix du profil n'est pas exposé — un seul profil par appareil.
- **Changer de classe** (CP1 → CP2) après la création du profil : aucun écran
  ne le permet encore.
- **Retours dits à voix haute** : « Bravo ! », « On réessaie, tout
  doucement. » s'affichent, avec la carte verte ou bleue et le visage de
  l'enfant qui réagit, mais ne sont pas dits. Les consignes, les sons, les
  mots, les histoires et les indices, eux, le sont.
- **Tracé des majuscules cursives** : reconnaissance et association seulement.
- **Interface en arabe tchadien**.

## À dire au premier utilisateur

- L'app fonctionne dès la première ouverture, sans réseau, sans compte.
- L'espace parent (onglet « Parents ») s'ouvre en écrivant le résultat d'une
  multiplication.
- « Réinitialiser la progression » efface tout, définitivement.
