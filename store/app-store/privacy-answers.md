<!-- App Store Connect → l'app → « Confidentialité de l'app » (App Privacy).
     Choix fermés, aucune limite de caractères. Libellés relevés le
     4 octobre 2026 dans l'aide d'App Store Connect (« Manage app privacy ») et
     sur la page « App privacy details » d'Apple. -->

# Confidentialité de l'app (App Privacy) — App Store Connect

## La réponse à saisir

App Store Connect → *Confidentialité de l'app* → *Commencer*. La fenêtre pose
une seule question :

| Question de la console | Réponse |
|---|---|
| « Collectez-vous, vous ou vos partenaires tiers, des données à partir de cette app ? » (en anglais : *Do you or your third-party partners collect data from this app?*) | **« Non, nous ne collectons pas de données à partir de cette app »** (*No, we do not collect data from this app*) |

Puis *Enregistrer* : Apple ne pose **aucune autre question**. La fiche affiche
alors « Données non collectées » (*Data Not Collected*). Le libellé français de
la console peut différer d'un mot : c'est le choix « Non » qu'il faut cocher.

## Pourquoi « Non » est exact

Apple définit la collecte comme la transmission de données **hors de
l'appareil**, d'une façon qui permet à l'éditeur ou à ses partenaires tiers d'y
accéder au-delà du temps nécessaire pour traiter la requête. Les partenaires
tiers sont les outils d'analyse, régies publicitaires et SDK tiers intégrés à
l'app.

| Catégorie Apple | Réponse | Pourquoi |
|---|---|---|
| Contact Info, Identifiers, Location | Non collecté | Aucun compte, aucun réseau, aucune autorisation de localisation |
| Health & Fitness, Financial Info, Browsing History, Search History | Non collecté | — |
| User Content | Non collecté | Prénom, avatar, classe et progression restent dans la base SQLite locale ; l'app ne les transmet jamais |
| Usage Data, Diagnostics | Non collecté | Aucun outil d'analyse ; le diagnostic est exporté volontairement par le parent, par la feuille de partage du système, vers le destinataire qu'il choisit — l'éditeur n'en reçoit rien |
| Tracking | Non | Aucun suivi, aucun SDK tiers, aucun identifiant publicitaire |

**La sauvegarde iCloud de l'appareil** n'est pas une collecte : c'est iOS qui
copie, si le propriétaire l'a activée, les données des apps dans **son**
compte iCloud ; ECOLNA n'y a pas accès. La politique de confidentialité le dit
en clair (§ 2 et § 7), sans que la réponse ci-dessus change.

## Catégorie Enfants

Décidée (`age-rating.md` § 1) : app éducative pour les 6–8 ans ; **aucun lien
externe dans l'app** ; **partages système derrière la porte parentale** (le
résumé de progression du tableau de bord et l'export du diagnostic, ouverts
par la feuille de partage du système après une multiplication tirée au
hasard) ; aucune publicité ; aucun SDK tiers.

Si une version future envoie quoi que ce soit hors de l'appareil (rapport de
plantage, synchronisation, statistiques), la réponse devient « Oui » et chaque
type de données est à déclarer **avant** la soumission de cette version.
