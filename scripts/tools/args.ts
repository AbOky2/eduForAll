/** Lecture minimale de `--nom valeur` / `--drapeau` pour les scripts du dépôt. */
export function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function has(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
