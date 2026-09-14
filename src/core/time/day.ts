/**
 * Jour calendaire tel que l'enfant le vit, pas tel que l'horloge UTC le voit.
 *
 * Les horodatages sont stockés en ISO UTC, ce qui est juste. Mais découper ces
 * chaînes aux dix premiers caractères range une leçon finie à 00 h 30 à
 * N'Djaména (UTC+1) dans la journée de la veille : l'accueil annonçait alors
 * « on commence la journée ? » juste après une leçon terminée, et la série de
 * jours pouvait se casser sans raison.
 *
 * Côté SQL, `date(colonne, 'localtime')` fait la même conversion avec le
 * fuseau de l'appareil.
 */
export function localDay(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
