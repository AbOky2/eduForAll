<!-- INDEX de la section « Contenu de l'application » de Play Console.
     Une ligne par déclaration exigée avant publication : la réponse en un mot,
     et le fichier qui la détaille avec son motif. Aucune valeur n'est dupliquée
     ici — pour modifier une réponse, modifier le fichier cité.
     Aucune limite de caractères : la section n'est faite que de choix fermés. -->

# Contenu de l'application — état des déclarations

Play refuse de publier tant qu'une seule de ces lignes reste ouverte. Le
tableau sert à vérifier la section d'un coup d'œil, console ouverte.

| Déclaration | Réponse | Détail et motif |
|---|---|---|
| Politique de confidentialité | `https://aboky2.github.io/eduForAll/` | `../shared/coordonnees-fiches.md` |
| **Accès à l'application** | Toutes les fonctionnalités sont disponibles sans accès spécial | `app-access.md` |
| Publicités | Non, l'app ne contient pas de publicité | `app-content-declarations.md` |
| Classification du contenu (IARC) | Référence, actualités ou éducation — « Non » partout ; PEGI 3 attendu | `content-rating-iarc.md` |
| Public cible et contenu | 6–8 ans ; programme Familles | `target-audience.md`, `families-checklist.md` |
| Sécurité des données (Data Safety) | Aucune collecte, aucun partage | `data-safety.md` |
| Applications d'actualités | Non | `app-content-declarations.md` |
| Applications gouvernementales | Non | `app-content-declarations.md` |
| Fonctionnalités financières | Non | `app-content-declarations.md` |
| Applications de santé | Non | `app-content-declarations.md` |
| COVID-19 (traçage, informations) | Non | `app-content-declarations.md` |
| Identifiant publicitaire | Non utilisé ; permission bloquée dans les builds livrés | `advertising-id.md` |
| Suppression du compte | Sans objet — l'app ne permet pas de créer de compte | ci-dessous |

## « Accès à l'application » : à écrire noir sur blanc

C'est la ligne qui fait perdre le plus de temps si elle est laissée vague. Un
examinateur voit la question de multiplication de l'espace parent et cherche un
compte de test. Il n'y en a pas : aucun compte, aucun identifiant, aucun code,
et aucun contenu pédagogique n'est derrière quoi que ce soit. La justification à
coller est dans `app-access.md`, et la même phrase figure dans les notes de
revue Apple.

## « Suppression du compte » : sans objet, mais pas sans réponse

ECOLNA ne permet pas de créer un compte : ni e-mail, ni mot de passe, ni
identifiant, ni serveur. Il n'y a donc aucun compte à supprimer, et aucune URL
de suppression à fournir.

Ce qui existe, et qui répond à l'intention de la question : l'action
**« Réinitialiser progression »** de l'espace parent efface la totalité des
données enregistrées — prénom, avatar, niveau, progression — dans la base SQLite
locale. Désinstaller l'app produit le même effet, et il n'existe aucune copie
ailleurs : la sauvegarde système Android est désactivée (`allowBackup: false`)
et l'app n'effectue aucun appel réseau. C'est aussi ce que déclare
`data-safety.md` et ce qu'écrit la politique de confidentialité (§7).

## Ce qui reste bloquant côté Play

| Manque | Fichier |
|---|---|
| 🔴 Captures : 2 minimum sur téléphone, plus les deux formats tablette | `screenshots/README.md` |
| 🔴 Publication de la politique de confidentialité et de la page de support sur `gh-pages` | `../shared/privacy-policy/README.md` |
| 🔴 Déclaration de statut de professionnel (DSA) à saisir dans la console | `../shared/dsa-trader.md` |

Tout le reste de la section est renseigné par les fichiers cités.
