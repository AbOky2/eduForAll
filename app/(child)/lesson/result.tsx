import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { StarRow } from '@/design-system/components/star-row';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { AlifaButton, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Lesson success (mockup S16): stars, avatar with check badge, warm words. */
export default function LessonResultScreen() {
  const router = useRouter();
  const { stars: starsParam, lessonId } = useLocalSearchParams<{ stars?: string; lessonId?: string }>();
  const profile = useActiveProfile((state) => state.profile);

  const stars = Math.min(3, Math.max(1, Number(starsParam ?? '1')));
  const avatarVariant = ((Math.max(1, Number(profile?.avatarId.split('-')[1] ?? '1')) - 1) % 4 + 1) as 1 | 2 | 3 | 4;

  return (
    <AlifaScreen background="default">
      <View style={styles.container}>
        <StarRow earned={stars} />

        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <AvatarFace variant={avatarVariant} size={96} />
          </View>
          <View style={styles.checkBadge}>
            <AlifaIcon name="check" size={16} color={colors.onSecondary} />
          </View>
        </View>

        <AlifaText variant="headlineLg" align="center">
          {fr.result.title}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {stars === 3 ? '' : stars === 2 ? fr.result.oneMoreStar : fr.result.needsReview}
        </AlifaText>

        <View style={styles.buttons}>
          <AlifaButton
            label={fr.common.continue}
            onPress={() => router.replace('/(child)/(tabs)')}
          />
          {lessonId ? (
            <AlifaButton
              label={fr.common.replay}
              variant="secondary"
              icon={<AlifaIcon name="replay" size={18} color={colors.secondary} />}
              onPress={() => router.replace(`/(child)/lesson/${lessonId}`)}
            />
          ) : null}
        </View>
      </View>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  avatarWrap: { alignSelf: 'center' },
  avatarRing: {
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.card,
    overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: { gap: spacing.md, marginTop: spacing.lg },
});
