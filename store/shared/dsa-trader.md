<!-- Déclaration de statut de professionnel (« trader ») au titre du règlement
     sur les services numériques (DSA), exigée par App Store Connect et par
     Play Console pour la distribution dans l'Union européenne.
     Limites de caractères : aucune. Les coordonnées citées ici sont celles de
     store/shared/coordonnees-fiches.md. -->

# Statut de professionnel (DSA) — décision

## La question posée

Les deux consoles demandent, avant toute distribution dans l'Union européenne,
si l'éditeur agit **en qualité de professionnel** (« trader ») ou non :

- App Store Connect → *Business → Trader Status* (ou l'écran de déclaration
  affiché à la création de l'app) ;
- Play Console → *Paramètres du compte développeur → Détails du développeur →
  statut de professionnel*.

## Réponse retenue : **non-professionnel**

Issa Oki ABDRAMANE publie ECOLNA en tant que personne physique, sans activité
commerciale attachée à l'application. Les faits, tous vérifiables dans le dépôt :

- l'application est **gratuite**, sur tous les territoires
  (`store/shared/distribution.md`) ;
- **aucun achat intégré, aucun abonnement** : aucune dépendance de paiement
  n'est installée (`package.json`) et aucun écran de paiement n'existe ;
- **aucune publicité, aucune régie, aucun SDK tiers** — gate automatisée dans
  `npm run validate:release` ;
- **aucune collecte de données**, donc aucune valorisation indirecte
  (`store/app-store/privacy-answers.md`, `store/google-play/data-safety.md`) ;
- aucun service payant, aucun don, aucune version « pro » annoncée.

## Ce que la réponse change, et c'est le cœur de la décision

| Réponse | Conséquence directe |
|---|---|
| **Professionnel** | Les deux stores **publient sur chaque fiche** le nom, l'adresse postale, l'e-mail et le téléphone de l'éditeur. L'adresse affichée serait l'adresse **personnelle** du 25 rue Édouard Vaillant — visible par tout visiteur de la fiche, indexée par les moteurs de recherche. |
| **Non-professionnel** (retenu) | Ces coordonnées ne sont pas affichées sur la fiche. L'e-mail de contact reste public par ailleurs, puisque la politique de confidentialité et la page de support le portent. |

Déclarer « professionnel » pour être tranquille n'est donc pas neutre : c'est
publier son domicile. Et déclarer « professionnel » sans l'être serait une
déclaration inexacte.

## Le point à vérifier dans la console avant de soumettre

🔴 À VÉRIFIER, console en main : **les deux plateformes conditionnent la
disponibilité dans l'UE à cette déclaration**, et leurs règles ont changé
plusieurs fois depuis 2024. Lire l'écran de déclaration tel qu'il s'affiche au
moment de la soumission, et notamment ce qu'il annonce pour une réponse
« non-professionnel ».

Deux cas, et la décision est déjà prise pour chacun :

1. **La console accepte « non-professionnel » et maintient la diffusion UE** →
   répondre « non-professionnel », rien d'autre à faire.
2. **La console réserve la diffusion UE aux professionnels vérifiés** → ne pas
   requalifier l'éditeur en professionnel pour gagner la France : retirer les
   territoires de l'UE de la diffusion publique et garder le Tchad, qui est la
   cible du pilote. La France ne revient qu'avec une adresse de contact
   qui n'est pas un domicile (boîte postale, domiciliation, structure
   associative), à obtenir avant de rouvrir le sujet.

Cette décision est à prendre **avant** la soumission : une fois la fiche
publiée, un changement de statut modifie ce qui est affiché publiquement, et un
retrait de territoire se voit.

## Coordonnées qui seraient affichées en cas de déclaration « professionnel »

À ne saisir que si le cas 2 ci-dessus conduit à ce choix :

- **Nom** : Issa Oki ABDRAMANE
- **Adresse** : 25 rue Édouard Vaillant, appartement 317, 37000 Tours, France
- **E-mail** : issaokiabderamane@gmail.com
- **Téléphone** : 🔴 À FOURNIR — aucun numéro ne figure dans le dépôt. Format
  international (`+33…`). Il serait **public** sur les deux fiches, à la
  différence du téléphone d'*App Review Information* (Apple), qui reste privé.

## Trace de la décision

Statut retenu : **non-professionnel**. Reporté dans `docs/store-readiness.md`.
Toute requalification ultérieure doit être écrite ici, avec sa date et son
motif — c'est une déclaration légale, pas un réglage de console.
