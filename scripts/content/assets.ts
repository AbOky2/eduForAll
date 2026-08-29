/** Tracks which illustrations the generated content actually references. */
const used = new Set<string>();

export function illustration(id: string): string {
  used.add(id);
  return id;
}

export function usedIllustrations(): string[] {
  return [...used].sort();
}
