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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubjectArt, type SubjectArtId } from '@/design-system/icons/subject-art';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaLogo } from '@/design-system/brand/ecolna-mark';
import { OfflineTabletArt } from '@/design-system/illustrations/offline-tablet';
import {
  Orbit,
  OrbitChip,
  orbitInsets,
  type OrbitSatellite,
} from '@/design-system/illustrations/orbit';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import {
  StepDots,
  ceremonyColumns,
  ceremonyFooterBottom,
  heroTitleStyle,
} from '@/features/onboarding/presentation/ceremony-parts';
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

/** Les libellés du bouton, page par page (les parcours Maestro les touchent). */
const ACTIONS = [fr.common.start, fr.common.next, fr.onboarding.createProfile] as const;
const PAGES = ACTIONS.length;

/**
 * Onboarding — direction v4. Trois pages qu'on fait glisser ou qu'on avance
 * au bouton : l'école qui accompagne chaque enfant (les personnages de l'app
 * en orbite), les quatre disciplines du programme, et la promesse « sans
 * connexion » (la tablette de l'écran hors connexion : une seule image de la
 * promesse dans toute l'app). En paysage, deux volets : l'image posée sur la
 * gouttière, centrée sur l'écran, et en face la colonne des mots — celle de
 * la création de profil qui suit (`ceremonyColumns`). Le pied (les points et
 * le bouton) est rendu une seule fois, immobile au bas de cette colonne : il
 * ne saute ni d'une page à l'autre ni vers la création de profil, où il
 * reprend la même place ; titre et phrase se centrent, au-dessus de lui,
 * sur l'axe de l'image. Ailleurs, l'image au-dessus des mots et le pied en
 * bas, centré.
 * Les pages prennent la largeur RÉELLE du conteneur, pas celle de la fenêtre.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { splitPanes, isTablet, scale, screenPadding } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // La hauteur de la rangée du logo : en deux volets, la même marge en bas
  // centre l'image sur l'écran, pas sous le logo.
  const [barHeight, setBarHeight] = useState(0);
  // La hauteur du pied des deux volets, mesurée : les mots se centrent au-dessus.
  const [footerHeight, setFooterHeight] = useState(0);

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
  const advanceFrom = (index: number) => (index < PAGES - 1 ? goTo(index + 1) : finish());

  // ── Mise en page ─────────────────────────────────────────────────────
  // De l'air en haut et en bas, à la mesure des marges latérales : le logo
  // et le bouton ne collent plus aux bords.
  const bottomPad = Math.max(insets.bottom, scaled(spacing.xxl, scale));
  // En deux volets, la colonne des mots et du pied est celle de la création
  // de profil ; l'image (un carré posé sur la gouttière) prend ce qui reste
  // devant elle, moins l'air. Le bas de l'image répond au haut (la rangée du
  // logo) : elle est centrée sur l'écran, comme l'enfant de l'écran suivant.
  const inner = Math.max(0, size.width - screenPadding * 2);
  const columns = ceremonyColumns(size.width, scale, screenPadding);
  const gap = scaled(splitPanes ? spacing.xxxl : spacing.xl, scale);
  const pageBottom = splitPanes ? Math.max(bottomPad, insets.top + barHeight) : 0;
  const orbit = splitPanes
    ? Math.max(
        0,
        Math.round(Math.min(columns.left - gap - screenPadding, (size.height - pageBottom) * 0.86)),
      )
    : Math.round(Math.min(inner, size.height * 0.5, scaled(isTablet ? 440 : 300, scale)));
  // Debout et au téléphone, une colonne lisible sous l'image.
  const wordsWidth = Math.min(inner, scaled(isTablet ? 600 : 520, scale));
  // Le pied des deux volets : au bas de l'écran, à la hauteur de celui de la
  // création de profil. Avant sa mesure, sa hauteur attendue (points, air,
  // bouton) : les mots ne bougent pas quand elle arrive.
  const footerBottom = ceremonyFooterBottom(insets.bottom);
  const footerReserve =
    footerBottom +
    (footerHeight || scaled(10, scale) + scaled(spacing.md, scale) + scaled(60, scale)) +
    scaled(spacing.xl, scale);
  // Titre et phrase se centrent sur l'axe de l'image, le centre de l'écran :
  // une cale au-dessus d'eux, dans la hauteur que laisse le pied, les y
  // descend. Si une page manque de hauteur, la cale cède la première — les
  // mots remontent, jamais sous les points.
  const axisSpacer = Math.max(0, footerReserve - pageBottom);

  /** Les points et le bouton d'une page. */
  const footerOf = (index: number) => (
    <View style={[styles.footerBody, { gap: scaled(spacing.md, scale) }]}>
      <View style={splitPanes ? styles.dotsSplit : styles.dots}>
        <StepDots
          step={index + 1}
          total={PAGES}
          accessibilityLabel={fr.a11y.page(index + 1, PAGES)}
        />
      </View>
      <EcolnaButton
        label={ACTIONS[index] ?? fr.common.next}
        onPress={() => advanceFrom(index)}
        style={splitPanes ? styles.ctaSplit : styles.cta}
      />
    </View>
  );

  const pageOf = (art: ReactNode, words: ReactNode) =>
    splitPanes ? (
      // Deux volets : l'image sur la gouttière, centrée sur l'écran ; les
      // mots dans la colonne du pied, au-dessus de lui, sur l'axe de l'image.
      <View style={{ width: size.width, height: size.height }}>
        <View style={[styles.artPane, { left: screenPadding, width: orbit, bottom: pageBottom }]}>
          <View style={[styles.artSquare, { width: orbit, height: orbit }]}>{art}</View>
        </View>
        <View
          style={[
            styles.wordsPane,
            { left: columns.left, width: columns.width, bottom: footerReserve },
          ]}
        >
          <View style={[styles.axisSpacer, { height: axisSpacer }]} />
          <View style={{ gap: scaled(spacing.md, scale) }}>{words}</View>
        </View>
      </View>
    ) : (
      <View
        style={[
          styles.page,
          { width: size.width, paddingHorizontal: screenPadding, gap: scaled(spacing.xxl, scale) },
        ]}
      >
        <View style={styles.artStack}>{art}</View>
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

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <View
        style={[
          styles.topBar,
          { paddingHorizontal: screenPadding, paddingTop: scaled(spacing.lg, scale) },
        ]}
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.height);
          if (next !== barHeight) {
            setBarHeight(next);
          }
        }}
      >
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
              <>
                <EcolnaText variant="displayHero" align={align} style={titleStyle}>
                  {welcomeBefore}
                  <EcolnaText variant="displayHero" color={colors.brand} style={titleStyle}>
                    {fr.onboarding.welcomeTitleHighlight}
                  </EcolnaText>
                  {welcomeAfter}
                </EcolnaText>
                <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
                  {fr.onboarding.welcomeSubtitle}
                </EcolnaText>
              </>,
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

            {/* Page 3 — Fonctionne sans connexion (S04) : la tablette de
                l'écran hors connexion, ses quatre disciplines à l'écran, et
                l'enfant de la page 1 à côté. */}
            {pageOf(
              <OfflineTabletArt size={orbit} />,
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

      {/* Le pied, rendu une seule fois. En deux volets, immobile au bas de la
          colonne des mots (la place du pied de la création de profil) ;
          sinon centré sous l'image et les mots. */}
      {splitPanes ? (
        size.width > 0 ? (
          <View
            style={[
              styles.footerSplit,
              { left: columns.left, width: columns.width, bottom: footerBottom },
            ]}
            onLayout={(event) => {
              const next = Math.round(event.nativeEvent.layout.height);
              if (next !== footerHeight) {
                setFooterHeight(next);
              }
            }}
          >
            {footerOf(page)}
          </View>
        ) : null
      ) : (
        <View
          style={[styles.footer, { paddingHorizontal: screenPadding, paddingBottom: bottomPad }]}
        >
          {footerOf(page)}
        </View>
      )}
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Deux volets : l'image part de la gouttière, les mots dans la colonne du pied.
  artPane: { position: 'absolute', top: 0, justifyContent: 'center' },
  artSquare: { alignItems: 'flex-start', justifyContent: 'center' },
  wordsPane: { position: 'absolute', top: 0, justifyContent: 'center' },
  axisSpacer: { flexShrink: 1, minHeight: 0 },
  artStack: { alignItems: 'center' },
  words: { justifyContent: 'center' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  subjectTile: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingTop: spacing.md, alignItems: 'center' },
  footerSplit: { position: 'absolute' },
  footerBody: { alignSelf: 'stretch', alignItems: 'center' },
  dots: { alignItems: 'center' },
  dotsSplit: { alignSelf: 'flex-start' },
  cta: { maxWidth: 560, width: '100%' },
  ctaSplit: { width: '100%' },
});
