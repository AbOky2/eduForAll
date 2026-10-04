import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { LevelId } from '@/content/schemas/curriculum-schema';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, fontFamilies, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

interface ProfileStageProps {
  width: number;
  height: number;
  avatarId: string | null;
  firstName: string;
  /** La classe choisie : lue par le lecteur d'écran (« Ta carte : Amina, CP1 »). */
  level: LevelId | null;
  /** Diamètre du médaillon du personnage (dp), cadre compris. */
  characterSize: number;
  /** Le personnage sourit (choisi, ou accueilli). */
  joy: boolean;
  /** La bienvenue : des étoiles éclosent autour du personnage. */
  celebrate?: boolean;
  /** L'ardoise du prénom n'apparaît qu'à partir de l'étape du prénom. */
  showSlate?: boolean;
  /**
   * Change quand l'enfant appuie trop tôt : la main de l'invitation salue de
   * nouveau (remontage par `key`).
   */
  inviteKey?: number;
}

/** Le cadre blanc du médaillon : ≈ 2,2 % du diamètre, 4 dp au moins. */
export function frameWidthOf(size: number): number {
  return Math.max(4, Math.round(size * 0.022));
}

/**
 * Le pointillé de l'invitation : des tirets de ≈ 10 dp séparés de ≈ 8 dp
 * (× l'échelle), répartis pour que le cercle se referme sur un tiret entier.
 * Le bout arrondi allonge chaque tiret de l'épaisseur du trait : on le
 * retranche du tiret et on le rend à l'espace.
 */
export function inviteDashes(diameter: number, stroke: number, scale: number) {
  const circumference = Math.PI * (diameter - stroke);
  const unit = 18 * scale;
  const count = Math.max(8, Math.round(circumference / unit));
  const step = circumference / count;
  const dash = Math.max(0.5, (step * 10) / 18 - stroke);
  return { count, dash, gap: step - dash };
}

/**
 * Les étoiles de la bienvenue : 7 étoiles éclosent autour du médaillon
 * (rayon 0,62 × son diamètre), en 600 ms ; leur taille suit le médaillon.
 */
function WelcomeStars({ size }: { size: number }) {
  const reducedMotion = useReducedMotion();
  const [burst] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(burst, {
      toValue: 1,
      duration: reducedMotion ? 200 : 600,
      useNativeDriver: true,
    }).start();
  }, [burst, reducedMotion]);
  const count = 7;
  const big = Math.round(Math.min(40, size * 0.15));
  const small = Math.round(big * 0.75);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.burst]}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * size * 0.62;
        const y = Math.sin(angle) * size * 0.62;
        return (
          <Animated.View
            key={index}
            style={[
              styles.star,
              {
                opacity: burst,
                transform: reducedMotion
                  ? [{ translateX: x }, { translateY: y }]
                  : [
                      {
                        translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, x] }),
                      },
                      {
                        translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, y] }),
                      },
                      { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                    ],
              },
            ]}
          >
            <EcolnaIcon name="star" size={index % 2 === 0 ? big : small} color={colors.reward} filled />
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * L'invitation, avant tout choix : une place réservée — un disque bleu très
 * clair cerclé d'un pointillé bleu — et une main qui salue. Elle dit « ici,
 * ce sera toi », sans visage gris ni point d'interrogation. La main fait deux
 * petits saluts (±12°) en arrivant ; rien en mouvement réduit.
 */
function Invitation({ size }: { size: number }) {
  const reducedMotion = useReducedMotion();
  const { scale } = useResponsive();
  const [tilt] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }
    const swing = (toValue: number, duration = 170) =>
      Animated.timing(tilt, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    const wave = Animated.sequence([
      Animated.delay(380),
      swing(1, 140),
      swing(-1),
      swing(1),
      swing(-1),
      swing(0, 140),
    ]);
    wave.start();
    return () => wave.stop();
  }, [tilt, reducedMotion]);

  const stroke = Math.max(3, scaled(3, scale));
  const { dash, gap } = inviteDashes(size, stroke, scale);
  const hand = Math.round(size * 0.42);
  return (
    <View
      testID="profile-invitation"
      style={[
        styles.invitation,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={(size - stroke) / 2}
          stroke={colors.brand}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Animated.View
        style={{
          // Le poignet sert de pivot : la main salue, elle ne tourne pas sur elle-même.
          transformOrigin: '42% 88%',
          transform: [
            { rotate: tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) },
          ],
        }}
      >
        <EcolnaIcon name="hand" mode="duo" color={colors.brand} size={hand} />
      </Animated.View>
    </View>
  );
}

/**
 * Le personnage choisi, dans un médaillon au cadre blanc : il apparaît en
 * joie sur un ressort (0,85 → 1, instantané en mouvement réduit). Remonté par
 * `key` à chaque nouveau choix.
 */
function Character({ avatarId, size, joy }: { avatarId: string; size: number; joy: boolean }) {
  const reducedMotion = useReducedMotion();
  const [grow] = useState(() => new Animated.Value(reducedMotion ? 1 : 0.85));
  const [shown] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    Animated.parallel([
      Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }),
      Animated.timing(shown, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [grow, shown, reducedMotion]);
  const frame = frameWidthOf(size);
  return (
    <Animated.View
      testID="profile-character"
      style={[
        styles.medallion,
        shadows.raised,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: frame,
          opacity: shown,
          transform: [{ scale: grow }],
        },
      ]}
    >
      <EcolnaAvatar avatarId={avatarId} size={size - frame * 2} expression={joy ? 'joy' : 'calm'} />
    </Animated.View>
  );
}

/**
 * La scène de la création de profil (v4) — elle ne se démonte jamais d'une
 * étape à l'autre. Un panneau bleu très clair ; au centre, la place de
 * l'enfant : d'abord une invitation (pointillé, main qui salue), puis le
 * personnage choisi dans son médaillon ; devant lui, comme un écolier montre
 * son ardoise, le prénom qui s'écrit à la craie, première lettre au soleil.
 * La classe se lit à droite, sur les cartes CP1/CP2 : pas d'étiquette collée
 * sur l'ardoise. Lue comme un tout : « Ta carte : Amina, CP1 ».
 */
export function ProfileStage({
  width,
  height,
  avatarId,
  firstName,
  level,
  characterSize,
  joy,
  celebrate = false,
  showSlate = true,
  inviteKey = 0,
}: ProfileStageProps) {
  const name = firstName.trim();
  const slateWidth = Math.min(width - 32, Math.max(220, characterSize * 1.25));
  const nameSize = Math.round(Math.min(56, Math.max(30, slateWidth / 7)));
  // L'ardoise se pose devant le buste, comme tenue à deux mains.
  const overlap = Math.round(characterSize * 0.1);
  return (
    <View
      style={[styles.stage, { width, height }]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={fr.profile.stageLabel(name, level ?? '')}
    >
      <View style={[styles.column, { gap: spacing.md }]}>
        <View style={{ width: characterSize, height: characterSize }}>
          {avatarId ? (
            <Character key={avatarId} avatarId={avatarId} size={characterSize} joy={joy} />
          ) : (
            <Invitation key={inviteKey} size={characterSize} />
          )}
          {celebrate ? <WelcomeStars size={characterSize} /> : null}
        </View>

        {/* L'ardoise : un panneau de nuit, le prénom à la craie. */}
        {showSlate ? (
          <View style={{ width: slateWidth, marginTop: -(overlap + spacing.md) }}>
            <View
              style={[
                styles.face,
                shadows.raised,
                { borderRadius: radius.xl, minHeight: nameSize * 2.1 },
              ]}
            >
              {name ? (
                <>
                  <EcolnaText variant="labelMd" color={colors.onNightSecondary} align="center">
                    {fr.profile.slateIntro}
                  </EcolnaText>
                  <EcolnaText
                    align="center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                    style={{
                      fontFamily: fontFamilies.bold,
                      fontSize: nameSize,
                      lineHeight: Math.round(nameSize * 1.2),
                      color: colors.white,
                    }}
                  >
                    <EcolnaText
                      style={{
                        fontFamily: fontFamilies.bold,
                        fontSize: nameSize,
                        color: colors.reward,
                      }}
                    >
                      {name.charAt(0)}
                    </EcolnaText>
                    {name.slice(1)}
                  </EcolnaText>
                </>
              ) : (
                // Ardoise vide : une ligne de base à la craie et un petit crayon.
                <View style={styles.emptyRow}>
                  <View style={styles.dotted}>
                    {Array.from({ length: 9 }, (_, index) => (
                      <View key={index} style={styles.dash} />
                    ))}
                  </View>
                  <EcolnaIcon name="pencil" size={22} color={colors.onNightSecondary} />
                </View>
              )}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { backgroundColor: colors.brandTint, overflow: 'hidden' },
  burst: { alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute' },
  column: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  invitation: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  medallion: { backgroundColor: colors.white },
  face: {
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  dotted: { flexDirection: 'row', gap: 6, paddingBottom: 6 },
  dash: { width: 10, height: 3, borderRadius: 2, backgroundColor: colors.onNightSecondary },
});
