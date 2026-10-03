import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressBar, EcolnaProgressRing, EcolnaText } from '../primitives';
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
 * La porte d'une discipline sur l'écran « Apprendre » : une surface de sa
 * couleur profonde ; au centre, son emblème dans l'anneau de ses leçons
 * faites ; dessous, son nom, ce qu'on y fait et une puce d'état. En paysage,
 * quatre portes côte à côte ; en portrait, deux par deux ; au téléphone, une
 * carte par ligne (emblème, texte, barre).
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
  // Le texte second reste blanc plein (≥ 4,9:1 sur toutes les couleurs
  // profondes) : la hiérarchie passe par la taille et la graisse, jamais par
  // une transparence qu'on ne lit plus au soleil.
  const soft = locked ? colors.inkSecondary : colors.white;
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
      {portal ? (
        <>
          {/* L'emblème au cœur de l'anneau de la discipline : plein, il passe au soleil. */}
          <View style={styles.center}>
            {locked ? (
              <View>
                <SubjectArt subject={subject} size={scaled(artSize, scale)} muted />
                <View style={styles.lockBadge}>
                  <EcolnaIcon name="lock" size={scaled(22, scale)} color={colors.inkDisabled} filled />
                </View>
              </View>
            ) : (
              <EcolnaProgressRing
                progress={progress}
                size={scaled(artSize + 36, scale)}
                stroke={scaled(7, scale)}
                color={colors.white}
                track={colors.onColorTrack}
                accessibilityLabel={fr.a11y.progress(label, completed, total)}
              >
                <SubjectArt subject={subject} size={scaled(artSize, scale)} variant="glyph" />
              </EcolnaProgressRing>
            )}
          </View>
          <View style={[styles.portalText, { gap: scaled(spacing.xxs, scale) }]}>
            <EcolnaText variant="headlineLg" color={ink} align="center">
              {label}
            </EcolnaText>
            <EcolnaText
              variant={explanation ? 'bodyLg' : 'bodyMd'}
              color={explanation ? ink : soft}
              align="center"
              numberOfLines={explanation ? 4 : 2}
              // Deux lignes réservées : titres et puces des quatre portes alignés.
              style={{ minHeight: scaled(44, scale) }}
              accessibilityLiveRegion={explanation ? 'polite' : undefined}
            >
              {explanation ?? hint}
            </EcolnaText>
          </View>
          <View
            style={[
              styles.stateChip,
              { backgroundColor: locked ? colors.white : colors.onColorGlass, paddingHorizontal: scaled(spacing.sm, scale) },
            ]}
          >
            <EcolnaText variant="labelMd" color={soft}>
              {status ?? state}
            </EcolnaText>
          </View>
        </>
      ) : (
        <>
          <SubjectArt
            subject={subject}
            size={scaled(64, scale)}
            variant={locked ? 'tile' : 'glyph'}
            muted={locked}
          />
          <View style={styles.rowText}>
            <EcolnaText variant="headlineMd" color={ink}>
              {label}
            </EcolnaText>
            <EcolnaText
              variant={explanation ? 'bodyLg' : 'bodyMd'}
              color={explanation ? ink : soft}
              accessibilityLiveRegion={explanation ? 'polite' : undefined}
            >
              {explanation ?? hint}
            </EcolnaText>
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
          </View>
          {locked ? <EcolnaIcon name="lock" size={scaled(24, scale)} color={colors.inkDisabled} filled /> : null}
        </>
      )}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  portalOuter: { flex: 1 },
  portalFace: { alignItems: 'center', justifyContent: 'flex-start' },
  center: { alignItems: 'center', justifyContent: 'center' },
  lockBadge: { position: 'absolute', right: -6, bottom: -6 },
  portalText: { alignItems: 'center' },
  stateChip: { borderRadius: radius.pill, paddingVertical: 4, marginTop: 'auto' },
  rowFace: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, gap: spacing.xxs },
  footer: { gap: spacing.xs },
  bar: { alignSelf: 'stretch' },
});
