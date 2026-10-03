import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { useSettings } from '@/features/settings/application/settings-store';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { useResponsive } from '@/design-system/responsive';
import { a11y, colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Settings — mockup S19. Reached from the parent space only. */
export default function SettingsScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const soundEnabled = useSettings((state) => state.soundEnabled);
  const setSoundEnabled = useSettings((state) => state.setSoundEnabled);
  const setActiveProfile = useActiveProfile((state) => state.setProfile);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const { screenPadding } = useResponsive();

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
    <EcolnaScreen background="plain">
      <EcolnaScreenHeader onBack={goBack} title={fr.settings.title} titleVariant="headlineMd" />

      <View style={[styles.content, { paddingHorizontal: screenPadding }]}>
        <EcolnaCard rounded="lg" padded={false} style={styles.group}>
          {/* Sound */}
          <View style={styles.row}>
            <EcolnaIcon name="speaker" size={22} color={colors.onSurfaceVariant} />
            <EcolnaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.sound}
            </EcolnaText>
            <Switch
              accessibilityLabel={fr.settings.sound}
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ true: colors.secondary, false: colors.surfaceContainerHighest }}
              thumbColor={colors.card}
            />
          </View>
          <View style={styles.divider} />

          {/* Language */}
          <View style={styles.rowColumn}>
            <View style={styles.rowInner}>
              <EcolnaIcon name="book" size={22} color={colors.onSurfaceVariant} />
              <EcolnaText variant="bodyLg" style={styles.rowLabel}>
                {fr.settings.language}
              </EcolnaText>
            </View>
            <View style={styles.radioGroup}>
              <View style={styles.radioRow}>
                <View style={[styles.radio, styles.radioActive]}>
                  <View style={styles.radioDot} />
                </View>
                <EcolnaText variant="bodyMd">{fr.settings.french}</EcolnaText>
              </View>
              <View style={[styles.radioRow, { opacity: 0.5 }]}>
                <View style={styles.radio} />
                <EcolnaText variant="bodyMd">
                  {fr.settings.chadianArabic} — {fr.settings.comingSoon}
                </EcolnaText>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Offline info */}
          <View style={styles.row}>
            <EcolnaIcon name="offline-ok" size={22} color={colors.secondary} />
            <View style={styles.rowLabel}>
              <EcolnaText variant="bodyLg">{fr.settings.offlineInfo}</EcolnaText>
              <EcolnaText variant="bodySm" color={colors.textSecondary}>
                {fr.settings.offlineStatus}
              </EcolnaText>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Privacy / diagnostics */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(settings)/privacy')}
            style={styles.row}
          >
            <EcolnaIcon name="shield" size={22} color={colors.onSurfaceVariant} />
            <EcolnaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.privacy}
            </EcolnaText>
            <EcolnaIcon name="chevron-right" size={20} color={colors.outline} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(settings)/diagnostics')}
            style={styles.row}
          >
            <EcolnaIcon name="gear" size={22} color={colors.onSurfaceVariant} />
            <EcolnaText variant="bodyLg" style={styles.rowLabel}>
              {fr.settings.diagnostics}
            </EcolnaText>
            <EcolnaIcon name="chevron-right" size={20} color={colors.outline} />
          </Pressable>
        </EcolnaCard>

        {/* Zone sensible : séparée, et doublement confirmée. */}
        <EcolnaButton
          label={fr.settings.resetProgress}
          variant="danger"
          size="md"
          icon={<EcolnaIcon name="trash" size={20} color={colors.onErrorContainer} />}
          onPress={() => setResetStep(1)}
        />
      </View>

      {/* Double confirmation */}
      <Modal
        transparent
        visible={resetStep > 0}
        animationType="fade"
        onRequestClose={() => setResetStep(0)}
      >
        <View style={[styles.modalBackdrop, { padding: screenPadding }]}>
          <EcolnaCard rounded="xl" style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <EcolnaIcon name="trash" size={28} color={colors.onErrorContainer} />
            </View>
            <EcolnaText variant="headlineSm" align="center">
              {fr.settings.resetTitle}
            </EcolnaText>
            <EcolnaText variant="bodyMd" color={colors.textSecondary} align="center">
              {resetStep === 1 ? fr.settings.resetMessage : fr.settings.resetLastCheck}
            </EcolnaText>
            <EcolnaButton label={fr.common.cancel} variant="accent" size="md" onPress={() => setResetStep(0)} />
            <EcolnaButton
              label={resetStep === 1 ? fr.common.continue : fr.settings.resetConfirm}
              variant="danger"
              size="md"
              onPress={() => (resetStep === 1 ? setResetStep(2) : void resetEverything())}
            />
          </EcolnaCard>
        </View>
      </Modal>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center', paddingTop: spacing.sm },
  group: { paddingVertical: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: a11y.minTouchTarget + 8,
  },
  rowColumn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { flex: 1 },
  divider: { height: 1.5, backgroundColor: colors.surfaceContainer, marginHorizontal: spacing.lg },
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
  radioActive: { borderColor: colors.secondary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.secondary },
  modalBackdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', alignItems: 'center' },
  modalCard: { gap: spacing.md, width: '100%', maxWidth: 480 },
  modalIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
