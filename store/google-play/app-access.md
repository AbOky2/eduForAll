<!-- Déclaration « Accès à l'application » — Play Console → Contenu de
     l'application → Accès à l'app. Obligatoire avant toute publication.
     Le champ de justification est un texte libre ; Play ne documente pas de
     limite stricte, le bloc ci-dessous fait 592 caractères (compté
     par script le 4 octobre 2026), ce qui tient partout. -->

# Accès à l'application

| Champ | Compte réel | Limite |
|---|---|---|
| Justification | 592 | non documentée |

## Réponse à cocher

> **Toutes les fonctionnalités sont disponibles sans accès spécial.**

Pas d'identifiants à fournir, pas d'instructions de connexion, aucun compte de
test à créer pour l'équipe d'examen.

## Justification à recopier dans la console

```
ECOLNA ne comporte ni compte, ni identifiant, ni mot de passe, ni code d’accès, ni abonnement : les 308 leçons et les 1 625 exercices sont accessibles dès l’installation, hors connexion. L’espace parent est protégé par une multiplication tirée au hasard, à écrire au clavier, destinée à écarter un enfant de 6 à 8 ans. Ce n’est pas un identifiant : il n’y a rien à créer, rien à retenir, rien à récupérer, et cette question ne restreint aucun contenu pédagogique. Elle ne garde que le suivi des progrès, les paramètres (son, classe, diagnostic), le partage d’un résumé et la réinitialisation.
```

## Pourquoi cette précision est nécessaire

Un examinateur **va voir** le contrôle d'accès adulte, et un écran qui demande
une réponse avant d'ouvrir une section ressemble à une restriction d'accès. S'il
le prend pour tel sans explication, il cherche des identifiants de test, ne les
trouve pas, et la version revient en attente — pour un malentendu.

Le dire ici évite l'aller-retour. La même phrase figure dans les notes de revue
Apple, pour la même raison (`../app-store/review-notes-fr.md`, champ
*Sign-in required* : **non**).

## Ce que la réponse engage

Elle doit rester vraie : si une version future introduit un code parental, un
compte ou un déverrouillage payant, cette déclaration doit être reprise **avant**
la publication de cette version.

À noter, et c'est un sujet distinct : la porte parentale a été durcie. Le
résultat se saisit au clavier numérique, sans réponse affichée ; l'opération
est tirée au hasard à chaque ouverture (deux facteurs de 6 à 9) et change
après chaque erreur ; les écrans de l'espace parent et des paramètres
renvoient à la porte tant qu'elle n'est pas franchie, lien profond compris
(`app/(parent)/gate.tsx`, `parent-session-store.ts`). Cela ne change pas la
réponse ci-dessus : une question de multiplication, même robuste, n'est
toujours pas un identifiant.
