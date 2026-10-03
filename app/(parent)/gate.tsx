import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, fontFamilies, radius, spacing } from '@/design-system/tokens';
import { typography } from '@/design-system/tokens/typography';
import { fr } from '@/localization/fr/strings';
import { useKeyboardVisible } from '@/shared/hooks/use-keyboard-visible';
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
  const [focused, setFocused] = useState(false);
  const { scale, screenPadding } = useResponsive();
  const keyboard = useKeyboardVisible();
  const challenge = useMemo(() => CHALLENGES[attempt % CHALLENGES.length]!, [attempt]);

  const valider = () => {
    // Champ vide : rien à vérifier (le bouton n'est jamais grisé pour autant).
    if (saisie.trim().length === 0) {
      return;
    }
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

  // Le texte indicatif est une invitation, en romain gris ; la réponse saisie
  // est une valeur, en gras et grande. Les confondre, c'est croire le champ
  // déjà rempli.
  const typing = saisie.length > 0;
  const inputType = typing ? typography.headlineLg : typography.bodyLg;

  return (
    <EcolnaScreen background="plain">
      {/* Retour : le bouton de toujours, en haut à gauche, comme partout ailleurs. */}
      <EcolnaScreenHeader onBack={goBack} />
      {/* Le clavier numérique ne doit jamais couvrir le champ ni « Entrer » :
          la page remonte (iOS), défile (partout), et l'écusson s'efface. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: screenPadding,
              paddingVertical: scaled(spacing.lg, scale),
              gap: scaled(spacing.lg, scale),
            },
          ]}
        >
          {keyboard ? null : (
            <View style={[styles.badge, { width: scaled(80, scale), height: scaled(80, scale) }]}>
              <EcolnaIcon name="shield" size={scaled(40, scale)} color={colors.brand} />
            </View>
          )}
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
              {`${challenge.question} =\u00a0?`}
            </EcolnaText>
            <TextInput
              accessibilityLabel={fr.parent.gateQuestion}
              value={saisie}
              onChangeText={(texte) => {
                setSaisie(texte.replace(/[^0-9]/g, '').slice(0, 4));
                setWrong(false);
              }}
              onSubmitEditing={valider}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={fr.parent.gatePlaceholder}
              placeholderTextColor={colors.inkTertiary}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={4}
              style={[
                styles.input,
                {
                  minHeight: scaled(60, scale),
                  fontFamily: typing ? fontFamilies.bold : fontFamilies.regular,
                  fontSize: scaled(inputType.fontSize, scale),
                },
                (focused || wrong) && styles.inputFocused,
              ]}
            />
            {wrong ? (
              <EcolnaText variant="bodyMd" color={colors.brand} align="center">
                {fr.parent.gateWrong}
              </EcolnaText>
            ) : null}
            <EcolnaButton
              label={fr.parent.gateEnter}
              variant="accent"
              onPress={valider}
            />
          </EcolnaCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  titles: { gap: spacing.xxs, maxWidth: 520 },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { width: '100%', maxWidth: 480 },
  // Au repos, un puits sans filet ; au focus (ou après une erreur), le filet bleu de 2 dp.
  input: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.fill,
    backgroundColor: colors.fill,
    textAlign: 'center',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    // Le filet bleu dit le focus ; aucun contour de navigateur par-dessus.
    outlineWidth: 0,
  },
  inputFocused: { borderColor: colors.brand, backgroundColor: colors.white },
});
