import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt } from '../icons/subject-art';
import { colors } from '../tokens';

/** Les quatre disciplines, en carré : langage et lecture, puis écriture et calcul. */
const SUBJECT_ROWS = [
  ['language', 'reading'],
  ['writing', 'math'],
] as const;

/**
 * Les mesures de la tablette dans un disque de `size` dp. Elles suivent le
 * repère 256 du tracé Phosphor « device-tablet » (corps 40–216 × 24–232,
 * écran 56–200 × 72–184). Exportées pour les tests : l'écran et la pastille
 * restent dans le disque à toutes les tailles.
 */
export function offlineTabletMetrics(size: number) {
  const tablet = Math.round(size * 0.52);
  const at = (units: number) => Math.round((tablet * units) / 256);
  const badge = Math.round(tablet * 0.36);
  return {
    tablet,
    screen: { left: at(56), top: at(72), width: at(144), height: at(112) },
    emblem: Math.round(tablet * 0.17),
    emblemGap: Math.round(tablet * 0.035),
    badge,
    ring: Math.max(3, Math.round(badge * 0.08)),
    // La pastille de réussite, sur le coin bas droit de la tablette.
    badgeLeft: Math.round(tablet * 0.8 - badge / 2),
    badgeTop: Math.round(tablet * 0.86 - badge / 2),
  };
}

/**
 * La promesse « sans internet », en une seule image pour toute l'app
 * (l'onboarding et l'écran hors connexion) : un grand disque vert très clair ;
 * au centre, la tablette dont l'écran montre les quatre disciplines — tout y
 * est déjà —, et la pastille de réussite posée sur son coin. Décorative : les
 * mots de l'écran disent la même chose au lecteur d'écran.
 */
export const OfflineTabletArt = memo(function OfflineTabletArt({ size }: { size: number }) {
  const m = offlineTabletMetrics(size);
  return (
    <View
      testID="offline-tablet-art"
      style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ width: m.tablet, height: m.tablet }}>
        <EcolnaIcon name="offline-ok" mode="duo" color={colors.success} size={m.tablet} />
        <View style={[styles.screen, m.screen, { gap: m.emblemGap }]}>
          {SUBJECT_ROWS.map((row) => (
            <View key={row[0]} style={[styles.emblemRow, { gap: m.emblemGap }]}>
              {row.map((subject) => (
                <SubjectArt key={subject} subject={subject} size={m.emblem} />
              ))}
            </View>
          ))}
        </View>
        <View
          style={[
            styles.badge,
            {
              width: m.badge,
              height: m.badge,
              borderRadius: m.badge / 2,
              padding: m.ring,
              left: m.badgeLeft,
              top: m.badgeTop,
            },
          ]}
        >
          <EcolnaIcon name="check" filled size={m.badge - m.ring * 2} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successTint,
  },
  // L'écran de la tablette : blanc, les quatre emblèmes en carré.
  screen: {
    position: 'absolute',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemRow: { flexDirection: 'row' },
  badge: { position: 'absolute', backgroundColor: colors.white },
});
