import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressBar, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing, subjectColors } from '../tokens';
import { EcolnaPill } from './ecolna-pill';

interface SubjectPortalProps {
  subject: SubjectArtId;
  label: string;
  /** Ce qu'on y fait, en quatre mots (« Les lettres et les sons »). */
  hint: string;
  /** « Nouveau ! » pour une discipline pas encore commencée ; sinon la barre parle. */
  status: string | null;
  completed: number;
  total: number;
  locked: boolean;
  /** `portal` : grande porte verticale ; `row` : carte en ligne (téléphone). */
  layout: 'portal' | 'row';
  /** Taille de l'objet avant mise à l'échelle (porte : défaut 136). */
  artSize?: number;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * La porte d'une discipline sur l'écran « Apprendre » : un grand galet de sa
 * couleur, son objet en grand, ce qu'on y fait et où on en est. En paysage,
 * quatre portes côte à côte ; en portrait, deux par deux ; au téléphone, une
 * carte par ligne.
 */
export function SubjectPortal({
  subject,
  label,
  hint,
  status,
  completed,
  total,
  locked,
  layout,
  artSize = 136,
  onPress,
  accessibilityLabel,
}: SubjectPortalProps) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const face = locked ? colors.lockedContainer : family.face;
  const edge = locked ? colors.lockedEdge : family.edge;
  const ink = locked ? colors.locked : family.ink;
  const progress = total === 0 ? 0 : completed / total;
  const portal = layout === 'portal';

  const bar = (
    <View style={styles.progressRow}>
      <View style={styles.bar}>
        <EcolnaProgressBar
          progress={progress}
          fill={locked ? colors.locked : family.deep}
          track={colors.card}
          height={12}
          accessibilityLabel={`${label} : ${completed} sur ${total}`}
        />
      </View>
      <EcolnaText variant="labelMd" color={ink}>
        {`${completed}/${total}`}
      </EcolnaText>
    </View>
  );

  return (
    <EcolnaGalet
      face={face}
      edge={edge}
      radius={radius.xl}
      depth="lg"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={portal ? styles.portalOuter : undefined}
      faceStyle={[
        portal ? styles.portalFace : styles.rowFace,
        {
          padding: scaled(portal ? spacing.lg : spacing.md, scale),
          gap: scaled(portal ? spacing.sm : spacing.md, scale),
        },
      ]}
    >
      <View>
        <SubjectArt subject={subject} size={scaled(portal ? artSize : 72, scale)} muted={locked} />
        {locked ? (
          <View style={styles.lock}>
            <EcolnaIcon name="lock" size={scaled(portal ? 32 : 24, scale)} color={colors.locked} />
          </View>
        ) : null}
      </View>
      <View style={portal ? styles.portalText : styles.rowText}>
        <EcolnaText variant="headlineMd" color={ink} align={portal ? 'center' : 'left'}>
          {label}
        </EcolnaText>
        <EcolnaText variant="bodyMd" color={colors.textSecondary} align={portal ? 'center' : 'left'}>
          {hint}
        </EcolnaText>
        {status ? (
          <EcolnaPill
            label={status}
            tone="white"
            variant="labelSm"
            style={portal ? styles.centerPill : undefined}
          />
        ) : null}
        {portal ? null : bar}
      </View>
      {/* Art et titre ancrés en haut (les titres s'alignent d'une porte à
          l'autre), la barre posée en bas, l'air entre les deux. */}
      {portal ? <View style={styles.spacer} /> : null}
      {portal ? <View style={styles.portalBar}>{bar}</View> : null}
      {portal ? null : (
        <EcolnaIcon
          name={locked ? 'lock' : 'chevron-right'}
          size={scaled(24, scale)}
          color={locked ? colors.locked : ink}
        />
      )}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  portalOuter: { flex: 1 },
  portalFace: { alignItems: 'center' },
  spacer: { flexGrow: 1 },
  portalText: { alignItems: 'center', gap: spacing.xxs },
  portalBar: { alignSelf: 'stretch' },
  centerPill: { alignSelf: 'center', marginTop: spacing.xxs },
  rowFace: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, gap: spacing.xxs },
  lock: { position: 'absolute', right: 0, bottom: 0 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  bar: { flex: 1 },
});
