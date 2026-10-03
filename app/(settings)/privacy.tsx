import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

const COMMITMENTS = fr.settings.privacyCommitments;

/** Privacy commitments, in plain French for parents. */
export default function PrivacyScreen() {
  const goBack = useSafeBack();
  const { screenPadding } = useResponsive();
  return (
    <EcolnaScreen background="plain">
      <EcolnaScreenHeader onBack={goBack} title={fr.settings.privacy} titleVariant="headlineMd" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: screenPadding }]}>
        <EcolnaCard rounded="xl" style={styles.card}>
          {COMMITMENTS.map((commitment) => (
            <View key={commitment} style={styles.row}>
              <EcolnaIcon name="check" size={22} color={colors.feedbackCorrect} />
              <EcolnaText variant="bodyLg" style={styles.rowText}>
                {commitment}
              </EcolnaText>
            </View>
          ))}
        </EcolnaCard>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.md, width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rowText: { flex: 1 },
});
