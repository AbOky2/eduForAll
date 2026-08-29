import { ScrollView, StyleSheet, View } from 'react-native';

import { StarRow } from '@/design-system/components/star-row';
import { AlifaIcon, type IconName } from '@/design-system/icons/alifa-icon';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import {
  AlifaAnswerCard,
  AlifaAudioButton,
  AlifaButton,
  AlifaCard,
  AlifaProgressBar,
  AlifaScreen,
  AlifaText,
} from '@/design-system/primitives';
import { colors, spacing, typography, type TypographyVariant } from '@/design-system/tokens';

const ICONS: IconName[] = [
  'speaker',
  'play',
  'check',
  'close',
  'star',
  'star-outline',
  'lock',
  'lightbulb',
  'arrow-back',
  'chevron-right',
  'gear',
  'home',
  'book',
  'pencil',
  'ear',
  'calculator',
  'parents',
  'cloud-off',
  'pause',
  'replay',
  'leaf',
  'sparkle',
  'trash',
  'share',
];

const OBJECT_ICONS = [
  'icon-goat',
  'icon-mango',
  'icon-hut',
  'icon-star',
  'icon-calabash',
  'icon-moto',
  'icon-bed',
  'icon-tomato',
  'icon-salad',
  'icon-father',
  'icon-friends',
  'icon-cat',
  'icon-sheep',
  'icon-soap',
  'icon-king',
  'icon-wolf',
  'icon-wood',
  'icon-missing-example',
];

/**
 * Development-only design system gallery (__DEV__ route group, never linked
 * from production flows). Visual QA reference for docs/visual-qa.md.
 */
export default function DesignSystemGallery() {
  if (!__DEV__) {
    return null;
  }
  return (
    <AlifaScreen background="default">
      <ScrollView contentContainerStyle={styles.scroll}>
        <AlifaText variant="headlineLg">Design system ALIFA</AlifaText>

        <Section title="Typographie">
          {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
            <AlifaText key={variant} variant={variant} numberOfLines={1}>
              {variant} — Amina lit « ba »
            </AlifaText>
          ))}
        </Section>

        <Section title="Couleurs">
          <View style={styles.wrap}>
            {(
              [
                ['primary', colors.primary],
                ['primaryContainer', colors.primaryContainer],
                ['secondary', colors.secondary],
                ['secondaryContainer', colors.secondaryContainer],
                ['tertiaryContainer', colors.tertiaryContainer],
                ['exerciseBackground', colors.exerciseBackground],
                ['feedbackCorrect', colors.feedbackCorrect],
                ['error', colors.error],
              ] as const
            ).map(([name, value]) => (
              <View key={name} style={styles.swatchWrap}>
                <View style={[styles.swatch, { backgroundColor: value }]} />
                <AlifaText variant="bodySm">{name}</AlifaText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Boutons">
          <AlifaButton label="Commencer" onPress={() => undefined} />
          <AlifaButton label="Rejouer" variant="secondary" onPress={() => undefined} />
          <AlifaButton label="Passer" variant="ghost" onPress={() => undefined} />
          <AlifaButton label="Réinitialiser" variant="danger" onPress={() => undefined} />
          <AlifaButton label="Désactivé" onPress={() => undefined} disabled />
        </Section>

        <Section title="Cartes réponses">
          <AlifaAnswerCard label="ba" onPress={() => undefined} />
          <AlifaAnswerCard label="ma" state="selected" onPress={() => undefined} />
          <AlifaAnswerCard label="ta" state="correct" onPress={() => undefined} />
          <AlifaAnswerCard label="da" state="incorrect" onPress={() => undefined} />
          <AlifaAnswerCard label="la" state="disabled" onPress={() => undefined} />
        </Section>

        <Section title="Audio et progression">
          <View style={styles.wrap}>
            <AlifaAudioButton onPress={() => undefined} />
            <AlifaAudioButton variant="sky" size={52} onPress={() => undefined} />
            <AlifaAudioButton variant="bordered" size={52} onPress={() => undefined} />
          </View>
          <AlifaProgressBar progress={0.6} />
          <AlifaProgressBar progress={0.35} tone="brown" />
          <StarRow earned={2} />
        </Section>

        <Section title="Icônes">
          <View style={styles.wrap}>
            {ICONS.map((name) => (
              <View key={name} style={styles.iconCell}>
                <AlifaIcon name={name} size={26} color={colors.onSurfaceVariant} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Pictogrammes pédagogiques">
          <View style={styles.wrap}>
            {OBJECT_ICONS.map((id) => (
              <ObjectIcon key={id} id={id} size={44} />
            ))}
          </View>
        </Section>

        <Section title="Avatars">
          <View style={styles.wrap}>
            {([1, 2, 3, 4] as const).map((variant) => (
              <AvatarFace key={variant} variant={variant} size={56} />
            ))}
          </View>
        </Section>
      </ScrollView>
    </AlifaScreen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AlifaCard style={styles.section}>
      <AlifaText variant="headlineSm">{title}</AlifaText>
      {children}
    </AlifaCard>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.screenMargin, gap: spacing.md, paddingBottom: spacing.xxxl },
  section: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
  swatchWrap: { alignItems: 'center', gap: 4 },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  iconCell: { width: 40, alignItems: 'center' },
});
