import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
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
  /**
   * La carte reçoit de son écran plus de hauteur que son contenu n'en
   * demande (l'accueil d'une grande tablette debout) : elle la remplit, et
   * l'image grandit avec elle (voir `heroFillArt`).
   */
  fill?: boolean;
}

/**
 * Taille de l'image de la leçon (avant mise à l'échelle). Elle est la plus
 * grande chose de l'accueil : grande tablette debout 160, couchée 132 ;
 * tablette 7" couchée (600 dp de haut) 108 — c'est la colonne du texte qui
 * fixe la hauteur de la carte, l'image y tient sans l'agrandir ; téléphone 96.
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
    return height < 700 ? 108 : height < 780 ? 112 : 132;
  }
  return height < 1000 ? 136 : 160;
}

/** L'image d'une carte qui remplit sa hauteur ne dépasse jamais cette taille (avant mise à l'échelle). */
export const HERO_ART_MAX = 240;
/** La place que garde le texte à côté d'une image agrandie (avant mise à l'échelle). */
const HERO_TEXT_MIN = 300;

/**
 * L'image d'une carte du jour qui remplit la hauteur que l'écran lui donne
 * (`fill`) : toute la hauteur intérieure, jamais moins que sa taille
 * ordinaire (`base`), jamais plus de `HERO_ART_MAX`, et toujours assez de
 * largeur pour le titre et le bouton. Mesures en dp, déjà mises à l'échelle.
 */
export function heroFillArt({
  base,
  face,
  pad,
  scale,
}: {
  base: number;
  /** La surface de la carte, mesurée. */
  face: { width: number; height: number };
  pad: number;
  scale: number;
}): number {
  const byHeight = face.height - 2 * pad;
  const byWidth = face.width - 3 * pad - scaled(HERO_TEXT_MIN, scale);
  return Math.max(base, Math.floor(Math.min(byHeight, byWidth, scaled(HERO_ART_MAX, scale))));
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
  fill = false,
}: LessonHeroCardProps) {
  const { scale, isTablet, isLandscape, height } = useResponsive();
  // Remplir : la surface mesurée dit jusqu'où l'image peut grandir.
  const [face, setFace] = useState({ width: 0, height: 0 });
  // Une tablette 7" couchée (600 dp) : titre et bouton resserrés.
  const short = height < 700;
  // Une grande tablette (iPad 11", 10" Android) : la carte prend de la hauteur.
  const tall = isTablet && height >= 780;
  const baseArt = scaled(heroArtSize({ isTablet, isLandscape, height }), scale);
  const pad = scaled(
    isTablet && !isLandscape ? spacing.xl : short ? spacing.md : spacing.lg,
    scale,
  );
  const art =
    fill && face.height > 0 ? heroFillArt({ base: baseArt, face, pad, scale }) : baseArt;
  const onFaceLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    const next = Math.round(event.nativeEvent.layout.height);
    if (width !== face.width || next !== face.height) {
      setFace({ width, height: next });
    }
  };
  // La pastille de la discipline suit l'image, sans devenir un second sujet.
  const badge = Math.min(Math.round(art * 0.3), scaled(56, scale));
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
      {/* La surface entière, mesurée (sans rien déplacer) quand la carte remplit sa hauteur. */}
      {fill ? <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onFaceLayout} /> : null}
      <View style={[styles.text, { gap: scaled(spacing.xxs, scale) }]}>
        {/* Jamais tronqué : un contexte long passe sur deux lignes. */}
        <EcolnaText variant="labelMd" color={colors.onColorSoft} numberOfLines={2}>
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
