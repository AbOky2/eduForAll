<!-- Territoires de diffusion et prix, pour Play Console → « Pays et régions »
     et App Store Connect → « Prix et disponibilité ».
     Limites de caractères : aucune (champs de sélection, pas de texte). -->

# Diffusion et prix

## Prix : gratuit, partout

- **Gratuit** sur tous les territoires retenus. Côté Apple : grille de prix
  *Gratuit*. Côté Play : application *gratuite* — un choix structurant, Play
  n'autorisant pas une app publiée gratuite à devenir payante ensuite. Sans
  objet pour ECOLNA, qui est gratuite par principe ; à relire dans la console
  si un modèle payant était un jour envisagé.
- **Aucun achat intégré, aucun abonnement.** Aucune dépendance de paiement
  n'est installée (`package.json`), aucun écran de paiement n'existe.
- Conséquence à ne pas oublier : « Gratuit » est interdit dans le **titre** et
  l'**icône** côté Play (`store/google-play/title-fr.md`). La gratuité
  s'annonce dans la description, pas dans le nom.

## Territoires retenus

| Territoire | Pourquoi | Statut |
|---|---|---|
| **Tchad** | cible du produit : le contenu suit le programme national tchadien, et le pilote se déroule sur place | retenu |
| **France** | pays de l'éditeur : essais sur appareils réels, démonstrations, proches testeurs | retenu, sous réserve DSA (ci-dessous) |

🔴 À DÉCIDER : toute extension au-delà de ces deux pays. Le contenu étant
indexé sur le programme tchadien, une diffusion mondiale n'apporte pas de
public mais ajoute des obligations (territoires avec des règles propres sur les
apps pour enfants). L'extension naturelle, après le pilote, serait les pays
francophones voisins — décision à prendre avec des retours réels, pas avant.

🔴 À VÉRIFIER d'un coup d'œil dans chaque console : que le **Tchad** figure
bien dans la liste des territoires proposés, sur les deux plateformes, avant de
compter sur une diffusion par les stores.

## La France dépend de la déclaration DSA

La France est dans l'Union européenne : sa diffusion dépend de la déclaration
de statut de professionnel (`store/shared/dsa-trader.md`, réponse retenue :
**non-professionnel**). Si une console réserve la diffusion UE aux
professionnels vérifiés, la décision déjà prise est de **retirer les
territoires de l'UE** plutôt que de publier une adresse personnelle, et de
garder le Tchad.

Dans ce cas, les essais en France passent par les canaux de test, qui ne sont
pas une diffusion publique : TestFlight côté Apple, piste de **test interne**
côté Play. 🔴 À VÉRIFIER dans la console : qu'un testeur interne reçoit bien
l'app même si son pays n'est pas dans les territoires de diffusion.

## Le pilote ne passe pas par la diffusion publique

Les 5 à 10 tablettes du pilote s'installent **depuis le Play Store, via le lien
de test interne** — jamais par un APK copié à la main. Un APK signé par EAS ne
peut pas être mis à jour par celui de Play : il faudrait désinstaller, et toute
la progression des enfants serait perdue (`docs/deploiement-v1.md` §3).

La diffusion publique et le pilote sont donc deux sujets distincts : le pilote
peut démarrer avant que les territoires publics soient tranchés.
