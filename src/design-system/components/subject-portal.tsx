import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressRing, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing, subjectColors } from '../tokens';
import { fr } from '@/localization/fr/strings';

/** Où en est un monde de la discipline : fini, celui du jour, ou à venir. */
export type PortalWorldState = 'done' | 'current' | 'upcoming';

/**
 * L'état de chaque monde d'une discipline, dans l'ordre du parcours : les
 * mondes finis d'abord, puis le premier qui ne l'est pas (le monde du jour,
 * seulement si la discipline est commencée), puis ceux à venir. Une
 * discipline pas encore commencée n'a pas de monde du jour : tous ses points
 * sont à venir, sa porte garde la même structure.
 */
export function portalWorldStates(
  worlds: readonly { done: boolean }[],
  started: boolean,
): PortalWorldState[] {
  const current = started ? worlds.findIndex((world) => !world.done) : -1;
  return worlds.map((world, index) =>
    world.done ? 'done' : index === current ? 'current' : 'upcoming',
  );
}

interface SubjectPortalProps {
  subject: SubjectArtId;
  label: string;
  /** Ce qu'on y fait, en quatre mots (« Les lettres et les sons »). */
  hint: string;
  completed: number;
  total: number;
  /** Un point par monde de la discipline (voir `portalWorldStates`). */
  worlds: readonly PortalWorldState[];
  /** Ce que disent les points, pour le lecteur d'écran. */
  worldsLabel: string;
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
 * La rangée des mondes d'une discipline : un point par monde. Fini : blanc
 * plein ; celui du jour : un anneau blanc ; à venir : la piste sur la
 * couleur. L'enfant voit où il en est sans un chiffre ni un mot à lire.
 */
function WorldDots({
  worlds,
  locked,
  label,
  align,
}: {
  worlds: readonly PortalWorldState[];
  locked: boolean;
  label: string;
  align: 'center' | 'flex-start';
}) {
  const { scale } = useResponsive();
  // Au-delà de six mondes (CP2, lecture), les points se resserrent pour tenir sur une ligne.
  const many = worlds.length > 6;
  const size = scaled(many ? 10 : 12, scale);
  const gap = scaled(many ? 6 : 8, scale);
  const ring = scaled(2, scale);
  const full = locked ? colors.inkDisabled : colors.white;
  const track = locked ? colors.track : colors.onColorTrack;
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[styles.dots, { gap, justifyContent: align }]}
    >
      {worlds.map((state, index) => (
        <View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: state === 'done' ? full : state === 'upcoming' ? track : undefined,
            borderWidth: state === 'current' ? ring : 0,
            borderColor: full,
          }}
        />
      ))}
    </View>
  );
}

/**
 * La porte d'une discipline sur l'écran « Apprendre » : une surface de sa
 * couleur profonde ; son emblème dans l'anneau de ses leçons faites, son nom,
 * ce qu'on y fait, et la rangée de ses mondes (un point par monde) — l'écran
 * ne répète pas l'accueil : il montre le chemin de chaque discipline. En
 * paysage, quatre portes côte à côte ; en portrait, deux par deux ; au
 * téléphone, une carte par ligne (emblème, texte, points).
 */
export function SubjectPortal({
  subject,
  label,
  hint,
  completed,
  total,
  worlds,
  worldsLabel,
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
        portal ? { padding: pad } : { padding: pad, gap: scaled(spacing.md, scale) },
      ]}
    >
      {portal ? (
        <>
          {/* L'emblème, les mots et les mondes, ensemble un peu au-dessus du
              milieu (le centre optique de la porte) — quand il y a de l'air
              à partager ; sinon rien ne s'ajoute. */}
          <View style={styles.airAbove} />
          <View style={[styles.portalBody, { gap: scaled(spacing.md, scale) }]}>
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
                accessibilityLiveRegion={explanation ? 'polite' : undefined}
              >
                {explanation ?? hint}
              </EcolnaText>
            </View>
            <View style={{ marginTop: scaled(spacing.xs, scale) }}>
              <WorldDots worlds={worlds} locked={locked} label={worldsLabel} align="center" />
            </View>
          </View>
          <View style={styles.airBelow} />
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
            <View style={{ marginTop: scaled(spacing.xs, scale) }}>
              <WorldDots worlds={worlds} locked={locked} label={worldsLabel} align="flex-start" />
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
  portalFace: { alignItems: 'center' },
  airAbove: { flexGrow: 1 },
  airBelow: { flexGrow: 1.5 },
  portalBody: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  lockBadge: { position: 'absolute', right: -6, bottom: -6 },
  portalText: { alignItems: 'center' },
  rowFace: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, gap: spacing.xxs },
  dots: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
