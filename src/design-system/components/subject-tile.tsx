import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressBar, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing, subjectColors } from '../tokens';
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
  /** Taille de l'illustration avant mise à l'échelle (défaut 80). */
  artSize?: number;
}

/**
 * Une discipline sur l'accueil : un galet de sa couleur (direction v3 § 4),
 * son objet d'écolier, sa barre de progression et le compte « 3 / 18 ». La
 * couleur dit la discipline avant que l'enfant sache lire son nom.
 *
 * Fermée, elle garde son dessin (en tons verrouillés) et répond quand on la
 * touche : un appui sans effet n'apprend rien à un enfant de six ans.
 */
export function SubjectTile({
  subject,
  label,
  completed,
  total,
  locked,
  onPress,
  explanation,
  artSize = 80,
}: SubjectTileProps) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const face = locked ? colors.lockedContainer : family.face;
  const edge = locked ? colors.lockedEdge : family.edge;
  // Le gris « fermé » reste aux icônes : un texte doit se lire (4,5:1).
  const ink = locked ? colors.textSecondary : family.ink;
  const progress = total === 0 ? 0 : completed / total;

  return (
    <EcolnaGalet
      face={face}
      edge={edge}
      radius={radius.xl}
      depth="lg"
      onPress={onPress}
      accessibilityLabel={fr.a11y.progress(
        locked ? `${label}, ${fr.a11y.locked}` : label,
        completed,
        total,
      )}
      accessibilityHint={locked ? fr.learn.lockedA11yHint : undefined}
      style={styles.fill}
      faceStyle={[
        styles.face,
        { padding: scaled(spacing.md, scale), gap: scaled(spacing.xs, scale) },
      ]}
    >
      <View style={styles.artRow}>
        <SubjectArt subject={subject} size={scaled(artSize, scale)} muted={locked} />
        {locked ? (
          <View style={styles.lock}>
            <EcolnaIcon name="lock" size={scaled(24, scale)} color={colors.locked} />
          </View>
        ) : null}
      </View>
      <EcolnaText variant="headlineSm" color={ink} align="center" numberOfLines={1}>
        {label}
      </EcolnaText>
      <View style={styles.progressRow}>
        <View style={styles.bar}>
          <EcolnaProgressBar
            progress={progress}
            fill={locked ? colors.locked : family.deep}
            track={colors.card}
            height={10}
            accessibilityLabel={fr.a11y.progress(label, completed, total)}
          />
        </View>
        <EcolnaText variant="labelSm" color={ink}>
          {`${completed}/${total}`}
        </EcolnaText>
      </View>
      {explanation ? (
        <EcolnaText
          variant="bodyMd"
          color={colors.textPrimary}
          align="center"
          accessibilityLiveRegion="polite"
        >
          {explanation}
        </EcolnaText>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  face: { alignItems: 'center', justifyContent: 'center' },
  artRow: { alignItems: 'center', justifyContent: 'center' },
  lock: { position: 'absolute', right: -6, bottom: -4 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  bar: { flex: 1 },
});
