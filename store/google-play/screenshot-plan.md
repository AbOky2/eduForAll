<!-- Plan des captures Play — pas un champ de console. Les plans, leur ordre
     et leurs légendes vivent dans store/screenshots/plan.json (seule source) ;
     ce fichier dit lesquels vont sur Play, pourquoi, et ce que Play exige. -->

# Plan des captures Google Play

**Huit plans sur dix** (Play en accepte 8 au plus par type d'appareil) : ceux
dont `"play": true` dans `store/screenshots/plan.json`. Les légendes ne sont
pas recopiées ici : `plan.json` est la seule source, et c'est lui que lit
`npm run store:screenshots`.

## Les huit plans retenus

| # | Plan (`id`) | Rôle dans l'histoire |
|---|---|---|
| 1 | `01-accueil` | la promesse : le CP tchadien, sans internet |
| 2 | `02-image` | la voix : écouter le mot, trouver l'image |
| 3 | `03-ecriture` | le geste : tracer la lettre du doigt |
| 4 | `04-parcours` | l'année entière, pas à pas |
| 5 | `05-lecture` | les sons et les syllabes, dits à voix haute |
| 6 | `06-calcul` | compter avec des objets familiers |
| 7 | `07-reussite` | des encouragements, jamais de pression |
| 8 | `10-parent` | l'adulte : ses progrès expliqués simplement, derrière la porte parentale |

Écartés : `08-matieres` (les quatre disciplines se lisent déjà sur
l'accueil) et `09-badges` (les badges apparaissent sur l'écran de réussite).
Les huit légendes se suffisent : aucune ne renvoie à une capture absente.

Règles Play pour les visuels de fiche, captures comprises : ni prix ni
« gratuit », ni classement ni superlatif, ni appel à l'action (« Télécharge »),
ni émoji en série. Aucune légende ne nomme le ministère ni ne dit
« officiel » (`../shared/mentions-programme-officiel.md`), aucune ne dit
« tablette » : la même légende sert au téléphone.

## Formats exigés

| Cible | Dimensions produites | Nombre |
|---|---|---|
| Téléphone | 1080 × 1920 (9:16) | 2 minimum, 8 maximum |
| Tablette 7" | 1920 × 1080, paysage (16:9) | 8 maximum — nécessaire pour la fiche tablette |
| Tablette 10" | même rendu que la 7" | 8 maximum — nécessaire pour la fiche tablette |
| Image de mise en avant | 1024 × 500, sans transparence | 1, obligatoire |
| Icône | 512 × 512 PNG | 1 |

ECOLNA vise la tablette : renseigner les deux formats tablette, sinon Play
présente la fiche comme une « application téléphone » sur les tablettes.

## Fabrication

Les captures brutes (`store/screenshots/raw/`) sont le rendu du **vrai code**
de l'app par le banc web (`scripts/web-preview/capture.cjs`, react-native-web),
profil de démonstration « Amina » (badges calculés par les règles de l'app),
aux résolutions exactes des appareils : iPhone 6,9" pour le téléphone,
tablette Android 10" paysage (2560 × 1600) pour la tablette. L'espace parent
(`10-parent`) est photographié après avoir franchi la porte, comme un parent.
Aucun pixel n'est dessiné. Le script ne fait qu'encadrer et légender :

```bash
npm run store:screenshots -- --format play-telephone
npm run store:screenshots -- --format play-tablette
```

Avant l'envoi, comparer chaque plan à un build Android installé : un écart
visible se corrige en retournant la capture, jamais en la retouchant (règles
Play sur les métadonnées trompeuses).

## Image de mise en avant

Livrée : `graphics/feature-graphic-1024x500.png`, rendue depuis
`graphics/feature-graphic-src.svg` par `npm run brand:assets`. Ses deux lignes
de texte vivent dans le SVG ; la même règle s'y applique qu'aux légendes : ni
prix, ni classement, et pas d'« officiel » sans phrase d'indépendance — or
une bannière ne peut pas la porter (voir
`../shared/mentions-programme-officiel.md`, tableau « Où elle doit
apparaître »).
