/**
 * Prononciation imposée des sons isolés — API phonétique internationale.
 *
 * La synthèse phonétise le français par espeak-ng, qui se trompe sur les sons
 * présentés SEULS : hors d'un mot, il retombe sur le nom des lettres (« bl »
 * devient « bé-elle »), part en anglais (« in » devient /ɪn/) ou choisit la
 * mauvaise voyelle (« eu » devient /y/, c'est-à-dire le son « u »). Sur une
 * app d'apprentissage de la lecture, c'est le contenu lui-même qui est faux :
 * l'enfant répète ce qu'il entend.
 *
 * Chaque entrée ci-dessous impose donc les phonèmes, vérifiés contre un mot
 * français de référence où espeak produit ce son correctement.
 *
 * ⚠️ CE SONT DES DÉCISIONS PÉDAGOGIQUES. Comme les `teachingOrder`, elles
 * doivent être validées par un enseignant — voir docs/pedagogical-validation.md.
 * En particulier : les consonnes et les groupes se disent ici avec un « e »
 * d'appui (/blə/, /tʁə/, /zə/), usage courant au CP français, plutôt qu'avec
 * le nom de la lettre.
 *
 * La clé est le texte du son tel qu'il est écrit dans le contenu ; la valeur
 * est ce que la voix doit produire.
 */
export const SPOKEN_PHONEMES: Record<string, string> = {
  // --- Lettres accentuées seules : espeak les épelle ------------------------
  // « é » → « e accent aigu ». Référence : « er » → /e/.
  é: 'ˈe',
  è: 'ˈɛ',
  ê: 'ˈɛ',
  ç: 'sˈə',

  // --- Groupes de consonnes : espeak épelle les lettres --------------------
  // « bl » → « bé-elle ». Références : blanc /blɑ̃/, brun /bʁœ̃/, train /tʁɛ̃/.
  bl: 'blˈə',
  br: 'bʁˈə',
  tr: 'tʁˈə',
  // « gn » → « gé-enne ». Référence : peigne /pɛɲ/.
  gn: 'ɲˈə',
  // « ch » → « cé-ache ». Référence : cheval /ʃəval/.
  ch: 'ʃˈə',

  // --- Consonnes seules : espeak donne le NOM de la lettre -----------------
  // « z » → « zède », « k » → « ka ». Au CP on émet le son, on ne le nomme pas.
  z: 'zˈə',
  k: 'kˈə',

  // --- Voyelles et digrammes mal rendus ------------------------------------
  // « eu » → /y/, soit le son « u » : deux sons du programme confondus.
  // Référence : feu /fø/.
  eu: 'ˈø',
  // « ai » → /e/ au lieu de /ɛ/. Référence : lait /lɛ/.
  ai: 'ˈɛ',
  // « in » → /ɪn/ anglais. Référence : pain /pɛ̃/.
  in: 'ˈɛ̃',
  // « ac » → /ase/, soit « a-cé » épelé. Référence : sac /sak/.
  ac: 'ˈak',

  // --- Équivalences du programme (p. 24) : le même son, trois écritures ----
  // L'enfant doit entendre trois fois LE MÊME son — c'est toute la leçon.
  'é, er, ez': 'ˈe, ˈe, ˈe',
  'c, s, ç': 'sˈə, sˈə, sˈə',
  'o, au, eau': 'ˈo, ˈo, ˈo',

  // --- Syllabes ------------------------------------------------------------
  // « be » → /biː/ anglais. Référence : semaine /səmɛn/ pour le e d'appui.
  be: 'bˈə',
  // « che » perdait sa voyelle (/ʃ/ seul).
  che: 'ʃˈə',
  // « bin » héritait du /ɪn/ anglais.
  bin: 'bˈɛ̃',
  // « bai » → /be/ au lieu de /bɛ/, comme « ai ».
  bai: 'bˈɛ',
  // « gna » → /nja/ au lieu de /ɲa/. Référence : peigne /pɛɲ/.
  gna: 'ɲˈa',
};
