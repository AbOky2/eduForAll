import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { a11y, colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface GateChallenge {
  question: string;
  answer: number;
}

/**
 * Porte parentale : une multiplication qu'un enfant de six à huit ans ne sait
 * pas encore poser, à SAISIR et non à choisir.
 *
 * Trois réponses proposées laissaient une chance sur trois par essai, sans
 * limite de tentatives : un enfant qui tape au hasard entrait en trois coups.
 * Ce n'est pas une porte parentale au sens de la catégorie Enfants d'Apple,
 * et neuf fiches de store affirment pourtant qu'elle en est une. La saisie
 * libre rend le hasard inopérant.
 *
 * Bloque l'accès aux actions réservées aux adultes : réinitialisation,
 * partage, diagnostic. Un code local pourra se superposer sans toucher aux
 * appelants.
 */
const CHALLENGES: GateChallenge[] = [
  { question: '7 × 6', answer: 42 },
  { question: '8 × 7', answer: 56 },
  { question: '9 × 6', answer: 54 },
  { question: '7 × 8', answer: 56 },
  { question: '6 × 8', answer: 48 },
];

export default function ParentGateScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const [attempt, setAttempt] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [saisie, setSaisie] = useState('');
  const challenge = useMemo(() => CHALLENGES[attempt % CHALLENGES.length]!, [attempt]);

  const valider = () => {
    if (Number(saisie.trim()) === challenge.answer) {
      router.replace('/(parent)/dashboard');
      return;
    }
    setWrong(true);
    setSaisie('');
    // Une opération différente à chaque échec : retenir la bonne réponse par
    // répétition ne mène nulle part.
    setAttempt((current) => current + 1);
  };

  return (
    <EcolnaScreen background="default">
      <View style={styles.container}>
        <View style={styles.badge}>
          <EcolnaIcon name="parents" size={34} color={colors.onSecondaryContainer} />
        </View>
        <EcolnaText variant="headlineLg" align="center">
          {fr.parent.gateTitle}
        </EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.parent.gateSubtitle}
        </EcolnaText>

        <EcolnaCard rounded="xl" style={styles.card}>
          <EcolnaText variant="bodyMd" color={colors.textSecondary} align="center">
            {fr.parent.gateQuestion}
          </EcolnaText>
          <EcolnaText variant="displayGlyphSmall" align="center">
            {challenge.question} = ?
          </EcolnaText>
          {wrong ? (
            <EcolnaText variant="bodyMd" color={colors.secondary} align="center">
              {fr.parent.gateWrong}
            </EcolnaText>
          ) : null}
          <TextInput
            accessibilityLabel={fr.parent.gateQuestion}
            value={saisie}
            onChangeText={(texte) => setSaisie(texte.replace(/[^0-9]/g, '').slice(0, 4))}
            onSubmitEditing={valider}
            placeholder={fr.parent.gatePlaceholder}
            placeholderTextColor={colors.outline}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={4}
            style={styles.input}
          />
          <EcolnaButton
            label={fr.parent.gateEnter}
            onPress={valider}
            disabled={saisie.trim().length === 0}
          />
        </EcolnaCard>

        <Pressable accessibilityRole="button" onPress={goBack} hitSlop={12}>
          <EcolnaText variant="labelMd" color={colors.textSecondary} align="center">
            {fr.common.back}
          </EcolnaText>
        </Pressable>
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screenMargin,
    gap: spacing.lg,
  },
  badge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { gap: spacing.md },
  input: {
    minHeight: a11y.minTouchTarget + 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    textAlign: 'center',
    fontSize: 26,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
  },
});
