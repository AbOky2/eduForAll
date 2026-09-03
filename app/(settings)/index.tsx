import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { useSettings } from '@/features/settings/application/settings-store';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { AlifaButton, AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { a11y, colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { AlifaScreenHeader } from '@/design-system/components/alifa-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Settings — mockup S19. Reached from the parent space only. */
export default function SettingsScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const soundEnabled = useSettings((state) => state.soundEnabled);
  const setSoundEnabled = useSettings((state) => state.setSoundEnabled);
  const setActiveProfile = useActiveProfile((state) => state.setProfile);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    void getDatabase().then((db) =>
      createSettingsRepository(db).set('sound_enabled', enabled ? 'true' : 'false'),
    );
  };

  const resetEverything = async () => {
    const db = await getDatabase();
    // Cascades wipe all progression; settings go last.
    await db.execAsync('DELETE FROM child_profiles;');
    await db.execAsync('DELETE FROM app_settings;');
    setActiveProfile(null);
    setResetStep(0);
    router.dismissAll();
    router.replace('/(onboarding)');
  };

  return (
    <AlifaScreen background="default">
      <AlifaScreenHeader onBack={goBack} title={fr.settings.title} titleVariant="headlineMd" />

      <View style={styles.content}>
        <AlifaCard rounded="lg" padded={false} style={styles.group}>
          {/* Sound */}
          <View style={styles.row}>
            <AlifaIcon name="speaker" size={22} color={colors.onSurfaceVariant} />
            <AlifaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.sound}
            </AlifaText>
            <Switch
              accessibilityLabel={fr.settings.sound}
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ true: colors.primaryContainer, false: colors.surfaceContainerHighest }}
              thumbColor={colors.card}
            />
          </View>
          <View style={styles.divider} />

          {/* Language */}
          <View style={styles.rowColumn}>
            <View style={styles.rowInner}>
              <AlifaIcon name="book" size={22} color={colors.onSurfaceVariant} />
              <AlifaText variant="bodyLg" style={styles.rowLabel}>
                {fr.settings.language}
              </AlifaText>
            </View>
            <View style={styles.radioGroup}>
              <View style={styles.radioRow}>
                <View style={[styles.radio, styles.radioActive]}>
                  <View style={styles.radioDot} />
                </View>
                <AlifaText variant="bodyMd">{fr.settings.french}</AlifaText>
              </View>
              <View style={[styles.radioRow, { opacity: 0.5 }]}>
                <View style={styles.radio} />
                <AlifaText variant="bodyMd">
                  {fr.settings.chadianArabic} — {fr.settings.comingSoon}
                </AlifaText>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Offline info */}
          <View style={styles.row}>
            <AlifaIcon name="check" size={22} color={colors.secondary} />
            <View style={styles.rowLabel}>
              <AlifaText variant="bodyLg">{fr.settings.offlineInfo}</AlifaText>
              <AlifaText variant="bodySm" color={colors.textSecondary}>
                {fr.settings.offlineStatus}
              </AlifaText>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Privacy / diagnostics */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(settings)/privacy')}
            style={styles.row}
          >
            <AlifaIcon name="lock" size={22} color={colors.onSurfaceVariant} />
            <AlifaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.privacy}
            </AlifaText>
            <AlifaIcon name="chevron-right" size={20} color={colors.outline} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(settings)/diagnostics')}
            style={styles.row}
          >
            <AlifaIcon name="gear" size={22} color={colors.onSurfaceVariant} />
            <AlifaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.diagnostics}
            </AlifaText>
            <AlifaIcon name="chevron-right" size={20} color={colors.outline} />
          </Pressable>
        </AlifaCard>

        {/* Danger zone */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.settings.resetProgress}
          onPress={() => setResetStep(1)}
          style={styles.danger}
        >
          <AlifaIcon name="trash" size={20} color={colors.onErrorContainer} />
          <AlifaText variant="labelLg" color={colors.onErrorContainer}>
            {fr.settings.resetProgress}
          </AlifaText>
        </Pressable>
      </View>

      {/* Double confirmation */}
      <Modal
        transparent
        visible={resetStep > 0}
        animationType="fade"
        onRequestClose={() => setResetStep(0)}
      >
        <View style={styles.modalBackdrop}>
          <AlifaCard rounded="xl" style={styles.modalCard}>
            <AlifaText variant="headlineSm" align="center">
              {fr.settings.resetTitle}
            </AlifaText>
            <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
              {resetStep === 1
                ? fr.settings.resetMessage
                : 'Dernière vérification : cette action supprime tout, définitivement.'}
            </AlifaText>
            <AlifaButton label={fr.common.cancel} onPress={() => setResetStep(0)} />
            <AlifaButton
              label={resetStep === 1 ? fr.common.continue : fr.settings.resetConfirm}
              variant="danger"
              onPress={() => (resetStep === 1 ? setResetStep(2) : void resetEverything())}
            />
          </AlifaCard>
        </View>
      </Modal>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.screenMargin, gap: spacing.lg },
  group: { paddingVertical: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: a11y.minTouchTarget,
  },
  rowColumn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.surfaceContainer, marginHorizontal: spacing.lg },
  radioGroup: { gap: spacing.sm, paddingLeft: spacing.xl + spacing.sm },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primaryContainer },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryContainer,
  },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    minHeight: a11y.minTouchTarget,
    paddingHorizontal: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(22,26,50,0.35)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: { gap: spacing.md },
});
