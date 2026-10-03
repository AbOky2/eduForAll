import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { SubjectArt, type SubjectArtId } from '@/design-system/icons/subject-art';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaLogo } from '@/design-system/brand/ecolna-mark';
import {
  Orbit,
  OrbitChip,
  OrbitTile,
  orbitInsets,
  type OrbitSatellite,
} from '@/design-system/illustrations/orbit';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { heroTitleStyle } from '@/features/onboarding/presentation/ceremony-parts';
import { colors, radius, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

// Le titre de la page 1, coupé autour du mot mis en couleur.
const [welcomeBefore = '', welcomeAfter = ''] = fr.onboarding.welcomeTitle.split(
  fr.onboarding.welcomeTitleHighlight,
);

const SUBJECTS: { id: SubjectArtId; label: string }[] = [
  { id: 'language', label: fr.subjects.language },
  { id: 'reading', label: fr.subjects.reading },
  { id: 'writing', label: fr.subjects.writing },
  { id: 'math', label: fr.subjects.math },
];

/**
 * Onboarding — direction v4. Trois pages qu'on fait glisser ou qu'on avance
 * au bouton : l'école qui accompagne chaque enfant (les personnages de l'app
 * en orbite), les quatre disciplines du programme, et la promesse « sans
 * connexion » (tout est déjà dans la tablette). En paysage, deux volets :
 * l'image posée sur la gouttière, la colonne de mots centrée en face, et le
 * pied (points, bouton) dans cette colonne ; ailleurs, l'image au-dessus.
 * Les pages prennent la largeur RÉELLE du conteneur, pas celle de la fenêtre.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { splitPanes, isTablet, scale, screenPadding } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (Math.abs(width - size.width) > 1 || Math.abs(height - size.height) > 1) {
      setSize({ width, height });
    }
  };

  // Après une rotation, on revient sur la page courante — une fois les pages
  // redimensionnées : défiler avant les laisserait sur une page à cheval.
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: page * size.width, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width]);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * size.width, animated: true });
    setPage(index);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (size.width > 0) {
      setPage(Math.round(event.nativeEvent.contentOffset.x / size.width));
    }
  };

  const finish = () => router.push('/(onboarding)/create-profile');

  // ── Mise en page ─────────────────────────────────────────────────────
  // En deux volets, la ligne se partage exactement : image (un carré posé sur
  // la gouttière), l'air, la colonne de mots — jusqu'à la gouttière de droite.
  const inner = Math.max(0, size.width - screenPadding * 2);
  const gap = scaled(splitPanes ? spacing.xxxl : spacing.xl, scale);
  const orbit = splitPanes
    ? Math.round(Math.min(inner * 0.46, size.height * 0.86))
    : Math.round(Math.min(inner, size.height * 0.5, scaled(isTablet ? 440 : 300, scale)));
  const wordsWidth = splitPanes
    ? inner - orbit - gap
    : Math.min(inner, scaled(isTablet ? 600 : 520, scale));
  // Les mots commencent ici (deux volets) : le pied s'y aligne.
  const wordsLeft = screenPadding + orbit + gap;

  const pageOf = (art: ReactNode, words: ReactNode) => (
    <View
      style={[
        styles.page,
        { width: size.width, paddingHorizontal: screenPadding },
        splitPanes ? [styles.pageSplit, { gap }] : { gap: scaled(spacing.xxl, scale) },
      ]}
    >
      <View style={splitPanes ? [styles.artPane, { width: orbit, height: orbit }] : styles.artStack}>
        {art}
      </View>
      <View style={[styles.words, { width: wordsWidth, gap: scaled(spacing.md, scale) }]}>
        {words}
      </View>
    </View>
  );

  const align = splitPanes ? 'left' : 'center';
  const titleStyle = heroTitleStyle(isTablet, scale);

  const gridGap = scaled(spacing.md, scale);
  // La grille des disciplines occupe le même carré que les orbites (un peu
  // plus large quand l'image est au-dessus des mots).
  const gridWidth = splitPanes ? orbit : Math.min(inner, Math.round(orbit * 1.18));
  const tile = Math.round((gridWidth - gridGap) / 2);
  const chip = Math.round(orbit * 0.15);
  const friend = Math.round(orbit * 0.19);
  const hero = Math.round(orbit * 0.38);
  const offlineTile = Math.round(orbit * 0.32);

  /**
   * Une orbite posée à l'œil : son bord VISIBLE (le satellite le plus à
   * gauche) sur la gouttière en deux volets, centrée sinon ; et centrée en
   * hauteur sur ce qui est peint, pas sur son carré.
   */
  const orbitArt = (centerSize: number, center: ReactNode, satellites: OrbitSatellite[]) => {
    const inset = orbitInsets({ size: orbit, satellites, centerSize });
    const dx = splitPanes ? -inset.left : (inset.right - inset.left) / 2;
    const dy = (inset.bottom - inset.top) / 2;
    return (
      <View style={{ transform: [{ translateX: Math.round(dx) }, { translateY: Math.round(dy) }] }}>
        <Orbit size={orbit} centerSize={centerSize} center={center} satellites={satellites} />
      </View>
    );
  };

  // Page 1 : les enfants de l'app, autour de l'un d'eux — une école pour chacun.
  const welcomeSatellites: OrbitSatellite[] = [
    { node: <EcolnaAvatar avatarId="avatar-1" size={friend} />, size: friend, angle: -150, ring: 1 },
    { node: <EcolnaAvatar avatarId="avatar-9" size={friend} expression="joy" />, size: friend, angle: -38, ring: 1 },
    { node: <EcolnaAvatar avatarId="avatar-6" size={friend} expression="joy" />, size: friend, angle: 25, ring: 1 },
    { node: <EcolnaAvatar avatarId="avatar-11" size={friend} />, size: friend, angle: 150, ring: 1 },
    { node: <EcolnaAvatar avatarId="avatar-8" size={friend} expression="joy" />, size: friend, angle: 90, ring: 1 },
    {
      node: <OrbitChip icon="book" color={subjectColors.reading.solid} tint={colors.white} size={chip} />,
      size: chip,
      angle: -95,
      ring: 0,
    },
    {
      node: <OrbitChip icon="star" color={colors.reward} tint={colors.white} size={chip} />,
      size: chip,
      angle: 60,
      ring: 0,
    },
  ];

  // Page 3 : tout est déjà dans la tablette — les quatre disciplines, avec
  // leurs emblèmes de partout, et l'étoile.
  const offlineSatellites: OrbitSatellite[] = [
    ...SUBJECTS.map((subject, index) => ({
      node: <SubjectArt subject={subject.id} size={chip} />,
      size: chip,
      angle: -90 + index * 72,
      ring: 1 as const,
    })),
    {
      node: <OrbitChip icon="star" color={colors.reward} tint={colors.white} size={chip} />,
      size: chip,
      angle: 198,
      ring: 1,
    },
  ];

  return (
    <EcolnaScreen background="default" fullWidth>
      <View style={[styles.topBar, { paddingHorizontal: screenPadding }]}>
        <EcolnaLogo size={scaled(36, scale)} />
        {/* La place de « Passer » reste réservée à la dernière page : le logo ne saute pas. */}
        <View style={{ opacity: page < 2 ? 1 : 0 }} pointerEvents={page < 2 ? 'auto' : 'none'}>
          <EcolnaButton
            label={fr.common.skip}
            variant="ghost"
            onPress={finish}
            style={{ marginRight: -scaled(spacing.md, scale) }}
          />
        </View>
      </View>

      <View style={styles.pager} onLayout={onLayout}>
        {size.width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEventThrottle={16}
          >
            {/* Page 1 — Ton école t'accompagne partout (S02) */}
            {pageOf(
              orbitArt(
                hero,
                <EcolnaAvatar avatarId="avatar-2" size={hero} expression="joy" />,
                welcomeSatellites,
              ),
              <EcolnaText variant="displayHero" align={align} style={titleStyle}>
                {welcomeBefore}
                <EcolnaText variant="displayHero" color={colors.brand} style={titleStyle}>
                  {fr.onboarding.welcomeTitleHighlight}
                </EcolnaText>
                {welcomeAfter}
              </EcolnaText>,
            )}

            {/* Page 2 — Les quatre disciplines du programme (S03) */}
            {pageOf(
              <View
                style={[styles.subjectGrid, { width: tile * 2 + gridGap, gap: gridGap }]}
              >
                {SUBJECTS.map((subject) => (
                  <View
                    key={subject.id}
                    // On regarde, on ne touche pas : un aplat teinté, sans filet ni ombre.
                    style={[
                      styles.subjectTile,
                      {
                        width: tile,
                        height: Math.round(tile * 0.92),
                        gap: scaled(spacing.sm, scale),
                        backgroundColor: subjectColors[subject.id].tint,
                      },
                    ]}
                  >
                    <SubjectArt subject={subject.id} size={Math.round(tile * 0.46)} />
                    <EcolnaText variant="headlineSm" color={subjectColors[subject.id].ink}>
                      {subject.label}
                    </EcolnaText>
                  </View>
                ))}
              </View>,
              <>
                <EcolnaText variant="displayHero" align={align} style={titleStyle}>
                  {fr.onboarding.subjectsTitle}
                </EcolnaText>
                <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
                  {fr.onboarding.subjectsSubtitle}
                </EcolnaText>
              </>,
            )}

            {/* Page 3 — Fonctionne sans connexion (S04) */}
            {pageOf(
              orbitArt(
                offlineTile,
                <OrbitTile icon="offline-ok" color={colors.success} size={offlineTile} />,
                offlineSatellites,
              ),
              <>
                <EcolnaText variant="displayHero" align={align} style={titleStyle}>
                  {fr.onboarding.offlineTitle}
                </EcolnaText>
                <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
                  {fr.onboarding.offlineSubtitle}
                </EcolnaText>
              </>,
            )}
          </ScrollView>
        ) : null}
      </View>

      {/* Le pied : en deux volets, dans la colonne des mots ; sinon centré. */}
      <View
        style={[
          styles.footer,
          { gap: scaled(spacing.md, scale) },
          splitPanes
            ? [styles.footerSplit, { paddingLeft: wordsLeft, paddingRight: screenPadding }]
            : { paddingHorizontal: screenPadding },
        ]}
      >
        <View
          style={[styles.dots, splitPanes && styles.dotsSplit]}
          accessible
          accessibilityLabel={fr.a11y.page(page + 1, 3)}
        >
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === page
                  ? { backgroundColor: colors.brand, width: 28 }
                  : { backgroundColor: index < page ? colors.brandTintStrong : colors.fillStrong },
              ]}
            />
          ))}
        </View>
        <EcolnaButton
          label={
            page === 0 ? fr.common.start : page === 1 ? fr.common.next : fr.onboarding.createProfile
          }
          onPress={() => (page < 2 ? goTo(page + 1) : finish())}
          style={splitPanes ? styles.ctaSplit : styles.cta}
        />
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 64,
  },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Deux volets : l'image part de la gouttière, les mots en face, centrés sur son axe.
  pageSplit: { flexDirection: 'row', justifyContent: 'flex-start' },
  artPane: { alignItems: 'flex-start', justifyContent: 'center' },
  artStack: { alignItems: 'center' },
  words: { justifyContent: 'center' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  subjectTile: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingTop: spacing.md, alignItems: 'center' },
  footerSplit: { alignItems: 'stretch' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dotsSplit: { justifyContent: 'flex-start' },
  dot: { height: 10, width: 10, borderRadius: 5 },
  cta: { maxWidth: 560, width: '100%' },
  ctaSplit: { width: '100%' },
});
