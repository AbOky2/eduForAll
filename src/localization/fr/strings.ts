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
    appName: 'ECOLNA',
    next: 'Suivant',
    start: 'Commencer',
    continue: 'Continuer',
    verify: 'Vérifier',
    replay: 'Rejouer',
    skip: 'Passer',
    back: 'Retour',
    understood: 'C’est compris',
    listen: 'Écouter',
    listenHint: 'Fait écouter le son',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    retry: 'Réessayer',
  },
  /** Ce que lit le lecteur d'écran, sans jamais l'afficher. */
  a11y: {
    locked: 'verrouillé',
    progress: (label: string, done: number, total: number) => `${label} : ${done} sur ${total}`,
    stars: (earned: number, total: number) =>
      `${earned} étoile${earned > 1 ? 's' : ''} sur ${total}`,
    page: (page: number, total: number) => `Page ${page} sur ${total}`,
  },
  onboarding: {
    welcomeTitle: 'Ton école t’accompagne partout.',
    /** Le mot du titre mis en couleur (il doit figurer dans `welcomeTitle`). */
    welcomeTitleHighlight: 't’accompagne',
    subjectsTitle: 'Langage, lecture, écriture et calcul.',
    subjectsSubtitle: 'Tout ce dont tu as besoin pour apprendre en t’amusant.',
    offlineTitle: 'Tout marche sans internet.',
    offlineSubtitle: 'Apprends partout, tout le temps.',
    createProfile: 'Créer mon profil',
    tagline: 'Apprendre partout, même sans internet',
  },
  profile: {
    title: 'Crée ton profil',
    subtitle: 'Choisis ton avatar et ton niveau',
    avatarLabel: 'Ton avatar',
    firstNameLabel: 'Prénom (ou surnom)',
    firstNamePlaceholder: 'Écris ton prénom ici',
    levelLabel: 'Ton niveau',
    go: 'C’est parti !',
    privacyNote:
      'Le prénom reste sur cet appareil. Pas de compte, pas d’e-mail, rien n’est envoyé.',
    whoLearns: 'Qui apprend aujourd’hui ?',
    addProfile: 'Nouveau profil',
    /** La cérémonie d'entrée (brief v2 § 12) : une décision par étape. */
    stepCount: (step: number, total: number) => `Étape ${step} sur ${total}`,
    stepAvatar: 'Choisis ton personnage',
    // Espace insécable avant « ? » : le point d'interrogation ne part jamais
    // seul à la ligne dans un grand titre.
    stepName: 'Comment tu t’appelles\u00a0?',
    stepLevel: 'Tu es dans quelle classe\u00a0?',
    itsMe: 'C’est moi !',
    itsMyName: 'C’est mon prénom !',
    adultNameHelp: 'Parent ou enseignant : écrivez le prénom de l’enfant (ou un surnom).',
    clearName: 'Effacer le prénom',
    slateIntro: 'Je m’appelle',
    levelGloss: { CP1: '1re année', CP2: '2e année' },
    levelLabelA11y: { CP1: 'CP1, première année', CP2: 'CP2, deuxième année' },
    levelAdultNote: 'Vous pourrez changer la classe plus tard dans l’espace parents.',
    helpAvatar: 'Touche le personnage qui te ressemble.',
    helpName: 'Il manque ton prénom : demande à un adulte de t’aider.',
    helpLevel: 'Touche ta classe.',
    welcome: (firstName: string) => `Bienvenue, ${firstName}\u00a0!`,
    letsGo: 'On y va !',
    stageLabel: (firstName: string, level: string) =>
      [firstName, level].filter(Boolean).length > 0
        ? `Ta carte : ${[firstName, level].filter(Boolean).join(', ')}`
        : 'Ta carte',
  },
  home: {
    greeting: (firstName: string) => `Bonjour ${firstName} !`,
    inProgress: 'EN COURS',
    newTag: 'NOUVEAU',
    continueLesson: 'Continuer ma leçon',
    startLesson: 'Ma prochaine leçon',
    activities: 'Tes activités',
    newBadge: 'Nouveau !',
    lessonsDone: (count: number) =>
      count > 1 ? `${count} leçons terminées` : `${count} leçon terminée`,
    today: (count: number) =>
      count === 0
        ? 'On commence la journée ?'
        : count === 1
          ? 'Une leçon faite aujourd’hui. Bravo !'
          : `${count} leçons faites aujourd’hui. Quelle énergie !`,
    streak: (days: number) => (days > 1 ? `${days} jours de suite` : 'Premier jour'),
    /** La série, en court sur la puce soleil. */
    streakShort: (days: number) => (days > 1 ? `${days} jours` : '1 jour'),
    lockedExplain: 'Termine d’abord les leçons d’avant, et ça s’ouvrira.',
    /** L'état d'une matière, dit en mots (jamais une fraction pour l'enfant). */
    subjectState: {
      new: 'À découvrir',
      started: 'En cours',
      done: 'Terminé',
      locked: 'Bientôt',
    },
    /** La carte du jour. */
    todayEyebrow: (subject: string, world: string) => `${subject} · ${world}`,
    lessonMeta: (steps: number, minutes: number) =>
      `${steps} activité${steps > 1 ? 's' : ''} · ${minutes} min`,
    reviseTitle: 'On revoit ensemble ?',
    reviseCount: (count: number) => (count > 1 ? `${count} notions à revoir` : '1 notion à revoir'),
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
    chooseModule: 'Que veux-tu apprendre ?',
    readyToday: 'Prêt à apprendre aujourd’hui ?',
    levelTitle: (level: string) => `Niveau ${level}`,
    cp1Motto: 'Continue ton aventure !',
    cp2Motto: 'En route vers l’oasis des savoirs !',
    locked: 'Encore un peu de patience !',
    lockedHint: 'Termine d’abord le monde précédent.',
    /** Le second volet du parcours, couché. */
    worldLessons: 'LES LEÇONS DE CE MONDE',
    /** Ce que fait un appui sur une porte ou un monde fermé. */
    lockedA11yHint: 'Explique pourquoi c’est fermé.',
    /** Ce qu'on fait dans chaque discipline, pour l'adulte qui lit l'écran. */
    subjectHints: {
      language: 'Parler, écouter, raconter',
      reading: 'Les lettres et les sons',
      writing: 'Tracer et écrire',
      math: 'Compter et calculer',
    },
  },
  lesson: {
    exerciseCount: (current: number, total: number) => `Exercice ${current} sur ${total}`,
    quit: 'Quitter la leçon ?',
    quitMessage: 'Ta progression est gardée. Tu pourras reprendre ici.',
    quitConfirm: 'Oui, je m’arrête',
    quitCancel: 'Je continue',
    resumeTitle: 'Bon retour !',
    resumeMessage: 'On reprend ta leçon là où tu t’étais arrêté.',
    hint: 'Un indice',
    replayInstruction: 'Réécouter la consigne',
    removeTile: (value: string) => `Retirer ${value}`,
    traceLetterHint: 'Pars du gros point et suis le chemin.',
    traceGraphismHint: 'Pars du gros point et va vers la droite.',
    traceLetterLabel: (letter: string) => `Trace la lettre ${letter}`,
    traceGraphismLabel: (pattern: string) => `Trace ${pattern}`,
    /** Un appui trop tôt : ce que dit l'anneau d'aide (jamais un bouton grisé). */
    nudgeTiles: 'Touche une tuile pour la poser.',
    nudgeWords: 'Touche les mots dans l’ordre de la phrase.',
    nudgeVerify: 'Tout est posé : touche « Vérifier ».',
    /** Une carte reliée, lue par le lecteur d'écran : « ba, paire 1 ». */
    pairLabel: (label: string, pair: number) => `${label}, paire ${pair}`,
    soundPositions: { debut: 'au début', milieu: 'au milieu', fin: 'à la fin' },
    maskedWord: 'Mot à compléter',
    feedbackCorrect: ['Bien joué !', 'Bravo !', 'Oui, c’est ça !', 'Super !', 'Exactement !'],
    feedbackIncorrect: [
      'Presque ! Essayons ensemble.',
      'Écoute encore une fois.',
      'Regarde bien, tu vas y arriver.',
      'On réessaie, tout doucement.',
    ],
    listenAndRepeat: 'Écoute, puis répète à voix haute.',
    repeatDone: 'J’ai répété !',
  },
  result: {
    title: 'Bravo ! Tu as terminé la leçon.',
    /** Le titre en deux temps : le cri, puis ce qu'on a fait. */
    bravo: 'Bravo !',
    lessonDone: 'Tu as terminé la leçon.',
    perfect: 'Trois étoiles ! C’est parfait.',
    oneMoreStar: 'Tu peux rejouer pour gagner plus d’étoiles.',
    needsReview: 'On reverra certaines notions ensemble, tout va bien.',
    nextLesson: 'Leçon suivante',
    backHome: 'Retour à l’accueil',
  },
  achievements: {
    title: 'Tes badges',
    subtitle: 'Chaque badge récompense un vrai progrès.',
    unlocked: 'Nouveau badge !',
    unlockedMany: 'Nouveaux badges !',
    lockedHint: 'Continue pour le découvrir.',
    countEarned: (earned: number, total: number) =>
      `${earned} badge${earned > 1 ? 's' : ''} sur ${total}`,
    /** Ce que voit l'enfant : ce qu'il a, jamais une fraction. */
    earnedCount: (earned: number) => `${earned} badge${earned > 1 ? 's' : ''}`,
    labels: {
      'first-lesson': 'Premiers pas',
      'five-lessons': 'On continue !',
      'twenty-lessons': 'Vingt leçons',
      'fifty-lessons': 'Cinquante leçons',
      'first-perfect': 'Sans faute',
      'five-perfect': 'Cinq sans faute',
      'first-world': 'Monde terminé',
      reader: 'Belle lecture',
      speaker: 'Belle parole',
      writer: 'Belle écriture',
      counter: 'As du calcul',
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
    /** Pourquoi une notion revient — dit à l'adulte, jamais à l'enfant. */
    reasons: {
      repeated_errors: 'Cette notion a posé plusieurs difficultés récemment.',
      needed_hints: 'Cette notion a souvent eu besoin d’un coup de pouce.',
      not_practiced_recently: 'Cette notion n’a pas été pratiquée depuis un moment.',
      confusion_pair: 'Deux sons proches sont parfois confondus : on les compare ensemble.',
    },
    subtitle: 'Pas de stress, on prend notre temps pour bien comprendre.',
    start: 'Commencer la révision',
    inLessons: 'Ces notions reviendront dans tes prochaines leçons.',
    empty: 'Rien à revoir pour l’instant. Continue comme ça !',
  },
  offline: {
    badge: 'Tout marche sans internet',
    /** La puce de l'accueil : une promesse, pas une alerte. */
    chip: 'Sans internet',
    title: 'Tu peux continuer à apprendre sans internet.',
    subtitle: 'Toutes tes leçons sont là, même sans internet.',
  },
  parent: {
    gateTitle: 'Espace parents',
    gateSubtitle: 'Cet espace est réservé aux parents.',
    gateQuestion: 'Pour entrer, écris le résultat de cette opération :',
    gatePlaceholder: 'Ta réponse',
    gateEnter: 'Entrer',
    gateWrong: 'Ce n’est pas la bonne réponse.',
    dashboardTitle: (firstName: string) => `Tableau de bord ${of(firstName)}`,
    dashboardSubtitle: 'Suivez sa progression et ses accomplissements récents.',
    currentLevel: 'Niveau actuel',
    lessonsCompleted: 'Leçons complétées',
    timeToday: 'Temps aujourd’hui',
    masteredSkills: 'Notions maîtrisées',
    minutes: (count: number) => `${count} min`,
    progressAnalysis: 'Analyse de progression',
    bySubject: 'Par discipline',
    subjectLessons: (done: number, total: number) =>
      `${done} leçon${done > 1 ? 's' : ''} sur ${total}`,
    percent: (value: number) => `${value}\u00a0%`,
    recommendation: 'RECOMMANDATION',
    toReview: 'Notions à revoir',
    nothingToReview: 'Aucune notion en difficulté cette semaine.',
    proudTitle: 'Fier des résultats ?',
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
    offlineInfo: 'Sans internet',
    offlineStatus: 'Tout est téléchargé',
    about: 'À propos du projet',
    privacy: 'Confidentialité',
    diagnostics: 'Diagnostic',
    resetProgress: 'Réinitialiser la progression',
    resetTitle: 'Tout effacer ?',
    resetMessage:
      'La progression, les étoiles et les profils seront supprimés pour toujours. Cette action est irréversible.',
    resetConfirm: 'Oui, tout effacer',
    resetLastCheck: 'Dernière vérification : cette action supprime tout, définitivement.',
    /** Engagements de confidentialité, en français simple pour les parents. */
    privacyCommitments: [
      'Toutes les données restent sur cet appareil. Rien n’est envoyé sur internet.',
      'Aucun compte, aucun e-mail, aucun mot de passe n’est demandé.',
      'Aucune publicité, aucun achat, aucun abonnement.',
      'Aucune géolocalisation, aucun accès aux contacts ni aux photos.',
      'Le prénom et l’avatar servent uniquement à accueillir l’enfant dans l’application.',
      'Supprimer l’application supprime toutes les données.',
    ],
    diagnosticsContent: 'Version du contenu',
    diagnosticsMigrations: 'Migrations appliquées',
    diagnosticsProfiles: 'Profils sur cet appareil',
    diagnosticsAttempts: 'Réponses enregistrées',
    diagnosticsExport: 'Exporter le diagnostic',
    diagnosticsNote:
      'L’export ne contient ni prénom, ni voix, ni position. Vous choisissez à qui l’envoyer.',
    diagnosticsUnknown: 'inconnue',
  },
  errors: {
    genericTitle: 'Oups, quelque chose s’est mal passé.',
    genericMessage: 'Ce n’est pas de ta faute. Réessaie, tout est gardé.',
    contentUnavailable: 'Ce contenu n’est pas disponible pour le moment.',
    audioUnavailable: 'Le son ne marche pas ici, mais tu peux continuer.',
    initFailedTitle: 'ECOLNA n’arrive pas à démarrer.',
    initFailedMessage: 'Réessaie. Si le problème continue, un parent peut voir le diagnostic.',
  },
  /**
   * Les douze enfants (design/brief-identite-v2.md § 8.4) : on décrit le style,
   * jamais une aide technique en premier. Libellé d'une tuile :
   * « Avatar 3 : garçon en jalabiya verte ».
   */
  avatars: {
    /** « Avatar 3 : garçon en jalabiya verte » — le préfixe reste pour Maestro. */
    tileLabel: (index: number, description: string) =>
      `Avatar ${index} : ${description.charAt(0).toLowerCase()}${description.slice(1)}`,
    descriptions: {
      'avatar-1': 'Garçon à la raie de côté, chemise bleue',
      'avatar-2': 'Fille aux deux boules afro, robe en pagne',
      'avatar-3': 'Garçon en jalabiya verte',
      'avatar-4': 'Fille aux tresses perlées, haut prune',
      'avatar-5': 'Fille au foulard noué, robe sable',
      'avatar-6': 'Garçon aux lunettes rondes, polo jaune',
      'avatar-7': 'Fille aux cheveux afro, robe bleu ciel',
      'avatar-8': 'Garçon au bob, t-shirt rayé',
      'avatar-9': 'Fille aux nattes relevées, robe brodée',
      'avatar-10': 'Garçon à la chemise à carreaux, appareil auditif bleu',
      'avatar-11': 'Fille au chignon couronne, boubou indigo',
      'avatar-12': 'Garçon aux cheveux bouclés, t-shirt vert',
    },
  },
} as const;

export type FeedbackPool = readonly string[];

/** Rotates kind feedback lines deterministically (index by attempt count). */
export function pickFeedback(pool: FeedbackPool, seed: number): string {
  return pool[seed % pool.length] ?? pool[0] ?? '';
}
