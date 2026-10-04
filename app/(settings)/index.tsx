import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ComponentType } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  type ColorValue,
  type SwitchProps,
} from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { useSettings } from '@/features/settings/application/settings-store';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { EcolnaLogo } from '@/design-system/brand/ecolna-mark';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y, colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** La colonne des réglages : une ligne ne s'étire jamais sur toute une tablette couchée. */
const COLUMN = 720;

/**
 * react-native-web peint le pouce d'un interrupteur ACTIF avec
 * `activeThumbColor` (le bleu-vert de Material par défaut), que les types de
 * React Native ne déclarent pas : on l'ajoute ici, sans `any`.
 */
interface WebSwitchProps extends SwitchProps {
  activeThumbColor?: ColorValue | undefined;
}
const ThemedSwitch = Switch as ComponentType<WebSwitchProps>;

/** La version de l'application, lue dans sa configuration (aucun réseau). */
const APP_VERSION = Constants.expoConfig?.version;

/**
 * Paramètres — maquette S19, depuis l'espace parent seulement. Le titre sur
 * la rangée du bouton retour, comme au tableau de bord d'où l'on vient, et la
 * colonne des réglages qui part de la gouttière (720 dp au plus) : l'intitulé
 * et son interrupteur restent à portée d'œil. La zone sensible (tout effacer)
 * est un simple lien sous la carte, doublement confirmé — jamais une action
 * aussi massive que les autres. Couché, la place de droite reçoit « À
 * propos » (la marque, la version, la source officielle du programme), aux
 * proportions des colonnes du tableau de bord ; debout, elle passe dessous.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const soundEnabled = useSettings((state) => state.soundEnabled);
  const setSoundEnabled = useSettings((state) => state.setSoundEnabled);
  const setActiveProfile = useActiveProfile((state) => state.setProfile);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const { screenPadding, scale, splitPanes } = useResponsive();
  const icon = scaled(22, scale);
  const chevron = scaled(20, scale);
  const gap = scaled(spacing.md, scale);

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
      <EcolnaScreenHeader
        onBack={goBack}
        title={fr.settings.title}
        titleVariant="headlineLg"
        alignTitle="left"
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: screenPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[splitPanes ? styles.split : styles.column, { gap }]}>
          <View style={[splitPanes && styles.main, { gap }]}>
            <EcolnaCard rounded="lg" padded={false} contentStyle={styles.group}>
              {/* Sound */}
              <View style={styles.row}>
                <EcolnaIcon name="speaker" size={icon} color={colors.inkSecondary} />
                <EcolnaText variant="bodyLg" style={styles.rowLabel}>
                  {fr.settings.sound}
                </EcolnaText>
                <ThemedSwitch
                  accessibilityLabel={fr.settings.sound}
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ true: colors.brand, false: colors.surfaceContainerHighest }}
                  thumbColor={colors.card}
                  activeThumbColor={Platform.OS === 'web' ? colors.white : undefined}
                />
              </View>
              <View style={styles.divider} />

              {/* Language */}
              <View style={styles.rowColumn}>
                <View style={styles.rowInner}>
                  <EcolnaIcon name="speech" size={icon} color={colors.inkSecondary} />
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
                <EcolnaIcon name="offline-ok" size={icon} color={colors.success} />
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
                <EcolnaIcon name="shield" size={icon} color={colors.inkSecondary} />
                <EcolnaText variant="bodyLg" style={styles.rowLabel}>
                  {fr.settings.privacy}
                </EcolnaText>
                <EcolnaIcon name="chevron-right" size={chevron} color={colors.inkTertiary} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(settings)/diagnostics')}
                style={styles.row}
              >
                <EcolnaIcon name="insight" size={icon} color={colors.inkSecondary} />
                <EcolnaText variant="bodyLg" style={styles.rowLabel}>
                  {fr.settings.diagnostics}
                </EcolnaText>
                <EcolnaIcon name="chevron-right" size={chevron} color={colors.inkTertiary} />
              </Pressable>
            </EcolnaCard>

            {/* Zone sensible : un lien sous la carte, séparé, et doublement confirmé. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={fr.settings.resetProgress}
              onPress={() => setResetStep(1)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.reset,
                { minHeight: a11y.minTouchTarget, gap: scaled(spacing.xs, scale), opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <EcolnaIcon name="trash" size={scaled(20, scale)} color={colors.dangerInk} />
              <EcolnaText variant="labelLg" color={colors.dangerInk}>
                {fr.settings.resetProgress}
              </EcolnaText>
            </Pressable>
          </View>
          <View style={splitPanes ? styles.aside : undefined}>
            <AboutCard />
          </View>
        </View>
      </ScrollView>

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
              <EcolnaIcon name="trash" size={28} color={colors.dangerInk} />
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

/**
 * « À propos » : la marque et sa promesse, la source officielle du programme
 * (le titre exact du document du ministère) et la version de l'application.
 * Ce qu'un cadre du ministère cherche d'abord : d'où vient ce qu'on enseigne.
 */
function AboutCard() {
  const { scale } = useResponsive();
  return (
    <EcolnaCard rounded="lg" padded={false} contentStyle={styles.group}>
      <View style={[styles.aboutBlock, { gap: scaled(spacing.xs, scale) }]}>
        {/* L'étiquette en capitales, lue en minuscules (pas épelée). */}
        <EcolnaText
          variant="tag"
          color={colors.textSecondary}
          accessibilityRole="header"
          accessibilityLabel={fr.settings.about}
        >
          {fr.settings.about.toLocaleUpperCase('fr-FR')}
        </EcolnaText>
        <EcolnaLogo size={scaled(36, scale)} />
        <EcolnaText variant="bodyMd" color={colors.textSecondary}>
          {fr.onboarding.tagline}
        </EcolnaText>
      </View>
      <View style={styles.divider} />
      <View style={[styles.aboutRow, { gap: scaled(spacing.sm, scale) }]}>
        <EcolnaIcon name="seal-check" size={scaled(24, scale)} color={colors.success} />
        <View style={[styles.rowLabel, { gap: scaled(spacing.xxs, scale) }]}>
          <EcolnaText variant="labelLg">{fr.settings.aboutCompliance}</EcolnaText>
          <EcolnaText variant="bodySm" color={colors.textSecondary}>
            {fr.settings.aboutSource}
          </EcolnaText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.aboutBlock}>
        <EcolnaText variant="bodySm" color={colors.textSecondary}>
          {fr.settings.aboutVersion(APP_VERSION ?? fr.settings.diagnosticsUnknown)}
        </EcolnaText>
      </View>
    </EcolnaCard>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  // Debout : une colonne qui part de la gouttière, la carte « À propos » dessous.
  column: { width: '100%', maxWidth: COLUMN, alignSelf: 'flex-start' },
  // Couché : les proportions du tableau de bord (1,6 : 1), en haut alignées.
  split: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1.6 },
  aside: { flex: 1 },
  aboutBlock: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  // Aligné sur le bord gauche de la carte et de ses pictogrammes.
  reset: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing.lg },
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
  divider: { height: 1.5, backgroundColor: colors.fill, marginHorizontal: spacing.lg },
  radioGroup: { gap: spacing.sm, paddingLeft: spacing.xl + spacing.sm },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.brand },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand },
  modalBackdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', alignItems: 'center' },
  modalCard: { gap: spacing.md, width: '100%', maxWidth: 480 },
  modalIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dangerTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
