import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing } from '../tokens';

interface LessonHeroCardProps {
  subject: SubjectArtId | null;
  /** Le contexte, au-dessus du titre : « Lecture · Les voyelles ». */
  eyebrow: string;
  /** Le vrai nom de la leçon. */
  title: string;
  /** « 6 activités · 5 min ». */
  meta: string;
  /** « Commencer » ou « Continuer ». */
  action: string;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * « Aujourd'hui » — la carte du jour (direction v4) : la plus grande chose de
 * l'accueil, sur la nuit du Sahel, où l'or du bouton chante. Le titre est le
 * vrai nom de la leçon, le contexte passe au-dessus en petit. À droite,
 * l'emblème de la discipline, posé sur des cercles concentriques à peine
 * visibles — le dessin d'une vannerie vue de dessus. Toute la carte se touche.
 */
export function LessonHeroCard({
  subject,
  eyebrow,
  title,
  meta,
  action,
  onPress,
  accessibilityLabel,
}: LessonHeroCardProps) {
  const { scale, isTablet, isLandscape, height } = useResponsive();
  // Couchée, la carte se fait plus basse : la hauteur manque, pas la largeur.
  const compact = !isTablet || isLandscape;
  const art = scaled(isTablet ? (isLandscape ? (height < 700 ? 76 : 92) : 112) : 76, scale);
  const pad = scaled(isTablet && !isLandscape ? spacing.xl : spacing.lg, scale);
  // Deux cercles autour de l'emblème, qui tiennent dans la carte sans rognage.
  const ringBox = Math.round(art + pad * 1.6);

  return (
    <EcolnaGalet
      face={colors.night}
      radius={radius.xxl}
      shadow={shadows.raised}
      haptic="light"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      faceStyle={[styles.face, { padding: pad, gap: pad, minHeight: scaled(compact ? (height < 700 ? 140 : 168) : 200, scale) }]}
    >
      <View style={styles.text}>
        <EcolnaText variant="labelMd" color={colors.onColorSoft} numberOfLines={1}>
          {eyebrow}
        </EcolnaText>
        <EcolnaText variant={isTablet ? 'headlineLg' : 'headlineMd'} color={colors.white} numberOfLines={2}>
          {title}
        </EcolnaText>
        <EcolnaText variant="bodyMd" color={colors.onColorSoft}>
          {meta}
        </EcolnaText>
        {/* Le bouton soleil : il fait partie de la carte, qui se touche tout entière. */}
        <View
          style={[
            styles.cta,
            shadows.glowReward,
            { height: scaled(isTablet ? 56 : 50, scale), paddingHorizontal: scaled(spacing.xl, scale), marginTop: scaled(spacing.sm, scale) },
          ]}
        >
          <EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} mode="color" />
          <EcolnaText variant="button" color={colors.onReward}>
            {action}
          </EcolnaText>
        </View>
      </View>
      {subject ? (
        <View style={[styles.artZone, { width: ringBox, height: ringBox }]}>
          {/* Deux cercles concentriques à peine visibles : une vannerie vue de dessus. */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg width={ringBox} height={ringBox}>
              <Circle cx={ringBox / 2} cy={ringBox / 2} r={ringBox / 2 - 1} stroke={colors.onColorTrack} strokeWidth={1.5} fill="none" opacity={0.5} />
              <Circle cx={ringBox / 2} cy={ringBox / 2} r={art / 2 + pad * 0.4} stroke={colors.onColorTrack} strokeWidth={1.5} fill="none" />
            </Svg>
          </View>
          <View style={[shadows.floating, { borderRadius: art * 0.29 }]}>
            <SubjectArt subject={subject} size={art} />
          </View>
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { flexDirection: 'row', alignItems: 'center' },
  artZone: { alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: spacing.xxs, alignItems: 'flex-start' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.reward,
  },
});
