import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Les quatre disciplines, en carré : langage et lecture, puis écriture et calcul. */
const SUBJECT_ROWS = [
  ['language', 'reading'],
  ['writing', 'math'],
] as const;

/**
 * L'image de l'écran : un grand disque vert très clair ; au centre, la
 * tablette (pictogramme `offline-ok`) dont l'écran montre les quatre
 * disciplines — tout y est déjà —, et la pastille de réussite posée sur son
 * coin. Les mesures de l'écran et du coin suivent le repère 256 du tracé
 * Phosphor « device-tablet » (corps 40–216 × 24–232, écran 56–200 × 72–184).
 */
function TabletArt({ size }: { size: number }) {
  const tablet = Math.round(size * 0.52);
  const at = (units: number) => Math.round((tablet * units) / 256);
  const emblem = Math.round(tablet * 0.17);
  const emblemGap = Math.round(tablet * 0.035);
  const badge = Math.round(tablet * 0.36);
  const ring = Math.max(3, Math.round(badge * 0.08));
  return (
    <View
      style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ width: tablet, height: tablet }}>
        <EcolnaIcon name="offline-ok" mode="duo" color={colors.success} size={tablet} />
        <View
          style={[
            styles.screen,
            {
              left: at(56),
              top: at(72),
              width: at(144),
              height: at(112),
              gap: emblemGap,
            },
          ]}
        >
          {SUBJECT_ROWS.map((row) => (
            <View key={row[0]} style={[styles.emblemRow, { gap: emblemGap }]}>
              {row.map((subject) => (
                <SubjectArt key={subject} subject={subject} size={emblem} />
              ))}
            </View>
          ))}
        </View>
        <View
          style={[
            styles.badge,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              padding: ring,
              // Sur le coin bas droit de la tablette.
              left: Math.round(tablet * 0.8 - badge / 2),
              top: Math.round(tablet * 0.86 - badge / 2),
            },
          ]}
        >
          <EcolnaIcon name="check" filled size={badge - ring * 2} />
        </View>
      </View>
    </View>
  );
}

/**
 * Hors connexion — direction v4. Une bonne nouvelle, pas une panne : tout
 * est déjà dans la tablette. Une composition propre, qui n'emprunte pas
 * l'orbite de l'onboarding : la tablette cochée, le titre sur deux lignes,
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
        <TabletArt size={art} />
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
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successTint,
  },
  // L'écran de la tablette : blanc, les quatre emblèmes en carré.
  screen: {
    position: 'absolute',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemRow: { flexDirection: 'row' },
  badge: { position: 'absolute', backgroundColor: colors.white },
});
