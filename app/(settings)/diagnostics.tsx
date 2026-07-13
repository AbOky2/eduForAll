import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { logSnapshot } from '@/core/logging/logger';
import { getDatabase } from '@/database/connection/database';
import { AlifaButton, AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

interface DiagnosticsInfo {
  migrations: number;
  contentVersion: string;
  profiles: number;
  attempts: number;
}

/**
 * Parent-triggered diagnostics. The export is a redacted text summary shared
 * voluntarily through the OS share sheet — no name, no voice, no location.
 */
export default function DiagnosticsScreen() {
  const router = useRouter();
  const [info, setInfo] = useState<DiagnosticsInfo | null>(null);

  const load = async () => {
    const db = await getDatabase();
    const migrations = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM migration_history',
    );
    const content = await db.getFirstAsync<{ content_version: string }>(
      'SELECT content_version FROM content_versions ORDER BY imported_at DESC LIMIT 1',
    );
    const profiles = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM child_profiles',
    );
    const attempts = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM exercise_attempts',
    );
    setInfo({
      migrations: migrations?.n ?? 0,
      contentVersion: content?.content_version ?? 'inconnue',
      profiles: profiles?.n ?? 0,
      attempts: attempts?.n ?? 0,
    });
  };

  const exportDiagnostics = () => {
    const logs = logSnapshot()
      .filter((entry) => entry.level === 'warn' || entry.level === 'error')
      .slice(-30)
      .map((entry) => `${entry.at} [${entry.level}] ${entry.scope}: ${entry.message}`)
      .join('\n');
    void Share.share({
      message:
        `Diagnostic ALIFA\n` +
        `Contenu : ${info?.contentVersion}\nMigrations : ${info?.migrations}\n` +
        `Profils : ${info?.profiles}\nRéponses enregistrées : ${info?.attempts}\n\n` +
        `Derniers avertissements :\n${logs || 'aucun'}`,
    });
  };

  if (!info) {
    void load();
  }

  return (
    <AlifaScreen background="default">
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.common.back}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AlifaIcon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <AlifaText variant="headlineMd" color={colors.primary}>
          {fr.settings.diagnostics}
        </AlifaText>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AlifaCard rounded="xl" style={styles.card}>
          <Row label="Version du contenu" value={info?.contentVersion ?? '…'} />
          <Row label="Migrations appliquées" value={String(info?.migrations ?? '…')} />
          <Row label="Profils sur ce téléphone" value={String(info?.profiles ?? '…')} />
          <Row label="Réponses enregistrées" value={String(info?.attempts ?? '…')} />
        </AlifaCard>
        <AlifaButton label="Exporter le diagnostic" onPress={exportDiagnostics} />
        <AlifaText variant="bodySm" color={colors.textSecondary} align="center">
          L’export ne contient ni prénom, ni voix, ni position. Vous choisissez à qui l’envoyer.
        </AlifaText>
      </ScrollView>
    </AlifaScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AlifaText variant="bodyMd" color={colors.textSecondary}>
        {label}
      </AlifaText>
      <AlifaText variant="bodyLg">{value}</AlifaText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.screenMargin, gap: spacing.lg },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
