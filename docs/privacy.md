# Confidentialité

Application destinée aux enfants (6–8 ans) : minimisation stricte.

## Ce que l'app fait

- Toutes les données restent sur l'appareil : prénom (facultatif de fait,
  40 caractères max), avatar (4 illustrations locales), niveau, progression.
- Aucune transmission réseau, d'aucune sorte, jamais.
- Le « partage de progression » parent utilise la feuille de partage du
  système avec un texte que le parent voit et choisit d'envoyer lui-même.
- L'export diagnostic (espace parent) est un texte expurgé : ni prénom, ni
  voix, ni position, ni identifiant publicitaire — uniquement des compteurs
  techniques et les derniers avertissements du logger local.

## Ce que l'app ne fait pas

Pas de : publicité, SDK tiers, analytics, tracking, fingerprinting, compte,
email, téléphone, date de naissance, géolocalisation, contacts, caméra,
photos, notifications marketing, liens externes dans l'espace enfant,
enregistrement vocal persistant (l'exercice « écoute et répète » n'enregistre
rien en V1), achat intégré, classement public.

## Permissions

Aucune permission sensible n'est demandée. Le microphone n'est pas utilisé
en V1.

## Suppression

- « Réinitialiser progression » (espace parent, double confirmation) efface
  profils + progression + réglages (cascade SQLite).
- Désinstaller l'application supprime la totalité des données.

## EAS Update

Non activé. La distribution passe par les stores uniquement ; le bundle
embarqué est autonome. Toute activation future exige un audit du flux de
données et une décision explicite du responsable produit (voir brief §18.5).
