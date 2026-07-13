# Audit d'accessibilité

## Mis en œuvre (par construction)

- **Cibles tactiles** : minimum 48 dp partout (`a11y.minTouchTarget`),
  64 dp pour les interactions principales enfant (cartes réponses, tuiles).
- **Labels** : tous les Pressable portent `accessibilityRole` +
  `accessibilityLabel` français ; états via `accessibilityState`
  (selected/disabled) ; barres de progression avec `accessibilityValue`.
- **Feedback jamais couleur-seule** : correct/incorrect = couleur + icône
  (coche/rond bleu) + texte + audio. Le rouge n'existe que dans l'espace
  parent (action destructive).
- **Réduction de mouvement** : `useReducedMotion` coupe pulsations et
  entrées animées (AccessibilityInfo.reduceMotion).
- **Tailles de texte** : `maxFontSizeMultiplier 1.4` sur AlifaText — l'échelle
  OS est respectée sans casser les glyphes pédagogiques.
- **Sans lecture** : chaque consigne a un bouton audio identique et
  reconnaissable ; l'enfant non-lecteur navigue à l'oreille.
- **Annonces** : la feuille de feedback porte `accessibilityLiveRegion`.

## Contrastes vérifiés (calcul WCAG)

| Combinaison | Ratio | Verdict |
|---|---|---|
| Encre `#161a32` sur ivoire `#F4F1DE` | ~14 : 1 | AA/AAA ✅ |
| Encre sur blanc carte | ~15 : 1 | ✅ |
| Brun texte `#5b3912` sur bouton sable `#d4a373` | ~4,9 : 1 | AA ✅ |
| Bleu `#255f80` sur `#c7e7ff` | ~5,6 : 1 | AA ✅ |
| Secondaire `#50453b` sur ivoire | ~8,6 : 1 | ✅ |
| Outline `#82756a` sur ivoire (petits textes décoratifs) | ~3,6 : 1 | réservé aux éléments non essentiels |

## À tester sur appareil (gates manuelles de release)

- [ ] TalkBack : parcours complet d'une leçon de chaque famille
- [ ] VoiceOver : idem + ordre de lecture des écrans à cartes
- [ ] Texte agrandi système au maximum
- [ ] Contraste en plein soleil (écrans bas de gamme) — luminosité mini/maxi
- [ ] Son coupé : l'app reste utilisable pour un accompagnant lecteur
