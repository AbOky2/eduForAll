import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { ObjectIcon } from '../illustrations/object-icons';
import { Orbit } from '../illustrations/orbit';
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
  /** Placement (une rangée en `stretch` lui donne sa hauteur). */
  style?: StyleProp<ViewStyle>;
  /** Le pictogramme du thème de la leçon : chaque carte du jour a son image. */
  cover?: string | null;
}

/**
 * « Aujourd'hui » — la carte du jour (direction v4) : la plus grande chose de
 * l'accueil, sur la nuit du Sahel, où l'or du bouton chante. Le titre est le
 * vrai nom de la leçon, le contexte passe au-dessus en petit. À droite,
 * l'image du thème de la leçon sur un disque blanc, l'emblème de la
 * discipline en satellite, posés sur des cercles concentriques à peine
 * visibles — une vannerie vue de dessus. Deux leçons ne se ressemblent plus.
 * Toute la carte se touche.
 */
export function LessonHeroCard({
  subject,
  eyebrow,
  title,
  meta,
  action,
  onPress,
  accessibilityLabel,
  style,
  cover = null,
}: LessonHeroCardProps) {
  const { scale, isTablet, isLandscape, height } = useResponsive();
  // Couchée, la carte se fait plus basse : la hauteur manque, pas la largeur.
  const compact = !isTablet || isLandscape;
  // Une tablette 7" couchée (600 dp) : titre et bouton resserrés.
  const short = height < 700;
  const art = scaled(isTablet ? (isLandscape ? (height < 700 ? 76 : 92) : 112) : 76, scale);
  const pad = scaled(
    isTablet && !isLandscape ? spacing.xl : short ? spacing.md : spacing.lg,
    scale,
  );
  // Deux cercles autour de l'image, qui tiennent dans la carte sans rognage.
  const badge = Math.round(art * 0.4);
  const ringBox = Math.round(art + pad * 1.6 + badge * 0.5);

  return (
    <EcolnaGalet
      face={colors.night}
      radius={radius.xxl}
      shadow={shadows.raised}
      haptic="light"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={style}
      faceStyle={[
        styles.face,
        { padding: pad, gap: pad, minHeight: scaled(compact ? (short ? 128 : 168) : 200, scale) },
      ]}
    >
      <View style={styles.text}>
        <EcolnaText variant="labelMd" color={colors.onColorSoft} numberOfLines={1}>
          {eyebrow}
        </EcolnaText>
        <EcolnaText
          variant={isTablet && !short ? 'headlineLg' : 'headlineMd'}
          color={colors.white}
          numberOfLines={2}
        >
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
            {
              height: scaled(isTablet && !short ? 56 : 48, scale),
              paddingHorizontal: scaled(spacing.xl, scale),
              marginTop: scaled(short ? spacing.xs : spacing.sm, scale),
            },
          ]}
        >
          <EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} mode="color" />
          <EcolnaText variant="button" color={colors.onReward}>
            {action}
          </EcolnaText>
        </View>
      </View>
      {subject ? (
        // La vannerie : le thème de la leçon au centre, l'emblème de la
        // discipline en satellite ; sans image, l'emblème seul au centre.
        <Orbit
          size={ringBox}
          ringColor={colors.onColorTrack}
          inner={0.78}
          center={
            cover ? (
              <View
                style={[
                  styles.coverDisc,
                  shadows.floating,
                  { width: art, height: art, borderRadius: art / 2 },
                ]}
              >
                <ObjectIcon id={cover} size={Math.round(art * 0.66)} />
              </View>
            ) : (
              <View style={[shadows.floating, { borderRadius: art / 2 }]}>
                <SubjectArt subject={subject} size={art} />
              </View>
            )
          }
          satellites={
            cover
              ? [
                  {
                    node: <SubjectArt subject={subject} size={badge} />,
                    size: badge,
                    angle: -42,
                    ring: 1,
                  },
                ]
              : []
          }
        />
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { flexDirection: 'row', alignItems: 'center' },
  coverDisc: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  text: { flex: 1, gap: spacing.xxs, alignItems: 'flex-start' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.reward,
  },
});
