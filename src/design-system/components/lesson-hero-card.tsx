import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { ObjectIcon } from '../illustrations/object-icons';
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
 * Taille de l'image de la leçon (avant mise à l'échelle). Elle est la plus
 * grande chose de l'accueil : grande tablette debout 160, couchée 132 ;
 * tablette 7" couchée (600 dp de haut) 76, pour que tout tienne au-dessus de
 * la barre d'onglets ; téléphone 96.
 */
export function heroArtSize({
  isTablet,
  isLandscape,
  height,
}: {
  isTablet: boolean;
  isLandscape: boolean;
  height: number;
}): number {
  if (!isTablet) {
    return 96;
  }
  if (isLandscape) {
    return height < 700 ? 76 : height < 780 ? 112 : 132;
  }
  return height < 1000 ? 136 : 160;
}

/**
 * « Aujourd'hui » — la carte du jour (direction v4) : la plus grande chose de
 * l'accueil, sur la nuit du Sahel, où l'or du bouton chante. Le titre est le
 * vrai nom de la leçon, le contexte passe au-dessus en petit. À droite,
 * l'image du thème de la leçon, seule et grande sur son disque blanc, avec
 * l'emblème de la discipline en pastille. Deux leçons ne se ressemblent plus.
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
  // Une tablette 7" couchée (600 dp) : titre et bouton resserrés.
  const short = height < 700;
  // Une grande tablette (iPad 11", 10" Android) : la carte prend de la hauteur.
  const tall = isTablet && height >= 780;
  const art = scaled(heroArtSize({ isTablet, isLandscape, height }), scale);
  const pad = scaled(
    isTablet && !isLandscape ? spacing.xl : short ? spacing.md : spacing.lg,
    scale,
  );
  const badge = Math.round(art * 0.3);
  const badgeRim = scaled(3, scale);
  const minHeight = scaled(
    !isTablet ? 168 : isLandscape ? (short ? 128 : tall ? 204 : 176) : tall ? 230 : 200,
    scale,
  );

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
        { padding: pad, gap: pad, minHeight },
      ]}
    >
      <View style={[styles.text, { gap: scaled(spacing.xxs, scale) }]}>
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
              marginTop: scaled(short ? spacing.xs : tall ? spacing.md : spacing.sm, scale),
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
        // L'image du thème, seule et grande ; l'emblème de la discipline en
        // pastille, détourée de nuit. Sans image, l'emblème seul.
        <View style={{ width: art, height: art }}>
          {cover ? (
            <>
              <View
                style={[
                  styles.coverDisc,
                  shadows.floating,
                  { width: art, height: art, borderRadius: art / 2 },
                ]}
              >
                <ObjectIcon id={cover} size={Math.round(art * 0.68)} />
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    padding: badgeRim,
                    borderRadius: badge / 2 + badgeRim,
                    // Sur le bord du disque, en haut à droite (à 45°).
                    right: Math.round(art * 0.146 - badge / 2 - badgeRim),
                    top: Math.round(art * 0.146 - badge / 2 - badgeRim),
                  },
                ]}
              >
                <SubjectArt subject={subject} size={badge} />
              </View>
            </>
          ) : (
            <View style={[shadows.floating, { borderRadius: art / 2 }]}>
              <SubjectArt subject={subject} size={art} />
            </View>
          )}
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { flexDirection: 'row', alignItems: 'center' },
  coverDisc: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  badge: { position: 'absolute', backgroundColor: colors.night },
  text: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.reward,
  },
});
