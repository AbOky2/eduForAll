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
import { Orbit, OrbitChip, OrbitTile } from '@/design-system/illustrations/orbit';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, shadows, spacing, subjectColors } from '@/design-system/tokens';
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
 * connexion » (tout est déjà dans la tablette). En
 * paysage, l'image à gauche et les mots à droite ; ailleurs, l'image au-dessus.
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

  // L'image d'une page : la moitié de la largeur en paysage, toute la colonne sinon.
  const artWidth = splitPanes
    ? Math.round((size.width - screenPadding * 3) * 0.55)
    : Math.min(size.width - screenPadding * 2, scaled(isTablet ? 640 : 360, scale));
  const artHeight = Math.round(
    Math.min(artWidth * (splitPanes ? 0.9 : 0.62), size.height * (splitPanes ? 0.86 : 0.48)),
  );

  const pageOf = (art: ReactNode, words: ReactNode) => (
    <View
      style={[
        styles.page,
        { width: size.width, paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) },
        splitPanes && styles.pageSplit,
      ]}
    >
      <View style={splitPanes ? styles.artPane : { marginBottom: scaled(spacing.lg, scale) }}>{art}</View>
      <View
        style={[
          styles.words,
          splitPanes ? styles.wordsSplit : styles.wordsStack,
          { gap: scaled(spacing.sm, scale) },
        ]}
      >
        {words}
      </View>
    </View>
  );

  const align = splitPanes ? 'left' : 'center';
  const titleVariant = isTablet ? 'displayHero' : 'headlineLg';

  const tile = Math.round((Math.min(artWidth, artHeight * 1.2) - scaled(spacing.md, scale)) / 2);
  // Les orbites sont carrées : le plus grand carré qui tient dans la zone d'image.
  const orbit = Math.round(Math.min(artWidth, artHeight));
  const chip = Math.round(orbit * 0.16);
  const friend = Math.round(orbit * 0.19);

  return (
    <EcolnaScreen background="default" fullWidth>
      <View style={[styles.topBar, { paddingHorizontal: screenPadding }]}>
        <EcolnaLogo size={scaled(36, scale)} />
        {page < 2 ? <EcolnaButton label={fr.common.skip} variant="ghost" onPress={finish} /> : null}
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
              // Les enfants de l'app, autour de l'un d'eux : une école pour chacun.
              <Orbit
                size={orbit}
                center={<EcolnaAvatar avatarId="avatar-2" size={Math.round(orbit * 0.4)} expression="joy" />}
                satellites={[
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
                ]}
              />,
              <EcolnaText variant={titleVariant} align={align}>
                {welcomeBefore}
                <EcolnaText variant={titleVariant} color={colors.brand}>
                  {fr.onboarding.welcomeTitleHighlight}
                </EcolnaText>
                {welcomeAfter}
              </EcolnaText>,
            )}

            {/* Page 2 — Les quatre disciplines du programme (S03) */}
            {pageOf(
              <View
                style={[
                  styles.subjectGrid,
                  { width: tile * 2 + scaled(spacing.md, scale), gap: scaled(spacing.md, scale) },
                ]}
              >
                {SUBJECTS.map((subject) => (
                  <View
                    key={subject.id}
                    style={[
                      styles.subjectTile,
                      shadows.card,
                      { width: tile, height: Math.round(tile * 0.92), gap: scaled(spacing.sm, scale) },
                    ]}
                  >
                    <SubjectArt subject={subject.id} size={Math.round(tile * 0.46)} />
                    <EcolnaText variant="headlineSm">
                      {subject.label}
                    </EcolnaText>
                  </View>
                ))}
              </View>,
              <>
                <EcolnaText variant={titleVariant} align={align}>
                  {fr.onboarding.subjectsTitle}
                </EcolnaText>
                <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
                  {fr.onboarding.subjectsSubtitle}
                </EcolnaText>
              </>,
            )}

            {/* Page 3 — Fonctionne sans connexion (S04) */}
            {pageOf(
              // Tout est déjà dans la tablette : les leçons, les sons, les dessins.
              <Orbit
                size={orbit}
                center={<OrbitTile icon="offline-ok" color={colors.success} size={Math.round(orbit * 0.32)} />}
                satellites={[
                  // Les quatre disciplines, avec leurs emblèmes de partout, et l'étoile.
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
                ]}
              />,
              <>
                <EcolnaText variant={titleVariant} align={align}>
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

      <View
        style={[
          styles.footer,
          { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) },
        ]}
      >
        <View style={styles.dots} accessible accessibilityLabel={fr.a11y.page(page + 1, 3)}>
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
          style={styles.cta}
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
  pageSplit: { flexDirection: 'row' },
  artPane: { flex: 1.1, alignItems: 'center' },
  words: { justifyContent: 'center' },
  wordsSplit: { flex: 0.9 },
  wordsStack: { maxWidth: 640 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  subjectTile: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingTop: spacing.md, alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { height: 10, width: 10, borderRadius: 5 },
  cta: { maxWidth: 560, width: '100%' },
});
