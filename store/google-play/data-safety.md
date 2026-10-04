<!-- Play Console → Contenu de l'application → « Sécurité des données ».
     Choix fermés, aucune limite de caractères. -->

# Sécurité des données (Google Play)

## La réponse à saisir

| Question de la console | Réponse |
|---|---|
| « Votre application collecte-t-elle ou partage-t-elle certains des types de données utilisateur requis ? » | **Non** |

Le formulaire **s'arrête là** : les questions suivantes (chiffrement en
transit, suppression des données, types de données et finalités) ne sont
posées qu'aux applications qui répondent « Oui ». Il n'y a rien d'autre à
remplir, puis la section se vérifie dans l'aperçu de la fiche (« Aucune donnée
collectée », « Aucune donnée partagée avec des tiers »).

## Pourquoi « Non » est exact

- **Collecte** : au sens de Google, une donnée est collectée quand elle quitte
  l'appareil. ECOLNA n'effectue aucun appel réseau au runtime : le prénom,
  l'avatar, la classe et la progression sont enregistrés dans la base SQLite
  locale et ne sont envoyés nulle part par l'app. Ce qui reste sur l'appareil
  n'a pas à être déclaré.
- **Partage** : aucun SDK tiers, aucune publicité, aucun outil de mesure
  d'audience, aucun identifiant publicitaire (`advertising-id.md`). Les deux
  partages possibles — le résumé de progression du tableau de bord et l'export
  du diagnostic — sont déclenchés par un adulte, derrière la porte parentale,
  par la feuille de partage du système, avec un texte visible avant l'envoi :
  un transfert fait à l'initiative de l'utilisateur, vers le destinataire qu'il
  choisit, ne compte pas comme un partage à déclarer.
- **Sauvegarde** : la sauvegarde système Android est coupée
  (`allowBackup: false`), donc rien ne part non plus vers Google Drive.

## Cohérence avec le reste

| Où | Ce qui est dit |
|---|---|
| `target-audience.md` | 6–8 ans ; la politique Familles s'applique d'office |
| `families-checklist.md` | aucune collecte, aucun identifiant transmis |
| Politique de confidentialité (§ 1, § 2, § 5) | aucune donnée collectée ; partage volontaire par un adulte |
| `../app-store/privacy-answers.md` | « Data Not Collected » chez Apple |

Si une version future envoie quoi que ce soit hors de l'appareil (rapport de
plantage, synchronisation, statistiques), la réponse devient « Oui » et le
formulaire entier est à remplir **avant** la publication de cette version.
