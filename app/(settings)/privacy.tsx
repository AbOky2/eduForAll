import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

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
  const router = useRouter();
  return (
    <AlifaScreen background="default">
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.common.back}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AlifaIcon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <AlifaText variant="headlineMd" color={colors.primary}>
          {fr.settings.privacy}
        </AlifaText>
        <View style={styles.backButton} />
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.screenMargin },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rowText: { flex: 1 },
});
