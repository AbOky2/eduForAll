import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressBar, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing, subjectColors } from '../tokens';
import { fr } from '@/localization/fr/strings';

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
  /**
   * Réponse à un appui sur une porte fermée : elle remplace la description,
   * plus grande, et le lecteur d'écran l'annonce.
   */
  explanation?: string | null | undefined;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
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
  explanation = null,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: SubjectPortalProps) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const progress = total === 0 ? 0 : completed / total;
  const portal = layout === 'portal';
  // Ouverte : la couleur profonde de la discipline, tout en blanc dessus.
  // Fermée : une surface neutre, l'emblème en gris — toujours reconnaissable.
  const face = locked ? colors.fill : family.deep;
  const ink = locked ? colors.inkSecondary : colors.white;
  const soft = locked ? colors.inkSecondary : colors.onColorSoft;
  const state = locked
    ? fr.home.subjectState.locked
    : completed === 0
      ? fr.home.subjectState.new
      : completed >= total
        ? fr.home.subjectState.done
        : fr.home.subjectState.started;
  const pad = scaled(portal ? spacing.xl : spacing.lg, scale);

  return (
    <EcolnaGalet
      face={face}
      radius={radius.xxl}
      shadow={locked ? undefined : shadows.raised}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={portal ? styles.portalOuter : undefined}
      faceStyle={[
        portal ? styles.portalFace : styles.rowFace,
        { padding: pad, gap: scaled(spacing.md, scale) },
      ]}
    >
      <View style={styles.artRow}>
        <SubjectArt
          subject={subject}
          size={scaled(portal ? artSize : 64, scale)}
          variant={locked ? 'tile' : 'glyph'}
          muted={locked}
        />
        {locked ? (
          <EcolnaIcon
            name="lock"
            size={scaled(24, scale)}
            color={colors.inkDisabled}
            mode="color"
          />
        ) : null}
      </View>
      <View style={portal ? styles.portalText : styles.rowText}>
        <EcolnaText variant={portal ? 'headlineLg' : 'headlineMd'} color={ink}>
          {label}
        </EcolnaText>
        <EcolnaText
          variant={explanation ? 'bodyLg' : 'bodyMd'}
          color={explanation ? ink : soft}
          accessibilityLiveRegion={explanation ? 'polite' : undefined}
        >
          {explanation ?? hint}
        </EcolnaText>
        {portal ? null : (
          <View style={[styles.footer, { marginTop: scaled(spacing.xs, scale) }]}>
            <EcolnaText variant="labelMd" color={soft}>
              {status ?? state}
            </EcolnaText>
            {locked ? null : (
              <View style={styles.bar}>
                <EcolnaProgressBar
                  progress={progress}
                  fill={colors.white}
                  track={colors.onColorTrack}
                  height={8}
                  accessibilityLabel={fr.a11y.progress(label, completed, total)}
                />
              </View>
            )}
          </View>
        )}
      </View>
      {portal ? <View style={styles.spacer} /> : null}
      {portal ? (
        <View style={styles.footer}>
          <EcolnaText variant="labelMd" color={soft}>
            {status ?? state}
          </EcolnaText>
          {locked ? null : (
            <View style={styles.bar}>
              <EcolnaProgressBar
                progress={progress}
                fill={colors.white}
                track={colors.onColorTrack}
                height={8}
                accessibilityLabel={fr.a11y.progress(label, completed, total)}
              />
            </View>
          )}
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  portalOuter: { flex: 1 },
  portalFace: {},
  spacer: { flexGrow: 1 },
  artRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  portalText: { gap: spacing.xxs },
  rowFace: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, gap: spacing.xxs },
  footer: { gap: spacing.xs },
  bar: { alignSelf: 'stretch' },
});
