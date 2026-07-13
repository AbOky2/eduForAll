import { initialSchema } from './001-initial-schema';
import type { Migration } from './types';

/** Ordered registry. Append only — never edit a shipped migration. */
export const migrations: readonly Migration[] = [initialSchema];
