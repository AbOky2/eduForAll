import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressBar, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing, subjectColors } from '../tokens';
import { fr } from '@/localization/fr/strings';

interface SubjectTileProps {
  subject: SubjectArtId;
  label: string;
  completed: number;
  total: number;
  locked: boolean;
  onPress: () => void;
  /** Phrase dite quand l'enfant touche une discipline encore fermée. */
  explanation?: string | null | undefined;
  /** Taille de l'emblème avant mise à l'échelle (défaut 64). */
  artSize?: number;
  /** `row` : l'emblème à gauche des mots — plus bas, pour un écran couché. */
  layout?: 'stack' | 'row';
}

/**
 * Une discipline sur l'accueil (v4) : une carte blanche, l'emblème de sa
 * couleur, son nom, une barre fine et un mot que l'enfant comprend
 * (« À découvrir », « En cours », « Terminé ») — jamais une fraction.
 *
 * Fermée, elle garde son dessin (en gris) et répond quand on la touche : un
 * appui sans effet n'apprend rien à un enfant de six ans.
 */
export function SubjectTile({
  subject,
  label,
  completed,
  total,
  locked,
  onPress,
  explanation,
  artSize = 64,
  layout = 'stack',
}: SubjectTileProps) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const progress = total === 0 ? 0 : completed / total;
  const state = locked
    ? fr.home.subjectState.locked
    : completed === 0
      ? fr.home.subjectState.new
      : completed >= total
        ? fr.home.subjectState.done
        : fr.home.subjectState.started;
  const row = layout === 'row';
  const pad = scaled(row ? spacing.md : spacing.lg, scale);

  return (
    <EcolnaGalet
      face={colors.white}
      border={colors.border}
      borderWidth={1}
      radius={radius.xl}
      shadow={shadows.card}
      onPress={onPress}
      accessibilityLabel={fr.a11y.progress(locked ? `${label}, ${fr.a11y.locked}` : label, completed, total)}
      accessibilityHint={locked ? fr.learn.lockedA11yHint : undefined}
      style={styles.fill}
      faceStyle={[styles.face, { padding: pad, gap: scaled(spacing.sm, scale) }]}
    >
      <View style={[styles.top, row && styles.topRow, { gap: scaled(row ? spacing.sm : spacing.md, scale) }]}>
        <SubjectArt subject={subject} size={scaled(artSize, scale)} muted={locked} />
        <View style={[styles.words, !row && { marginTop: scaled(spacing.xs, scale) }]}>
          <EcolnaText variant={row ? 'headlineSm' : 'headlineMd'} color={locked ? colors.inkSecondary : colors.ink} numberOfLines={1}>
            {label}
          </EcolnaText>
          <EcolnaText variant={row ? 'labelSm' : 'labelMd'} color={colors.inkSecondary} numberOfLines={explanation ? 3 : 1}>
            {explanation ?? state}
          </EcolnaText>
        </View>
        {locked ? (
          <View style={styles.lock}>
            <EcolnaIcon name="lock" size={scaled(20, scale)} color={colors.inkDisabled} mode="color" />
          </View>
        ) : null}
      </View>
      {locked ? null : (
        <EcolnaProgressBar progress={progress} fill={family.solid} height={8} accessibilityLabel={fr.a11y.progress(label, completed, total)} />
      )}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  face: { justifyContent: 'space-between' },
  top: { alignItems: 'flex-start' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  words: { gap: 2, flexShrink: 1 },
  lock: { position: 'absolute', top: 0, right: 0 },
});
