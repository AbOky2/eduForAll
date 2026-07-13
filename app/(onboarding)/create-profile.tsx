import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { AVATAR_IDS, isValidFirstName, type AvatarId } from '@/features/child-profile/domain/child-profile';
import type { LevelId } from '@/content/schemas/curriculum-schema';
import { AlifaButton, AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { a11y, colors, radius, spacing, typography } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Profile creation — mockup S05. Local only: no email, no password. */
export default function CreateProfileScreen() {
  const router = useRouter();
  const setActiveProfile = useActiveProfile((state) => state.setProfile);

  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-1');
  const [firstName, setFirstName] = useState('');
  const [level, setLevel] = useState<LevelId>('CP1');
  const [saving, setSaving] = useState(false);

  const canSubmit = isValidFirstName(firstName) && !saving;

  const submit = async () => {
    if (!canSubmit) {
      return;
    }
    setSaving(true);
    try {
      const db = await getDatabase();
      const profiles = createChildProfileRepository(db);
      const settings = createSettingsRepository(db);
      const profile = await profiles.create({ firstName, avatarId, level });
      await settings.set('active_profile_id', profile.id);
      await settings.set('onboarding_done', 'true');
      setActiveProfile(profile);
      router.replace('/(child)/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlifaScreen background="exercise">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <AlifaCard rounded="xl" style={styles.card}>
            <AlifaText variant="headlineLg" align="center">
              {fr.profile.title}
            </AlifaText>
            <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
              {fr.profile.subtitle}
            </AlifaText>

            <AlifaText variant="labelMd" color={colors.textSecondary} align="center">
              {fr.profile.avatarLabel}
            </AlifaText>
            <View style={styles.avatarRow}>
              {AVATAR_IDS.map((candidate, index) => {
                const selected = candidate === avatarId;
                return (
                  <Pressable
                    key={candidate}
                    accessibilityRole="radio"
                    accessibilityLabel={`Avatar ${index + 1}`}
                    accessibilityState={{ selected }}
                    onPress={() => setAvatarId(candidate)}
                    style={[styles.avatar, selected && styles.avatarSelected]}
                  >
                    <AvatarFace variant={(index + 1) as 1 | 2 | 3 | 4} size={56} />
                    {selected ? (
                      <View style={styles.avatarCheck}>
                        <AlifaIcon name="check" size={12} color={colors.onPrimary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <AlifaText variant="labelMd" color={colors.textSecondary}>
              {fr.profile.firstNameLabel}
            </AlifaText>
            <TextInput
              accessibilityLabel={fr.profile.firstNameLabel}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={fr.profile.firstNamePlaceholder}
              placeholderTextColor={colors.outline}
              maxLength={40}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />

            <AlifaText variant="labelMd" color={colors.textSecondary}>
              {fr.profile.levelLabel}
            </AlifaText>
            <View style={styles.levelRow}>
              {(
                [
                  { id: 'CP1', icon: 'sparkle' },
                  { id: 'CP2', icon: 'book' },
                ] as const
              ).map((option) => {
                const selected = level === option.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityLabel={option.id}
                    accessibilityState={{ selected }}
                    onPress={() => setLevel(option.id)}
                    style={[styles.levelCard, selected && styles.levelCardSelected]}
                  >
                    {selected ? (
                      <View style={styles.levelCheck}>
                        <AlifaIcon name="check" size={12} color={colors.onSecondary} />
                      </View>
                    ) : null}
                    <AlifaIcon
                      name={option.icon}
                      size={26}
                      color={selected ? colors.secondary : colors.onSurfaceVariant}
                    />
                    <AlifaText
                      variant="headlineSm"
                      color={selected ? colors.secondary : colors.textPrimary}
                    >
                      {option.id}
                    </AlifaText>
                  </Pressable>
                );
              })}
            </View>

            <AlifaButton
              label={fr.profile.go}
              onPress={() => void submit()}
              disabled={!canSubmit}
            />
            <View style={styles.privacyRow}>
              <AlifaIcon name="lock" size={16} color={colors.textSecondary} />
              <AlifaText variant="bodySm" color={colors.textSecondary} style={styles.privacyText}>
                {fr.profile.privacyNote}
              </AlifaText>
            </View>
          </AlifaCard>
        </View>
      </KeyboardAvoidingView>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screenMargin,
  },
  card: { gap: spacing.md },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  avatar: {
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: 'transparent',
    padding: 2,
  },
  avatarSelected: { borderColor: colors.primaryContainer },
  avatarCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...typography.bodyLg,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: a11y.minTouchTarget,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  levelRow: { flexDirection: 'row', gap: spacing.md },
  levelCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
  },
  levelCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryFixed,
  },
  levelCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  privacyText: { flex: 1 },
});
