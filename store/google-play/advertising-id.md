<!-- Déclaration « Identifiant publicitaire » — Play Console → Contenu de
     l'application → Identifiant publicitaire. Obligatoire. Choix fermé,
     aucune limite de caractères. -->

# Identifiant publicitaire

## Réponse à cocher

> **Non** — l'application n'utilise pas d'identifiant publicitaire.

## La preuve, vérifiable

Une déclaration « Non » n'est pas une intention : Play lit le **manifeste
fusionné** de l'AAB. Si une bibliothèque y déclare
`com.google.android.gms.permission.AD_ID`, la déclaration est démentie par le
paquet lui-même.

| Fait | Comment le vérifier |
|---|---|
| Aucune dépendance ne déclare `AD_ID` | `grep -r "com.google.android.gms.permission.AD_ID" node_modules` — aucun résultat sur l'arbre actuel |
| Aucun SDK publicitaire, aucune régie, aucune mesure d'audience | gate automatisée de `npm run validate:release` |
| Aucun appel réseau au runtime | règle n° 1 du projet ; l'app tourne entièrement en mode avion |
| La permission est **bloquée** dans les builds livrés | `BLOCKED_PERMISSIONS` de `app.config.ts`, appliquée dès que `ECOLNA_RELEASE=1` (profils `preview`, `production`, `production-apk`) |
| Le blocage est verrouillé par un test | `tests/unit/app-config.test.ts` — « retire l'accès réseau et l'overlay système des builds livrés » |

## Pourquoi bloquer une permission qu'aucune dépendance ne demande

C'est la différence entre « c'est vrai aujourd'hui » et « ça restera vrai ».

`INTERNET` est arrivée dans le manifeste par les dépendances
(`expo-file-system`, `expo-image`), sans que personne l'écrive, et
`ACCESS_NETWORK_STATE` de la même façon (Glide, via `expo-image`). `AD_ID` peut
arriver de la même façon, à la prochaine montée de version d'une dépendance :
le manifeste fusionné la déclarerait, la déclaration « Non » deviendrait fausse,
et une déclaration fausse sur l'identifiant publicitaire dans une app du
programme **Familles** n'est pas un avertissement — c'est un retrait.

Le blocage fait tenir la promesse par la configuration plutôt que par la
vigilance, comme pour les cinq autres autorisations de `BLOCKED_PERMISSIONS`
(`INTERNET`, `ACCESS_NETWORK_STATE`, `SYSTEM_ALERT_WINDOW` et les deux
autorisations de stockage externe). Il ne coûte rien :
ECOLNA n'a aucun usage de l'identifiant publicitaire.

## Cohérence avec le reste des déclarations

| Déclaration | Valeur | Fichier |
|---|---|---|
| Publicités | Non | `app-content-declarations.md` |
| Data Safety — identifiants | aucun collecté | `data-safety.md` |
| Politique Familles | s'applique d'office (6-8 ans) ; aucune publicité | `target-audience.md`, `families-checklist.md` |
| App Privacy (Apple) — Tracking | Non | `../app-store/privacy-answers.md` |

Les quatre disent la même chose. Si l'une change, les quatre changent.
