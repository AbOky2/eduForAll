import { initialSchema } from './001-initial-schema';
import { officialCurriculum } from './002-official-curriculum';
import { revisionPriority } from './003-revision-priority';
import type { Migration } from './types';

/** Ordered registry. Append only — never edit a shipped migration. */
export const migrations: readonly Migration[] = [
  initialSchema,
  officialCurriculum,
  revisionPriority,
];
