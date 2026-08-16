// Game configuration constants and default settings
export const GAME_CONFIG = {
  // Board Configuration
  BOARD: {
    TOTAL_SQUARES: 10,
    SQUARES_PER_PLAYER: 5,
    DEFAULT_PIECES_PER_SQUARE: 5,
    QUAN_SQUARES: [0, 5]
  },

  // Time Limits
  TIME: {
    MIN_TURN_TIME: 30,    // 30 seconds
    DEFAULT_TURN_TIME: 120, // 2 minutes
    MAX_TURN_TIME: 300,   // 5 minutes
    MOVE_ANIMATION_TIME: 500 // 0.5 seconds
  },

  // Scoring
  SCORING: {
    REGULAR_PIECE_POINTS: 1,
    QUAN_PIECE_POINTS: 10
  },

  // AI Configuration
  AI: {
    DIFFICULTY_LEVELS: {
      EASY: {
        NAME: 'Easy',
        MOVE_SELECTION_STRATEGY: 'random',
        THINKING_TIME: 500 // 0.5 seconds
      },
      MEDIUM: {
        NAME: 'Medium',
        MOVE_SELECTION_STRATEGY: 'most-pieces',
        THINKING_TIME: 1000 // 1 second
      },
      HARD: {
        NAME: 'Hard',
        MOVE_SELECTION_STRATEGY: 'advanced-evaluation',
        THINKING_TIME: 2000 // 2 seconds
      }
    }
  },

  // Game Modes
  MODES: {
    PVP: 'Player vs Player',
    PVE: 'Player vs AI'
  },

  // Analytics and Tracking
  ANALYTICS: {
    TRACK_GAME_HISTORY: true,
    MAX_GAME_HISTORY: 100,
    PERFORMANCE_METRICS: [
      'totalPoints',
      'pieceCaptured',
      'quanCaptured',
      'averageTurnTime'
    ]
  },

  // Sound and Accessibility
  SOUND: {
    DEFAULT_VOLUME: 0.5,
    SOUND_EFFECTS: {
      PIECE_MOVE: '/sounds/piece-move.mp3',
      PIECE_CAPTURE: '/sounds/piece-capture.mp3',
      GAME_START: '/sounds/game-start.mp3',
      GAME_END: '/sounds/game-end.mp3'
    }
  }
};

// Validation utility
export function validateGameConfig(config: any): boolean {
  try {
    // Validate board configuration
    if (config.BOARD.TOTAL_SQUARES !== 10) return false;
    if (config.BOARD.SQUARES_PER_PLAYER !== 5) return false;

    // Validate time limits
    if (config.TIME.DEFAULT_TURN_TIME < config.TIME.MIN_TURN_TIME) return false;
    if (config.TIME.DEFAULT_TURN_TIME > config.TIME.MAX_TURN_TIME) return false;

    // Validate scoring
    if (config.SCORING.REGULAR_PIECE_POINTS !== 1) return false;
    if (config.SCORING.QUAN_PIECE_POINTS !== 10) return false;

    return true;
  } catch (error) {
    console.error('Invalid game configuration:', error);
    return false;
  }
}

// Get default game settings
export function getDefaultGameSettings() {
  return {
    gameMode: GAME_CONFIG.MODES.PVP,
    timeLimit: GAME_CONFIG.TIME.DEFAULT_TURN_TIME,
    startingPieces: GAME_CONFIG.BOARD.DEFAULT_PIECES_PER_SQUARE,
    language: 'vi',
    soundEnabled: true,
    aiDifficulty: GAME_CONFIG.AI.DIFFICULTY_LEVELS.MEDIUM
  };
}
