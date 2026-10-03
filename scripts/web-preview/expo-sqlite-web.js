// Cale du banc de prévisualisation web : expo-sqlite web n'a pas de
// transaction exclusive ; on la ramène à une transaction ordinaire.
const real = require('expo-sqlite');
function patch(db) {
  if (db && !db.__ecolnaPatched) {
    db.withExclusiveTransactionAsync = (task) => db.withTransactionAsync(() => task(db));
    db.__ecolnaPatched = true;
    // Le banc sème le profil de démonstration par cette porte.
    globalThis.__ecolnaDb = db;
  }
  return db;
}
module.exports = {
  ...real,
  openDatabaseAsync: async (...args) => patch(await real.openDatabaseAsync(...args)),
};
