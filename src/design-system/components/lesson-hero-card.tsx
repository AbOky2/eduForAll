import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { CardDunes } from '../illustrations/backdrops';
import { EcolnaGalet, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, depth, radius, shadows, spacing } from '../tokens';
import { EcolnaPill } from './ecolna-pill';

interface LessonHeroCardProps {
  subject: SubjectArtId | null;
  tag: string;
  title: string;
  /** « Monde · leçon » — ce que l'enfant va retrouver. */
  detail: string;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * La carte « Ma prochaine leçon » : l'action du jour, la plus grande chose de
 * l'accueil. Un galet terre (la couleur de la marque) qui ouvre sur un
 * paysage ton sur ton, l'objet de la discipline à gauche, et un gros soleil
 * « jouer » à droite — l'or sur la terre se voit de loin, au soleil aussi.
 */
export function LessonHeroCard({
  subject,
  tag,
  title,
  detail,
  onPress,
  accessibilityLabel,
}: LessonHeroCardProps) {
  const { scale, isTablet } = useResponsive();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!size || Math.abs(size.width - width) > 1 || Math.abs(size.height - height) > 1) {
      setSize({ width, height });
    }
  };
  const art = scaled(isTablet ? 84 : 56, scale);
  const play = scaled(isTablet ? 68 : 56, scale);
  const lift = scaled(depth.md, scale);

  return (
    <EcolnaGalet
      face={colors.primary}
      edge={colors.primaryShade}
      radius={radius.xl}
      depth="lg"
      onPress={onPress}
      shadow={shadows.raised}
      accessibilityLabel={accessibilityLabel}
      faceStyle={[
        styles.face,
        {
          padding: scaled(isTablet ? spacing.lg : spacing.md, scale),
          gap: scaled(isTablet ? spacing.lg : spacing.md, scale),
          minHeight: scaled(isTablet ? 132 : 112, scale),
        },
      ]}
    >
      <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
        {size ? (
          <CardDunes
            width={size.width}
            height={size.height}
            far={colors.primaryDuneFar}
            near={colors.primaryDuneNear}
          />
        ) : null}
      </View>
      {subject ? <SubjectArt subject={subject} size={art} /> : null}
      <View style={styles.text}>
        <EcolnaPill label={tag} tone="glass" variant="tag" />
        <EcolnaText variant={isTablet ? 'headlineMd' : 'headlineSm'} color={colors.onPrimary}>
          {title}
        </EcolnaText>
        <EcolnaText
          variant={isTablet ? 'bodyLg' : 'bodyMd'}
          color={colors.onPrimary}
          numberOfLines={2}
        >
          {detail}
        </EcolnaText>
      </View>
      {/* Le soleil « jouer » : partie de la carte (toute la carte se touche). */}
      <View style={{ width: play, height: play + lift }}>
        <View
          style={[
            styles.disc,
            { top: lift, width: play, height: play, backgroundColor: colors.sunShade },
          ]}
        />
        <View style={[styles.disc, { width: play, height: play, backgroundColor: colors.sun }]}>
          <EcolnaIcon name="play" size={Math.round(play * 0.5)} color={colors.onSun} mode="mono" />
        </View>
      </View>
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  text: { flex: 1, gap: spacing.xxs },
  disc: {
    position: 'absolute',
    left: 0,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
