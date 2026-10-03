import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '../icons/subject-art';
import { EcolnaGalet, EcolnaProgressRing, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing, subjectColors } from '../tokens';
import { typography } from '../tokens/typography';
import { fr } from '@/localization/fr/strings';

/**
 * `stack` : l'emblème au-dessus des mots (téléphone) ; `row` : l'emblème à
 * gauche des mots, compact (tablette courte) ; `tall` et `wide` : les grandes
 * tuiles d'une tablette qui a la hauteur — l'emblème en haut et le nom au
 * pied (`tall`), ou l'emblème à gauche et le nom à côté (`wide`) — qui
 * prennent toute la hauteur que leur rangée leur donne.
 */
export type SubjectTileLayout = 'stack' | 'row' | 'tall' | 'wide';

export interface SubjectTileFit {
  layout: 'tall' | 'wide';
  /** Diamètre de l'anneau de l'emblème, en dp (déjà mis à l'échelle). */
  emblem: number;
}

/** Plus petit qu'un anneau de cette taille, la grande tuile ne vaut pas la tuile compacte. */
const FIT_MIN = 56;
/** L'emblème ne dépasse jamais cette taille : au-delà, il écraserait le nom. */
const FIT_MAX = 104;
/** La place que demandent « Écriture » et « À découvrir » à côté de l'emblème. */
const WORDS_WIDTH = 116;

/**
 * La grande tuile qui tient dans `box` (largeur et hauteur d'une cellule de la
 * grille, en dp) : celle des deux dispositions qui donne le plus grand
 * emblème, ou `null` quand la place manque — la tuile compacte reste alors.
 * La tuile ne déborde jamais de sa cellule : l'écran ne défile pas pour elle.
 */
export function fitSubjectTile(
  box: { width: number; height: number },
  scale: number,
): SubjectTileFit | null {
  const pad = scaled(spacing.md, scale);
  const gap = scaled(spacing.xs, scale);
  const words =
    scaled(typography.headlineMd.lineHeight, scale) + scaled(typography.labelMd.lineHeight, scale) + 2;
  const cap = scaled(FIT_MAX, scale);
  const tall = Math.min(box.height - 2 * pad - gap - words, box.width - 2 * pad, cap);
  const wide = Math.min(box.height - 2 * pad, box.width - 2 * pad - gap - scaled(WORDS_WIDTH, scale), cap);
  // À emblème égal, la tuile en largeur : une cellule plus large que haute s'y remplit mieux.
  const best: SubjectTileFit = tall > wide ? { layout: 'tall', emblem: tall } : { layout: 'wide', emblem: wide };
  return best.emblem >= scaled(FIT_MIN, scale) ? { ...best, emblem: Math.floor(best.emblem) } : null;
}

interface SubjectTileProps {
  subject: SubjectArtId;
  label: string;
  completed: number;
  total: number;
  locked: boolean;
  onPress: () => void;
  /** Phrase dite quand l'enfant touche une discipline encore fermée. */
  explanation?: string | null | undefined;
  /** Taille de l'emblème avant mise à l'échelle, tuiles compactes (défaut 64). */
  artSize?: number;
  layout?: SubjectTileLayout;
  /** Grandes tuiles : diamètre de l'anneau en dp (voir `fitSubjectTile`). */
  emblem?: number | undefined;
}

/**
 * Une discipline sur l'accueil (v4) : une carte blanche, l'emblème de sa
 * couleur dans l'anneau de sa progression, son nom, et un mot que l'enfant
 * comprend (« À découvrir », « En cours », « Terminé ») — jamais une fraction.
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
  emblem,
}: SubjectTileProps) {
  const { scale, height } = useResponsive();
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
  const big = (layout === 'tall' || layout === 'wide') && emblem !== undefined;
  const tall = big && layout === 'tall';
  const wide = big && layout === 'wide';
  // Une tablette 7" couchée : la tuile se resserre pour tenir sous la barre d'onglets.
  const pad = scaled(
    big ? spacing.md : row ? (height < 700 ? spacing.sm : spacing.md) : spacing.lg,
    scale,
  );
  const ring = big ? emblem : scaled(artSize + 12, scale);
  const stroke = big ? Math.max(scaled(4, scale), Math.round(ring * 0.05)) : scaled(4, scale);
  const art = big ? Math.round(ring * 0.8) : scaled(artSize - 2, scale);

  const emblemView = locked ? (
    <View style={[styles.center, { width: ring, height: ring }]}>
      <SubjectArt subject={subject} size={art} muted />
    </View>
  ) : (
    // La progression de la discipline : l'anneau autour de son emblème,
    // le même codage qu'« Apprendre » (plein, il passe au soleil).
    <EcolnaProgressRing
      progress={progress}
      size={ring}
      stroke={stroke}
      color={family.solid}
      track={family.tintStrong}
    >
      <SubjectArt subject={subject} size={art} />
    </EcolnaProgressRing>
  );
  const words = (
    <View
      style={[
        styles.words,
        row || wide ? styles.wordsRow : !tall && { marginTop: scaled(spacing.xs, scale) },
      ]}
    >
      <EcolnaText
        variant={row ? 'headlineSm' : 'headlineMd'}
        color={locked ? colors.inkSecondary : colors.ink}
        numberOfLines={1}
      >
        {label}
      </EcolnaText>
      <EcolnaText
        variant={row ? 'labelSm' : 'labelMd'}
        color={colors.inkSecondary}
        numberOfLines={explanation ? 3 : 1}
        accessibilityLiveRegion={explanation ? 'polite' : undefined}
      >
        {explanation ?? state}
      </EcolnaText>
    </View>
  );
  const lock = locked ? (
    // Grande tuile : le cadenas dans le coin, à la marge de la tuile.
    <View style={[styles.lock, big && { top: pad, right: pad }]}>
      <EcolnaIcon name="lock" size={scaled(20, scale)} color={colors.inkDisabled} mode="color" />
    </View>
  ) : null;

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
      faceStyle={[
        tall ? styles.faceTall : wide ? styles.faceWide : styles.face,
        { padding: pad, gap: scaled(big ? spacing.xs : spacing.sm, scale) },
      ]}
    >
      {big ? (
        // Grande tuile : l'emblème en haut et les mots au pied (`tall`), ou
        // côte à côte, centrés dans la hauteur (`wide`).
        <>
          {emblemView}
          {words}
          {lock}
        </>
      ) : (
        <View
          style={[
            styles.top,
            row && styles.topRow,
            { gap: scaled(row ? spacing.sm : spacing.md, scale) },
          ]}
        >
          {emblemView}
          {words}
          {lock}
        </View>
      )}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Compacte, étirée par sa rangée : le contenu reste centré dans la hauteur.
  face: { justifyContent: 'center' },
  faceTall: { justifyContent: 'space-between', alignItems: 'flex-start' },
  faceWide: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: { alignItems: 'flex-start' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  words: { gap: 2, flexShrink: 1 },
  wordsRow: { flex: 1 },
  lock: { position: 'absolute', top: 0, right: 0 },
});
