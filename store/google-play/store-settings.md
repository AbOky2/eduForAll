<!-- Play Console → « Fiche Play Store » et « Paramètres de la fiche ».
     Limites de caractères : nom 30, description courte 80, description
     complète 4 000. Les tags et la catégorie sont des listes fermées.
     Les coordonnées ne sont pas dupliquées ici : voir contact-details.md. -->

# Paramètres de la fiche Play

## Fiche principale

| Champ | Valeur | Limite |
|---|---|---|
| Nom de l'application | `ECOLNA : le CP tchadien` (23 car.) | 30 |
| Description courte | `short-description-fr.md` (76 car.) | 80 |
| Description complète | `full-description-fr.md` | 4 000 |
| Icône | `graphics/icon-512.png` | 512 × 512 |
| Image de mise en avant | `graphics/feature-graphic-1024x500.png` | 1024 × 500, sans transparence |
| Captures téléphone et tablette | `screenshots/README.md` | 2 min. téléphone |
| Vidéo promotionnelle | *aucune* | — |

Le nom et ses raisons sont dans `title-fr.md`, qui porte aussi la règle de
placement : aucune mention de prix ni de promotion dans le nom, l'icône, le nom
du développeur ou l'image de mise en avant — mais « gratuit » reste permis dans
la description, où il figure.

## Catégorisation

| Champ | Valeur |
|---|---|
| Type d'application | **Application** (pas un jeu) |
| Catégorie | **Éducation** |
| Tags | cinq, voir ci-dessous |

Catégorie **Éducation**, et pas « Jeux éducatifs » : il n'y a ni score, ni
classement, ni adversaire, ni personnage à faire progresser. Le même choix est
fait côté IARC, où la catégorie déclarée est « Référence, actualités ou
éducation » (`content-rating-iarc.md`).

### Les cinq tags

Play impose une **liste fermée** de tags, dont les intitulés évoluent et
dépendent de la catégorie choisie. Les cinq intentions retenues, par ordre de
priorité, avec l'intitulé attendu :

1. Éducation de la petite enfance / préscolaire et primaire
2. Lecture et écriture — apprentissage de la lecture
3. Mathématiques
4. Apprentissage des langues (le français comme langue d'enseignement)
5. Apprentissage hors connexion / sans connexion

🔴 À CONFIRMER dans la console : les intitulés exacts proposés dans la liste au
moment de la saisie. Choisir l'entrée la plus proche de chaque intention
ci-dessus et **ne pas prendre de tag de jeu** — un seul tag de jeu suffit à
déplacer la fiche dans un classement où ECOLNA n'a rien à faire.

## Coordonnées et politique de confidentialité

| Champ | Où est la valeur |
|---|---|
| E-mail de contact (obligatoire) | `contact-details.md` |
| Site web, téléphone | `contact-details.md` |
| Politique de confidentialité | `../shared/coordonnees-fiches.md` |

Un seul fichier porte ces chaînes, pour qu'elles ne divergent pas entre les deux
consoles et la politique de confidentialité.

## Pays, prix, public

| Sujet | Fichier |
|---|---|
| Pays et régions, gratuité | `../shared/distribution.md` |
| Public cible, programme Familles | `target-audience.md`, `families-checklist.md` |
| Déclarations de la section « Contenu de l'application » | `declarations.md` |
| Statut de professionnel (DSA) | `../shared/dsa-trader.md` |
