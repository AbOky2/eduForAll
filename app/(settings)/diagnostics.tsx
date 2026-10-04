import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { logSnapshot } from '@/core/logging/logger';
import { getDatabase } from '@/database/connection/database';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';
import { useParentSession } from '@/features/parent-space/application/parent-session-store';
import { fr } from '@/localization/fr/strings';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface DiagnosticsInfo {
  migrations: number;
  contentVersion: string;
  profiles: number;
  attempts: number;
}

async function loadDiagnostics(): Promise<DiagnosticsInfo> {
  const db = await getDatabase();
  const migrations = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM migration_history',
  );
  const content = await db.getFirstAsync<{ content_version: string }>(
    'SELECT content_version FROM content_versions ORDER BY imported_at DESC LIMIT 1',
  );
  const profiles = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM child_profiles');
  const attempts = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM exercise_attempts',
  );
  return {
    migrations: migrations?.n ?? 0,
    contentVersion: content?.content_version ?? fr.settings.diagnosticsUnknown,
    profiles: profiles?.n ?? 0,
    attempts: attempts?.n ?? 0,
  };
}

/**
 * Parent-triggered diagnostics. The export is a redacted text summary shared
 * voluntarily through the OS share sheet — no name, no voice, no location.
 */
export default function DiagnosticsScreen() {
  const goBack = useSafeBack();
  const info = useFocusedData(loadDiagnostics, 'diagnostics');

  const exportDiagnostics = (info: DiagnosticsInfo) => {
    const logs = logSnapshot()
      .filter((entry) => entry.level === 'warn' || entry.level === 'error')
      .slice(-30)
      .map((entry) => `${entry.at} [${entry.level}] ${entry.scope}: ${entry.message}`)
      .join('\n');
    // Android sort de l'app pour la feuille de partage : la session reste ouverte.
    useParentSession.getState().beginExternalShare();
    void Share.share({ message: fr.settings.diagnosticsExportText(info, logs) });
  };

  return (
    <EcolnaScreen background="plain">
      <EcolnaScreenHeader onBack={goBack} title={fr.settings.diagnostics} titleVariant="headlineMd" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <EcolnaCard rounded="xl" style={styles.card}>
          <Row label={fr.settings.diagnosticsContent} value={info?.contentVersion ?? '…'} />
          <Row label={fr.settings.diagnosticsMigrations} value={String(info?.migrations ?? '…')} />
          <Row label={fr.settings.diagnosticsProfiles} value={String(info?.profiles ?? '…')} />
          <Row label={fr.settings.diagnosticsAttempts} value={String(info?.attempts ?? '…')} />
        </EcolnaCard>
        {/* L'export n'existe qu'une fois le diagnostic lu : jamais « undefined » dans le texte partagé. */}
        {info ? (
          <EcolnaButton
            label={fr.settings.diagnosticsExport}
            variant="accent"
            size="md"
            onPress={() => exportDiagnostics(info)}
          />
        ) : null}
        <EcolnaText variant="bodySm" color={colors.textSecondary} align="center">
          {fr.settings.diagnosticsNote}
        </EcolnaText>
      </ScrollView>
    </EcolnaScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <EcolnaText variant="bodyMd" color={colors.textSecondary}>
        {label}
      </EcolnaText>
      <EcolnaText variant="bodyLg">{value}</EcolnaText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenMargin,
    gap: spacing.lg,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
