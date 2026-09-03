/**
 * French UI copy — V1 ships entirely in French. Keys are semantic; screens
 * never hardcode visible text. Pedagogical content lives in the curriculum
 * manifests, not here.
 */
/**
 * « de » ou « d’ » selon le prénom : « le tableau de bord d’Amina », mais
 * « de Moussa ». L'UI est en français seulement — une élision fautive se voit
 * immédiatement, et c'est le prénom de l'enfant qui est en jeu.
 */
function of(firstName: string): string {
  const first = firstName.trim().charAt(0).toLowerCase();
  return 'aeiouyàâäéèêëîïôöùûü'.includes(first) ? `d’${firstName}` : `de ${firstName}`;
}

export const fr = {
  common: {
    appName: 'ALIFA',
    next: 'Suivant',
    start: 'Commencer',
    continue: 'Continuer',
    verify: 'Vérifier',
    replay: 'Rejouer',
    skip: 'Passer',
    back: 'Retour',
    understood: 'C’est compris',
    listen: 'Écouter',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    retry: 'Réessayer',
  },
  onboarding: {
    welcomeTitle: 'Ton école t’accompagne partout.',
    subjectsTitle: 'Langage, lecture, écriture et calcul.',
    subjectsSubtitle: 'Tout ce dont tu as besoin pour apprendre en t’amusant.',
    offlineTitle: 'Fonctionne sans connexion.',
    offlineSubtitle: 'Apprends partout, tout le temps.',
    createProfile: 'Créer mon profil',
    tagline: 'Apprendre partout, même sans internet',
  },
  profile: {
    title: 'Crée ton profil',
    subtitle: 'Choisis ton avatar et ton niveau',
    avatarLabel: 'Ton avatar',
    firstNameLabel: 'Ton prénom',
    firstNamePlaceholder: 'Écris ton prénom ici',
    levelLabel: 'Ton niveau',
    go: 'C’est parti !',
    privacyNote: 'Pas d’email, pas de mot de passe. Tes données restent sur ce téléphone.',
    whoLearns: 'Qui apprend aujourd’hui ?',
    addProfile: 'Nouveau profil',
  },
  home: {
    greeting: (firstName: string) => `Bonjour ${firstName} !`,
    inProgress: 'EN COURS',
    continueLesson: 'Continuer ma leçon',
    startLesson: 'Ma prochaine leçon',
    activities: 'Tes activités',
    newBadge: 'Nouveau !',
    lessonsDone: (count: number) =>
      count > 1 ? `${count} leçons terminées` : `${count} leçon terminée`,
    today: (count: number) =>
      count === 0
        ? 'On commence la journée ?'
        : count === 1
          ? 'Une leçon faite aujourd’hui. Bravo !'
          : `${count} leçons faites aujourd’hui. Quelle énergie !`,
    streak: (days: number) => (days > 1 ? `${days} jours de suite` : 'Premier jour'),
    lockedExplain: 'Termine d’abord les leçons d’avant, et ça s’ouvrira.',
    reviseTitle: 'On revoit ensemble ?',
    reviseCount: (count: number) =>
      count > 1 ? `${count} notions à revoir` : '1 notion à revoir',
  },
  subjects: {
    language: 'Langage',
    reading: 'Lecture',
    writing: 'Écriture',
    math: 'Calcul',
  },
  tabs: {
    home: 'Accueil',
    learn: 'Apprendre',
    parents: 'Parents',
  },
  learn: {
    chooseModule: 'Choisis ton module',
    readyToday: 'Prêt à apprendre aujourd’hui ?',
    levelTitle: (level: string) => `Niveau ${level}`,
    cp1Motto: 'Continue ton aventure !',
    cp2Motto: 'En route vers l’oasis des savoirs !',
    locked: 'Encore un peu de patience !',
    lockedHint: 'Termine d’abord le monde précédent.',
  },
  lesson: {
    exerciseCount: (current: number, total: number) => `Exercice ${current} sur ${total}`,
    quit: 'Quitter la leçon ?',
    quitMessage: 'Ta progression est gardée. Tu pourras reprendre ici.',
    quitConfirm: 'Oui, je m’arrête',
    quitCancel: 'Je continue',
    resumeTitle: 'Bon retour !',
    resumeMessage: 'On reprend ta leçon là où tu t’étais arrêté.',
    hint: 'Un indice',
    dragHere: 'Glisse les lettres ici',
    feedbackCorrect: ['Bien joué !', 'Bravo !', 'Tu progresses !', 'Super !', 'C’est ça !'],
    feedbackIncorrect: [
      'Presque ! Essayons ensemble.',
      'Écoute encore une fois.',
      'Regarde bien, tu vas y arriver.',
      'On réessaie, tout doucement.',
    ],
    listenAndRepeat: 'Écoute, puis répète à voix haute.',
    repeatDone: 'J’ai répété !',
  },
  result: {
    title: 'Bravo ! Tu as terminé la leçon.',
    perfect: 'Trois étoiles ! C’est parfait.',
    oneMoreStar: 'Tu peux rejouer pour gagner plus d’étoiles.',
    needsReview: 'On reverra certaines notions ensemble, tout va bien.',
    nextLesson: 'Leçon suivante',
    backHome: 'Retour à l’accueil',
  },
  achievements: {
    title: 'Tes badges',
    subtitle: 'Chaque badge récompense un vrai progrès.',
    unlocked: 'Nouveau badge !',
    lockedHint: 'Continue pour le découvrir.',
    countEarned: (earned: number, total: number) => `${earned} badge${earned > 1 ? 's' : ''} sur ${total}`,
    labels: {
      'first-lesson': 'Premiers pas',
      'five-lessons': 'On continue !',
      'twenty-lessons': 'Élève appliqué',
      'fifty-lessons': 'Grand travailleur',
      'first-perfect': 'Sans faute',
      'five-perfect': 'Cinq sans faute',
      'first-world': 'Monde terminé',
      reader: 'Bon lecteur',
      speaker: 'Belle parole',
      writer: 'Belle écriture',
      counter: 'Roi du calcul',
      'streak-three': 'Trois jours de suite',
      'streak-seven': 'Une semaine entière',
      'star-collector': 'Cinquante étoiles',
    },
    descriptions: {
      'first-lesson': 'Terminer ta première leçon.',
      'five-lessons': 'Terminer 5 leçons.',
      'twenty-lessons': 'Terminer 20 leçons.',
      'fifty-lessons': 'Terminer 50 leçons.',
      'first-perfect': 'Gagner 3 étoiles sur une leçon.',
      'five-perfect': 'Gagner 3 étoiles sur 5 leçons.',
      'first-world': 'Terminer toutes les leçons d’un monde.',
      reader: 'Terminer 10 leçons de lecture.',
      speaker: 'Terminer 10 leçons de langage.',
      writer: 'Terminer 10 leçons d’écriture.',
      counter: 'Terminer 10 leçons de calcul.',
      'streak-three': 'Apprendre 3 jours de suite.',
      'streak-seven': 'Apprendre 7 jours de suite.',
      'star-collector': 'Gagner 50 étoiles en tout.',
    },
  },
  childProfile: {
    title: 'Mon profil',
    levelLabel: 'Mon niveau',
    changeAvatar: 'Choisis ton avatar',
    lessonsDone: 'Leçons terminées',
    starsEarned: 'Étoiles gagnées',
    bestStreak: 'Jours de suite',
    days: (count: number) => (count > 1 ? `${count} jours` : `${count} jour`),
  },
  revision: {
    title: 'On va revoir ce qui est difficile.',
    subtitle: 'Pas de stress, on prend notre temps pour bien comprendre.',
    start: 'Commencer la révision',
    empty: 'Rien à revoir pour l’instant. Continue comme ça !',
  },
  offline: {
    badge: 'Mode hors-connexion actif',
    title: 'Tu peux continuer à apprendre sans internet.',
    subtitle: 'Tes leçons favorites sont toujours là.',
  },
  parent: {
    gateTitle: 'Espace parents',
    gateSubtitle: 'Cet espace est réservé aux parents.',
    gateQuestion: 'Pour entrer, réponds à cette question :',
    gateWrong: 'Ce n’est pas la bonne réponse.',
    dashboardTitle: (firstName: string) => `Tableau de bord ${of(firstName)}`,
    dashboardSubtitle: 'Suivez sa progression et ses accomplissements récents.',
    currentLevel: 'Niveau actuel',
    lessonsCompleted: 'Leçons complétées',
    timeToday: 'Temps aujourd’hui',
    minutes: (count: number) => `${count} min`,
    progressAnalysis: 'Analyse de progression',
    recommendation: 'RECOMMANDATION',
    toReview: 'Notions à revoir',
    nothingToReview: 'Aucune notion en difficulté cette semaine.',
    proudTitle: 'Fier des résultats ?',
    share: 'Partager la progression',
    switchProfile: 'Changer de profil',
  },
  settings: {
    title: 'Paramètres',
    sound: 'Son',
    language: 'Langue',
    french: 'Français',
    chadianArabic: 'Arabe tchadien',
    comingSoon: 'Bientôt disponible',
    offlineInfo: 'Informations offline',
    offlineStatus: 'Tout est téléchargé',
    about: 'À propos du projet',
    privacy: 'Confidentialité',
    diagnostics: 'Diagnostic',
    resetProgress: 'Réinitialiser progression',
    resetTitle: 'Tout effacer ?',
    resetMessage:
      'La progression, les étoiles et les profils seront supprimés pour toujours. Cette action est irréversible.',
    resetConfirm: 'Oui, tout effacer',
  },
  errors: {
    genericTitle: 'Oups, quelque chose s’est mal passé.',
    genericMessage: 'Ce n’est pas de ta faute. Réessaie, tout est gardé.',
    contentUnavailable: 'Ce contenu n’est pas disponible pour le moment.',
    audioUnavailable: 'Le son ne marche pas ici, mais tu peux continuer.',
    initFailedTitle: 'ALIFA n’arrive pas à démarrer.',
    initFailedMessage: 'Réessaie. Si le problème continue, un parent peut voir le diagnostic.',
  },
} as const;

export type FeedbackPool = readonly string[];

/** Rotates kind feedback lines deterministically (index by attempt count). */
export function pickFeedback(pool: FeedbackPool, seed: number): string {
  return pool[seed % pool.length] ?? pool[0] ?? '';
}
