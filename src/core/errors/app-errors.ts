/**
 * Application error hierarchy.
 *
 * Technical messages stay in English and are reserved for diagnostics
 * (parent-space export, dev logs). Child- and parent-facing screens must map
 * these to localized, kind copy — never render `message` directly in the UI.
 */

export type ErrorSeverity = 'recoverable' | 'fatal';

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly severity: ErrorSeverity;

  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ContentValidationError extends AppError {
  readonly code = 'CONTENT_VALIDATION';
  readonly severity = 'recoverable';
}

export class DatabaseInitializationError extends AppError {
  readonly code = 'DATABASE_INITIALIZATION';
  readonly severity = 'fatal';
}

export class MigrationError extends AppError {
  readonly code = 'MIGRATION';
  readonly severity = 'fatal';
}

export class AudioAssetNotFoundError extends AppError {
  readonly code = 'AUDIO_ASSET_NOT_FOUND';
  readonly severity = 'recoverable';

  constructor(
    readonly audioId: string,
    cause?: unknown,
  ) {
    super(`Audio asset not found: ${audioId}`, cause);
  }
}

export class LessonSessionError extends AppError {
  readonly code = 'LESSON_SESSION';
  readonly severity = 'recoverable';
}

export class RecoverableAppError extends AppError {
  readonly code = 'RECOVERABLE';
  readonly severity = 'recoverable';
}

export class FatalAppError extends AppError {
  readonly code = 'FATAL';
  readonly severity = 'fatal';
}

export function toAppError(candidate: unknown, fallbackMessage: string): AppError {
  if (candidate instanceof AppError) {
    return candidate;
  }
  if (candidate instanceof Error) {
    return new RecoverableAppError(candidate.message, candidate);
  }
  return new RecoverableAppError(fallbackMessage, candidate);
}
