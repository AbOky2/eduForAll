import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, fontFamilies, radius, spacing } from '@/design-system/tokens';
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
  const { scale, screenPadding } = useResponsive();
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
    <EcolnaScreen background="plain">
      <View style={[styles.container, { paddingHorizontal: screenPadding, gap: scaled(spacing.lg, scale) }]}>
        <View style={[styles.badge, { width: scaled(80, scale), height: scaled(80, scale) }]}>
          <EcolnaIcon name="shield" size={scaled(40, scale)} color={colors.secondary} />
        </View>
        <View style={styles.titles}>
          <EcolnaText variant="headlineLg" align="center">
            {fr.parent.gateTitle}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
            {fr.parent.gateSubtitle}
          </EcolnaText>
        </View>

        <EcolnaCard rounded="xl" style={[styles.card, { gap: scaled(spacing.md, scale) }]}>
          <EcolnaText variant="bodyMd" color={colors.textSecondary} align="center">
            {fr.parent.gateQuestion}
          </EcolnaText>
          <EcolnaText variant="displayGlyphSmall" align="center">
            {challenge.question} = ?
          </EcolnaText>
          <TextInput
            accessibilityLabel={fr.parent.gateQuestion}
            value={saisie}
            onChangeText={(texte) => {
              setSaisie(texte.replace(/[^0-9]/g, '').slice(0, 4));
              setWrong(false);
            }}
            onSubmitEditing={valider}
            placeholder={fr.parent.gatePlaceholder}
            placeholderTextColor={colors.outline}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={4}
            style={[
              styles.input,
              { minHeight: scaled(60, scale), fontSize: scaled(26, Math.min(scale, 1.15)) },
              wrong && styles.inputWrong,
            ]}
          />
          {wrong ? (
            <EcolnaText variant="bodyMd" color={colors.secondary} align="center">
              {fr.parent.gateWrong}
            </EcolnaText>
          ) : null}
          <EcolnaButton
            label={fr.parent.gateEnter}
            variant="accent"
            onPress={valider}
            disabled={saisie.trim().length === 0}
          />
        </EcolnaCard>

        <EcolnaButton label={fr.common.back} variant="ghost" onPress={goBack} />
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titles: { gap: spacing.xxs, maxWidth: 520 },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { width: '100%', maxWidth: 480 },
  input: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.cardEdge,
    backgroundColor: colors.surfaceContainerLow,
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
  },
  inputWrong: { borderColor: colors.secondary },
});
