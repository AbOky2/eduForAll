<!-- Plan des captures App Store — pas un champ de console. Les plans, leur
     ordre et leurs légendes vivent dans store/screenshots/plan.json (seule
     source) ; ce fichier dit pourquoi cet ordre et ce qu'Apple exige. -->

# Plan des captures App Store

**Dix plans, tous publiés côté Apple** (10 au plus par taille d'écran), dans
l'ordre de `store/screenshots/plan.json`. Les légendes ne sont pas recopiées
ici : `plan.json` est la seule source, et c'est lui que lit
`npm run store:screenshots`.

## L'histoire que racontent les dix plans

Les trois premières captures sont les seules visibles sans faire défiler dans
les résultats de recherche : elles portent la promesse, la voix et le geste.

| # | Plan (`id`) | Ce qu'il prouve |
|---|---|---|
| 1 | `01-accueil` | la promesse : le CP tchadien, sans internet — la leçon du jour, la révision, les quatre disciplines |
| 2 | `02-image` | la voix : l'enfant écoute le mot et touche l'image, sans savoir lire |
| 3 | `03-ecriture` | le geste : tracer la lettre du doigt, la bille montre le chemin |
| 4 | `04-parcours` | la continuité : l'année entière, semaine après semaine |
| 5 | `05-lecture` | la méthode : les sons et les syllabes, dits à voix haute |
| 6 | `06-calcul` | le calcul en images, avec des objets familiers |
| 7 | `07-reussite` | l'encouragement : étoiles et badges à la fin de la leçon, jamais de reproche |
| 8 | `08-matieres` | les quatre disciplines du programme |
| 9 | `09-badges` | le progrès personnel, sans classement entre enfants |
| 10 | `10-parent` | l'adulte : ses progrès expliqués simplement, sans compte ni internet |

Chaque légende doit rester vraie de son écran **et** de la description
(`description-fr.md`) : rien n'y est promis que la description ne prouve.
Aucune légende ne nomme le ministère ni ne dit « officiel » : un champ court
ne peut pas porter la phrase d'indépendance
(`../shared/mentions-programme-officiel.md`). Aucune ne dit « tablette » : la
même légende coiffe la capture iPhone.

## Formats exigés

| Cible | Dimensions | Nombre |
|---|---|---|
| iPhone 6,9" | 1320 × 2868 | 1 minimum, 10 maximum |
| iPad 13" | 2752 × 2064 (paysage) | **obligatoire** : `app.config.ts` déclare `supportsTablet` |

Les captures iPad sont en paysage : c'est la tenue de l'enfant, et plusieurs
écrans y passent en deux volets (parcours, profil, espace parent).

## Fabrication

Les captures brutes (`store/screenshots/raw/<id>.png` et
`<id>@tablette.png`) sont le rendu du **vrai code** de l'app par le banc web
(`scripts/web-preview/capture.cjs`, react-native-web), sur le profil de
démonstration « Amina », CP1, une douzaine de leçons terminées, aux
résolutions exactes des appareils. Aucun pixel n'est dessiné ni retouché ;
`npm run store:screenshots` ajoute seulement la légende et le cadre.

Apple demande que les captures montrent l'app en usage (règle 2.3.3). Avant
l'envoi, comparer chaque plan à un build installé : polices, ombres et
découpes peuvent différer d'un rendu web. Un écart visible se corrige en
retournant la capture, jamais en la retouchant.
