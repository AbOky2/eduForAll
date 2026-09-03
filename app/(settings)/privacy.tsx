import { ScrollView, StyleSheet, View } from 'react-native';

import { AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { AlifaScreenHeader } from '@/design-system/components/alifa-screen-header';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

const COMMITMENTS = [
  'Toutes les données restent sur ce téléphone. Rien n’est envoyé sur internet.',
  'Aucun compte, aucun email, aucun mot de passe n’est demandé.',
  'Aucune publicité, aucun achat, aucun abonnement.',
  'Aucune géolocalisation, aucun accès aux contacts ni aux photos.',
  'Le prénom et l’avatar servent uniquement à accueillir l’enfant dans l’application.',
  'Supprimer l’application supprime toutes les données.',
];

/** Privacy commitments, in plain French for parents. */
export default function PrivacyScreen() {
  const goBack = useSafeBack();
  return (
    <AlifaScreen background="default">
      <AlifaScreenHeader onBack={goBack} title={fr.settings.privacy} titleVariant="headlineMd" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <AlifaCard rounded="xl" style={styles.card}>
          {COMMITMENTS.map((commitment) => (
            <View key={commitment} style={styles.row}>
              <AlifaIcon name="check" size={18} color={colors.feedbackCorrect} />
              <AlifaText variant="bodyLg" style={styles.rowText}>
                {commitment}
              </AlifaText>
            </View>
          ))}
        </AlifaCard>
      </ScrollView>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.screenMargin },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rowText: { flex: 1 },
});
