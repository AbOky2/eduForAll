import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  findNodeHandle,
  type Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LevelId } from '@/content/schemas/curriculum-schema';
import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  AVATAR_IDS,
  isValidFirstName,
  type AvatarId,
} from '@/features/child-profile/domain/child-profile';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import {
  LevelCard,
  StepDots,
  heroTitleStyle,
} from '@/features/onboarding/presentation/ceremony-parts';
import { ProfileStage } from '@/features/onboarding/presentation/profile-stage';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { AvatarGrid } from '@/design-system/components/avatar-grid';
import { NudgeRing } from '@/design-system/components/nudge-ring';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { EcolnaButton, EcolnaIconButton, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y, colors, fontFamilies, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useKeyboardVisible } from '@/shared/hooks/use-keyboard-visible';

type Step = 'avatar' | 'name' | 'level' | 'welcome';
const ORDER: Step[] = ['avatar', 'name', 'level', 'welcome'];

/** Fondu enchaîné du panneau d'étape : 220 ms, 120 ms en mouvement réduit. */
function FadeIn({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: reducedMotion ? 120 : 220,
      useNativeDriver: true,
    }).start();
  }, [opacity, reducedMotion]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

/**
 * « Crée ton profil » — la petite cérémonie d'entrée à l'école (brief v2
 * § 12). L'enfant choisit qui il est ; un adulte écrit son prénom pendant
 * qu'il le voit s'écrire à la craie sur son ardoise ; il dit dans quelle
 * classe il est ; et l'école l'accueille. Une décision par étape, la scène ne
 * bouge pas, jamais de bouton grisé : un appui trop tôt rejoue la consigne.
 * Local seulement : ni e-mail, ni mot de passe, ni photo, ni voix.
 */
export default function CreateProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, splitPanes, isTablet, scale, screenPadding } = useResponsive();
  const setActiveProfile = useActiveProfile((state) => state.setProfile);
  const keyboard = useKeyboardVisible();

  const [step, setStep] = useState<Step>('avatar');
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [firstName, setFirstName] = useState('');
  const [level, setLevel] = useState<LevelId | null>(null);
  const [nudge, setNudge] = useState(0);
  const [saving, setSaving] = useState(false);
  const [goVisible, setGoVisible] = useState(false);
  const titleRef = useRef<Text>(null);
  const inputRef = useRef<TextInput>(null);
  // Un double appui sur « C'est parti » ne doit jamais créer deux profils :
  // l'état `saving` n'est relu qu'au rendu suivant, le ref tout de suite.
  const savingRef = useRef(false);

  const stepNumber = ORDER.indexOf(step) + 1;
  const compact = keyboard || height - insets.top - insets.bottom < 480;

  const goTo = (next: Step) => {
    setNudge(0);
    setStep(next);
  };
  const enterSchool = () => router.replace('/(child)/(tabs)');
  const previous = () => {
    // Le profil est enregistré : revenir en arrière le recréerait. Le retour
    // mène alors à l'école, comme « On y va ! ».
    if (step === 'welcome') {
      enterSchool();
      return true;
    }
    const index = ORDER.indexOf(step);
    if (index <= 0) {
      return false;
    }
    goTo(ORDER[index - 1] ?? 'avatar');
    return true;
  };

  // Retour Android = étape précédente (puis l'onboarding).
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', previous);
    return () => subscription.remove();
  });

  // À chaque étape, le lecteur d'écran part du titre ; le champ du prénom
  // prend le focus tout seul, sauf si un lecteur d'écran est actif.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const node = titleRef.current ? findNodeHandle(titleRef.current) : null;
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
    if (step !== 'name') {
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
        if (!cancelled && !enabled) {
          inputRef.current?.focus();
        }
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step]);

  // La bienvenue : le bouton « On y va ! » apparaît après 600 ms.
  useEffect(() => {
    if (step !== 'welcome') {
      return undefined;
    }
    AccessibilityInfo.announceForAccessibility(fr.profile.welcome(firstName.trim()));
    const timer = setTimeout(() => setGoVisible(true), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const save = async () => {
    if (!avatarId || !level || !isValidFirstName(firstName) || savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const db = await getDatabase();
      const profile = await createChildProfileRepository(db).create({
        firstName: firstName.trim(),
        avatarId,
        level,
      });
      const settings = createSettingsRepository(db);
      await settings.set('active_profile_id', profile.id);
      await settings.set('onboarding_done', 'true');
      setActiveProfile(profile);
      goTo('welcome');
    } catch (error) {
      // Rien n'est enregistré : l'enfant peut réessayer.
      savingRef.current = false;
      throw error;
    } finally {
      setSaving(false);
    }
  };

  /** Le bouton d'étape : avance, ou rejoue la consigne si rien n'est choisi. */
  const advance = () => {
    if (step === 'avatar') {
      return avatarId ? goTo('name') : setNudge((n) => n + 1);
    }
    if (step === 'name') {
      return isValidFirstName(firstName) ? goTo('level') : setNudge((n) => n + 1);
    }
    if (step === 'level') {
      return level ? void save() : setNudge((n) => n + 1);
    }
    enterSchool();
  };

  // ── Mise en page (§ 12.4) ────────────────────────────────────────────
  const usableHeight = height - insets.top - insets.bottom;
  const stageWidth = splitPanes ? Math.round(width * 0.44) : width;
  const stageHeight = splitPanes
    ? usableHeight
    : isTablet
      ? Math.round(usableHeight * (compact ? 0.26 : 0.36))
      : compact
        ? 150
        : 210;
  // Le médaillon de l'enfant : la plus grande chose de la scène, l'ardoise
  // tenue devant lui comprise.
  const characterSize = splitPanes
    ? Math.min(scaled(240, scale), Math.round(stageHeight * 0.4), Math.round(stageWidth * 0.62))
    : Math.round(Math.min(stageHeight * (isTablet ? 0.52 : 0.44), isTablet ? 260 : 96));
  // Le bouton retour : même place et même taille que sur tous les écrans
  // (EcolnaScreenHeader) — la gouttière, en haut à gauche de l'écran.
  const backSize = Math.max(a11y.minTouchTarget, scaled(52, scale));
  const backTop = (splitPanes ? insets.top : 0) + spacing.sm;
  const panelWidth = splitPanes ? width - stageWidth : width;
  // Un demi-écran : sa propre marge, pas la gouttière de tout l'écran.
  const panelPadding = splitPanes ? scaled(spacing.xl, scale) : screenPadding;
  const panelInner = Math.min(panelWidth - panelPadding * 2, 760);
  const gap = scaled(spacing.lg, scale);

  // Les douze personnages tiennent sans défiler, de la 7" couchée au
  // téléphone : la grille (trois rangées de quatre sur tablette, quatre de
  // trois au téléphone) prend la hauteur que laissent la scène ou le haut du
  // volet, le titre et le bouton — et pas davantage que sa colonne.
  const gridRows = isTablet ? 3 : 4;
  const topRoom = splitPanes ? backTop + backSize : stageHeight + spacing.md + 10;
  const titleRoom = scaled(isTablet ? 40 : 34, scale);
  const footerRoom =
    spacing.sm + scaled(60, scale) + Math.max(insets.bottom, spacing.md) + spacing.xs;
  const gridRoom = usableHeight - topRoom - spacing.lg * 2 - titleRoom - gap - footerRoom;
  const tileExtra = 2 * (2 * scaled(4, scale) + 2);
  const fitAvatar = Math.floor(
    (gridRoom - (gridRows - 1) * scaled(spacing.md, scale)) / gridRows - tileExtra,
  );
  const [minAvatar, capAvatar] = splitPanes ? [56, 92] : isTablet ? [80, 124] : [64, 104];
  const maxAvatar = Math.max(minAvatar, Math.min(capAvatar, Math.floor(fitAvatar / scale)));

  const levelWidth = Math.min(
    Math.floor((panelInner - gap) / 2),
    scaled(splitPanes ? 240 : 220, scale),
  );
  const levelHeight = Math.round(levelWidth * (isTablet ? 1.05 : 1.15));

  const title =
    step === 'avatar'
      ? fr.profile.stepAvatar
      : step === 'name'
        ? fr.profile.stepName
        : step === 'level'
          ? fr.profile.stepLevel
          : fr.profile.welcome(firstName.trim());
  const help =
    nudge > 0
      ? step === 'avatar'
        ? fr.profile.helpAvatar
        : step === 'name'
          ? fr.profile.helpName
          : step === 'level'
            ? fr.profile.helpLevel
            : null
      : null;
  const action =
    step === 'avatar'
      ? fr.profile.itsMe
      : step === 'name'
        ? fr.profile.itsMyName
        : step === 'level'
          ? fr.profile.go
          : fr.profile.letsGo;

  const body =
    step === 'avatar' ? (
      <NudgeRing key={`a-${nudge}`} active={nudge > 0} announcement={help}>
        <AvatarGrid
          avatarIds={AVATAR_IDS}
          selectedId={avatarId}
          onSelect={(id) => {
            setAvatarId(id as AvatarId);
            setNudge(0);
          }}
          // Les douze tiennent sans défiler (voir `maxAvatar`).
          minAvatar={minAvatar}
          maxAvatar={maxAvatar}
          labelFor={(id, index) =>
            fr.avatars.tileLabel(index + 1, fr.avatars.descriptions[id as AvatarId])
          }
          accessibilityLabel={fr.profile.stepAvatar}
        />
      </NudgeRing>
    ) : step === 'name' ? (
      <View style={{ gap: scaled(spacing.md, scale) }}>
        {compact ? null : (
          <View style={styles.adultRow}>
            <EcolnaIcon name="parents" size={20} color={colors.textSecondary} />
            <EcolnaText variant="labelMd" color={colors.textSecondary} style={styles.flex}>
              {fr.profile.adultNameHelp}
            </EcolnaText>
          </View>
        )}
        <EcolnaText variant="labelLg" color={colors.textPrimary}>
          {fr.profile.firstNameLabel}
        </EcolnaText>
        <NudgeRing key={`n-${nudge}`} active={nudge > 0} announcement={help}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              accessibilityLabel={fr.profile.firstNameLabel}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setNudge(0);
              }}
              placeholder={fr.profile.firstNamePlaceholder}
              placeholderTextColor={colors.inkTertiary}
              maxLength={30}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              returnKeyType="next"
              disableFullscreenUI
              onSubmitEditing={advance}
              style={[
                styles.input,
                {
                  height: scaled(isTablet ? 72 : 64, scale),
                  fontSize: scaled(isTablet ? 28 : 24, Math.min(scale, 1.15)),
                },
              ]}
            />
            {firstName ? (
              <EcolnaIconButton
                icon="close"
                accessibilityLabel={fr.profile.clearName}
                onPress={() => setFirstName('')}
                size={48}
              />
            ) : null}
          </View>
        </NudgeRing>
        <View style={styles.adultRow}>
          <EcolnaIcon name="shield" size={20} color={colors.brand} />
          <EcolnaText variant="bodySm" color={colors.textSecondary} style={styles.flex}>
            {fr.profile.privacyNote}
          </EcolnaText>
        </View>
      </View>
    ) : step === 'level' ? (
      <View style={{ gap: scaled(spacing.md, scale) }}>
        <NudgeRing key={`l-${nudge}`} active={nudge > 0} announcement={help}>
          <View accessibilityRole="radiogroup" style={[styles.levelRow, { gap }]}>
            {(['CP1', 'CP2'] as const).map((option) => (
              <LevelCard
                key={option}
                level={option}
                selected={level === option}
                onSelect={() => {
                  setLevel(option);
                  setNudge(0);
                }}
                width={levelWidth}
                height={levelHeight}
              />
            ))}
          </View>
        </NudgeRing>
        {/* Une phrase pour l'adulte, marquée comme telle (vouvoiement, pictogramme parents). */}
        <View style={[styles.adultRow, styles.center]}>
          <EcolnaIcon name="parents" size={20} color={colors.textSecondary} />
          <EcolnaText variant="bodySm" color={colors.textSecondary}>
            {fr.profile.levelAdultNote}
          </EcolnaText>
        </View>
      </View>
    ) : null;

  const panel = (
    <View
      style={[
        styles.panel,
        { paddingHorizontal: panelPadding, paddingTop: splitPanes ? backTop : spacing.md },
      ]}
      pointerEvents="box-none"
    >
      {/* Les points d'étape, à la hauteur du bouton retour en deux volets. */}
      <View style={[styles.topRow, { width: panelInner, minHeight: splitPanes ? backSize : 0 }]}>
        {!compact && step !== 'welcome' ? <StepDots step={stepNumber} total={3} /> : null}
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.panelScroll, { gap }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn key={step}>
          <View style={[styles.stepColumn, { width: panelInner, gap }]}>
            <EcolnaText
              ref={titleRef}
              accessibilityRole="header"
              variant={isTablet ? 'displayHero' : 'headlineLg'}
              align={step === 'welcome' ? 'center' : 'left'}
              // La bienvenue parle aussi fort que la première page de l'app.
              style={step === 'welcome' ? heroTitleStyle(isTablet, scale) : undefined}
            >
              {title}
            </EcolnaText>
            {body}
            {help ? (
              <EcolnaText variant="headlineSm" color={colors.brandInk} align="center">
                {help}
              </EcolnaText>
            ) : null}
          </View>
        </FadeIn>
      </ScrollView>
      {/* Le bouton d'étape reste au pied du panneau : il ne passe jamais sous
          la grille, un enfant ne fait pas défiler pour le chercher. */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs }]}>
        <View style={{ width: panelInner }}>
          {step !== 'welcome' || goVisible ? (
            <EcolnaButton label={action} onPress={advance} disabled={saving} />
          ) : null}
        </View>
      </View>
    </View>
  );

  const stage = (
    <View>
      <ProfileStage
        width={stageWidth}
        height={stageHeight}
        avatarId={avatarId}
        firstName={firstName}
        level={step === 'avatar' || step === 'name' ? null : level}
        showSlate={step !== 'avatar'}
        characterSize={characterSize}
        joy={step === 'welcome' || avatarId !== null}
        celebrate={step === 'welcome'}
        inviteKey={step === 'avatar' ? nudge : 0}
      />
    </View>
  );

  const back =
    step !== 'welcome' ? (
      <EcolnaIconButton
        icon="arrow-back"
        accessibilityLabel={fr.common.back}
        onPress={() => {
          if (!previous()) {
            router.back();
          }
        }}
        style={[styles.back, { top: backTop, left: screenPadding }]}
      />
    ) : null;

  return (
    <View style={[styles.root, { paddingTop: splitPanes ? 0 : insets.top }]}>
      {/* Une fois le profil enregistré, plus de geste de retour vers le formulaire. */}
      <Stack.Screen options={{ gestureEnabled: step !== 'welcome' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* La bienvenue se passe d'un appui n'importe où. Le conteneur est
            l'ancêtre de tout ce qui est à l'écran : un appui sur la scène ou le
            panneau remonte jusqu'à lui (« On y va ! », plus profond, garde le
            sien). Pas un bouton : aucun rôle ni état pour le lecteur d'écran,
            qui continue de voir « On y va ! ». Hors de la bienvenue, il ne
            réclame aucun appui. */}
        <View
          style={[styles.flex, splitPanes && styles.row]}
          onStartShouldSetResponder={() => step === 'welcome'}
          onResponderRelease={advance}
        >
          {/* Le retour vient en premier pour le lecteur d'écran ; posé au-dessus de la scène. */}
          {back}
          {stage}
          {panel}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  panel: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
  back: { position: 'absolute', zIndex: 2 },
  panelScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.lg },
  stepColumn: { alignSelf: 'center' },
  adultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  center: { alignSelf: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.lg,
  },
  levelRow: { flexDirection: 'row', justifyContent: 'center' },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
});
