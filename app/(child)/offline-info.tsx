import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { OfflineTabletArt } from '@/design-system/illustrations/offline-tablet';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Hors connexion — direction v4. Une bonne nouvelle, pas une panne : tout
 * est déjà dans la tablette. La même image que la dernière page de
 * l'onboarding (`OfflineTabletArt`) : la tablette cochée, le titre sur deux lignes,
 * une phrase, et « C'est compris » (coche, comme toute action soleil). En
 * paysage, l'image à gauche et la colonne de mots à droite, le bouton dans
 * cette colonne.
 */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
  const { scale, isTablet, isLandscape, screenPadding, width, height } = useResponsive();
  // Côte à côte dès qu'on est couché et qu'il y a la place (téléphone compris).
  const sideBySide = isLandscape && width >= 640;
  // L'illustration se règle sur la largeur ET la hauteur : couché, un
  // téléphone n'a pas la place d'une image de tablette au-dessus des mots.
  const art = Math.round(
    Math.min(
      scaled(sideBySide ? 320 : isTablet ? 360 : 240, scale),
      height * (sideBySide ? 0.6 : 0.36),
      sideBySide ? width * 0.38 : width - screenPadding * 2,
    ),
  );
  const align = sideBySide ? 'left' : 'center';

  return (
    <EcolnaScreen background="default">
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingVertical: scaled(spacing.lg, scale),
            gap: scaled(sideBySide ? spacing.xxxl : spacing.xl, scale),
          },
          sideBySide && styles.split,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <OfflineTabletArt size={art} />
        {/* Une colonne étroite : le titre tient en deux lignes. */}
        <View
          style={[
            styles.words,
            { gap: scaled(spacing.md, scale), maxWidth: scaled(isTablet ? 360 : 340, scale) },
            !sideBySide && styles.center,
          ]}
        >
          <EcolnaText variant={isTablet ? 'displayHero' : 'headlineLg'} align={align}>
            {fr.offline.title}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
            {fr.offline.subtitle}
          </EcolnaText>
          <EcolnaButton
            label={fr.common.understood}
            onPress={goBack}
            icon={<EcolnaIcon name="check" size={scaled(20, scale)} color={colors.onReward} />}
            style={[styles.button, { marginTop: scaled(spacing.sm, scale) }]}
          />
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row' },
  words: { flexShrink: 1, width: '100%' },
  center: { alignSelf: 'center' },
  button: { alignSelf: 'stretch' },
});
