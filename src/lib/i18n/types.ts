/**
 * i18n Type Definitions
 * Feature: 008-i18n-support
 *
 * Type-safe translation system for Japanese/English bilingual support
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Supported language codes
 */
export type Language = 'ja' | 'en';

// =============================================================================
// Translation Namespace Interfaces
// =============================================================================

/**
 * Common UI element translations
 */
export interface CommonTranslations {
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  back: string;
  next: string;
  loading: string;
  submit: string;
  close: string;
  confirm: string;
  yes: string;
  no: string;
  checkmark: string;
  reset: string;
}

/**
 * Navigation and header translations
 */
export interface NavigationTranslations {
  home: string;
  games: string;
  gameList: string;
  createGame: string;
  joinGame: string;
  settings: string;
  language: string;
  dashboard: string;
  activeGames: string;
  participantTop: string;
}

/**
 * Game status translations
 */
export interface GameStatusTranslations {
  preparing: string;
  active: string;
  closed: string;
}

/**
 * Game-related translations
 */
export interface GameTranslations {
  title: string;
  createGame: string;
  editGame: string;
  editSettings: string;
  deleteGame: string;
  dangerZone: string;
  deleteWarning: string;
  createHelp: string;
  playerLimit: string;
  playerLimitDescription: string;
  status: GameStatusTranslations;
  presenter: string;
  presenters: string;
  episode: string;
  episodes: string;
  truth: string;
  lie: string;
  noGames: string;
  gameNotFound: string;
  startGame: string;
  endGame: string;
  activeGames: string;
  gameManagement: string;
  gameManagementDescription: string;
  newGame: string;
  gameDetails: string;
  gameTitle: string;
  createdAt: string;
  players: string;
  participants: string;
  participantList: string;
  join: string;
  availableSlots: string;
  startAccepting: string;
  gameClosed: string;
  createdGames: string;
  availableGames: string;
  searchPlaceholder: string;
  searchLabel: string;
}

/**
 * Session and player translations
 */
export interface SessionTranslations {
  nickname: string;
  enterNickname: string;
  join: string;
  leave: string;
  participants: string;
  noParticipants: string;
  welcome: string;
}

/**
 * Answer submission translations
 */
export interface AnswerTranslations {
  answerGame: string;
  submitAnswer: string;
  selectLie: string;
  yourAnswer: string;
  correct: string;
  incorrect: string;
  alreadySubmitted: string;
  answerSubmitted: string;
  answerForm: string;
  detectLieTitle: string;
  detectLieDescription: string;
  selectAllEpisodes: string;
  ready: string;
}

/**
 * Results and scoring translations
 */
export interface ResultsTranslations {
  results: string;
  finalResults: string;
  calculatingResults: string;
  responseStatus: string;
  responseStatusDashboard: string;
  responseStatusDescription: string;
  loadingResponseStatus: string;
  autoUpdating: string;
  manualRefresh: string;
  updating: string;
  lastUpdated: string;
  gameEnded: string;
  gameEndedDescription: string;
  creatorOnly: string;
  requiresActiveOrClosed: string;
  statistics: string;
  score: string;
  ranking: string;
  winner: string;
  points: string;
  correctAnswers: string;
  totalQuestions: string;
  totalParticipants: string;
  highestScore: string;
  averageScore: string;
  medianScore: string;
  congratulations: string;
  tieWinner: string;
  tieMessage: string;
  detectSuccess: string;
  correctCount: string;
  showDetails: string;
  noAnswers: string;
  pending: string;
  submitted: string;
  allSubmitted: string;
  viewResults: string;
}

/**
 * Error message translations
 */
export interface ErrorTranslations {
  required: string;
  invalid: string;
  notFound: string;
  pageNotFound: string;
  pageNotFoundDescription: string;
  serverError: string;
  networkError: string;
  unauthorized: string;
  forbidden: string;
  validationFailed: string;
  unexpectedError: string;
  nicknameUpdateFailed: string;
  gameClosed: string;
  errorOccurred: string;
  responseStatusFetchError: string;
}

/**
 * Success/notification message translations
 */
export interface MessageTranslations {
  saved: string;
  deleted: string;
  created: string;
  updated: string;
  copied: string;
  success: string;
}

/**
 * Empty state translations
 */
export interface EmptyStateTranslations {
  noData: string;
  noResults: string;
  noGamesFound: string;
  noActiveGames: string;
  waitForGames: string;
  noGames: string;
  createFirstGame: string;
  noAvailableGames: string;
  noSearchResults: string;
}

/**
 * Validation error translations
 */
export interface ValidationTranslations {
  required: string;
  invalid: string;
  tooLong: string;
  tooShort: string;
  outOfRange: string;
  notInteger: string;
  game: {
    name: {
      tooLong: string;
    };
    playerLimit: {
      range: string;
      belowCurrent: string;
      notInteger: string;
      tooLow: string;
      tooHigh: string;
    };
  };
  nickname: {
    empty: string;
    tooLong: string;
  };
  episode: {
    empty: string;
    tooLong: string;
    count: string;
    lieCount: string;
    needOneLie: string;
    onlyOneLie: string;
  };
  presenter: {
    alreadyComplete: string;
    notFound: string;
  };
  answer: {
    noSelections: string;
    incomplete: string;
  };
}

/**
 * Form field translations
 */
export interface FormTranslations {
  game: {
    name: {
      label: string;
      placeholder: string;
      description: string;
      optional: string;
    };
    playerLimit: {
      label: string;
      description: string;
      currentPlayers: string;
      availableSlots: string;
    };
    status: {
      label: string;
    };
    availableSlots: {
      label: string;
    };
    createdAt: {
      label: string;
    };
    updatedAt: {
      label: string;
    };
  };
  presenter: {
    nickname: {
      label: string;
      placeholder: string;
      example: string;
    };
  };
  episode: {
    content: {
      label: string;
      placeholder: string;
    };
    isLie: {
      label: string;
    };
  };
  answer: {
    selectEpisodes: string;
    selectLieEpisode: string;
  };
}

/**
 * Status and transition translations
 */
export interface StatusTranslations {
  transition: {
    preparing: {
      toActive: string;
    };
    active: {
      toClosed: string;
    };
  };
  labels: {
    preparing: string;
    active: string;
    closed: string;
    starting: string;
    closing: string;
    updating: string;
    loading: string;
    success: string;
    error: string;
    retry: string;
    completed: string;
    complete: string;
    incomplete: string;
  };
  messages: {
    gameStarted: string;
    gameClosed: string;
    statusUpdated: string;
    cannotEdit: string;
  };
}

/**
 * Presenter-related translations
 */
export interface PresenterTranslations {
  add: string;
  addPresenter: string;
  presenterManagement: string;
  presenterManagementDescription: string;
  registerPresenterAndEpisodes: string;
  goToPresenterPage: string;
  presenterList: string;
  registeredPresenters: string;
  noPresenter: string;
  presenterNotFound: string;
  episodeCount: string;
  registrationStatus: string;
  registered: string;
  episodesComplete: string;
  episodesIncomplete: string;
  deletePresenter: string;
  confirmDelete: string;
  addEpisode: string;
  presenterAdded: string;
  presenterDeleted: string;
  presenterDeleteFailed: string;
  noPresenters: string;
  presenterEpisodes: string;
  management: string;
}

/**
 * Episode-related translations
 */
export interface EpisodeTranslations {
  addEpisode: string;
  episodeContent: string;
  episodeList: string;
  noEpisodes: string;
  selectThree: string;
  remaining: string;
  canAddMore: string;
  alreadyComplete: string;
  lieEpisode: string;
  truthEpisode: string;
  markAsLie: string;
  alreadyHasLie: string;
  episodeAdded: string;
  episodeFailed: string;
  episodeManagementDescription: string;
  registered: string;
  remainingCount: string;
  characterCount: string;
}

/**
 * Server action feedback translations
 */
export interface ActionTranslations {
  game: {
    create: {
      success: string;
      error: string;
    };
    update: {
      success: string;
      error: string;
    };
    delete: {
      success: string;
      error: string;
      confirm: string;
      confirmActive: string;
      confirmClosed: string;
    };
    start: {
      success: string;
      error: string;
      confirm: string;
    };
    close: {
      success: string;
      error: string;
      confirm: string;
    };
    fetch: {
      error: string;
    };
  };
  presenter: {
    add: {
      success: string;
      error: string;
    };
    delete: {
      error: string;
    };
  };
  episode: {
    add: {
      error: string;
    };
  };
  answer: {
    submit: {
      success: string;
      error: string;
    };
  };
  session: {
    notFound: string;
    required: string;
    unauthorized: string;
  };
}

/**
 * Toast notification translations
 */
export interface ToastTranslations {
  success: string;
  successIcon: string;
  successNotification: string;
  error: string;
  errorIcon: string;
  errorNotification: string;
  warning: string;
  warningIcon: string;
  warningNotification: string;
  info: string;
  infoIcon: string;
  infoNotification: string;
  close: string;
  closeIcon: string;
  notificationArea: string;
}

/**
 * Accessibility announcement translations
 */
export interface AccessibilityTranslations {
  statusChanged: string;
  errorOccurred: string;
  operationSucceeded: string;
  detailedUpdate: string;
}

// =============================================================================
// Complete Translation Structure
// =============================================================================

/**
 * Complete translation object structure for a single language
 */
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  game: GameTranslations;
  session: SessionTranslations;
  answer: AnswerTranslations;
  results: ResultsTranslations;
  errors: ErrorTranslations;
  messages: MessageTranslations;
  emptyState: EmptyStateTranslations;
  validation: ValidationTranslations;
  form: FormTranslations;
  status: StatusTranslations;
  presenter: PresenterTranslations;
  episode: EpisodeTranslations;
  action: ActionTranslations;
  toast: ToastTranslations;
  accessibility: AccessibilityTranslations;
}

/**
 * All translations indexed by language
 */
export type TranslationsByLanguage = {
  [K in Language]: Translations;
};

// =============================================================================
// Translation Key Types
// =============================================================================

/**
 * Dot-notation path to a translation value
 */
export type TranslationKey =
  // Original namespaces (9)
  | `common.${keyof CommonTranslations}`
  | `navigation.${keyof NavigationTranslations}`
  | `game.${keyof Omit<GameTranslations, 'status'>}`
  | `game.status.${keyof GameStatusTranslations}`
  | `session.${keyof SessionTranslations}`
  | `answer.${keyof AnswerTranslations}`
  | `results.${keyof ResultsTranslations}`
  | `errors.${keyof ErrorTranslations}`
  | `messages.${keyof MessageTranslations}`
  | `emptyState.${keyof EmptyStateTranslations}`
  // Validation namespace (nested structure)
  | `validation.${keyof Omit<ValidationTranslations, 'game' | 'nickname' | 'episode' | 'presenter' | 'answer'>}`
  | `validation.game.name.${keyof ValidationTranslations['game']['name']}`
  | `validation.game.playerLimit.${keyof ValidationTranslations['game']['playerLimit']}`
  | `validation.nickname.${keyof ValidationTranslations['nickname']}`
  | `validation.episode.${keyof ValidationTranslations['episode']}`
  | `validation.presenter.${keyof ValidationTranslations['presenter']}`
  | `validation.answer.${keyof ValidationTranslations['answer']}`
  // Form namespace (nested structure)
  | `form.game.name.${keyof FormTranslations['game']['name']}`
  | `form.game.playerLimit.${keyof FormTranslations['game']['playerLimit']}`
  | `form.game.status.${keyof FormTranslations['game']['status']}`
  | `form.game.availableSlots.${keyof FormTranslations['game']['availableSlots']}`
  | `form.game.createdAt.${keyof FormTranslations['game']['createdAt']}`
  | `form.game.updatedAt.${keyof FormTranslations['game']['updatedAt']}`
  | `form.presenter.nickname.${keyof FormTranslations['presenter']['nickname']}`
  | `form.episode.content.${keyof FormTranslations['episode']['content']}`
  | `form.episode.isLie.${keyof FormTranslations['episode']['isLie']}`
  | `form.answer.${keyof FormTranslations['answer']}`
  // Status namespace (nested structure)
  | `status.transition.preparing.${keyof StatusTranslations['transition']['preparing']}`
  | `status.transition.active.${keyof StatusTranslations['transition']['active']}`
  | `status.labels.${keyof StatusTranslations['labels']}`
  | `status.messages.${keyof StatusTranslations['messages']}`
  // Presenter namespace (flat structure)
  | `presenter.${keyof PresenterTranslations}`
  // Episode namespace (flat structure)
  | `episode.${keyof EpisodeTranslations}`
  // Action namespace (deeply nested structure)
  | `action.game.create.${keyof ActionTranslations['game']['create']}`
  | `action.game.update.${keyof ActionTranslations['game']['update']}`
  | `action.game.delete.${keyof ActionTranslations['game']['delete']}`
  | `action.game.start.${keyof ActionTranslations['game']['start']}`
  | `action.game.close.${keyof ActionTranslations['game']['close']}`
  | `action.game.fetch.${keyof ActionTranslations['game']['fetch']}`
  | `action.presenter.add.${keyof ActionTranslations['presenter']['add']}`
  | `action.presenter.delete.${keyof ActionTranslations['presenter']['delete']}`
  | `action.episode.add.${keyof ActionTranslations['episode']['add']}`
  | `action.answer.submit.${keyof ActionTranslations['answer']['submit']}`
  | `action.session.${keyof ActionTranslations['session']}`
  // Toast namespace (flat structure)
  | `toast.${keyof ToastTranslations}`
  // Accessibility namespace (flat structure)
  | `accessibility.${keyof AccessibilityTranslations}`;

// =============================================================================
// Context Types
// =============================================================================

/**
 * Language context value provided to consumers
 */
export interface LanguageContextValue {
  /** Current active language */
  language: Language;

  /** Update the active language (persists to localStorage) */
  setLanguage: (lang: Language) => void;

  /** Toggle between Japanese and English */
  toggleLanguage: () => void;

  /** Get translated text by key path */
  t: (key: TranslationKey) => string;

  /** Format a date according to current locale */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;

  /** Format a number according to current locale */
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type of useLanguage hook
 */
export type UseLanguageReturn = LanguageContextValue;

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for LanguageSwitcher component
 */
export interface LanguageSwitcherProps {
  /** Optional CSS class name */
  className?: string;

  /** Whether to show full language names instead of short codes */
  showFullNames?: boolean;
}

/**
 * Props for LanguageProvider component
 */
export interface LanguageProviderProps {
  /** Child components to wrap */
  children: React.ReactNode;

  /** Optional initial language (overrides localStorage) */
  initialLanguage?: Language;
}
