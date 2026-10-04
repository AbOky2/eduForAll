import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

const COMMITMENTS = fr.settings.privacyCommitments;

/**
 * Les engagements de confidentialité, en français simple pour les parents,
 * puis l'adresse de la politique complète et le contact de l'éditeur. Ces
 * deux lignes sont du texte, pas des liens : rien ne fait sortir de l'app
 * (catégorie Enfants), et l'adresse reste lisible, et copiable, pour qui
 * veut la taper ailleurs.
 */
export default function PrivacyScreen() {
  const goBack = useSafeBack();
  const { screenPadding, scale } = useResponsive();
  return (
    <EcolnaScreen background="plain">
      <EcolnaScreenHeader onBack={goBack} title={fr.settings.privacy} titleVariant="headlineMd" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: screenPadding }]}>
        <EcolnaCard rounded="xl" style={styles.card}>
          {COMMITMENTS.map((commitment) => (
            <View key={commitment} style={styles.row}>
              <EcolnaIcon name="check" size={22} color={colors.success} />
              <EcolnaText variant="bodyLg" style={styles.rowText}>
                {commitment}
              </EcolnaText>
            </View>
          ))}
        </EcolnaCard>
        <View
          style={[
            styles.policy,
            { paddingHorizontal: scaled(spacing.lg, scale), gap: scaled(spacing.sm, scale) },
          ]}
        >
          {[
            [fr.settings.privacyPolicyLabel, fr.settings.privacyPolicyAddress],
            [fr.settings.privacyContactLabel, fr.settings.privacyContact],
          ].map(([label, value]) => (
            <View key={label}>
              <EcolnaText variant="bodySm" color={colors.textSecondary}>
                {label}
              </EcolnaText>
              <EcolnaText variant="bodyMd" selectable>
                {value}
              </EcolnaText>
            </View>
          ))}
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.md, width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { gap: spacing.md },
  // Sous la carte, sur le bord intérieur de la carte (sa marge, mise à l'échelle).
  policy: { paddingTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rowText: { flex: 1 },
});
