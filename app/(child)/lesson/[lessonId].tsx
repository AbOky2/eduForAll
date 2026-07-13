import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { resolveAudioSource } from '@/content/audio-registry.generated';
import { asId } from '@/core/ids/ids';
import { createLogger } from '@/core/logging/logger';
import { getDatabase } from '@/database/connection/database';
import { createLearningAudioService } from '@/features/audio/application/learning-audio-service';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { findLesson } from '@/features/curriculum/application/curriculum-catalog';
import { rendererFor } from '@/features/exercises/presentation/exercise-registry';
import {
  createLessonMachine,
  currentStep,
  lessonReducer,
} from '@/features/lesson-session/domain/lesson-machine';
import { recordLessonCompletion } from '@/features/progress/application/record-lesson-completion';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { useSettings } from '@/features/settings/application/settings-store';
import { FeedbackBanner } from '@/design-system/components/feedback-banner';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { AlifaButton, AlifaCard, AlifaProgressBar, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { a11y, colors, spacing } from '@/design-system/tokens';
import { fr, pickFeedback } from '@/localization/fr/strings';

const log = createLogger('lesson-session');

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
      <AlifaScreen background="exercise">
        <View style={styles.missing}>
          <AlifaText variant="headlineMd" align="center">
            {fr.errors.contentUnavailable}
          </AlifaText>
          <AlifaButton label={fr.common.back} onPress={() => router.back()} />
        </View>
      </AlifaScreen>
    );
  }
  if (resumeIndex === null) {
    return <AlifaScreen background="exercise">{null}</AlifaScreen>;
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
  const [state, dispatch] = useReducer(lessonReducer, undefined, () =>
    createLessonMachine(lesson, initialStepIndex),
  );
  const [quitVisible, setQuitVisible] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const completionHandled = useRef(false);

  const audio = useRef(createLearningAudioService(resolveAudioSource));
  useEffect(() => {
    const service = audio.current;
    return () => service.dispose();
  }, []);

  const playAudio = (audioId: string) => {
    if (!soundEnabled) {
      return;
    }
    audio.current
      .play(audioId)
      .then(() => {
        setPlayingAudioId(audioId);
        setTimeout(() => setPlayingAudioId((current) => (current === audioId ? null : current)), 2500);
      })
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
    // Auto-advance: presentation immediately awaits the child's answer.
    dispatch({ type: 'STEP_PRESENTED' });
  }, [state.phase, state.stepIndex, profileId, lesson]);

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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  }, [state.phase, state.lastFeedback, profileId, lesson, state]);

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
    }).then((score) => {
      router.replace({
        pathname: '/(child)/lesson/result',
        params: { stars: String(score.stars), lessonId: lesson.id },
      });
    });
  }, [state.phase, profileId, lesson, state.outcomes, router]);

  const step = state.phase === 'completed' ? null : currentStep(state);
  const Renderer = step ? rendererFor(step) : null;
  const progress = state.stepIndex / lesson.steps.length;

  return (
    <AlifaScreen background="exercise">
      {/* Header: close — progress — hint */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.lesson.quit}
          onPress={() => setQuitVisible(true)}
          style={styles.headerButton}
        >
          <AlifaIcon name="close" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.progressWrap}>
          <AlifaProgressBar progress={progress} accessibilityLabel={fr.lesson.exerciseCount(state.stepIndex + 1, lesson.steps.length)} />
        </View>
        {step?.hint ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fr.lesson.hint}
            onPress={() => dispatch({ type: 'HINT_REQUESTED' })}
            style={styles.headerButton}
          >
            <AlifaIcon name="lightbulb" size={22} color={colors.tertiary} />
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Instruction */}
      {step && step.type !== 'compose_syllable' && step.type !== 'compose_word' ? (
        <AlifaText variant="headlineMd" align="center" style={styles.instruction}>
          {step.instruction.text}
        </AlifaText>
      ) : null}

      {/* Exercise body */}
      <View style={styles.body}>
        {step && Renderer ? (
          <Renderer
            step={step}
            interactive={state.phase === 'awaiting_answer'}
            onSubmit={(answer) => dispatch({ type: 'ANSWER_SUBMITTED', answer })}
            playAudio={playAudio}
            playingAudioId={playingAudioId}
          />
        ) : step ? (
          <View style={styles.missing}>
            <AlifaText variant="bodyLg" align="center" color={colors.textSecondary}>
              {fr.errors.contentUnavailable}
            </AlifaText>
            <AlifaButton
              label={fr.common.next}
              onPress={() => dispatch({ type: 'ANSWER_SUBMITTED', answer: { kind: 'acknowledge' } })}
            />
          </View>
        ) : null}
      </View>

      {/* Feedback */}
      {state.phase === 'showing_feedback' && state.lastFeedback ? (
        <FeedbackBanner
          kind={state.lastFeedback}
          message={pickFeedback(
            state.lastFeedback === 'correct' ? fr.lesson.feedbackCorrect : fr.lesson.feedbackIncorrect,
            state.stepIndex + state.attemptsOnCurrentStep,
          )}
          actionLabel={state.lastFeedback === 'correct' ? fr.common.continue : fr.common.retry}
          onAction={() => dispatch({ type: 'FEEDBACK_DISMISSED' })}
        />
      ) : null}

      {/* Hint sheet */}
      {state.phase === 'showing_hint' && step?.hint ? (
        <View style={styles.hintOverlay}>
          <AlifaCard rounded="xl" style={styles.hintCard}>
            <View style={styles.hintHeader}>
              <AlifaIcon name="lightbulb" size={26} color={colors.tertiary} />
              <AlifaText variant="headlineSm">{fr.lesson.hint}</AlifaText>
            </View>
            <AlifaText variant="bodyLg">{step.hint.text}</AlifaText>
            <AlifaButton label={fr.common.understood} onPress={() => dispatch({ type: 'HINT_DISMISSED' })} />
          </AlifaCard>
        </View>
      ) : null}

      {/* Quit confirmation */}
      <Modal transparent visible={quitVisible} animationType="fade" onRequestClose={() => setQuitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <AlifaCard rounded="xl" style={styles.modalCard}>
            <AlifaText variant="headlineSm" align="center">
              {fr.lesson.quit}
            </AlifaText>
            <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
              {fr.lesson.quitMessage}
            </AlifaText>
            <AlifaButton label={fr.lesson.quitCancel} onPress={() => setQuitVisible(false)} />
            <AlifaButton
              label={fr.lesson.quitConfirm}
              variant="secondary"
              onPress={() => {
                audio.current.stop();
                setQuitVisible(false);
                router.back();
              }}
            />
          </AlifaCard>
        </View>
      </Modal>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: a11y.minTouchTarget,
    height: a11y.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: { flex: 1 },
  instruction: { paddingHorizontal: spacing.screenMargin, paddingTop: spacing.xs },
  body: { flex: 1, paddingHorizontal: spacing.screenMargin, paddingBottom: spacing.md },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  hintOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(22,26,50,0.35)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  hintCard: { gap: spacing.md },
  hintHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(22,26,50,0.35)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: { gap: spacing.md },
});
