import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createElement, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { resolveAudioSource } from '@/content/audio-registry.generated';
import { asId } from '@/core/ids/ids';
import { createLogger } from '@/core/logging/logger';
import { getDatabase } from '@/database/connection/database';
import { createLearningAudioService } from '@/features/audio/application/learning-audio-service';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { findLesson, worldOfLesson } from '@/features/curriculum/application/curriculum-catalog';
import { rendererFor } from '@/features/exercises/presentation/exercise-registry';
import {
  createLessonMachine,
  currentStep,
  lessonReducer,
  willMoveOn,
} from '@/features/lesson-session/domain/lesson-machine';
import { recordLessonCompletion } from '@/features/progress/application/record-lesson-completion';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { useSettings } from '@/features/settings/application/settings-store';
import { EcolnaAvatar } from '@/design-system/avatars';
import { FeedbackBanner } from '@/design-system/components/feedback-banner';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import {
  AnswerVerdictContext,
  ExerciseSubjectContext,
  EcolnaAudioButton,
  EcolnaButton,
  EcolnaCard,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaSegmentedProgress,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y, colors, spacing, subjectColors } from '@/design-system/tokens';
import { fr, pickFeedback } from '@/localization/fr/strings';

const log = createLogger('lesson-session');

/** Des étapes sans réponse à juger : on les enchaîne sans verdict. */
const QUIET_STEPS = new Set(['listen', 'listen_and_repeat', 'trace_letter', 'trace_graphism']);

/**
 * L'étape fait-elle entendre quelque chose (un son, un mot, une histoire) ?
 * « Écoute encore une fois » n'a de sens que là ; ailleurs on dit « regarde ».
 */
function makesSound(step: object): boolean {
  return ['audioId', 'storyAudioId', 'statementAudioId'].some(
    (key) => typeof (step as Record<string, unknown>)[key] === 'string',
  );
}

/**
 * Lesson session (mockups S10–S15). Presentation shell around the pure
 * lesson state machine: it renders the current step via the registry,
 * persists progression after every transition, and survives interruption
 * (resume at the saved step).
 */
export default function LessonSessionScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const profile = useActiveProfile((state) => state.profile);
  const lesson = useMemo(() => (lessonId ? findLesson(lessonId) : null), [lessonId]);
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);

  // Load the saved step before creating the machine so an interrupted lesson
  // resumes exactly where the child left it.
  useEffect(() => {
    if (!profile || !lesson) {
      return;
    }
    let cancelled = false;
    void getDatabase()
      .then((db) => createProgressRepository(db).findLessonProgress(profile.id, asId(lesson.id)))
      .then((progress) => {
        if (!cancelled) {
          setResumeIndex(progress?.status === 'in_progress' ? progress.currentStepIndex : 0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [profile, lesson]);

  if (!lesson || !profile) {
    return (
      <EcolnaScreen background="exercise">
        <View style={styles.missing}>
          <EcolnaText variant="headlineMd" align="center">
            {fr.errors.contentUnavailable}
          </EcolnaText>
          <EcolnaButton label={fr.common.back} onPress={() => router.back()} />
        </View>
      </EcolnaScreen>
    );
  }
  if (resumeIndex === null) {
    return <EcolnaScreen background="exercise">{null}</EcolnaScreen>;
  }
  return <SessionBody lesson={lesson} profileId={profile.id} initialStepIndex={resumeIndex} />;
}

function SessionBody({
  lesson,
  profileId,
  initialStepIndex,
}: {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  profileId: ReturnType<typeof asId<'ChildProfileId'>>;
  initialStepIndex: number;
}) {
  const router = useRouter();
  const soundEnabled = useSettings((state) => state.soundEnabled);
  const avatarId = useActiveProfile((state) => state.profile?.avatarId ?? 'avatar-1');
  const { isTablet, scale, screenPadding, contentMaxWidth } = useResponsive();
  const subject = useMemo(() => worldOfLesson(lesson.id)?.subject ?? null, [lesson.id]);
  const [state, dispatch] = useReducer(lessonReducer, undefined, () =>
    createLessonMachine(lesson, initialStepIndex),
  );
  const [quitVisible, setQuitVisible] = useState(false);
  // Le corps défile seulement s'il ne tient pas : sinon un geste de tracé ou
  // de glisser ne doit jamais être pris pour un défilement.
  const [bodyHeight, setBodyHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const completionHandled = useRef(false);

  const audio = useRef(createLearningAudioService(resolveAudioSource));
  useEffect(() => {
    const service = audio.current;
    return () => service.dispose();
  }, []);

  // L'anneau « en train de parler » du bouton qui joue, ~2,5 s.
  const markPlaying = (audioId: string) => {
    setPlayingAudioId(audioId);
    setTimeout(() => setPlayingAudioId((current) => (current === audioId ? null : current)), 2500);
  };

  const playAudio = (audioId: string) => {
    if (!soundEnabled) {
      return;
    }
    audio.current
      .play(audioId)
      .then(() => markPlaying(audioId))
      .catch((cause) => log.warn(`audio failed for ${audioId}: ${String(cause)}`));
  };

  // Persist the reached step so a killed app resumes exactly here.
  useEffect(() => {
    if (state.phase !== 'presenting') {
      return;
    }
    void getDatabase().then((db) =>
      createProgressRepository(db).saveStepReached(profileId, asId(lesson.id), state.stepIndex),
    );
    // Un enfant de CP ne lit pas encore : la consigne est dite d'elle-même à
    // chaque exercice, puis le son que l'exercice vient de lancer (le mot, la
    // syllabe — les effets des enfants passent avant celui-ci).
    if (soundEnabled) {
      const presented = lesson.steps[state.stepIndex];
      if (presented) {
        const stimulus = audio.current.justStarted(600);
        const intro = [presented.instruction.audioId];
        if (stimulus && stimulus !== presented.instruction.audioId) {
          intro.push(stimulus);
        }
        audio.current
          .playSequence(intro, markPlaying)
          .catch((cause) => log.warn(`instruction audio failed: ${String(cause)}`));
      }
    }
    // Auto-advance: presentation immediately awaits the child's answer.
    dispatch({ type: 'STEP_PRESENTED' });
  }, [state.phase, state.stepIndex, profileId, lesson, soundEnabled]);

  // Record every attempt (for the revision engine and parent dashboard).
  useEffect(() => {
    if (state.phase !== 'showing_feedback' || !state.lastFeedback) {
      return;
    }
    const step = currentStep(state);
    void getDatabase().then((db) =>
      createProgressRepository(db).recordAttempt({
        childProfileId: profileId,
        lessonId: asId(lesson.id),
        stepId: step.id,
        exerciseType: step.type,
        isCorrect: state.lastFeedback === 'correct',
        usedHint: state.hintShownOnCurrentStep,
        attemptIndex: state.attemptsOnCurrentStep,
      }),
    );
    if (state.lastFeedback === 'correct') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    }
  }, [state.phase, state.lastFeedback, profileId, lesson, state]);

  // Écouter, répéter, tracer : rien à juger. Le pas est enregistré par l'effet
  // ci-dessus, puis on enchaîne sans feuille « Bravo » — la félicitation garde
  // son sens pour les vraies réussites.
  useEffect(() => {
    if (state.phase !== 'showing_feedback' || state.lastFeedback !== 'correct') {
      return;
    }
    if (QUIET_STEPS.has(currentStep(state).type)) {
      dispatch({ type: 'FEEDBACK_DISMISSED' });
    }
  }, [state]);

  // L'indice s'ouvre (demandé, ou de lui-même après deux essais) : il est dit.
  useEffect(() => {
    if (state.phase !== 'showing_hint' || !soundEnabled) {
      return;
    }
    const hintAudio = currentStep(state).hint?.audioId;
    if (hintAudio) {
      audio.current
        .play(hintAudio)
        .then(() => markPlaying(hintAudio))
        .catch((cause) => log.warn(`hint audio failed: ${String(cause)}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.stepIndex, soundEnabled]);

  // Completion: score, persist, navigate to the result screen.
  useEffect(() => {
    if (state.phase !== 'completed' || completionHandled.current) {
      return;
    }
    completionHandled.current = true;
    audio.current.stop();
    void recordLessonCompletion({
      childProfileId: profileId,
      lesson,
      outcomes: state.outcomes,
      startedAt: startedAtRef.current,
    }).then(({ score, newAchievements }) => {
      router.replace({
        pathname: '/(child)/lesson/result',
        params: {
          stars: String(score.stars),
          lessonId: lesson.id,
          badges: newAchievements.join(','),
        },
      });
    });
  }, [state.phase, profileId, lesson, state.outcomes, router]);

  const step = state.phase === 'completed' ? null : currentStep(state);
  const renderer = step ? rendererFor(step) : null;

  return (
    <EcolnaScreen background="exercise" fullWidth>
      {/* En-tête : fermer — progression — indice. */}
      <View
        style={[
          styles.header,
          { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) },
        ]}
      >
        <EcolnaIconButton
          icon="close"
          accessibilityLabel={fr.lesson.quit}
          onPress={() => setQuitVisible(true)}
        />
        <View style={styles.progressWrap}>
          <EcolnaSegmentedProgress
            total={lesson.steps.length}
            done={state.phase === 'completed' ? lesson.steps.length : state.stepIndex}
            fill={subject ? subjectColors[subject].solid : colors.brand}
            height={isTablet ? 14 : 10}
            accessibilityLabel={fr.lesson.exerciseCount(state.stepIndex + 1, lesson.steps.length)}
          />
        </View>
        {step?.hint ? (
          // Un disque soleil, l'ampoule à l'encre : l'aide se voit en plein soleil (9,6:1).
          <EcolnaIconButton
            icon="lightbulb"
            tone="sun"
            accessibilityLabel={fr.lesson.hint}
            onPress={() => dispatch({ type: 'HINT_REQUESTED' })}
          />
        ) : (
          <View style={{ width: Math.max(48, scaled(52, scale)) }} />
        )}
      </View>

      {/* La consigne, une seule fois, et toujours réécoutable. */}
      {step ? (
        <View
          style={[
            styles.instruction,
            { paddingHorizontal: screenPadding, gap: scaled(spacing.sm, scale) },
          ]}
        >
          <EcolnaAudioButton
            variant="sky"
            icon="speech"
            // Le diamètre du bouton « fermer » : consigne et barre partent du même bord.
            size={Math.max(a11y.childTouchTarget, scaled(52, scale))}
            accessibilityLabel={fr.lesson.replayInstruction}
            playing={playingAudioId === step.instruction.audioId}
            onPress={() => playAudio(step.instruction.audioId)}
          />
          <EcolnaText
            variant={isTablet ? 'headlineLg' : 'headlineMd'}
            style={styles.instructionText}
          >
            {step.instruction.text}
          </EcolnaText>
        </View>
      ) : null}

      {/* Exercise body — centré quand il tient, défilable sinon (petite
          fenêtre couchée) : un contenu centré trop haut déborderait sur la consigne. */}
      <ScrollView
        style={[
          styles.body,
          { maxWidth: isTablet ? contentMaxWidth + screenPadding * 2 : undefined },
        ]}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingHorizontal: screenPadding, paddingBottom: scaled(spacing.lg, scale) },
        ]}
        scrollEnabled={contentHeight > bodyHeight + 1}
        onLayout={(event) => setBodyHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step && renderer ? (
          // Pendant la feuille de retour, la carte choisie montre elle-même le verdict.
          <ExerciseSubjectContext.Provider value={subject}>
            <AnswerVerdictContext.Provider
              value={state.phase === 'showing_feedback' ? state.lastFeedback : null}
            >
              {
                // key remounts the renderer per step: fresh local state, no reset effects.
                // playAudio only touches the audio ref inside event handlers, never during render.
                // eslint-disable-next-line react-hooks/refs
                createElement(renderer, {
                  key: step.id,
                  step,
                  interactive: state.phase === 'awaiting_answer',
                  onSubmit: (answer) => dispatch({ type: 'ANSWER_SUBMITTED', answer }),
                  playAudio,
                  playingAudioId,
                })
              }
            </AnswerVerdictContext.Provider>
          </ExerciseSubjectContext.Provider>
        ) : step ? (
          <View style={styles.missing}>
            <EcolnaText variant="bodyLg" align="center" color={colors.textSecondary}>
              {fr.errors.contentUnavailable}
            </EcolnaText>
            <EcolnaButton
              label={fr.common.next}
              onPress={() =>
                dispatch({ type: 'ANSWER_SUBMITTED', answer: { kind: 'acknowledge' } })
              }
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Feedback */}
      {state.phase === 'showing_feedback' &&
      state.lastFeedback &&
      !(state.lastFeedback === 'correct' && step && QUIET_STEPS.has(step.type)) ? (
        <FeedbackBanner
          kind={state.lastFeedback}
          avatarId={avatarId}
          moveOn={willMoveOn(state)}
          message={
            willMoveOn(state)
              ? fr.lesson.moveOn
              : pickFeedback(
                  state.lastFeedback === 'correct'
                    ? fr.lesson.feedbackCorrect
                    : step && makesSound(step)
                      ? fr.lesson.feedbackIncorrectListen
                      : fr.lesson.feedbackIncorrectLook,
                  state.stepIndex + state.attemptsOnCurrentStep,
                )
          }
          actionLabel={
            state.lastFeedback === 'correct' || willMoveOn(state)
              ? fr.common.continue
              : fr.common.retry
          }
          onAction={() => dispatch({ type: 'FEEDBACK_DISMISSED' })}
        />
      ) : null}

      {/* Indice : une feuille posée en bas, l'exercice reste visible derrière. */}
      {state.phase === 'showing_hint' && step?.hint ? (
        <View style={[styles.overlay, styles.overlayBottom, { padding: screenPadding }]}>
          <EcolnaCard rounded="xl" style={[styles.sheetCard, { maxWidth: contentMaxWidth }]}>
            <View style={styles.hintHeader}>
              <EcolnaIcon name="lightbulb" size={scaled(48, scale)} mode="color" />
              <EcolnaText variant="headlineMd" style={styles.flex}>
                {fr.lesson.hint}
              </EcolnaText>
              {step.hint.audioId ? (
                <EcolnaAudioButton
                  variant="sky"
                  size={scaled(48, scale)}
                  playing={playingAudioId === step.hint.audioId}
                  onPress={() => step.hint?.audioId && playAudio(step.hint.audioId)}
                />
              ) : null}
            </View>
            <EcolnaText variant="bodyLg">{step.hint.text}</EcolnaText>
            <EcolnaButton
              label={fr.common.understood}
              icon={<EcolnaIcon name="check" size={scaled(20, scale)} color={colors.onReward} />}
              onPress={() => dispatch({ type: 'HINT_DISMISSED' })}
            />
          </EcolnaCard>
        </View>
      ) : null}

      {/* Quit confirmation */}
      <Modal
        transparent
        visible={quitVisible}
        animationType="fade"
        onRequestClose={() => setQuitVisible(false)}
      >
        <View style={[styles.overlay, styles.overlayCenter, { padding: screenPadding }]}>
          <EcolnaCard rounded="xl" style={[styles.sheetCard, styles.quitCard]}>
            <EcolnaAvatar avatarId={avatarId} size={scaled(88, scale)} />
            <EcolnaText variant="headlineMd" align="center">
              {fr.lesson.quit}
            </EcolnaText>
            <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
              {fr.lesson.quitMessage}
            </EcolnaText>
            <View style={styles.quitButtons}>
              <EcolnaButton label={fr.lesson.quitCancel} onPress={() => setQuitVisible(false)} />
              <EcolnaButton
                label={fr.lesson.quitConfirm}
                variant="secondary"
                onPress={() => {
                  audio.current.stop();
                  setQuitVisible(false);
                  router.back();
                }}
              />
            </View>
          </EcolnaCard>
        </View>
      </Modal>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  progressWrap: { flex: 1 },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  instructionText: { flex: 1 },
  body: { flex: 1, width: '100%', alignSelf: 'center' },
  bodyContent: { flexGrow: 1, paddingTop: spacing.sm },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  flex: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
    alignItems: 'center',
  },
  // Au-dessus des cartes de l'exercice, qui portent une élévation Android.
  overlayBottom: { justifyContent: 'flex-end', zIndex: 20, elevation: 20 },
  overlayCenter: { justifyContent: 'center', flex: 1, position: 'relative' },
  sheetCard: { gap: spacing.md, width: '100%' },
  hintHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quitCard: { maxWidth: 480, alignItems: 'center' },
  quitButtons: { alignSelf: 'stretch', gap: spacing.sm },
});
