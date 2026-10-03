/**
 * Les polices embarquées, chargées au démarrage depuis le bundle (hors-ligne,
 * aucun appel réseau) : Ecolna Sans (Figtree au « a » scolaire) porte
 * l'interface, Andika les lettres que
 * l'enfant apprend à lire. Les noms sont ceux qu'utilisent les jetons de
 * typographie et le plugin `expo-font` d'`app.config.ts`.
 */
export const FONT_ASSETS = {
  'EcolnaSans-Regular': require('../../../assets/fonts/EcolnaSans-Regular.ttf'),
  'EcolnaSans-Medium': require('../../../assets/fonts/EcolnaSans-Medium.ttf'),
  'EcolnaSans-SemiBold': require('../../../assets/fonts/EcolnaSans-SemiBold.ttf'),
  'EcolnaSans-Bold': require('../../../assets/fonts/EcolnaSans-Bold.ttf'),
  'EcolnaSans-ExtraBold': require('../../../assets/fonts/EcolnaSans-ExtraBold.ttf'),
  'Andika-Regular': require('../../../assets/fonts/Andika-Regular.ttf'),
  'Andika-Bold': require('../../../assets/fonts/Andika-Bold.ttf'),
} as const;
