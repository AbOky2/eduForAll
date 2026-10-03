import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { LevelId } from '@/content/schemas/curriculum-schema';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { AvatarSilhouette, EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { Orbit } from '@/design-system/illustrations/orbit';
import { EcolnaText } from '@/design-system/primitives';
import { colors, fontFamilies, illustration, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

const { slate, chalk, chalkDim } = illustration.school;

interface ProfileStageProps {
  width: number;
  height: number;
  avatarId: string | null;
  firstName: string;
  level: LevelId | null;
  /** Diamètre du personnage (dp). */
  characterSize: number;
  /** Le personnage sourit (choisi, ou accueilli). */
  joy: boolean;
  /** La bienvenue : des étoiles éclosent autour du personnage. */
  celebrate?: boolean;
}

/** Les étoiles de la bienvenue : 7 étoiles éclosent dans un rayon ≈ 0,62 × le personnage, en 600 ms. */
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
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.burst]}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * size * 0.66;
        const y = Math.sin(angle) * size * 0.66;
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
            <EcolnaIcon name="star" size={index % 2 === 0 ? 40 : 30} color={colors.reward} filled />
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Le personnage saute quand on le choisit : 0,85 → 1 en ~300 ms (instantané
 * en mouvement réduit). Remonté par `key` à chaque nouveau choix.
 */
function Character({
  avatarId,
  size,
  joy,
}: {
  avatarId: string | null;
  size: number;
  joy: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [grow] = useState(() => new Animated.Value(reducedMotion || !avatarId ? 1 : 0.85));
  useEffect(() => {
    if (reducedMotion || !avatarId) {
      grow.setValue(1);
      return;
    }
    Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 12 }).start();
  }, [avatarId, grow, reducedMotion]);
  return (
    <Animated.View style={{ transform: [{ scale: grow }] }}>
      {avatarId ? (
        <EcolnaAvatar avatarId={avatarId} size={size} expression={joy ? 'joy' : 'calm'} />
      ) : (
        <AvatarSilhouette size={size} />
      )}
    </Animated.View>
  );
}

/**
 * La scène de la création de profil (v4) — elle ne se démonte jamais d'une
 * étape à l'autre. Un panneau bleu très clair cerclé de la vannerie ; le
 * personnage choisi, grand, au centre ; sous lui, comme un écolier montre
 * son ardoise, le prénom qui s'écrit à la craie, première lettre au soleil ;
 * la classe qui se pose dans le coin. Lue comme un tout : « Ta carte :
 * Amina, CP1 ».
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
}: ProfileStageProps) {
  const name = firstName.trim();
  const slateWidth = Math.min(width - 32, Math.max(220, characterSize * 1.35));
  const nameSize = Math.round(Math.min(56, Math.max(30, slateWidth / 7)));
  const orbit = Math.round(Math.min(width - 24, characterSize * 1.7));
  return (
    <View
      style={[styles.stage, { width, height }]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={fr.profile.stageLabel(name, level ?? '')}
    >
      <View style={[styles.column, { gap: spacing.md }]}>
        <View style={styles.center}>
          <Orbit
            size={orbit}
            ringColor={colors.brandTintStrong}
            inner={0.78}
            center={
              <View>
                <Character key={avatarId ?? 'none'} avatarId={avatarId} size={characterSize} joy={joy} />
                {celebrate ? <WelcomeStars size={characterSize} /> : null}
              </View>
            }
          />
        </View>

        {/* L'ardoise : un panneau d'ardoise mat, le prénom à la craie. */}
        <View style={{ width: slateWidth, marginTop: -Math.round((orbit - characterSize) / 2) + spacing.sm }}>
          <View style={[styles.face, shadows.raised, { borderRadius: radius.xl, minHeight: nameSize * 2.1 }]}>
            {name ? (
              <>
                <EcolnaText variant="labelMd" color={chalkDim} align="center">
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
                    color: chalk,
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
                <EcolnaIcon name="pencil" size={22} color={chalkDim} />
              </View>
            )}
          </View>
          {level ? (
            <View style={styles.levelPill}>
              <EcolnaText variant="buttonSm" color={colors.onReward}>
                {level}
              </EcolnaText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { backgroundColor: colors.brandTint, overflow: 'hidden' },
  burst: { alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute' },
  center: { alignItems: 'center' },
  column: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  face: {
    backgroundColor: slate.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  dotted: { flexDirection: 'row', gap: 6, paddingBottom: 6 },
  dash: { width: 10, height: 3, borderRadius: 2, backgroundColor: chalkDim },
  levelPill: {
    position: 'absolute',
    top: -12,
    right: -10,
    backgroundColor: colors.reward,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.brandTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
