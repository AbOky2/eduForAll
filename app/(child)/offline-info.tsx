import { ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { ceremonyColumns } from '@/features/onboarding/presentation/ceremony-parts';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { OfflineTabletArt } from '@/design-system/illustrations/offline-tablet';
import {
  EcolnaButton,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Hors connexion — direction v4. Une bonne nouvelle, pas une panne : tout
 * est déjà dans la tablette. La même image que la dernière page de
 * l'onboarding (`OfflineTabletArt`), avec l'enfant du profil à côté de sa
 * tablette ; le titre, une phrase, et « C'est compris » (coche, comme toute
 * action soleil). La composition de l'atelier de révision : la croix en
 * haut à gauche, sur la gouttière (l'écran s'ouvre en modale) ; couché, l'image posée sur la gouttière
 * et la colonne de mots jusqu'à la gouttière de droite — sur grande
 * tablette, exactement l'image et la colonne de la page de l'onboarding
 * (`ceremonyColumns`) : même taille, même place. Debout, le même ordre,
 * centré.
 */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
  const avatarId = useActiveProfile((state) => state.profile?.avatarId);
  const { scale, isTablet, isLandscape, splitPanes, screenPadding, width, height } =
    useResponsive();
  // Côte à côte dès qu'on est couché et qu'il y a la place (téléphone compris).
  const sideBySide = isLandscape && width >= 640;
  const gap = scaled(sideBySide ? spacing.xxxl : spacing.xl, scale);
  const columns = ceremonyColumns(width, scale, screenPadding);
  // L'illustration se règle sur la largeur ET la hauteur : couché, un
  // téléphone n'a pas la place d'une image de tablette au-dessus des mots.
  // Sur grande tablette couchée, la place que lui laisse la colonne de
  // l'onboarding — la 7" comprise, qui a la hauteur de la loger.
  const art = Math.round(
    Math.min(
      splitPanes
        ? columns.left - gap - screenPadding
        : scaled(sideBySide ? 300 : isTablet ? 360 : 240, scale),
      height * (splitPanes ? 0.66 : sideBySide ? 0.56 : 0.36),
      sideBySide ? width * 0.38 : width - screenPadding * 2,
    ),
  );
  const align = sideBySide ? 'left' : 'center';

  return (
    <EcolnaScreen background="default">
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        {/* L'écran s'ouvre par-dessus (modale) : la croix, à la place du retour des écrans poussés. */}
        <EcolnaIconButton icon="close" accessibilityLabel={fr.common.close} onPress={goBack} />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingBottom: scaled(spacing.xxl, scale),
            gap,
          },
          sideBySide && styles.split,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <OfflineTabletArt size={art} {...(avatarId ? { avatarId } : {})} />
        {/* Couché, la colonne va jusqu'à la gouttière de droite : l'image part
            de celle de gauche, le titre et le bouton ont la même largeur.
            Debout, une colonne lisible, centrée. */}
        <View
          style={[
            { gap: scaled(spacing.md, scale) },
            sideBySide
              ? styles.wordsSide
              : [styles.wordsStack, { maxWidth: scaled(isTablet ? 440 : 360, scale) }],
          ]}
        >
          <EcolnaText
            variant={isTablet ? 'displayHero' : 'headlineLg'}
            align={align}
            accessibilityRole="header"
          >
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
  header: { paddingVertical: spacing.sm },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row' },
  wordsSide: { flex: 1 },
  wordsStack: { flexShrink: 1, width: '100%', alignSelf: 'center' },
  button: { alignSelf: 'stretch' },
});
