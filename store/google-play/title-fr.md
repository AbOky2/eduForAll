<!-- Champ « Nom de l'application » de la fiche Play — 30 CARACTÈRES MAXIMUM,
     espaces compris. COMPTE RÉEL du titre retenu : 23 sur 30 (vérifié par
     script, espace insécable devant les deux-points). Play compte les caractères, pas les mots, et tronque sans
     prévenir. Interdits dans ce champ : prix, promotion, classement, superlatif
     et émoji. -->

# Titre de la fiche Play

## Titre retenu

```
ECOLNA : le CP tchadien
```

**23 caractères sur 30.**

## Pourquoi pas « ECOLNA » seul

« ECOLNA » occupe 6 caractères sur 30 dans le champ que la recherche Play
pondère le plus, pour une marque que personne ne connaît encore. Un parent
tchadien ne cherche pas « ECOLNA » : il cherche « CP », « lecture », « calcul ».
Les 24 caractères restants sont de la visibilité qu'on laisse sur la table.

Le titre retenu ajoute deux termes réellement tapés — « CP » et « tchadien » —
sans rien promettre de faux : l'app couvre bien les deux années du cours
préparatoire tchadien, programme officiel à l'appui.

## Pourquoi il diffère du nom App Store

Côté Apple, le nom retenu est `ECOLNA : lire, écrire, compter`
(`../app-store/app-information.md`). La divergence est voulue, pas un oubli :
chaque store indexe d'autres champs à côté du nom.

| Store | Le nom ajoute | Parce que l'autre champ porte déjà |
|---|---|---|
| Play | « CP », « tchadien » | la description courte dit déjà « Lire, écrire, compter au CP » |
| App Store | « lire », « écrire », « compter » | le sous-titre dit déjà « Le CP tchadien, sans internet » |

Les deux commencent par la marque : c'est elle qu'on construit. Et le nom
affiché **sur l'appareil** reste « ECOLNA » dans les deux cas — il vient de
`app.config.ts`, pas de la fiche. Ne pas aligner `app.config.ts` sur le titre
de la fiche.

## Interdit dans ce champ

Play proscrit, dans le **titre**, l'**icône**, le **nom du développeur** et
l'**image de mise en avant** :

- toute mention de prix ou de gratuité — « Gratuit », « 0 F », « offert » ;
- toute promotion — « promo », « réduction », « nouveau » ;
- tout classement ou superlatif — « N° 1 », « meilleur », « top » ;
- les émoji, les caractères décoratifs, les majuscules intégrales de style
  publicitaire.

Les descriptions d'ECOLNA vont plus loin que la règle : elles ne parlent pas
de prix du tout (`full-description-fr.md`). La console affiche le prix d'elle-
même, et le programme Familles regarde de près toute mention de prix ou de
promotion. « Aucun achat intégré, aucun abonnement » dit l'essentiel sans
tarif.

## Repli

Si le propriétaire préfère la marque nue : `ECOLNA` (6 caractères). Le titre se
modifie après publication sans nouveau binaire — mais chaque changement remet
en jeu le référencement acquis, donc mieux vaut trancher avant la mise en ligne.

Autres candidats mesurés, si la formulation doit changer :

| Candidat | Caractères |
|---|---|
| `ECOLNA : le CP du Tchad` | 23 |
| `ECOLNA — le CP tchadien` | 23 |
| `ECOLNA : lire, écrire, compter` | 30 |
