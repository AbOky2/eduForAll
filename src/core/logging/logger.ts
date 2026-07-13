/**
 * Local-only ring-buffer logger. Nothing ever leaves the device: the buffer
 * feeds the parent-space diagnostics export and dev tooling. Console output
 * is enabled only in development builds.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly at: string;
  readonly level: LogLevel;
  readonly scope: string;
  readonly message: string;
}

const MAX_ENTRIES = 500;
const entries: LogEntry[] = [];

function record(level: LogLevel, scope: string, message: string): void {
  entries.push({ at: new Date().toISOString(), level, scope, message });
  if (entries.length > MAX_ENTRIES) {
    entries.shift();
  }
  if (__DEV__ && (level === 'warn' || level === 'error')) {
    // eslint-disable-next-line no-console
    console[level](`[${scope}] ${message}`);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (message: string) => record('debug', scope, message),
    info: (message: string) => record('info', scope, message),
    warn: (message: string) => record('warn', scope, message),
    error: (message: string, cause?: unknown) =>
      record('error', scope, cause instanceof Error ? `${message} — ${cause.message}` : message),
  };
}

/** Snapshot used by the parent-space diagnostics export (redacted upstream). */
export function logSnapshot(): readonly LogEntry[] {
  return [...entries];
}
