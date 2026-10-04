import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useParentSession } from '@/features/parent-space/application/parent-session-store';
import {
  drawGateChallenge,
  gateAnswer,
} from '@/features/parent-space/domain/parent-gate-challenge';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, fontFamilies, radius, spacing } from '@/design-system/tokens';
import { typography } from '@/design-system/tokens/typography';
import { fr } from '@/localization/fr/strings';
import { useKeyboardVisible } from '@/shared/hooks/use-keyboard-visible';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Porte parentale : une multiplication qu'un enfant de six à huit ans ne sait
 * pas encore poser, à SAISIR et non à choisir, tirée au hasard à chaque
 * ouverture (deux facteurs de 6 à 9).
 *
 * Trois réponses proposées laissaient une chance sur trois par essai, sans
 * limite de tentatives : un enfant qui tape au hasard entrait en trois coups.
 * Une liste fixe, elle, posait toujours « 7 × 6 » en premier : il suffisait
 * d'avoir vu taper 42 une fois. Après chaque erreur, une AUTRE opération
 * (autre résultat) : ni le hasard ni la mémoire ne mènent à l'intérieur.
 *
 * La bonne réponse ouvre la session parent (éphémère, voir
 * `parent-session-store`) : sans elle, les layouts `(parent)` et `(settings)`
 * renvoient ici, lien profond compris. Bloque l'accès aux actions réservées
 * aux adultes : réinitialisation, partage, diagnostic, changement de classe.
 *
 * `testID` stables (`parent-gate-question`, `parent-gate-answer`) : les
 * parcours Maestro lisent l'opération et calculent la réponse.
 */
export default function ParentGateScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const unlock = useParentSession((state) => state.unlock);
  // Tirée une fois à l'ouverture (initialiseur, hors du rendu), puis dans le
  // gestionnaire après chaque erreur.
  const [challenge, setChallenge] = useState(() => drawGateChallenge());
  const [wrong, setWrong] = useState(false);
  const [saisie, setSaisie] = useState('');
  const [focused, setFocused] = useState(false);
  const { scale, screenPadding } = useResponsive();
  const keyboard = useKeyboardVisible();

  const valider = () => {
    // Champ vide : rien à vérifier (le bouton n'est jamais grisé pour autant).
    if (saisie.trim().length === 0) {
      return;
    }
    if (Number(saisie.trim()) === gateAnswer(challenge)) {
      unlock();
      router.replace('/(parent)/dashboard');
      return;
    }
    setWrong(true);
    setSaisie('');
    // Une autre opération, d'un autre résultat : réessayer au hasard ou
    // retenir un nombre vu par-dessus l'épaule ne mène nulle part.
    setChallenge(drawGateChallenge(challenge));
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
            <EcolnaText variant="displayGlyphSmall" align="center" testID="parent-gate-question">
              {fr.parent.gateOperation(challenge.left, challenge.right)}
            </EcolnaText>
            <TextInput
              testID="parent-gate-answer"
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
              <EcolnaText
                variant="bodyMd"
                color={colors.brand}
                align="center"
                accessibilityLiveRegion="polite"
              >
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
  // Le même champ que le prénom (création de profil) : blanc, filet de 2 dp
  // (« 2 dp sur ce qui se touche ») ; au focus ou après une erreur, le filet
  // passe au bleu. Jamais un puits gris, qui se lirait « désactivé ».
  input: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    textAlign: 'center',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    // Le filet bleu dit le focus ; aucun contour de navigateur par-dessus.
    outlineWidth: 0,
  },
  inputFocused: { borderColor: colors.brand },
});
